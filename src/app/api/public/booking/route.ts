import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  contacts,
  crmDeals,
  appointments,
  activities,
  outboxEvents,
  users,
  userRoles,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

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

function calculateEndTime(startTime: string, durationMinutes: number = 60): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const totalEndMin = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalEndMin / 60);
  const endMinutes = totalEndMin % 60;
  return `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      phone,
      email,
      therapyType = "Clinical Hypnotherapy Consultation",
      mode = "In-Clinic (Wanowrie, Pune)",
      scheduledDate,
      startTime,
      primaryConcern,
      amount = "2500.00",
    } = body;

    // 1. Validate mandatory fields
    if (!fullName || !phone || !scheduledDate || !startTime) {
      return NextResponse.json(
        { error: "Full name, phone number, date, and time slot are required" },
        { status: 400 }
      );
    }

    const formattedPhone = sanitizePhone(phone);
    const db = await getDb();

    // 2. Resolve Lead Clinical Practitioner (Col Umakant Saxena)
    const [leadPractitioner] = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .innerJoin(userRoles, eq(users.id, userRoles.userId))
      .where(and(eq(userRoles.roleId, "PRACTITIONER"), eq(users.isActive, true)))
      .limit(1);

    const practitionerId = leadPractitioner?.id || null;
    const practitionerName = leadPractitioner?.name || "Col Umakant Saxena";

    // 3. Check for existing contact by sanitized phone or email
    let [contact] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.phone, formattedPhone))
      .limit(1);

    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] || fullName;
    const lastName = nameParts.slice(1).join(" ") || null;

    if (!contact) {
      // Create new canonical Contact record
      [contact] = await db
        .insert(contacts)
        .values({
          fullName: fullName.trim(),
          firstName,
          lastName,
          phone: formattedPhone,
          email: email?.trim() || null,
          city: "Pune",
          status: "ACTIVE",
          activeDealStage: "scheduled",
          activeDealValue: amount.toString(),
          primaryConcern: primaryConcern?.trim() || null,
          tags: ["Website Booking", "Clinical Hypnotherapy"],
          notes: `Web booking inquiry received. Mode: ${mode}. Primary concern: ${primaryConcern || "N/A"}`,
        })
        .returning();
    } else {
      // Update existing contact deal stage & concerns
      await db
        .update(contacts)
        .set({
          activeDealStage: "scheduled",
          activeDealValue: amount.toString(),
          primaryConcern: primaryConcern?.trim() || contact.primaryConcern,
          updatedAt: new Date(),
        })
        .where(eq(contacts.id, contact.id));
    }

    // 4. Create CRM Deal
    const [deal] = await db
      .insert(crmDeals)
      .values({
        contactId: contact.id,
        title: `${fullName.trim()} - ${therapyType}`,
        stage: "scheduled",
        value: amount.toString(),
        probability: 80,
        therapy: therapyType,
        mode,
        source: "Website Booking",
        notes: primaryConcern?.trim() || "Initial web booking intake",
      })
      .returning();

    // 5. Calculate slot end time (60-minute clinical consultation)
    const endTime = calculateEndTime(startTime, 60);

    // 6. Create Confirmed Appointment
    const [appointment] = await db
      .insert(appointments)
      .values({
        contactId: contact.id,
        practitionerId,
        practitionerName,
        therapyType,
        mode,
        scheduledDate,
        startTime,
        endTime,
        status: "CONFIRMED",
        paymentStatus: "PAY_AT_CLINIC",
        amount: amount.toString(),
        notes: `Online appointment requested: ${therapyType} (${mode}). Concern: ${primaryConcern || "Standard intake"}`,
      })
      .returning();

    // 7. Record 360° Timeline Activity
    await db.insert(activities).values({
      contactId: contact.id,
      type: "APPOINTMENT_BOOKED",
      title: "Online Booking Confirmed",
      description: `Appointment confirmed for ${scheduledDate} at ${startTime} with ${practitionerName} (${mode}).`,
      metadata: {
        appointmentId: appointment.id,
        dealId: deal.id,
        therapyType,
        amount,
      },
    });

    // 8. Queue Transactional Outbox Notification Event (for n8n WhatsApp / SMS dispatch)
    await db.insert(outboxEvents).values({
      idempotencyKey: `evt_booking_${appointment.id}`,
      eventType: "appointment.confirmed",
      payload: {
        appointmentId: appointment.id,
        contactId: contact.id,
        patientName: fullName.trim(),
        phone: formattedPhone,
        email: email?.trim() || null,
        scheduledDate,
        startTime,
        endTime,
        therapyType,
        mode,
        location: mode.includes("Online")
          ? "Secure Video Telehealth Room (Link sent via WhatsApp)"
          : "Soulmates Clinic Suite, Wanowrie, Pune - 411040",
        practitionerName,
        channel: "WHATSAPP",
      },
      status: "PENDING",
      scheduledAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      bookingReference: appointment.id,
      patient: {
        id: contact.id,
        fullName: contact.fullName,
        phone: contact.phone,
      },
      appointment: {
        id: appointment.id,
        date: appointment.scheduledDate,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        therapyType: appointment.therapyType,
        mode: appointment.mode,
        practitioner: practitionerName,
        location: mode.includes("Online")
          ? "Secure Video Consultation"
          : "Soulmates Clinic, Wanowrie, Pune",
      },
      message: "Your clinical consultation has been confirmed. A WhatsApp confirmation has been dispatched.",
    });
  } catch (error: any) {
    console.error("Public booking submission error:", error);
    return NextResponse.json(
      { error: "Failed to process booking submission" },
      { status: 500 }
    );
  }
}
