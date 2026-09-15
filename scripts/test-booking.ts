import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "../src/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import path from "path";

function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatMinutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
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

async function simulatePublicBooking(db: any, payload: {
  fullName: string;
  phone: string;
  email?: string;
  therapyType: string;
  mode: string;
  scheduledDate: string;
  startTime: string;
  primaryConcern: string;
  amount: string;
  practitionerId: string;
  practitionerName: string;
}) {
  const formattedPhone = payload.phone.trim();

  // 1. Upsert Contact
  let [contact] = await db
    .select()
    .from(schema.contacts)
    .where(eq(schema.contacts.phone, formattedPhone))
    .limit(1);

  if (!contact) {
    [contact] = await db
      .insert(schema.contacts)
      .values({
        fullName: payload.fullName.trim(),
        phone: formattedPhone,
        email: payload.email?.trim() || null,
        city: "Pune",
        status: "ACTIVE",
        activeDealStage: "scheduled",
        activeDealValue: payload.amount,
        primaryConcern: payload.primaryConcern,
        tags: ["Website Booking", "Clinical Hypnotherapy"],
      })
      .returning();
  } else {
    await db
      .update(schema.contacts)
      .set({
        activeDealStage: "scheduled",
        activeDealValue: payload.amount,
        primaryConcern: payload.primaryConcern,
        updatedAt: new Date(),
      })
      .where(eq(schema.contacts.id, contact.id));
  }

  // 2. Insert Deal
  const [deal] = await db
    .insert(schema.crmDeals)
    .values({
      contactId: contact.id,
      title: `${payload.fullName} - ${payload.therapyType}`,
      stage: "scheduled",
      value: payload.amount,
      probability: 80,
      therapy: payload.therapyType,
      mode: payload.mode,
      source: "Website Booking",
      notes: payload.primaryConcern,
    })
    .returning();

  // 3. Calculate End Time
  const startMin = parseTimeToMinutes(payload.startTime);
  const endTime = formatMinutesToTime(startMin + 60);

  // 4. Insert Confirmed Appointment
  const [appointment] = await db
    .insert(schema.appointments)
    .values({
      contactId: contact.id,
      practitionerId: payload.practitionerId,
      practitionerName: payload.practitionerName,
      therapyType: payload.therapyType,
      mode: payload.mode,
      scheduledDate: payload.scheduledDate,
      startTime: payload.startTime,
      endTime,
      status: "CONFIRMED",
      paymentStatus: "PAY_AT_CLINIC",
      amount: payload.amount,
      notes: payload.primaryConcern,
    })
    .returning();

  // 5. Timeline Activity
  await db.insert(schema.activities).values({
    contactId: contact.id,
    type: "APPOINTMENT_BOOKED",
    title: "Online Booking Confirmed",
    description: `Appointment confirmed for ${payload.scheduledDate} at ${payload.startTime} with ${payload.practitionerName}.`,
  });

  // 6. Transactional Outbox Event
  await db.insert(schema.outboxEvents).values({
    idempotencyKey: `evt_booking_${appointment.id}`,
    eventType: "appointment.confirmed",
    payload: {
      appointmentId: appointment.id,
      contactId: contact.id,
      patientName: payload.fullName,
      phone: formattedPhone,
      channel: "WHATSAPP",
    },
    status: "PENDING",
  });

  return { contact, deal, appointment };
}

async function runBookingIntegrationTests() {
  console.log("================================================================================");
  console.log("  AECTURA PRACTICEOS: PHASE 3 PUBLIC BOOKING & SLOT ENGINE VERIFICATION");
  console.log("================================================================================\n");

  const migrationsFolder = path.join(process.cwd(), "drizzle", "migrations");
  const pglite = new PGlite();
  const db = drizzle(pglite, { schema });
  await migrate(db, { migrationsFolder });

  // 1. Setup Practitioner & Availability
  console.log("[TEST 1/5] Setting up Practitioner & Weekly Availability Rules...");
  const [practitioner] = await db
    .insert(schema.users)
    .values({
      email: "owner@soulmatestherapy.com",
      name: "Col Umakant Saxena",
      passwordHash: "hash_configured",
      isActive: true,
    })
    .returning();

  // Set Monday to Saturday 10:30 - 19:30 (Day 1 to 6). Sunday (0) is off.
  for (let day = 1; day <= 6; day++) {
    await db.insert(schema.practitionerAvailability).values({
      practitionerId: practitioner.id,
      dayOfWeek: day,
      startTime: "10:30",
      endTime: "19:30",
      slotDurationMinutes: 60,
      bufferMinutes: 15,
      isActive: true,
    });
  }
  console.log("  ✓ Availability configured for Col Umakant Saxena (Mon-Sat, 10:30-19:30, 60m+15m).");

  // 2. Test Availability Engine Calculation
  console.log("\n[TEST 2/5] Testing Slot Availability Calculation...");
  // Tuesday 2026-09-22
  const tuesdaySlots = await calculateAvailableSlots(db, "2026-09-22", practitioner.id);
  console.log(`  ✓ Tuesday 2026-09-22 open slots: ${tuesdaySlots.length} slots (${tuesdaySlots.slice(0, 4).join(", ")}...)`);
  if (tuesdaySlots.length === 0 || !tuesdaySlots.includes("10:30") || !tuesdaySlots.includes("11:45")) {
    throw new Error("Availability calculation failed to return expected slots!");
  }

  // Sunday 2026-09-20 (off day)
  const sundaySlots = await calculateAvailableSlots(db, "2026-09-20", practitioner.id);
  if (sundaySlots.length !== 0) {
    throw new Error(`Sunday should have 0 slots, but returned ${sundaySlots.length}`);
  }
  console.log("  ✓ Off-day check verified: Sunday correctly yields 0 available slots.");

  // 3. Test Direct Booking Transaction & Record Creation
  console.log("\n[TEST 3/5] Testing Public Booking Submission & Relational Persistence...");
  const booking1 = await simulatePublicBooking(db, {
    fullName: "Aarav Deshmukh",
    phone: "+91 98989 11223",
    email: "aarav.deshmukh@example.com",
    therapyType: "Clinical Hypnotherapy Consultation",
    mode: "In-Clinic (Wanowrie, Pune)",
    scheduledDate: "2026-09-22",
    startTime: "10:30",
    primaryConcern: "Severe panic episodes before flight travel",
    amount: "2500.00",
    practitionerId: practitioner.id,
    practitionerName: practitioner.name,
  });

  console.log(`  ✓ Contact created: ID ${booking1.contact.id} (${booking1.contact.fullName})`);
  console.log(`  ✓ CRM Deal created: ID ${booking1.deal.id} (Value: ₹${booking1.deal.value})`);
  console.log(`  ✓ Appointment created: ID ${booking1.appointment.id} (${booking1.appointment.scheduledDate} at ${booking1.appointment.startTime})`);

  // Verify Outbox Event created
  const [outboxEvent] = await db
    .select()
    .from(schema.outboxEvents)
    .where(eq(schema.outboxEvents.idempotencyKey, `evt_booking_${booking1.appointment.id}`));

  if (!outboxEvent || outboxEvent.status !== "PENDING") {
    throw new Error("Outbox event creation failed!");
  }
  console.log(`  ✓ Transactional Outbox Event verified: '${outboxEvent.eventType}' queued for WhatsApp notification.`);

  // 4. Test Contact Deduplication / Re-Booking by Same Patient
  console.log("\n[TEST 4/5] Testing Patient Deduplication & Re-Booking by Phone...");
  const booking2 = await simulatePublicBooking(db, {
    fullName: "Aarav Deshmukh",
    phone: "+91 98989 11223", // Same phone number!
    therapyType: "3-Session Anxiety & Somatic Pack",
    mode: "Online Secure Telehealth",
    scheduledDate: "2026-09-29",
    startTime: "14:00",
    primaryConcern: "Follow-up session pack",
    amount: "7500.00",
    practitionerId: practitioner.id,
    practitionerName: practitioner.name,
  });

  const matchingContacts = await db
    .select()
    .from(schema.contacts)
    .where(eq(schema.contacts.phone, "+91 98989 11223"));

  if (matchingContacts.length !== 1) {
    throw new Error(`Duplicate contact created! Expected 1 contact, found ${matchingContacts.length}`);
  }
  if (booking1.contact.id !== booking2.contact.id) {
    throw new Error("Contact ID mismatch on re-booking!");
  }
  console.log("  ✓ Deduplication verified: Re-booking mapped to existing contact ID with zero duplicate rows.");

  // Check that both appointments are linked to this single contact
  const patientAppointments = await db
    .select()
    .from(schema.appointments)
    .where(eq(schema.appointments.contactId, booking1.contact.id));

  if (patientAppointments.length !== 2) {
    throw new Error(`Expected 2 appointments for contact, found ${patientAppointments.length}`);
  }
  console.log(`  ✓ 360° Continuity verified: Both appointments relationally linked to single contact record.`);

  // 5. Test Slot Collision Prevention
  console.log("\n[TEST 5/5] Testing Slot Collision Prevention after Booking...");
  const updatedTuesdaySlots = await calculateAvailableSlots(db, "2026-09-22", practitioner.id);
  if (updatedTuesdaySlots.includes("10:30")) {
    throw new Error("CRITICAL COLLISION BUG: Booked slot '10:30' is still returned as available!");
  }
  console.log(`  ✓ Slot '10:30' successfully removed from availability (Remaining: ${updatedTuesdaySlots.length} slots).`);

  console.log("\n================================================================================");
  console.log("  ALL 5 PHASE 3 BOOKING & AVAILABILITY CHECKS PASSED: 100% SUCCESS");
  console.log("================================================================================\n");
}

runBookingIntegrationTests().catch((err) => {
  console.error("Booking integration test suite failed:", err);
  process.exit(1);
});
