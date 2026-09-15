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
import { eq, and, notInArray } from "drizzle-orm";
import {
  getClinicConfig,
  getClinicTimezone,
  resolveClinicPractitioner,
} from "@/config/clinic.config";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const dynamic = "force-dynamic";

const TERMINAL_OR_UNBLOCKING_STATUSES = [
  "CANCELLED",
  "RESCHEDULED",
  "NO_SHOW",
  "DECLINED_IN_ADVANCE",
];

const bookingSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  phone: z.string().trim().min(8, "Phone number is too short").max(20),
  email: z.string().trim().email("Invalid email address").optional().or(z.literal("")),
  serviceId: z.string().min(1, "Service ID is required"),
  practitionerId: z.string().optional(),
  mode: z.enum(["In-Clinic (Wanowrie, Pune)", "Online Secure Telehealth"]).default("In-Clinic (Wanowrie, Pune)"),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  primaryConcern: z.string().trim().max(1000).optional(),
  hp_website: z.string().optional(), // Honeypot trap
});

function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

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
      practitionerId: requestedPractitionerId,
      mode,
      scheduledDate,
      startTime,
      primaryConcern,
      hp_website,
    } = parseResult.data;

    // 2. Anti-Spam Honeypot Verification
    if (hp_website && hp_website.length > 0) {
      return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
    }

    const clinicConfig = getClinicConfig();
    const clinicTz = getClinicTimezone();

    // 3. Timezone, Past-Date & Advance Notice Rules (P4)
    const now = new Date();
    const dateInClinic = new Intl.DateTimeFormat("en-CA", {
      timeZone: clinicTz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);

    if (scheduledDate < dateInClinic) {
      return NextResponse.json(
        { error: "Appointments cannot be booked in the past." },
        { status: 400 }
      );
    }

    const maxDate = new Date(now.getTime() + clinicConfig.bookingSettings.maxAdvanceDays * 24 * 60 * 60 * 1000);
    const maxDateInClinic = new Intl.DateTimeFormat("en-CA", {
      timeZone: clinicTz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(maxDate);

    if (scheduledDate > maxDateInClinic) {
      return NextResponse.json(
        { error: `Bookings can only be scheduled up to ${clinicConfig.bookingSettings.maxAdvanceDays} days in advance.` },
        { status: 400 }
      );
    }

    if (scheduledDate === dateInClinic) {
      const timeInClinic = new Intl.DateTimeFormat("en-GB", {
        timeZone: clinicTz,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now);
      const currentClinicMin = parseTimeToMinutes(timeInClinic);
      const slotStartMin = parseTimeToMinutes(startTime);
      if (slotStartMin < currentClinicMin + clinicConfig.bookingSettings.advanceNoticeHours * 60) {
        return NextResponse.json(
          { error: `Appointments must be booked at least ${clinicConfig.bookingSettings.advanceNoticeHours} hours in advance.` },
          { status: 400 }
        );
      }
    }

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
    const targetDate = new Date(`${scheduledDate}T12:00:00+05:30`);
    const dayOfWeek = targetDate.getDay();
    if (!clinicConfig.workingHours.days.includes(dayOfWeek)) {
      return NextResponse.json(
        { error: "The clinic is closed on the selected day of the week." },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 6. Strict Practitioner Resolution (P3)
    let practitionerConfig = resolveClinicPractitioner(clinicConfig, requestedPractitionerId);
    if (requestedPractitionerId && !practitionerConfig) {
      return NextResponse.json(
        { error: "Invalid or unauthorized practitioner specified." },
        { status: 400 }
      );
    }

    let practitionerId: string | null = null;
    let practitionerName = practitionerConfig?.name || "Col Umakant Saxena";

    if (requestedPractitionerId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestedPractitionerId)) {
      const [matchedUser] = await db
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(eq(users.id, requestedPractitionerId))
        .limit(1);
      if (matchedUser) {
        practitionerId = matchedUser.id;
        practitionerName = matchedUser.name;
      }
    }

    if (!practitionerId) {
      const [leadPractitioner] = await db
        .select({ id: users.id, name: users.name })
        .from(users)
        .innerJoin(userRoles, eq(users.id, userRoles.userId))
        .where(and(eq(userRoles.roleId, "PRACTITIONER"), eq(users.isActive, true)))
        .limit(1);

      if (leadPractitioner) {
        practitionerId = leadPractitioner.id;
        practitionerName = leadPractitioner.name;
      }
    }

    if (!practitionerId) {
      return NextResponse.json(
        { error: "No active clinical practitioner is configured to receive bookings." },
        { status: 503 }
      );
    }

    const formattedPhone = sanitizePhone(phone);
    const endTime = calculateEndTime(startTime, durationMinutes);

    // Precise timestamps for PostgreSQL range exclusion constraint (P2)
    const startAt = new Date(`${scheduledDate}T${startTime}:00+05:30`);
    const endAt = new Date(`${scheduledDate}T${endTime}:00+05:30`);

    // 7. Atomic Database Transaction
    const bookingResult = await db.transaction(async (tx: any) => {
      // Pre-check for overlapping active appointments on practitioner
      const candidateStartMin = parseTimeToMinutes(startTime);
      const candidateEndMin = parseTimeToMinutes(endTime);

      const existingAppts = await tx
        .select({
          startTime: appointments.startTime,
          endTime: appointments.endTime,
        })
        .from(appointments)
        .where(
          and(
            eq(appointments.practitionerId, practitionerId!),
            eq(appointments.scheduledDate, scheduledDate),
            notInArray(appointments.status, TERMINAL_OR_UNBLOCKING_STATUSES)
          )
        );

      const hasOverlap = existingAppts.some((appt: { startTime: string; endTime: string }) => {
        const apptStart = parseTimeToMinutes(appt.startTime);
        const apptEnd = parseTimeToMinutes(appt.endTime);
        return Math.max(candidateStartMin, apptStart) < Math.min(candidateEndMin, apptEnd);
      });

      if (hasOverlap) {
        const collisionErr: any = new Error("OVERLAP_COLLISION");
        collisionErr.code = "23P01";
        collisionErr.constraint = "excl_practitioner_no_overlap";
        throw collisionErr;
      }

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

      // C. Appointment Creation (Semantic initial state: SCHEDULED, startAt, endAt for GiST exclusion)
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
          startAt,
          endAt,
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
    // 8. Overlap & Concurrency Collision Handling (PostgreSQL GiST exclusion constraint or application check)
    if (
      error?.code === "23P01" ||
      error?.code === "23505" ||
      error?.message?.includes("excl_practitioner_no_overlap") ||
      error?.message === "OVERLAP_COLLISION"
    ) {
      return NextResponse.json(
        {
          error: "This appointment slot or overlapping duration was just booked by another patient. Please choose an alternative time slot.",
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
