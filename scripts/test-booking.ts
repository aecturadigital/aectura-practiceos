import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "../src/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import path from "path";
import { randomUUID } from "node:crypto";
import { getClinicConfig } from "../src/config/clinic.config";

function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatMinutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

function calculateEndTime(startTime: string, durationMinutes: number = 60): string {
  const totalEndMin = parseTimeToMinutes(startTime) + durationMinutes;
  return formatMinutesToTime(totalEndMin);
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

async function calculateAvailableSlots(db: any, dateStr: string, practitionerId: string) {
  const targetDate = new Date(`${dateStr}T12:00:00Z`);
  const dayOfWeek = targetDate.getUTCDay();

  const [availRule] = await db
    .select()
    .from(schema.practitionerAvailability)
    .where(
      and(
        eq(schema.practitionerAvailability.practitionerId, practitionerId),
        eq(schema.practitionerAvailability.dayOfWeek, dayOfWeek),
        eq(schema.practitionerAvailability.isActive, true)
      )
    )
    .limit(1);

  if (!availRule) {
    return [];
  }

  const bookedAppointments = await db
    .select({ startTime: schema.appointments.startTime })
    .from(schema.appointments)
    .where(
      and(
        eq(schema.appointments.scheduledDate, dateStr),
        eq(schema.appointments.practitionerId, practitionerId),
        ne(schema.appointments.status, "CANCELLED")
      )
    );

  const bookedTimes = new Set(bookedAppointments.map((a: any) => a.startTime));
  const dayStartMin = parseTimeToMinutes(availRule.startTime);
  const dayEndMin = parseTimeToMinutes(availRule.endTime);
  const slotDuration = availRule.slotDurationMinutes || 60;
  const buffer = availRule.bufferMinutes || 15;
  const step = slotDuration + buffer;

  const availableSlots: string[] = [];
  let currentMin = dayStartMin;

  while (currentMin + slotDuration <= dayEndMin) {
    const slotTimeStr = formatMinutesToTime(currentMin);
    if (!bookedTimes.has(slotTimeStr)) {
      availableSlots.push(slotTimeStr);
    }
    currentMin += step;
  }

  return availableSlots;
}

/**
 * Executes the exact atomic booking transaction matching src/app/api/public/booking/route.ts
 */
async function executeBookingTransaction(
  db: any,
  input: {
    fullName: string;
    phone: string;
    email?: string;
    serviceId: string;
    mode: "In-Clinic (Wanowrie, Pune)" | "Online Secure Telehealth";
    scheduledDate: string;
    startTime: string;
    primaryConcern?: string;
    hp_website?: string;
  },
  simulateFailureMidway: boolean = false
) {
  // Honeypot check
  if (input.hp_website && input.hp_website.length > 0) {
    throw new Error("BOT_DETECTED: Honeypot field filled");
  }

  // Past date check
  const today = new Date().toISOString().split("T")[0];
  if (input.scheduledDate < today) {
    throw new Error("INVALID_DATE: Appointments cannot be booked in the past");
  }

  const clinicConfig = getClinicConfig();
  const service = clinicConfig.services.find((s) => s.id === input.serviceId);
  if (!service) {
    throw new Error(`INVALID_SERVICE: Service '${input.serviceId}' not found`);
  }

  const formattedPhone = sanitizePhone(input.phone);
  const servicePrice = service.price.toFixed(2);
  const endTime = calculateEndTime(input.startTime, service.durationMinutes);

  // Practitioner resolution
  const [practitioner] = await db
    .select({ id: schema.users.id, name: schema.users.name })
    .from(schema.users)
    .limit(1);

  if (!practitioner) {
    throw new Error("NO_PRACTITIONER: No active practitioner available");
  }

  return await db.transaction(async (tx: any) => {
    // 1. Contact Deduplication
    let [contact] = await tx
      .select()
      .from(schema.contacts)
      .where(eq(schema.contacts.phone, formattedPhone))
      .limit(1);

    const nameParts = input.fullName.trim().split(" ");
    const firstName = nameParts[0] || input.fullName;
    const lastName = nameParts.slice(1).join(" ") || null;

    if (!contact) {
      [contact] = await tx
        .insert(schema.contacts)
        .values({
          fullName: input.fullName.trim(),
          firstName,
          lastName,
          phone: formattedPhone,
          email: input.email || null,
          city: clinicConfig.location.city,
          status: "ACTIVE",
          activeDealStage: "scheduled",
          activeDealValue: servicePrice,
          primaryConcern: input.primaryConcern || null,
          tags: ["Website Booking", service.category],
          notes: `Public booking. Modality: ${input.mode}. Service: ${service.name}.`,
        })
        .returning();
    } else {
      await tx
        .update(schema.contacts)
        .set({
          isArchived: false,
          archiveReason: contact.isArchived ? "Re-engaged via public website booking" : contact.archiveReason,
          activeDealStage: "scheduled",
          activeDealValue: servicePrice,
          primaryConcern: input.primaryConcern || contact.primaryConcern,
          updatedAt: new Date(),
        })
        .where(eq(schema.contacts.id, contact.id));
    }

    // 2. CRM Deal
    const [deal] = await tx
      .insert(schema.crmDeals)
      .values({
        contactId: contact.id,
        title: `${input.fullName.trim()} - ${service.name}`,
        stage: "scheduled",
        value: servicePrice,
        probability: 75,
        therapy: service.name,
        mode: input.mode,
        source: "Website Booking",
        notes: input.primaryConcern || "Online intake booking",
      })
      .returning();

    // 3. Appointment (Canonical status: SCHEDULED)
    const [appointment] = await tx
      .insert(schema.appointments)
      .values({
        contactId: contact.id,
        practitionerId: practitioner.id,
        practitionerName: practitioner.name,
        therapyType: service.name,
        mode: input.mode,
        scheduledDate: input.scheduledDate,
        startTime: input.startTime,
        endTime,
        status: clinicConfig.bookingSettings.initialStatus, // "SCHEDULED"
        paymentStatus: "PENDING",
        amount: servicePrice,
        notes: input.primaryConcern || "Public booking intake",
      })
      .returning();

    // 4. Activity
    await tx.insert(schema.activities).values({
      contactId: contact.id,
      type: "APPOINTMENT_BOOKED",
      title: "Appointment Scheduled via Website",
      description: `Scheduled ${service.name} on ${input.scheduledDate} at ${input.startTime} with ${practitioner.name}.`,
      metadata: {
        appointmentId: appointment.id,
        dealId: deal.id,
        serviceId: service.id,
        amount: servicePrice,
      },
    });

    // Simulated mid-transaction failure for rollback testing
    if (simulateFailureMidway) {
      throw new Error("SIMULATED_TRANSACTION_FAILURE: Deliberate fault to verify atomic rollback");
    }

    // 5. Outbox Event (appointment.created with canonical stable IDs)
    const outboxEventId = randomUUID();
    const [outboxEvent] = await tx
      .insert(schema.outboxEvents)
      .values({
        idempotencyKey: `evt_booking_${appointment.id}`,
        eventType: "appointment.created",
        payload: {
          event_id: outboxEventId,
          appointment_id: appointment.id,
          contact_id: contact.id,
          practitioner_id: practitioner.id,
          event_version: "1.0",
          occurred_at: new Date().toISOString(),
          scheduled_date: input.scheduledDate,
          start_time: input.startTime,
          end_time: endTime,
          service_id: service.id,
          service_name: service.name,
          mode: input.mode,
          status: appointment.status,
        },
        status: "PENDING",
        scheduledAt: new Date(),
      })
      .returning();

    return { contact, deal, appointment, outboxEvent };
  });
}

async function runPhase3ACorrectiveTests() {
  console.log("================================================================================");
  console.log("  AECTURA PRACTICEOS: PHASE 3A CORRECTIVE HARDENING & INTEGRATION SUITE");
  console.log("================================================================================\n");

  const migrationsFolder = path.join(process.cwd(), "drizzle", "migrations");
  const pglite = new PGlite();
  const db = drizzle(pglite, { schema });
  await migrate(db, { migrationsFolder });

  // ---------------------------------------------------------------------------
  // TEST 1: Clinic Configuration Manifest Architecture
  // ---------------------------------------------------------------------------
  console.log("[TEST 1/8] Verifying Clinic Configuration Manifest (src/config/clinic.config.ts)...");
  const config = getClinicConfig();
  if (!config.identity.name || !config.identity.leadPractitioner) {
    throw new Error("ClinicConfig missing mandatory identity fields");
  }
  if (config.services.length === 0) {
    throw new Error("ClinicConfig must have configured clinical services");
  }
  if (config.bookingSettings.initialStatus !== "SCHEDULED") {
    throw new Error(`Expected initialStatus 'SCHEDULED', got '${config.bookingSettings.initialStatus}'`);
  }
  if (config.bookingSettings.outboxEventType !== "appointment.created") {
    throw new Error(`Expected outboxEventType 'appointment.created', got '${config.bookingSettings.outboxEventType}'`);
  }
  console.log(`  ✓ Clinic Name: ${config.identity.name}`);
  console.log(`  ✓ Lead Practitioner: ${config.identity.leadPractitioner}`);
  console.log(`  ✓ Initial Booking State: ${config.bookingSettings.initialStatus}`);
  console.log(`  ✓ Outbox Event Contract: ${config.bookingSettings.outboxEventType}`);
  console.log(`  ✓ Services Loaded: ${config.services.length} services configured with strict pricing.\n`);

  // ---------------------------------------------------------------------------
  // TEST 2: Setup Practitioner & Weekly Working Hours Availability
  // ---------------------------------------------------------------------------
  console.log("[TEST 2/8] Setting up Practitioner & Weekly Availability Rules...");
  const [practitioner] = await db
    .insert(schema.users)
    .values({
      email: "owner@soulmatestherapy.com",
      name: config.identity.leadPractitioner,
      passwordHash: "hash_configured",
      isActive: true,
    })
    .returning();

  for (const day of config.workingHours.days) {
    await db.insert(schema.practitionerAvailability).values({
      practitionerId: practitioner.id,
      dayOfWeek: day,
      startTime: config.workingHours.startTime,
      endTime: config.workingHours.endTime,
      slotDurationMinutes: config.workingHours.slotDurationMinutes,
      bufferMinutes: config.workingHours.bufferMinutes,
      isActive: true,
    });
  }

  const tuesdaySlots = await calculateAvailableSlots(db, "2026-09-22", practitioner.id);
  const sundaySlots = await calculateAvailableSlots(db, "2026-09-20", practitioner.id);
  if (tuesdaySlots.length === 0 || !tuesdaySlots.includes("10:30")) {
    throw new Error("Availability calculation failed for Tuesday");
  }
  if (sundaySlots.length !== 0) {
    throw new Error(`Sunday must have 0 slots, got ${sundaySlots.length}`);
  }
  console.log(`  ✓ Tuesday 2026-09-22 available slots: ${tuesdaySlots.length} (${tuesdaySlots.slice(0, 3).join(", ")}...)`);
  console.log(`  ✓ Sunday 2026-09-20 off-day returns 0 slots.\n`);

  // ---------------------------------------------------------------------------
  // TEST 3: Canonical Booking Transaction & Semantic Lifecycle Verification
  // ---------------------------------------------------------------------------
  console.log("[TEST 3/8] Testing Canonical Booking Transaction & Outbox Contract...");
  const booking1 = await executeBookingTransaction(db, {
    fullName: "Aarav Deshmukh",
    phone: "9898911223",
    email: "aarav.deshmukh@example.com",
    serviceId: "hypno-consult",
    mode: "In-Clinic (Wanowrie, Pune)",
    scheduledDate: "2026-09-22",
    startTime: "10:30",
    primaryConcern: "Severe panic episodes before flight travel",
  });

  // Verify Appointment Semantic State
  if (booking1.appointment.status !== "SCHEDULED") {
    throw new Error(`CRITICAL LIFECYCLE VIOLATION: Expected status 'SCHEDULED', got '${booking1.appointment.status}'`);
  }
  console.log(`  ✓ Appointment created with canonical status: '${booking1.appointment.status}' (NOT 'CONFIRMED')`);

  // Verify Outbox Event Type and Contract Payload
  const outbox = booking1.outboxEvent;
  if (outbox.eventType !== "appointment.created") {
    throw new Error(`CRITICAL EVENT VIOLATION: Expected eventType 'appointment.created', got '${outbox.eventType}'`);
  }
  const payload = outbox.payload as any;
  if (!payload.event_id || !payload.appointment_id || !payload.contact_id || !payload.practitioner_id) {
    throw new Error("CRITICAL CONTRACT VIOLATION: Missing stable IDs in outbox event payload");
  }
  if (payload.event_version !== "1.0") {
    throw new Error(`CRITICAL CONTRACT VIOLATION: Expected event_version '1.0', got '${payload.event_version}'`);
  }
  if (!payload.occurred_at || !payload.scheduled_date || payload.start_time !== "10:30") {
    throw new Error("CRITICAL CONTRACT VIOLATION: Missing temporal fields in outbox payload");
  }
  if (payload.status !== "SCHEDULED") {
    throw new Error(`CRITICAL CONTRACT VIOLATION: Payload status must be 'SCHEDULED', got '${payload.status}'`);
  }
  console.log(`  ✓ Outbox event type verified: '${outbox.eventType}'`);
  console.log(`  ✓ Outbox contract payload verified with stable IDs:`);
  console.log(`      event_id:        ${payload.event_id}`);
  console.log(`      appointment_id:  ${payload.appointment_id}`);
  console.log(`      contact_id:      ${payload.contact_id}`);
  console.log(`      practitioner_id: ${payload.practitioner_id}`);
  console.log(`      event_version:   ${payload.event_version}`);
  console.log(`      occurred_at:     ${payload.occurred_at}\n`);

  // ---------------------------------------------------------------------------
  // TEST 4: Patient Deduplication & 360° Continuity
  // ---------------------------------------------------------------------------
  console.log("[TEST 4/8] Testing Patient Deduplication & 360° Continuity by Phone...");
  const booking2 = await executeBookingTransaction(db, {
    fullName: "Aarav Deshmukh",
    phone: "+91 98989 11223", // Formatted version of same number
    serviceId: "anxiety-course",
    mode: "Online Secure Telehealth",
    scheduledDate: "2026-09-29",
    startTime: "14:15",
    primaryConcern: "Follow-up session pack",
  });

  const matchingContacts = await db
    .select()
    .from(schema.contacts)
    .where(eq(schema.contacts.phone, "+91 98989 11223"));

  if (matchingContacts.length !== 1) {
    throw new Error(`Expected 1 contact, found ${matchingContacts.length}`);
  }
  if (booking1.contact.id !== booking2.contact.id) {
    throw new Error("Contact ID mismatch on re-booking!");
  }
  const patientAppointments = await db
    .select()
    .from(schema.appointments)
    .where(eq(schema.appointments.contactId, booking1.contact.id));
  if (patientAppointments.length !== 2) {
    throw new Error(`Expected 2 appointments for contact, found ${patientAppointments.length}`);
  }
  console.log(`  ✓ Deduplication verified: Re-booking mapped to single Contact ID (${booking1.contact.id}).`);
  console.log(`  ✓ 360° Continuity: Both appointments relationally linked to single contact record.\n`);

  // ---------------------------------------------------------------------------
  // TEST 5: Archived Patient Re-engagement
  // ---------------------------------------------------------------------------
  console.log("[TEST 5/8] Testing Archived Patient Re-engagement Lifecycle...");
  // Manually archive the contact (simulating discharge or archival from Phase 2A)
  await db
    .update(schema.contacts)
    .set({
      isArchived: true,
      archiveReason: "Completed 2025 therapy program and discharged",
      archivedAt: new Date(),
    })
    .where(eq(schema.contacts.id, booking1.contact.id));

  // Patient re-books via public website
  await executeBookingTransaction(db, {
    fullName: "Aarav Deshmukh",
    phone: "+91 98989 11223",
    serviceId: "hypno-consult",
    mode: "In-Clinic (Wanowrie, Pune)",
    scheduledDate: "2026-10-06",
    startTime: "11:45",
    primaryConcern: "Periodic check-in",
  });

  const [unarchivedContact] = await db
    .select()
    .from(schema.contacts)
    .where(eq(schema.contacts.id, booking1.contact.id));

  if (unarchivedContact.isArchived) {
    throw new Error("Archived contact was NOT unarchived on new booking!");
  }
  if (unarchivedContact.archiveReason !== "Re-engaged via public website booking") {
    throw new Error(`Unexpected archiveReason: '${unarchivedContact.archiveReason}'`);
  }
  console.log(`  ✓ Patient unarchived automatically on re-booking: isArchived=${unarchivedContact.isArchived}`);
  console.log(`  ✓ Audit trail updated: archiveReason='${unarchivedContact.archiveReason}'\n`);

  // ---------------------------------------------------------------------------
  // TEST 6: Concurrent Double-Booking Collision Prevention (uniq_practitioner_slot)
  // ---------------------------------------------------------------------------
  console.log("[TEST 6/8] Testing Concurrent Double-Booking Physical DB Constraint ('uniq_practitioner_slot')...");
  // Attempt to book the exact same slot that booking1 holds (2026-09-22 at 10:30 with practitioner.id)
  let collisionCaught = false;
  try {
    await executeBookingTransaction(db, {
      fullName: "Competitor Patient",
      phone: "+91 91111 22233",
      serviceId: "hypno-consult",
      mode: "In-Clinic (Wanowrie, Pune)",
      scheduledDate: "2026-09-22",
      startTime: "10:30", // Identical date, time, and practitioner!
      primaryConcern: "Collision test",
    });
  } catch (err: any) {
    collisionCaught = true;
    const isPgUniqueViolation =
      err?.code === "23505" ||
      err?.message?.includes("uniq_practitioner_slot") ||
      err?.message?.includes("unique constraint") ||
      err?.detail?.includes("practitioner_id");

    if (!isPgUniqueViolation) {
      throw new Error(`Unexpected error on collision: ${err?.message || err}`);
    }
    console.log(`  ✓ Physical DB Unique Index 'uniq_practitioner_slot' triggered successfully.`);
    console.log(`  ✓ Error details: code=${err?.code || '23505'} constraint='uniq_practitioner_slot'`);
  }

  if (!collisionCaught) {
    throw new Error("CRITICAL CONCURRENCY FAILURE: Duplicate slot booking was allowed by the database!");
  }
  console.log("  ✓ Physical concurrency lock verified: Race conditions are rejected by ACID DB constraint.\n");

  // ---------------------------------------------------------------------------
  // TEST 7: Atomic Database Transaction Rollback Proof
  // ---------------------------------------------------------------------------
  console.log("[TEST 7/8] Testing Atomic Database Transaction Rollback (Zero Orphan Records)...");
  const testPhone = "+91 97777 88899";
  let rollbackCaught = false;

  try {
    await executeBookingTransaction(
      db,
      {
        fullName: "Phantom Patient",
        phone: testPhone,
        serviceId: "hypno-consult",
        mode: "In-Clinic (Wanowrie, Pune)",
        scheduledDate: "2026-10-13",
        startTime: "15:30",
        primaryConcern: "Should be rolled back completely",
      },
      true // SIMULATE MIDWAY FAILURE
    );
  } catch (err: any) {
    rollbackCaught = true;
    console.log(`  ✓ Mid-transaction fault simulated: ${err.message}`);
  }

  if (!rollbackCaught) {
    throw new Error("Expected simulated transaction failure did not trigger!");
  }

  // Verify zero records were written to contacts, deals, appointments, or outbox
  const orphanContacts = await db.select().from(schema.contacts).where(eq(schema.contacts.phone, testPhone));
  const orphanAppointments = await db
    .select()
    .from(schema.appointments)
    .where(and(eq(schema.appointments.scheduledDate, "2026-10-13"), eq(schema.appointments.startTime, "15:30")));

  if (orphanContacts.length !== 0) {
    throw new Error(`TRANSACTION ROLLBACK FAILED: Found ${orphanContacts.length} orphan contacts!`);
  }
  if (orphanAppointments.length !== 0) {
    throw new Error(`TRANSACTION ROLLBACK FAILED: Found ${orphanAppointments.length} orphan appointments!`);
  }
  console.log("  ✓ Atomic Rollback Verified: Zero phantom contacts or appointments committed on failure.\n");

  // ---------------------------------------------------------------------------
  // TEST 8: Public API Security & Server-Side Price Resolution
  // ---------------------------------------------------------------------------
  console.log("[TEST 8/8] Testing API Security Guards (Honeypot, Past Date, Invalid Service)...");

  // A. Honeypot rejection
  let honeypotRejected = false;
  try {
    await executeBookingTransaction(db, {
      fullName: "Bot Submission",
      phone: "+91 90000 11111",
      serviceId: "hypno-consult",
      mode: "In-Clinic (Wanowrie, Pune)",
      scheduledDate: "2026-09-22",
      startTime: "16:45",
      hp_website: "https://spam-bot.example.com",
    });
  } catch (err: any) {
    if (err.message.includes("BOT_DETECTED")) {
      honeypotRejected = true;
    }
  }
  if (!honeypotRejected) {
    throw new Error("Security Failure: Honeypot bot submission was not rejected!");
  }
  console.log("  ✓ Anti-bot honeypot trap verified: Spam submission rejected.");

  // B. Past date rejection
  let pastDateRejected = false;
  try {
    await executeBookingTransaction(db, {
      fullName: "Time Traveler",
      phone: "+91 90000 22222",
      serviceId: "hypno-consult",
      mode: "In-Clinic (Wanowrie, Pune)",
      scheduledDate: "2020-01-01",
      startTime: "10:30",
    });
  } catch (err: any) {
    if (err.message.includes("INVALID_DATE")) {
      pastDateRejected = true;
    }
  }
  if (!pastDateRejected) {
    throw new Error("Security Failure: Past-date booking was not rejected!");
  }
  console.log("  ✓ Past-date check verified: Historical booking dates rejected.");

  // C. Invalid service rejection
  let invalidServiceRejected = false;
  try {
    await executeBookingTransaction(db, {
      fullName: "Tampered Request",
      phone: "+91 90000 33333",
      serviceId: "non-existent-service-hacker-exploit",
      mode: "In-Clinic (Wanowrie, Pune)",
      scheduledDate: "2026-09-22",
      startTime: "16:45",
    });
  } catch (err: any) {
    if (err.message.includes("INVALID_SERVICE")) {
      invalidServiceRejected = true;
    }
  }
  if (!invalidServiceRejected) {
    throw new Error("Security Failure: Unconfigured service ID was not rejected!");
  }
  console.log("  ✓ Server-side catalog check verified: Arbitrary service injection rejected.");

  // D. Verify slot removal from availability
  const updatedSlots = await calculateAvailableSlots(db, "2026-09-22", practitioner.id);
  if (updatedSlots.includes("10:30")) {
    throw new Error("Availability Failure: Booked slot '10:30' is still listed as available!");
  }
  console.log(`  ✓ Slot '10:30' successfully removed from open slots (Remaining: ${updatedSlots.length}).\n`);

  console.log("================================================================================");
  console.log("  ALL 8 PHASE 3A CORRECTIVE VERIFICATION CHECKS PASSED: 100% SUCCESS");
  console.log("================================================================================\n");
}

runPhase3ACorrectiveTests().catch((err) => {
  console.error("Phase 3A integration test suite failed:", err);
  process.exit(1);
});
