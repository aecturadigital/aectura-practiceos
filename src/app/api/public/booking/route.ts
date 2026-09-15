import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  contacts,
  crmDeals,
  appointments,
  activities,
  outboxEvents,
  users,
} from "@/lib/db/schema";
import { eq, and, notInArray } from "drizzle-orm";
import {
  getClinicConfig,
  getClinicTimezone,
  resolveClinicPractitioner,
  getPublicVerifiedServices,
  BookingMode,
} from "@/config/clinic.config";
import {
  localDateTimeToUtc,
  getTodayInTimezone,
  getCurrentTimeInTimezone,
  getDayOfWeekInTimezone,
  parseTimeToMinutes,
  calculateEndTime,
} from "@/lib/date-utils";
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
  mode: z.enum(["IN_CLINIC", "ONLINE", "HOME_VISIT"]).default("IN_CLINIC"),
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

    // 3. Timezone-Aware Past-Date & Advance Notice Rules (Section 5)
    const todayInClinic = getTodayInTimezone(clinicTz);

    if (scheduledDate < todayInClinic) {
      return NextResponse.json(
        { error: "Appointments cannot be booked in the past." },
        { status: 400 }
      );
    }

    const now = new Date();
    const maxDate = new Date(now.getTime() + clinicConfig.bookingSettings.maxAdvanceDays * 24 * 60 * 60 * 1000);
    const maxDateInClinic = getTodayInTimezone(clinicTz, maxDate);

    if (scheduledDate > maxDateInClinic) {
      return NextResponse.json(
        { error: `Bookings can only be scheduled up to ${clinicConfig.bookingSettings.maxAdvanceDays} days in advance.` },
        { status: 400 }
      );
    }

    if (scheduledDate === todayInClinic) {
      const currentTimeStr = getCurrentTimeInTimezone(clinicTz);
      const currentClinicMin = parseTimeToMinutes(currentTimeStr);
      const slotStartMin = parseTimeToMinutes(startTime);
      if (slotStartMin < currentClinicMin + clinicConfig.bookingSettings.advanceNoticeHours * 60) {
        return NextResponse.json(
          { error: `Appointments must be booked at least ${clinicConfig.bookingSettings.advanceNoticeHours} hours in advance.` },
          { status: 400 }
        );
      }
    }

    // 4. Server-Side Service & Content Provenance Gating (Section 9)
    const publicServices = getPublicVerifiedServices(clinicConfig);
    const configuredService = publicServices.find((s) => s.id === serviceId);

    if (!configuredService) {
      return NextResponse.json(
        { error: `Requested service '${serviceId}' is not verified or currently offered for public booking.` },
        { status: 400 }
      );
    }

    const servicePrice = configuredService.price.toFixed(2);
    const serviceName = configuredService.name;
    const durationMinutes = configuredService.durationMinutes;
    const bufferMinutes = clinicConfig.bookingSettings.bufferMinutes || 15;

    // 5. Working Hours & Day of Week Validation
    const dayOfWeek = getDayOfWeekInTimezone(scheduledDate, clinicTz);
    if (!clinicConfig.workingHours.days.includes(dayOfWeek)) {
      return NextResponse.json(
        { error: "The clinic is closed on the selected day of the week." },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 6. Strict Practitioner Resolution & Database Mapping (Section 6)
    const practitionerConfig = resolveClinicPractitioner(clinicConfig, requestedPractitionerId);
    if (requestedPractitionerId && !practitionerConfig) {
      return NextResponse.json(
        { error: "Invalid or unauthorized practitioner specified." },
        { status: 400 }
      );
    }

    if (!practitionerConfig) {
      return NextResponse.json(
        { error: "No active practitioner configured for this clinic." },
        { status: 503 }
      );
    }

    // Deterministic DB user resolution
    let dbPractitioner: { id: string; name: string } | null = null;

    if (requestedPractitionerId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestedPractitionerId)) {
      const [matchedUser] = await db
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(eq(users.id, requestedPractitionerId))
        .limit(1);
      if (matchedUser) {
        dbPractitioner = matchedUser;
      }
    }

    if (!dbPractitioner && practitionerConfig.email) {
      const [matchedUser] = await db
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(eq(users.email, practitionerConfig.email))
        .limit(1);
      if (matchedUser) {
        dbPractitioner = matchedUser;
      }
    }

    if (!dbPractitioner) {
      const [matchedUser] = await db
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(eq(users.name, practitionerConfig.name))
        .limit(1);
      if (matchedUser) {
        dbPractitioner = matchedUser;
      }
    }

    if (!dbPractitioner) {
      return NextResponse.json(
        { error: `Practitioner database configuration mapping is missing for '${practitionerConfig.name}'.` },
        { status: 503 }
      );
    }

    const practitionerId = dbPractitioner.id;
    const practitionerName = dbPractitioner.name;
    const formattedPhone = sanitizePhone(phone);
    const endTime = calculateEndTime(startTime, durationMinutes);
    const blockedUntilTime = calculateEndTime(startTime, durationMinutes + bufferMinutes);

    // 7. Timezone-Portable Timestamps with Buffer Policy (Section 5 & 8)
    const startAt = localDateTimeToUtc(scheduledDate, startTime, clinicTz);
    const endAt = localDateTimeToUtc(scheduledDate, blockedUntilTime, clinicTz);

    // 8. Atomic Database Transaction
    const bookingResult = await db.transaction(async (tx: any) => {
      // Pre-check for overlapping active appointments on practitioner including buffer
      const candidateStartMin = parseTimeToMinutes(startTime);
      const candidateBlockedUntilMin = parseTimeToMinutes(blockedUntilTime);

      const existingAppts = await tx
        .select({
          startTime: appointments.startTime,
          endTime: appointments.endTime,
        })
        .from(appointments)
        .where(
          and(
            eq(appointments.practitionerId, practitionerId),
            eq(appointments.scheduledDate, scheduledDate),
            notInArray(appointments.status, TERMINAL_OR_UNBLOCKING_STATUSES)
          )
        );

      const hasOverlap = existingAppts.some((appt: { startTime: string; endTime: string }) => {
        const apptStart = parseTimeToMinutes(appt.startTime);
        const apptBlockedUntil = parseTimeToMinutes(appt.endTime) + bufferMinutes;
        return Math.max(candidateStartMin, apptStart) < Math.min(candidateBlockedUntilMin, apptBlockedUntil);
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
        // Contact exists: If previously archived, unarchive with audit reason
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

      // C. Appointment Creation (Canonical status: SCHEDULED, startAt, endAt for GiST exclusion)
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

    const displayLocation =
      mode === "ONLINE"
        ? "Secure Video Consultation (Google Meet link will be provided before session)"
        : `${clinicConfig.location.address}, ${clinicConfig.location.city}`;

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
        modeLabel: clinicConfig.bookingSettings.modeDisplayLabels[mode as BookingMode] || mode,
        status: bookingResult.appointment.status, // "SCHEDULED"
        practitioner: practitionerName,
        location: displayLocation,
      },
      message: "Your appointment has been scheduled. Our front desk will reach out to confirm your slot.",
    });
  } catch (error: any) {
    // 9. Concurrency & Range Overlap Handling
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
