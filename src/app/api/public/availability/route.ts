import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { practitionerAvailability, appointments, users } from "@/lib/db/schema";
import { eq, and, notInArray } from "drizzle-orm";
import {
  getClinicConfig,
  getClinicTimezone,
  resolveClinicPractitioner,
  getPublicVerifiedServices,
} from "@/config/clinic.config";
import {
  getTodayInTimezone,
  getCurrentTimeInTimezone,
  getDayOfWeekInTimezone,
  parseTimeToMinutes,
  formatMinutesToTime,
} from "@/lib/date-utils";

export const dynamic = "force-dynamic";

const TERMINAL_OR_UNBLOCKING_STATUSES = [
  "CANCELLED",
  "RESCHEDULED",
  "NO_SHOW",
  "DECLINED_IN_ADVANCE",
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date"); // Format: YYYY-MM-DD
    const practitionerParam = searchParams.get("practitionerId");
    const serviceIdParam = searchParams.get("serviceId");

    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return NextResponse.json(
        { error: "Valid date query parameter required in YYYY-MM-DD format" },
        { status: 400 }
      );
    }

    const clinicConfig = getClinicConfig();
    const clinicTz = getClinicTimezone();

    // 1. Timezone-Aware Advance Booking & Past Date Rules
    const todayInClinic = getTodayInTimezone(clinicTz);

    if (dateStr < todayInClinic) {
      return NextResponse.json(
        { error: "Appointments cannot be booked in the past." },
        { status: 400 }
      );
    }

    const now = new Date();
    const maxDate = new Date(now.getTime() + clinicConfig.bookingSettings.maxAdvanceDays * 24 * 60 * 60 * 1000);
    const maxDateInClinic = getTodayInTimezone(clinicTz, maxDate);

    if (dateStr > maxDateInClinic) {
      return NextResponse.json({
        date: dateStr,
        availableSlots: [],
        message: `Bookings can only be scheduled up to ${clinicConfig.bookingSettings.maxAdvanceDays} days in advance.`,
      });
    }

    // 2. Strict Practitioner Manifest & Database Mapping (Section 6)
    const practitionerConfig = resolveClinicPractitioner(clinicConfig, practitionerParam);
    if (practitionerParam && !practitionerConfig) {
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

    const db = await getDb();

    // Exact deterministic lookup: Match practitioner by config email or exact UUID
    let dbPractitioner: { id: string; name: string } | null = null;

    if (practitionerParam && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(practitionerParam)) {
      const [matchedUser] = await db
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(eq(users.id, practitionerParam))
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

    // Fallback: lookup by practitioner name if seeded with name
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
        { error: `Practitioner mapping missing in database for '${practitionerConfig.name}'.` },
        { status: 503 }
      );
    }

    const dbPractitionerId = dbPractitioner.id;

    // 3. Service Duration & Provenance Gating (Section 8 & 9)
    let serviceDuration = clinicConfig.workingHours.slotDurationMinutes || 60;
    if (serviceIdParam) {
      const publicServices = getPublicVerifiedServices(clinicConfig);
      const service = publicServices.find((s) => s.id === serviceIdParam);
      if (service) {
        serviceDuration = service.durationMinutes;
      }
    }

    const bufferMinutes = clinicConfig.bookingSettings.bufferMinutes || 15;
    const dayOfWeek = getDayOfWeekInTimezone(dateStr, clinicTz);

    // 4. Fetch Practitioner Availability Rule for this Day of Week
    const rules = await db
      .select()
      .from(practitionerAvailability)
      .where(
        and(
          eq(practitionerAvailability.practitionerId, dbPractitionerId),
          eq(practitionerAvailability.dayOfWeek, dayOfWeek),
          eq(practitionerAvailability.isActive, true)
        )
      )
      .limit(1);

    const availRule = rules[0];

    // Check clinic working days
    if (!availRule && !clinicConfig.workingHours.days.includes(dayOfWeek)) {
      return NextResponse.json({
        date: dateStr,
        availableSlots: [],
        message: "No practitioner availability scheduled on this day.",
      });
    }

    const dayStart = availRule?.startTime || clinicConfig.workingHours.startTime;
    const dayEnd = availRule?.endTime || clinicConfig.workingHours.endTime;

    // 5. Query active booked appointments on this date
    const bookedAppointments = await db
      .select({
        startTime: appointments.startTime,
        endTime: appointments.endTime,
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.scheduledDate, dateStr),
          eq(appointments.practitionerId, dbPractitionerId),
          notInArray(appointments.status, TERMINAL_OR_UNBLOCKING_STATUSES)
        )
      );

    // 6. Same-Day Advance Notice Filter
    let minAllowedStartMin = 0;
    if (dateStr === todayInClinic) {
      const currentTimeStr = getCurrentTimeInTimezone(clinicTz);
      const currentClinicMin = parseTimeToMinutes(currentTimeStr);
      minAllowedStartMin = currentClinicMin + clinicConfig.bookingSettings.advanceNoticeHours * 60;
    }

    // 7. Generate discrete time slots evaluating session duration + buffer policy
    const dayStartMin = parseTimeToMinutes(dayStart);
    const dayEndMin = parseTimeToMinutes(dayEnd);
    const step = 60 + bufferMinutes; // Standard slot increment grid

    const availableSlots: string[] = [];
    let currentMin = dayStartMin;

    while (currentMin + serviceDuration <= dayEndMin) {
      const meetsAdvanceNotice = dateStr !== todayInClinic || currentMin >= minAllowedStartMin;

      if (meetsAdvanceNotice) {
        // Candidate interval blocked for duration + buffer
        const candidateStart = currentMin;
        const candidateBlockedUntil = currentMin + serviceDuration + bufferMinutes;

        // Check range overlap against all active booked appointments
        const hasOverlap = bookedAppointments.some((appt: { startTime: string; endTime: string }) => {
          const apptStart = parseTimeToMinutes(appt.startTime);
          const apptBlockedUntil = parseTimeToMinutes(appt.endTime) + bufferMinutes;
          return Math.max(candidateStart, apptStart) < Math.min(candidateBlockedUntil, apptBlockedUntil);
        });

        if (!hasOverlap) {
          availableSlots.push(formatMinutesToTime(currentMin));
        }
      }

      currentMin += step;
    }

    return NextResponse.json({
      date: dateStr,
      timezone: clinicTz,
      practitionerId: dbPractitionerId,
      practitionerName: practitionerConfig.name,
      serviceDurationMinutes: serviceDuration,
      bufferMinutes,
      availableSlots,
      slotDurationMinutes: serviceDuration,
    });
  } catch (error: any) {
    console.error("Public availability fetch error:", error);
    return NextResponse.json(
      { error: "Failed to resolve practitioner availability" },
      { status: 500 }
    );
  }
}
