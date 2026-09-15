import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  contacts,
  crmDeals,
  appointments,
  activities,
  outboxEvents,
  users,
  userRoles,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getClinicConfig } from "@/config/clinic.config";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const dynamic = "force-dynamic";

const bookingSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  phone: z.string().trim().min(8, "Phone number is too short").max(20),
  email: z.string().trim().email("Invalid email address").optional().or(z.literal("")),
  serviceId: z.string().min(1, "Service ID is required"),
  mode: z.enum(["In-Clinic (Wanowrie, Pune)", "Online Secure Telehealth"]).default("In-Clinic (Wanowrie, Pune)"),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  primaryConcern: z.string().trim().max(1000).optional(),
  hp_website: z.string().optional(), // Honeypot trap
});

function sanitizePhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return rawPhone.trim();
}

function calculateEndTime(startTime: string, durationMinutes: number = 60): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const totalEndMin = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalEndMin / 60);
  const endMinutes = totalEndMin % 60;
  return `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // 1. Zod Input Validation
    const parseResult = bookingSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid booking request parameters",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      fullName,
      phone,
      email,
      serviceId,
      mode,
      scheduledDate,
      startTime,
      primaryConcern,
      hp_website,
    } = parseResult.data;

    // 2. Anti-Spam Honeypot Verification
    if (hp_website && hp_website.length > 0) {
      // Silently reject bots that populate the hidden honeypot
      return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
    }

    // 3. Past-Date Rejection
    const today = new Date().toISOString().split("T")[0];
    if (scheduledDate < today) {
      return NextResponse.json(
        { error: "Appointments cannot be booked in the past." },
        { status: 400 }
      );
    }

    const clinicConfig = getClinicConfig();

    // 4. Server-Side Service & Price Resolution (Prevents arbitrary client price injection)
    const configuredService = clinicConfig.services.find((s) => s.id === serviceId);
    if (!configuredService) {
      return NextResponse.json(
        { error: `Requested service '${serviceId}' is not offered by this clinic.` },
        { status: 400 }
      );
    }

    const servicePrice = configuredService.price.toFixed(2);
    const serviceName = configuredService.name;
    const durationMinutes = configuredService.durationMinutes;

    // 5. Working Hours & Day of Week Validation
    const targetDate = new Date(`${scheduledDate}T12:00:00Z`);
    const dayOfWeek = targetDate.getUTCDay();
    if (!clinicConfig.workingHours.days.includes(dayOfWeek)) {
      return NextResponse.json(
        { error: "The clinic is closed on the selected day of the week." },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 6. Resolve Authorized Clinic Practitioner (Prevents client-controlled practitioner impersonation)
    const [leadPractitioner] = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .innerJoin(userRoles, eq(users.id, userRoles.userId))
      .where(and(eq(userRoles.roleId, "PRACTITIONER"), eq(users.isActive, true)))
      .limit(1);

    if (!leadPractitioner) {
      return NextResponse.json(
        { error: "No active clinical practitioner is configured to receive bookings." },
        { status: 503 }
      );
    }

    const practitionerId = leadPractitioner.id;
    const practitionerName = leadPractitioner.name;
    const formattedPhone = sanitizePhone(phone);
    const endTime = calculateEndTime(startTime, durationMinutes);

    // 7. Atomic Database Transaction
    // Wraps Contact upsert, Deal, Appointment, Activity, and Outbox event into a single ACID unit.
    const bookingResult = await db.transaction(async (tx: any) => {
      // A. Contact Lookup / Deduplication by phone
      let [contact] = await tx
        .select()
        .from(contacts)
        .where(eq(contacts.phone, formattedPhone))
        .limit(1);

      const nameParts = fullName.trim().split(" ");
      const firstName = nameParts[0] || fullName;
      const lastName = nameParts.slice(1).join(" ") || null;

      if (!contact) {
        // Create new Contact
        [contact] = await tx
          .insert(contacts)
          .values({
            fullName: fullName.trim(),
            firstName,
            lastName,
            phone: formattedPhone,
            email: email || null,
            city: clinicConfig.location.city,
            status: "ACTIVE",
            activeDealStage: "scheduled",
            activeDealValue: servicePrice,
            primaryConcern: primaryConcern || null,
            tags: ["Website Booking", configuredService.category],
            notes: `Public website booking. Modality: ${mode}. Service: ${serviceName}.`,
          })
          .returning();
      } else {
        // Contact exists: If previously archived, unarchive with audit reason; update active deal stage
        await tx
          .update(contacts)
          .set({
            isArchived: false,
            archiveReason: contact.isArchived ? "Re-engaged via public website booking" : contact.archiveReason,
            activeDealStage: "scheduled",
            activeDealValue: servicePrice,
            primaryConcern: primaryConcern || contact.primaryConcern,
            updatedAt: new Date(),
          })
          .where(eq(contacts.id, contact.id));
      }

      // B. CRM Deal
      const [deal] = await tx
        .insert(crmDeals)
        .values({
          contactId: contact.id,
          title: `${fullName.trim()} - ${serviceName}`,
          stage: "scheduled",
          value: servicePrice,
          probability: 75,
          therapy: serviceName,
          mode,
          source: "Website Booking",
          notes: primaryConcern || "Online intake booking",
        })
        .returning();

      // C. Appointment Creation (Semantic initial state: SCHEDULED)
      const [appointment] = await tx
        .insert(appointments)
        .values({
          contactId: contact.id,
          practitionerId,
          practitionerName,
          therapyType: serviceName,
          mode,
          scheduledDate,
          startTime,
          endTime,
          status: clinicConfig.bookingSettings.initialStatus, // 'SCHEDULED'
          paymentStatus: "PENDING",
          amount: servicePrice,
          notes: primaryConcern ? `Online intake: ${primaryConcern}` : "Public booking intake",
        })
        .returning();

      // D. Timeline Activity Record
      await tx.insert(activities).values({
        contactId: contact.id,
        type: "APPOINTMENT_BOOKED",
        title: "Appointment Scheduled via Website",
        description: `Scheduled ${serviceName} on ${scheduledDate} at ${startTime} (${mode}) with ${practitionerName}.`,
        metadata: {
          appointmentId: appointment.id,
          dealId: deal.id,
          serviceId,
          amount: servicePrice,
        },
      });

      // E. Transactional Outbox Event (Contract: appointment.created with stable IDs)
      const outboxEventId = randomUUID();
      await tx.insert(outboxEvents).values({
        idempotencyKey: `evt_booking_${appointment.id}`,
        eventType: "appointment.created",
        payload: {
          event_id: outboxEventId,
          appointment_id: appointment.id,
          contact_id: contact.id,
          practitioner_id: practitionerId,
          event_version: "1.0",
          occurred_at: new Date().toISOString(),
          scheduled_date: scheduledDate,
          start_time: startTime,
          end_time: endTime,
          service_id: serviceId,
          service_name: serviceName,
          mode,
          status: appointment.status,
        },
        status: "PENDING",
        scheduledAt: new Date(),
      });

      return {
        contact,
        deal,
        appointment,
      };
    });

    return NextResponse.json({
      success: true,
      bookingReference: bookingResult.appointment.id,
      patient: {
        id: bookingResult.contact.id,
        fullName: bookingResult.contact.fullName,
        phone: bookingResult.contact.phone,
      },
      appointment: {
        id: bookingResult.appointment.id,
        date: bookingResult.appointment.scheduledDate,
        startTime: bookingResult.appointment.startTime,
        endTime: bookingResult.appointment.endTime,
        therapyType: bookingResult.appointment.therapyType,
        mode: bookingResult.appointment.mode,
        status: bookingResult.appointment.status, // "SCHEDULED"
        practitioner: practitionerName,
        location: mode.includes("Online")
          ? "Secure Video Consultation (Link will be provided before session)"
          : `${clinicConfig.location.address}, ${clinicConfig.location.city}`,
      },
      message: "Your appointment has been scheduled. Our front desk will reach out to confirm your slot.",
    });
  } catch (error: any) {
    // 8. Concurrency Collision Handling (PostgreSQL unique index violation)
    if (error?.code === "23505" && error?.constraint === "uniq_practitioner_slot") {
      return NextResponse.json(
        {
          error: "This appointment slot was just booked by another patient. Please choose an alternative time slot.",
        },
        { status: 409 }
      );
    }

    console.error("Public booking submission error:", error?.message || error);
    return NextResponse.json(
      { error: "Unable to process booking at this time. Please try again or contact the clinic directly." },
      { status: 500 }
    );
  }
}
