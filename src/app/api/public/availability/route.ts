import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { practitionerAvailability, appointments, users, userRoles } from "@/lib/db/schema";
import { eq, and, notInArray } from "drizzle-orm";
import {
  getClinicConfig,
  getClinicTimezone,
  resolveClinicPractitioner,
} from "@/config/clinic.config";

export const dynamic = "force-dynamic";

const TERMINAL_OR_UNBLOCKING_STATUSES = [
  "CANCELLED",
  "RESCHEDULED",
  "NO_SHOW",
  "DECLINED_IN_ADVANCE",
];

function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatMinutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

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

    // 1. Timezone & Advance Booking Rules
    const now = new Date();
    const dateInClinic = new Intl.DateTimeFormat("en-CA", {
      timeZone: clinicTz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);

    // Reject past dates
    if (dateStr < dateInClinic) {
      return NextResponse.json(
        { error: "Appointments cannot be booked in the past." },
        { status: 400 }
      );
    }

    // Reject dates beyond maxAdvanceDays
    const maxDate = new Date(now.getTime() + clinicConfig.bookingSettings.maxAdvanceDays * 24 * 60 * 60 * 1000);
    const maxDateInClinic = new Intl.DateTimeFormat("en-CA", {
      timeZone: clinicTz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(maxDate);

    if (dateStr > maxDateInClinic) {
      return NextResponse.json({
        date: dateStr,
        availableSlots: [],
        message: `Bookings can only be scheduled up to ${clinicConfig.bookingSettings.maxAdvanceDays} days in advance.`,
      });
    }

    // 2. Strict Practitioner Resolution (P3)
    let practitionerConfig = resolveClinicPractitioner(clinicConfig, practitionerParam);
    if (practitionerParam && !practitionerConfig) {
      return NextResponse.json(
        { error: "Invalid or unauthorized practitioner specified." },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Resolve DB user record for the practitioner
    let dbPractitionerId: string | null = null;
    if (practitionerParam && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(practitionerParam)) {
      const [matchedUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, practitionerParam))
        .limit(1);
      if (matchedUser) {
        dbPractitionerId = matchedUser.id;
      }
    }

    if (!dbPractitionerId) {
      const [leadPractitioner] = await db
        .select({ id: users.id })
        .from(users)
        .innerJoin(userRoles, eq(users.id, userRoles.userId))
        .where(and(eq(userRoles.roleId, "PRACTITIONER"), eq(users.isActive, true)))
        .limit(1);

      if (leadPractitioner) {
        dbPractitionerId = leadPractitioner.id;
      }
    }

    // 3. Service Duration Resolution (P2: 60, 90, 120, 180 min)
    let serviceDuration = clinicConfig.workingHours.slotDurationMinutes || 60;
    if (serviceIdParam) {
      const service = clinicConfig.services.find((s) => s.id === serviceIdParam);
      if (service) {
        serviceDuration = service.durationMinutes;
      }
    }

    // Determine Day of Week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    // Date string parsed at noon IST
    const targetDate = new Date(`${dateStr}T12:00:00+05:30`);
    const dayOfWeek = targetDate.getDay();

    // 4. Fetch Practitioner Availability Rule for this Day of Week
    let availRule: any = null;
    if (dbPractitionerId) {
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
      availRule = rules[0];
    }

    // Fallback to clinic working hours
    const dayStart = availRule?.startTime || clinicConfig.workingHours.startTime;
    const dayEnd = availRule?.endTime || clinicConfig.workingHours.endTime;
    const buffer = availRule?.bufferMinutes ?? clinicConfig.workingHours.bufferMinutes ?? 15;

    // If day is not in configured working days (e.g. Sunday)
    if (!availRule && !clinicConfig.workingHours.days.includes(dayOfWeek)) {
      return NextResponse.json({
        date: dateStr,
        availableSlots: [],
        message: "No practitioner availability scheduled on this day.",
      });
    }

    // 5. Query active booked appointments on this date (P2: Overlap check, unblocking cancelled slots)
    const apptConditions = [
      eq(appointments.scheduledDate, dateStr),
      notInArray(appointments.status, TERMINAL_OR_UNBLOCKING_STATUSES),
    ];

    if (dbPractitionerId) {
      apptConditions.push(eq(appointments.practitionerId, dbPractitionerId));
    }

    const bookedAppointments = await db
      .select({
        startTime: appointments.startTime,
        endTime: appointments.endTime,
      })
      .from(appointments)
      .where(and(...apptConditions));

    // 6. Current Time & Advance Notice Filter (P4: Same-day booking notice window)
    let minAllowedStartMin = 0;
    if (dateStr === dateInClinic) {
      const timeInClinic = new Intl.DateTimeFormat("en-GB", {
        timeZone: clinicTz,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now);
      const currentClinicMin = parseTimeToMinutes(timeInClinic);
      minAllowedStartMin = currentClinicMin + clinicConfig.bookingSettings.advanceNoticeHours * 60;
    }

    // 7. Generate discrete time slots between startTime and endTime evaluating service duration
    const dayStartMin = parseTimeToMinutes(dayStart);
    const dayEndMin = parseTimeToMinutes(dayEnd);
    const step = 60 + buffer; // standard slot increment grid

    const availableSlots: string[] = [];
    let currentMin = dayStartMin;

    while (currentMin + serviceDuration <= dayEndMin) {
      const slotEndMin = currentMin + serviceDuration;

      // Check advance notice requirement if today
      const meetsAdvanceNotice = dateStr !== dateInClinic || currentMin >= minAllowedStartMin;

      if (meetsAdvanceNotice) {
        // Range overlap check against booked appointments: [currentMin, slotEndMin) overlaps [apptStart, apptEnd)
        const hasOverlap = bookedAppointments.some((appt: { startTime: string; endTime: string }) => {
          const apptStart = parseTimeToMinutes(appt.startTime);
          const apptEnd = parseTimeToMinutes(appt.endTime);
          return Math.max(currentMin, apptStart) < Math.min(slotEndMin, apptEnd);
        });

        if (!hasOverlap) {
          availableSlots.push(formatMinutesToTime(currentMin));
        }
      }

      currentMin += step;
    }

    return NextResponse.json({
      date: dateStr,
      practitionerId: dbPractitionerId || practitionerConfig?.id,
      practitionerName: practitionerConfig?.name,
      serviceDurationMinutes: serviceDuration,
      availableSlots,
      slotDurationMinutes: serviceDuration,
      bufferMinutes: buffer,
    });
  } catch (error: any) {
    console.error("Public availability fetch error:", error);
    return NextResponse.json(
      { error: "Failed to resolve practitioner availability" },
      { status: 500 }
    );
  }
}
