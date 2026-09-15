/**
 * Timezone-aware date & time utilities for Aectura PracticeOS.
 * Converts local clinic date/time to exact UTC/timestamptz instants
 * across arbitrary timezones (e.g. Asia/Kolkata, Asia/Dubai, Europe/London, America/New_York)
 * handling Daylight Saving Time (DST) and midnight boundaries without hardcoded offsets.
 */

export function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

export function formatMinutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const totalEndMin = parseTimeToMinutes(startTime) + durationMinutes;
  return formatMinutesToTime(totalEndMin);
}

/**
 * Converts a clinic's local date string (YYYY-MM-DD) and time string (HH:MM)
 * in a specified IANA timezone into an exact UTC Date instance.
 */
export function localDateTimeToUtc(dateStr: string, timeStr: string, timeZone: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);

  // Initial UTC guess
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));

  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });

  const parts = dtf.formatToParts(utcGuess);
  const partMap: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      partMap[part.type] = parseInt(part.value, 10);
    }
  }

  let targetHour = partMap.hour === 24 ? 0 : partMap.hour;
  const asInTz = Date.UTC(
    partMap.year,
    partMap.month - 1,
    partMap.day,
    targetHour,
    partMap.minute,
    partMap.second || 0
  );

  const offsetMs = asInTz - utcGuess.getTime();
  return new Date(utcGuess.getTime() - offsetMs);
}

/**
 * Returns today's date in YYYY-MM-DD in the target clinic timezone.
 */
export function getTodayInTimezone(timeZone: string, refDate: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(refDate);
}

/**
 * Returns the current time in HH:MM (24-hour) in the target clinic timezone.
 */
export function getCurrentTimeInTimezone(timeZone: string, refDate: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(refDate);
}

/**
 * Returns the day of week (0 = Sunday, 1 = Monday ... 6 = Saturday)
 * for a given date in the target clinic timezone.
 */
export function getDayOfWeekInTimezone(dateStr: string, timeZone: string): number {
  const utcMoment = localDateTimeToUtc(dateStr, "12:00", timeZone);
  const dayStr = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(utcMoment);

  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return dayMap[dayStr] ?? 0;
}
