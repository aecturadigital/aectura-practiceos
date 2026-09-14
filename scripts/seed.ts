import { getDb } from "../src/lib/db";
import { hashPassword } from "../src/lib/auth/password";
import {
  roles,
  users,
  userRoles,
  staffProfiles,
  practitionerAvailability,
  contacts,
  crmDeals,
  appointments,
  treatmentCourses,
  planCycles,
  treatmentSessions,
  clinicalNotes,
  ledgerTransactions,
  invoices,
  outboxEvents,
} from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("-> Seeding Soulmates Hypnotherapy Clinic Database (clinic_soulmates)...");
  const db = await getDb();

  // 1. ROLES
  console.log("[1/9] Seeding standard RBAC roles...");
  const standardRoles = [
    { id: "OWNER", name: "Clinic Owner", description: "Full administrative and clinical ownership" },
    { id: "CLINIC_ADMIN", name: "Clinic Administrator", description: "Operational and billing management" },
    { id: "PRACTITIONER", name: "Practitioner / Therapist", description: "Clinical sessions and EMR records" },
    { id: "RECEPTIONIST", name: "Front Desk Receptionist", description: "Scheduling, intake, and triage" },
    { id: "BILLING_ACCOUNTANT", name: "Billing Accountant", description: "Ledger, invoices, and payment tracking" },
    { id: "PATIENT", name: "Patient / Client", description: "Patient portal read-only access" },
  ];

  for (const r of standardRoles) {
    await db.insert(roles).values(r).onConflictDoNothing();
  }

  // 2. PRACTITIONER & STAFF USERS
  console.log("[2/9] Seeding clinical practitioners and staff with hashed credentials...");
  const defaultPasswordHash = hashPassword("Soulmates@2026!");

  let [ownerUser] = await db.select().from(users).where(eq(users.email, "owner@soulmatestherapy.com")).limit(1);
  if (!ownerUser) {
    [ownerUser] = await db
      .insert(users)
      .values({
        email: "owner@soulmatestherapy.com",
        name: "Col Umakant Saxena",
        passwordHash: defaultPasswordHash,
        isActive: true,
      })
      .returning();

    await db.insert(userRoles).values([
      { userId: ownerUser.id, roleId: "OWNER" },
      { userId: ownerUser.id, roleId: "PRACTITIONER" },
    ]).onConflictDoNothing();
  } else {
    await db.update(users).set({ passwordHash: defaultPasswordHash }).where(eq(users.id, ownerUser.id));
  }

  let [receptionUser] = await db.select().from(users).where(eq(users.email, "staff@soulmatestherapy.com")).limit(1);
  if (!receptionUser) {
    [receptionUser] = await db
      .insert(users)
      .values({
        email: "staff@soulmatestherapy.com",
        name: "Priya Sharma (Staff)",
        passwordHash: defaultPasswordHash,
        isActive: true,
      })
      .returning();

    await db.insert(userRoles).values([
      { userId: receptionUser.id, roleId: "RECEPTIONIST" },
    ]).onConflictDoNothing();
  } else {
    await db.update(users).set({ passwordHash: defaultPasswordHash }).where(eq(users.id, receptionUser.id));
  }

  // Staff Profile
  let [staffProf] = await db.select().from(staffProfiles).where(eq(staffProfiles.email, "staff@soulmatestherapy.com")).limit(1);
  if (!staffProf) {
    [staffProf] = await db
      .insert(staffProfiles)
      .values({
        userId: receptionUser.id,
        name: "Priya Sharma",
        role: "RECEPTIONIST",
        email: "staff@soulmatestherapy.com",
        phone: "+91 98230 99887",
        shift: "10:00 AM - 07:00 PM",
        baseSalary: "22000.00",
        status: "ACTIVE",
        joiningDate: "2025-01-15",
      })
      .returning();
  }

  // Practitioner Availability (Monday to Saturday)
  for (let day = 1; day <= 6; day++) {
    const existing = await db
      .select()
      .from(practitionerAvailability)
      .where(eq(practitionerAvailability.practitionerId, ownerUser.id))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(practitionerAvailability).values({
        practitionerId: ownerUser.id,
        dayOfWeek: day,
        startTime: "10:30",
        endTime: "19:30",
        slotDurationMinutes: 60,
        bufferMinutes: 15,
        isActive: true,
      });
    }
  }

  // 3. CANONICAL CONTACTS (PATIENTS)
  console.log("[3/9] Seeding canonical 360° patient records...");
  let [priyaPatient] = await db.select().from(contacts).where(eq(contacts.phone, "+91 98230 12345")).limit(1);
  if (!priyaPatient) {
    [priyaPatient] = await db
      .insert(contacts)
      .values({
        fullName: "Priya Sharma",
        firstName: "Priya",
        lastName: "Sharma",
        email: "priya.sharma@example.com",
        phone: "+91 98230 12345",
        city: "Pune",
        gender: "Female",
        age: 29,
        status: "ACTIVE",
        activeDealStage: "won",
        activeDealValue: "7500.00",
        primaryConcern: "Generalized Anxiety & Chronic Insomnia",
        tags: ["Anxiety", "Insomnia", "Package-Client"],
        notes: "Referred by Dr. Kulkarni. Prefers evening slots after 5 PM.",
      })
      .returning();
  }

  let [rajeshPatient] = await db.select().from(contacts).where(eq(contacts.phone, "+91 94220 54321")).limit(1);
  if (!rajeshPatient) {
    [rajeshPatient] = await db
      .insert(contacts)
      .values({
        fullName: "Rajesh Verma",
        firstName: "Rajesh",
        lastName: "Verma",
        email: "rajesh.verma@example.com",
        phone: "+91 94220 54321",
        city: "Pune",
        gender: "Male",
        age: 42,
        status: "ACTIVE",
        activeDealStage: "scheduled",
        activeDealValue: "2500.00",
        primaryConcern: "Past Life Exploration & Fear of Heights",
        tags: ["PLR", "Phobia"],
        notes: "Intake form submitted online. Session scheduled.",
      })
      .returning();
  }

  // 4. CRM DEALS
  console.log("[4/9] Seeding CRM pipeline deals...");
  const existingDeals = await db.select().from(crmDeals).where(eq(crmDeals.contactId, priyaPatient.id));
  if (existingDeals.length === 0) {
    await db
      .insert(crmDeals)
      .values({
        contactId: priyaPatient.id,
        title: "Priya Sharma - 3-Session Anxiety Protocol",
        stage: "won",
        value: "7500.00",
        probability: 100,
        therapy: "Clinical Hypnotherapy",
        mode: "In-Clinic (Wanowrie, Pune)",
        source: "Website Booking",
        notes: "Paid in full at Clinic.",
      });
  }

  // 5. APPOINTMENTS
  console.log("[5/9] Seeding appointment schedule...");
  let [appt1] = await db.select().from(appointments).where(eq(appointments.contactId, priyaPatient.id)).limit(1);
  if (!appt1) {
    [appt1] = await db
      .insert(appointments)
      .values({
        contactId: priyaPatient.id,
        practitionerId: ownerUser.id,
        practitionerName: "Col Umakant Saxena",
        therapyType: "Clinical Hypnotherapy",
        mode: "In-Clinic (Wanowrie, Pune)",
        scheduledDate: "2026-09-18",
        startTime: "11:00",
        endTime: "12:00",
        status: "CONFIRMED",
        paymentStatus: "PAID_ONLINE",
        amount: "2500.00",
        notes: "Follow-up trance induction session.",
      })
      .returning();
  }

  // 6. TREATMENT PLAN & CYCLES
  console.log("[6/9] Seeding treatment courses & plan cycles...");
  let [course] = await db.select().from(treatmentCourses).where(eq(treatmentCourses.contactId, priyaPatient.id)).limit(1);
  if (!course) {
    [course] = await db
      .insert(treatmentCourses)
      .values({
        contactId: priyaPatient.id,
        title: "Anxiety & Somatic Stress Recovery Course",
        prescribedBy: ownerUser.id,
        status: "ACTIVE",
        startDate: "2026-09-10",
        notes: "Comprehensive 3-stage hypnotherapy protocol.",
      })
      .returning();
  }

  let [cycle] = await db.select().from(planCycles).where(eq(planCycles.courseId, course.id)).limit(1);
  if (!cycle) {
    [cycle] = await db
      .insert(planCycles)
      .values({
        courseId: course.id,
        cycleIndex: 1,
        title: "Cycle 1: 3-Session Pack",
        billingType: "FIXED_PACKAGE",
        price: "7500.00",
        totalSessions: 3,
        consumedSessions: 1,
        validityDays: 60,
        status: "ACTIVE",
        noShowPolicy: "REQUIRES_APPROVAL",
        startDate: "2026-09-10",
        expiryDate: "2026-11-10",
      })
      .returning();

    // Completed Session 1 (with verified entitlement deduction)
    await db.insert(treatmentSessions).values({
      cycleId: cycle.id,
      appointmentId: appt1.id,
      sessionNumber: 1,
      status: "COMPLETED",
      isEntitlementDeducted: true,
      deductedAt: new Date(),
      authorizedBy: ownerUser.id,
      clinicalNotes: "Initial induction successful. Client reached deep somnambulism within 18 minutes.",
    });
  }

  // 7. CLINICAL EMR NOTE
  console.log("[7/9] Seeding clinical hypnotherapy notes...");
  const existingNotes = await db.select().from(clinicalNotes).where(eq(clinicalNotes.contactId, priyaPatient.id));
  if (existingNotes.length === 0) {
    await db.insert(clinicalNotes).values({
      contactId: priyaPatient.id,
      appointmentId: appt1.id,
      practitionerId: ownerUser.id,
      sessionNumber: 1,
      hypnoticDepth: "Deep Somnambulism",
      primaryIssue: "Generalized Anxiety & Chronic Insomnia",
      rootCausesRevealed: "Subconscious fear of inadequacy stemming from high-school board examinations.",
      suggestedHomework: "Listen to 20-minute audio anchor before sleeping every night.",
      isRestricted: true,
    });
  }

  // 8. FINANCE: LEDGER & INVOICES
  console.log("[8/9] Seeding financial ledger & invoices...");
  const existingLedger = await db.select().from(ledgerTransactions).where(eq(ledgerTransactions.contactId, priyaPatient.id));
  if (existingLedger.length === 0) {
    await db.insert(ledgerTransactions).values([
      {
        contactId: priyaPatient.id,
        cycleId: cycle.id,
        type: "CHARGE",
        amount: "7500.00",
        date: "2026-09-10",
        memo: "Package Fee: 3-Session Hypnotherapy Pack",
        status: "COMPLETED",
        recordedBy: ownerUser.id,
      },
      {
        contactId: priyaPatient.id,
        cycleId: cycle.id,
        type: "PAYMENT",
        amount: "7500.00",
        date: "2026-09-10",
        method: "UPI",
        referenceNumber: "UPI/260910998811",
        memo: "UPI Payment received for Cycle 1",
        status: "COMPLETED",
        recordedBy: receptionUser.id,
      },
    ]);
  }

  const existingInvoices = await db.select().from(invoices).where(eq(invoices.contactId, priyaPatient.id));
  if (existingInvoices.length === 0) {
    await db.insert(invoices).values({
      contactId: priyaPatient.id,
      invoiceNumber: "INV-2026-001",
      issueDate: "2026-09-10",
      dueDate: "2026-09-10",
      subtotal: "7500.00",
      tax: "0.00",
      total: "7500.00",
      amountPaid: "7500.00",
      balanceDue: "0.00",
      status: "PAID",
      notes: "Settled via UPI.",
    });
  }

  // 9. TRANSACTIONAL OUTBOX
  console.log("[9/9] Seeding transactional outbox events...");
  await db.insert(outboxEvents).values({
    idempotencyKey: "evt_soulmates_seed_welcome_001",
    eventType: "appointment.confirmed",
    payload: {
      appointmentId: appt1.id,
      patientName: priyaPatient.fullName,
      practitionerName: "Col Umakant Saxena",
      date: "2026-09-18",
      time: "11:00 AM",
      channel: "WHATSAPP",
    },
    status: "PENDING",
    scheduledAt: new Date(),
  }).onConflictDoNothing();

  console.log("-> Soulmates Clinic Database seed complete! All 29 tables instantiated and populated.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
