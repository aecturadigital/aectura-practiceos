import { getDb } from "./index";
import { eq, and } from "drizzle-orm";
import {
  tenants,
  practitioners,
  services,
  contacts,
  appointments,
  tenantMemberships,
  Tenant,
  Practitioner,
  Service,
  Contact,
  Appointment
} from "./schema";

export class TenantScopedDb {
  constructor(private tenantId: string) {}

  async getTenant(): Promise<Tenant | null> {
    const db = await getDb();
    const [result] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, this.tenantId))
      .limit(1);
    return result || null;
  }

  async getPractitioners(): Promise<Practitioner[]> {
    const db = await getDb();
    return await db
      .select()
      .from(practitioners)
      .where(eq(practitioners.tenantId, this.tenantId));
  }

  async createPractitioner(data: { name: string; title: string; bio?: string; email: string }) {
    const db = await getDb();
    const [result] = await db
      .insert(practitioners)
      .values({
        tenantId: this.tenantId,
        name: data.name,
        title: data.title,
        bio: data.bio || "",
        email: data.email,
      })
      .returning();
    return result;
  }

  async getServices(): Promise<Service[]> {
    const db = await getDb();
    return await db
      .select()
      .from(services)
      .where(eq(services.tenantId, this.tenantId));
  }

  async createService(data: {
    name: string;
    description?: string;
    durationMinutes: number;
    price: number;
    practitionerId?: string;
  }) {
    const db = await getDb();
    const [result] = await db
      .insert(services)
      .values({
        tenantId: this.tenantId,
        name: data.name,
        description: data.description || "",
        durationMinutes: data.durationMinutes,
        price: data.price,
        practitionerId: data.practitionerId || null,
      })
      .returning();
    return result;
  }

  // 360 Unified Contacts / CRM
  async getContacts(): Promise<Contact[]> {
    const db = await getDb();
    return await db
      .select()
      .from(contacts)
      .where(eq(contacts.tenantId, this.tenantId));
  }

  async getContactById(contactId: string): Promise<Contact | null> {
    const db = await getDb();
    const [result] = await db
      .select()
      .from(contacts)
      .where(and(eq(contacts.tenantId, this.tenantId), eq(contacts.id, contactId)))
      .limit(1);
    return result || null;
  }

  async createContact(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    stage?: "lead" | "client" | "patient";
    notes?: string;
  }) {
    const db = await getDb();
    const [result] = await db
      .insert(contacts)
      .values({
        tenantId: this.tenantId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        stage: data.stage || "lead",
        notes: data.notes || "",
      })
      .returning();
    return result;
  }

  // Appointments
  async getAppointments(): Promise<(Appointment & { contactName?: string; practitionerName?: string; serviceName?: string })[]> {
    const db = await getDb();
    const appts = await db
      .select()
      .from(appointments)
      .where(eq(appointments.tenantId, this.tenantId));

    // Enrich with names
    const contactList = await this.getContacts();
    const practitionerList = await this.getPractitioners();
    const serviceList = await this.getServices();

    return appts.map((a: any) => {
      const c = contactList.find((x) => x.id === a.contactId);
      const p = practitionerList.find((x) => x.id === a.practitionerId);
      const s = serviceList.find((x) => x.id === a.serviceId);
      return {
        ...a,
        contactName: c ? `${c.firstName} ${c.lastName}` : "Unknown Contact",
        practitionerName: p ? p.name : "Unassigned",
        serviceName: s ? s.name : "Consultation",
      };
    });
  }

  async createAppointment(data: {
    contactId: string;
    practitionerId: string;
    serviceId: string;
    startTime: Date;
    endTime: Date;
    notes?: string;
  }) {
    const db = await getDb();
    const [result] = await db
      .insert(appointments)
      .values({
        tenantId: this.tenantId,
        contactId: data.contactId,
        practitionerId: data.practitionerId,
        serviceId: data.serviceId,
        startTime: data.startTime,
        endTime: data.endTime,
        status: "scheduled",
        notes: data.notes || "",
      })
      .returning();
    return result;
  }

  async updateBranding(newBranding: Partial<Tenant["branding"]>) {
    const db = await getDb();
    const tenant = await this.getTenant();
    if (!tenant) throw new Error("Tenant not found");

    const merged = { ...tenant.branding, ...newBranding };
    const [updated] = await db
      .update(tenants)
      .set({ branding: merged, updatedAt: new Date() })
      .where(eq(tenants.id, this.tenantId))
      .returning();
    return updated;
  }
}

export function getTenantDb(tenantId: string) {
  return new TenantScopedDb(tenantId);
}

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const db = await getDb();
  const [result] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.slug, slug))
    .limit(1);
  return result || null;
}
