import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { practitionerAvailability, appointments, users, userRoles } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { getClinicConfig } from "@/config/clinic.config";

export const dynamic = "force-dynamic";

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
    const practitionerIdParam = searchParams.get("practitionerId");

    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return NextResponse.json(
        { error: "Valid date query parameter required in YYYY-MM-DD format" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 1. Resolve Practitioner (default to Clinic Owner / Lead Therapist)
    let practitionerId = practitionerIdParam;
    if (!practitionerId) {
      const [leadOwner] = await db
        .select({ id: users.id })
        .from(users)
        .innerJoin(userRoles, eq(users.id, userRoles.userId))
        .where(and(eq(userRoles.roleId, "OWNER"), eq(users.isActive, true)))
        .limit(1);

      if (leadOwner) {
        practitionerId = leadOwner.id;
      }
    }

    // Determine Day of Week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const targetDate = new Date(`${dateStr}T12:00:00Z`);
    const dayOfWeek = targetDate.getUTCDay();

    // 2. Fetch Practitioner Availability Rule for this Day of Week
    let availabilityQuery = db
      .select()
      .from(practitionerAvailability)
      .where(
        and(
          eq(practitionerAvailability.dayOfWeek, dayOfWeek),
          eq(practitionerAvailability.isActive, true)
        )
      );

    if (practitionerId) {
      availabilityQuery = db
        .select()
        .from(practitionerAvailability)
        .where(
          and(
            eq(practitionerAvailability.practitionerId, practitionerId),
            eq(practitionerAvailability.dayOfWeek, dayOfWeek),
            eq(practitionerAvailability.isActive, true)
          )
        );
    }

    let availRule = await availabilityQuery.limit(1).then((r: any[]) => r[0]);

    const clinicConfig = getClinicConfig();

    // Fallback to clinicConfig working hours if database record not populated
    let dayStart = availRule?.startTime || clinicConfig.workingHours.startTime;
    let dayEnd = availRule?.endTime || clinicConfig.workingHours.endTime;
    let slotDuration = availRule?.slotDurationMinutes || clinicConfig.workingHours.slotDurationMinutes || 60;
    let buffer = availRule?.bufferMinutes || clinicConfig.workingHours.bufferMinutes || 15;

    // If day is not in configured working days (e.g. Sunday)
    if (!availRule && !clinicConfig.workingHours.days.includes(dayOfWeek)) {
      return NextResponse.json({
        date: dateStr,
        availableSlots: [],
        message: "No practitioner availability scheduled on this day.",
      });
    }

    // 3. Query existing booked appointments on this date
    let apptConditions = [
      eq(appointments.scheduledDate, dateStr),
      ne(appointments.status, "CANCELLED"),
    ];

    if (practitionerId) {
      apptConditions.push(eq(appointments.practitionerId, practitionerId));
    }

    const bookedAppointments = await db
      .select({
        startTime: appointments.startTime,
        endTime: appointments.endTime,
      })
      .from(appointments)
      .where(and(...apptConditions));

    const bookedTimes = new Set(bookedAppointments.map((a: { startTime: string }) => a.startTime));

    // 4. Generate discrete time slots between startTime and endTime
    const dayStartMin = parseTimeToMinutes(dayStart);
    const dayEndMin = parseTimeToMinutes(dayEnd);
    const step = slotDuration + buffer;

    const availableSlots: string[] = [];
    let currentMin = dayStartMin;

    while (currentMin + slotDuration <= dayEndMin) {
      const slotTimeStr = formatMinutesToTime(currentMin);
      // Check if slot overlaps with any booked appointment
      if (!bookedTimes.has(slotTimeStr)) {
        availableSlots.push(slotTimeStr);
      }
      currentMin += step;
    }

    return NextResponse.json({
      date: dateStr,
      practitionerId: practitionerId || availRule?.practitionerId,
      availableSlots,
      slotDurationMinutes: slotDuration,
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
