---
name: appointment-engine
description: >-
  Governs scheduling mathematics, practitioner availability rules, service durations,
  pre- and post-buffers, break intervals, holidays, multi-location clinics, conflict resolution,
  rescheduling, cancellations, no-show tracking, and timezone conversions. Activate whenever
  working on calendars, slot generation, appointment booking, or availability checks.
---

# Appointment Engine & Scheduling Mathematics

Scheduling in private healthcare practices requires strict algorithmic rigor. A double-booking or timezone mismatch directly damages clinic revenue and patient trust.

---

## 1. Slot Generation Pipeline

When a patient requests available times for a service with duration $D$ and practitioner $P$:

$$\text{Slot Interval} = [\text{Start Time} - \text{Buffer}_{\text{pre}}, \; \text{End Time} + \text{Buffer}_{\text{post}}]$$

### The 7-Filter Algorithm
1. **Practitioner Weekly Roster**: Check if day of week and requested time fall within the practitioner's active working hours.
2. **Clinic & Public Holidays**: Exclude clinic holidays and practitioner-specific time-off requests.
3. **Existing Confirmed Appointments**: Check for overlap against `appointments` where `practitioner_id = P` and `status IN ('confirmed', 'in_progress')`.
4. **Service Buffers**: Add `service.buffer_before_minutes` and `service.buffer_after_minutes` (e.g. 10 minutes post-session room sanitize/note completion).
5. **Room / Location Capacity**: If service requires a specialized room (e.g., Dental Chair 1, Soundproof Therapy Room), check room availability.
6. **Notice Windows**: Enforce clinic rules (e.g. minimum 2 hours advance notice, maximum 60 days in advance).
7. **Timezone Normalization**: Store all timestamps in UTC (`timestamp with time zone`); render in clinic or patient local timezone (`Intl.DateTimeFormat`).

---

## 2. Appointment State Machine

```
              [Public / Staff]
                     |
                     v
             +---------------+
             |   CONFIRMED   |
             +-------+-------+
                     |
         +-----------+-----------+
         |           |           |
         v           v           v
  +--------------+  +-------+  +---------+
  |  COMPLETED   |  | CANCELED |  NO-SHOW |
  +--------------+  +-------+  +---------+
         |              |           |
         v              v           v
  Emits Webhook:   Emits Webhook:  Emits Webhook:
  `appointment.    `appointment.   `appointment.
   completed`       canceled`       no_show`
```

---

## 3. Concurrency & Overlap Prevention

To prevent race conditions during concurrent bookings of the same slot, wrap slot creation in an atomic check-and-insert transaction with an advisory lock or explicit SQL constraint:

```typescript
// lib/appointments/book.ts
export async function bookAppointment(tenantId: string, data: BookingInput) {
  return await db.transaction(async (tx) => {
    // 1. Check for conflicting overlaps
    const overlaps = await tx
      .select({ id: appointments.id })
      .from(appointments)
      .where(
        and(
          eq(appointments.tenantId, tenantId),
          eq(appointments.practitionerId, data.practitionerId),
          eq(appointments.status, "confirmed"),
          or(
            and(
              lte(appointments.startTime, data.startTime),
              gt(appointments.endTime, data.startTime)
            ),
            and(
              lt(appointments.startTime, data.endTime),
              gte(appointments.endTime, data.endTime)
            )
          )
        )
      );

    if (overlaps.length > 0) {
      throw new ConflictError("Selected time slot is no longer available.");
    }

    // 2. Insert appointment
    const [appointment] = await tx
      .insert(appointments)
      .values({
        tenantId,
        ...data,
        status: "confirmed",
      })
      .returning();

    return appointment;
  });
}
```

---

## 4. Rescheduling and Cancellation Policies

- **Late Cancellation Threshold**: Clinics configure a cut-off (e.g. 24 or 48 hours).
- **Patient Rescheduling**: Generates a new appointment record while preserving the previous appointment ID in `rescheduled_from_id` for audit history.
- **Buffers Enforcement**: Post-session buffers ensure practitioners have adequate time to finish clinical notes before their next patient arrives.
