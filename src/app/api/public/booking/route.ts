import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  getClinicConfig,
  getClinicTimezone,
  BookingMode,
} from "@/config/clinic.config";
import {
  executeCanonicalBooking,
  getValidatedPublicService,
  resolvePractitionerIdentity,
} from "@/lib/appointments/appointment-service";
import {
  getTodayInTimezone,
  getCurrentTimeInTimezone,
  parseTimeToMinutes,
} from "@/lib/date-utils";
import { z } from "zod";

export const dynamic = "force-dynamic";

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

    // 3. Timezone-Aware Past-Date & Advance Notice Rules
    const todayInClinic = getTodayInTimezone(clinicTz);
    if (scheduledDate < todayInClinic) {
      return NextResponse.json(
        { error: "Appointments cannot be booked in the past." },
        { status: 400 }
      );
    }

    if (scheduledDate === todayInClinic) {
      const currentTimeStr = getCurrentTimeInTimezone(clinicTz);
      const currentClinicMin = parseTimeToMinutes(currentTimeStr);
      const requestedStartMin = parseTimeToMinutes(startTime);
      const minAllowedStartMin = currentClinicMin + clinicConfig.bookingSettings.advanceNoticeHours * 60;

      if (requestedStartMin < minAllowedStartMin) {
        return NextResponse.json(
          {
            error: `Appointments must be booked at least ${clinicConfig.bookingSettings.advanceNoticeHours} hours in advance.`,
          },
          { status: 400 }
        );
      }
    }

    const db = await getDb();

    // 4. Validate Service & Practitioner Deterministically
    let service;
    try {
      service = getValidatedPublicService(clinicConfig, serviceId);
    } catch (err: any) {
      return NextResponse.json(
        { error: `Invalid or unverified service requested: '${serviceId}'` },
        { status: 400 }
      );
    }

    let practitioner;
    try {
      practitioner = await resolvePractitionerIdentity(db, requestedPractitionerId, clinicConfig);
    } catch (err: any) {
      return NextResponse.json(
        { error: err?.message || "Practitioner mapping missing in database." },
        { status: 503 }
      );
    }

    const cleanPhone = sanitizePhone(phone);

    // 5. Execute Canonical Atomic Booking Transaction
    const bookingResult = await executeCanonicalBooking(
      db,
      {
        fullName,
        phone: cleanPhone,
        email: email || undefined,
        serviceId,
        scheduledDate,
        startTime,
        mode,
        primaryConcern,
        practitionerId: practitioner.id,
      },
      clinicConfig
    );

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
        startAt: bookingResult.appointment.startAt,
        endAt: bookingResult.appointment.endAt,
        blockedUntilAt: bookingResult.appointment.blockedUntilAt,
        therapyType: bookingResult.appointment.therapyType,
        mode: bookingResult.appointment.mode,
        modeLabel: clinicConfig.bookingSettings.modeDisplayLabels[mode as BookingMode] || mode,
        status: bookingResult.appointment.status, // "SCHEDULED"
        practitioner: practitioner.name,
        location: displayLocation,
      },
      message: "Your appointment has been scheduled. Our front desk will reach out to confirm your slot.",
    });
  } catch (error: any) {
    // Concurrency & Range Overlap Handling
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
