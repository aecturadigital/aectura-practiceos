import { getDb } from "./index";
import { eq, desc } from "drizzle-orm";
import {
  contacts,
  appointments,
  users,
  crmDeals,
  treatmentCourses,
  planCycles,
  treatmentSessions,
  clinicalNotes,
  ledgerTransactions,
  invoices,
  Contact,
  Appointment,
  User,
  ClinicalNote,
  TreatmentCourse,
  PlanCycle,
} from "./schema";

/**
 * ClinicDb Repository
 * Provides canonical domain query helpers for the isolated clinic database.
 * Architecture: ONE CLINIC = ONE POSTGRESQL DATABASE = ONE CREDENTIAL SET
 */
export class ClinicDb {
  async getContacts(): Promise<Contact[]> {
    const db = await getDb();
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async getContactById(contactId: string): Promise<Contact | null> {
    const db = await getDb();
    const [result] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, contactId))
      .limit(1);
    return result || null;
  }

  async getAppointments(): Promise<Appointment[]> {
    const db = await getDb();
    return await db.select().from(appointments).orderBy(desc(appointments.scheduledDate));
  }

  async getPractitioners(): Promise<User[]> {
    const db = await getDb();
    return await db.select().from(users).where(eq(users.isActive, true));
  }

  async getClinicalNotes(contactId: string): Promise<ClinicalNote[]> {
    const db = await getDb();
    return await db
      .select()
      .from(clinicalNotes)
      .where(eq(clinicalNotes.contactId, contactId))
      .orderBy(desc(clinicalNotes.createdAt));
  }
}

export const clinicDb = new ClinicDb();

// Adapter for backward-compatibility with test scripts
export function getTenantDb(_tenantId?: string) {
  return clinicDb;
}
