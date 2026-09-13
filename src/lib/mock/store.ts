import {
  Tenant,
  Contact,
  Appointment,
  CrmDeal,
  Message,
  Conversation,
  Form,
  FormSubmission,
  Exercise,
  Review,
  AutomationRecipe,
  KnowledgeDocument,
  AuditLogEntry,
  WebsiteConfig,
  PlanId,
  CrmStage,
  AppointmentStatus,
} from "@/types";
import {
  SEED_TENANTS,
  SEED_MINDWELL_CONTACTS,
  SEED_MOTIONPLUS_CONTACTS,
  SEED_MINDWELL_APPOINTMENTS,
  SEED_MOTIONPLUS_APPOINTMENTS,
  SEED_MINDWELL_CRM_DEALS,
  SEED_MOTIONPLUS_CRM_DEALS,
  SEED_MINDWELL_MESSAGES,
  SEED_MOTIONPLUS_MESSAGES,
  SEED_MINDWELL_CONVERSATIONS,
  SEED_MOTIONPLUS_CONVERSATIONS,
  SEED_MOTIONPLUS_EXERCISES,
  SEED_FORMS,
  SEED_FORM_SUBMISSIONS,
  SEED_MINDWELL_REVIEWS,
  SEED_MOTIONPLUS_REVIEWS,
  SEED_AUTOMATIONS,
  SEED_KNOWLEDGE_DOCS,
  SEED_AUDIT_LOGS,
  SEED_WEBSITE_CONFIGS,
} from "./seed";

const STORAGE_KEY = "aectura_mock_store_v3";

export interface MockStoreData {
  tenants: Tenant[];
  activeTenantId: string;
  contacts: Contact[];
  appointments: Appointment[];
  crmDeals: CrmDeal[];
  messages: Message[];
  conversations: Conversation[];
  exercises: Exercise[];
  forms: Form[];
  formSubmissions: FormSubmission[];
  reviews: Review[];
  automations: AutomationRecipe[];
  knowledgeDocs: KnowledgeDocument[];
  auditLogs: AuditLogEntry[];
  websiteConfigs: Record<string, WebsiteConfig>;
}

function getInitialData(): MockStoreData {
  return {
    tenants: [...SEED_TENANTS],
    activeTenantId: "tenant-mindwell",
    contacts: [...SEED_MINDWELL_CONTACTS, ...SEED_MOTIONPLUS_CONTACTS],
    appointments: [...SEED_MINDWELL_APPOINTMENTS, ...SEED_MOTIONPLUS_APPOINTMENTS],
    crmDeals: [...SEED_MINDWELL_CRM_DEALS, ...SEED_MOTIONPLUS_CRM_DEALS],
    messages: [...SEED_MINDWELL_MESSAGES, ...SEED_MOTIONPLUS_MESSAGES],
    conversations: [...SEED_MINDWELL_CONVERSATIONS, ...SEED_MOTIONPLUS_CONVERSATIONS],
    exercises: [...SEED_MOTIONPLUS_EXERCISES],
    forms: [...SEED_FORMS],
    formSubmissions: [...SEED_FORM_SUBMISSIONS],
    reviews: [...SEED_MINDWELL_REVIEWS, ...SEED_MOTIONPLUS_REVIEWS],
    automations: [...SEED_AUTOMATIONS],
    knowledgeDocs: [...SEED_KNOWLEDGE_DOCS],
    auditLogs: [...SEED_AUDIT_LOGS],
    websiteConfigs: { ...SEED_WEBSITE_CONFIGS },
  };
}

class MockStore {
  private data: MockStoreData;
  private listeners: Set<() => void> = new Set();
  private initialized: boolean = false;

  constructor() {
    this.data = getInitialData();
    if (typeof window !== "undefined") {
      this.loadFromLocalStorage();
    }
  }

  private loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const defaults = getInitialData();
        this.data = {
          ...defaults,
          ...parsed,
          forms: parsed.forms?.length ? parsed.forms : defaults.forms,
          formSubmissions: parsed.formSubmissions?.length ? parsed.formSubmissions : defaults.formSubmissions,
        };
      }
      this.initialized = true;
    } catch (e) {
      console.warn("Could not load from localStorage, using initial mock data", e);
      this.data = getInitialData();
    }
  }

  private persist() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (e) {
        console.warn("Could not save to localStorage", e);
      }
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  public resetToDefaults() {
    this.data = getInitialData();
    this.persist();
  }

  // --- TENANT METHODS ---
  public getTenants(): Tenant[] {
    return this.data.tenants;
  }

  public getTenant(idOrSlug: string): Tenant | undefined {
    return this.data.tenants.find((t) => t.id === idOrSlug || t.slug === idOrSlug);
  }

  public getActiveTenant(): Tenant {
    const tenant = this.getTenant(this.data.activeTenantId);
    return tenant || this.data.tenants[0] || SEED_TENANTS[0];
  }

  public setActiveTenant(idOrSlug: string): void {
    const tenant = this.getTenant(idOrSlug);
    if (tenant) {
      this.data.activeTenantId = tenant.id;
      this.persist();
    }
  }

  public createTenant(tenant: Tenant): Tenant {
    this.data.tenants.unshift(tenant);
    // initialize website config for new tenant
    if (!this.data.websiteConfigs[tenant.id]) {
      this.data.websiteConfigs[tenant.id] = {
        tenantId: tenant.id,
        hero: {
          badge: `${tenant.name} • ${tenant.city}`,
          headline: `Welcome to ${tenant.name}`,
          subheadline: tenant.branding.tagline || "Professional compassionate care for your health and wellbeing.",
          ctaText: "Book Appointment",
          ctaLink: "#booking",
        },
        sections: [
          { id: "hero", name: "Hero Header", isEnabled: true, order: 1 },
          { id: "services", name: "Our Services", isEnabled: true, order: 2 },
          { id: "team", name: "Our Team", isEnabled: true, order: 3 },
          { id: "booking_cta", name: "Book Now", isEnabled: true, order: 4 },
        ],
        seo: {
          metaTitle: `${tenant.name} | ${tenant.city}`,
          metaDescription: tenant.branding.tagline,
        },
      };
    }
    this.addAuditLog({
      id: `aud-${Date.now()}`,
      tenantId: tenant.id,
      timestamp: new Date().toISOString(),
      user: "Super Admin",
      action: "CREATE_TENANT",
      entity: `Tenant: ${tenant.name} (${tenant.id})`,
      details: `Created new ${tenant.verticalId} practice on ${tenant.planId} plan.`,
      ipAddress: "127.0.0.1",
    });
    this.persist();
    return tenant;
  }

  public updateTenant(id: string, updates: Partial<Tenant>): Tenant | undefined {
    const index = this.data.tenants.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.data.tenants[index] = { ...this.data.tenants[index], ...updates };
      this.persist();
      return this.data.tenants[index];
    }
    return undefined;
  }

  public updateTenantPlan(tenantId: string, newPlanId: PlanId): void {
    const tenant = this.getTenant(tenantId);
    if (tenant) {
      tenant.planId = newPlanId;
      this.addAuditLog({
        id: `aud-${Date.now()}`,
        tenantId,
        timestamp: new Date().toISOString(),
        user: "Tenant Admin",
        action: "UPDATE_PLAN",
        entity: `Tenant: ${tenant.name}`,
        details: `Plan updated to ${newPlanId}`,
        ipAddress: "127.0.0.1",
      });
      this.persist();
    }
  }

  // --- CONTACT METHODS ---
  public getContacts(tenantId?: string): Contact[] {
    const tid = tenantId || this.data.activeTenantId;
    return this.data.contacts.filter((c) => c.tenantId === tid);
  }

  public getContact(id: string): Contact | undefined {
    if (id === "cnt-01") {
      return this.data.contacts.find((c) => c.id === "cnt-mw-priya");
    }
    return this.data.contacts.find((c) => c.id === id);
  }

  public createContact(contact: Contact): Contact {
    this.data.contacts.unshift(contact);
    this.addAuditLog({
      id: `aud-${Date.now()}`,
      tenantId: contact.tenantId,
      timestamp: new Date().toISOString(),
      user: "Staff User",
      action: "CREATE_CONTACT",
      entity: `Contact: ${contact.fullName}`,
      details: `Added new ${contact.status.toLowerCase()} to database.`,
      ipAddress: "127.0.0.1",
    });
    this.persist();
    return contact;
  }

  public updateContact(id: string, updates: Partial<Contact>): Contact | undefined {
    const index = this.data.contacts.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.data.contacts[index] = { ...this.data.contacts[index], ...updates };
      this.persist();
      return this.data.contacts[index];
    }
    return undefined;
  }

  // --- CRM METHODS ---
  public getCrmDeals(tenantId?: string): CrmDeal[] {
    const tid = tenantId || this.data.activeTenantId;
    return this.data.crmDeals.filter((d) => d.tenantId === tid);
  }

  public updateDealStage(dealId: string, stage: CrmStage): void {
    const deal = this.data.crmDeals.find((d) => d.id === dealId);
    if (deal) {
      deal.stage = stage;
      deal.updatedAt = new Date().toISOString();
      // Keep contact record in sync!
      const contact = this.getContact(deal.contactId);
      if (contact) {
        contact.activeDealStage = stage;
      }
      this.persist();
    }
  }

  public createCrmDeal(deal: CrmDeal): CrmDeal {
    this.data.crmDeals.unshift(deal);
    const contact = this.getContact(deal.contactId);
    if (contact) {
      contact.activeDealStage = deal.stage;
      contact.activeDealValue = deal.value;
    }
    this.persist();
    return deal;
  }

  // --- APPOINTMENT METHODS ---
  public getAppointments(tenantId?: string): Appointment[] {
    const tid = tenantId || this.data.activeTenantId;
    return this.data.appointments.filter((a) => a.tenantId === tid);
  }

  public getAppointment(id: string): Appointment | undefined {
    return this.data.appointments.find((a) => a.id === id);
  }

  public createAppointment(appointment: Appointment): Appointment {
    this.data.appointments.unshift(appointment);
    // Update connected contact's next appointment
    const contact = this.getContact(appointment.contactId);
    if (contact) {
      contact.nextAppointmentDate = `${appointment.date} ${appointment.startTime}`;
      if (contact.status === "LEAD") {
        contact.status = "ACTIVE";
      }
    }
    this.addAuditLog({
      id: `aud-${Date.now()}`,
      tenantId: appointment.tenantId,
      timestamp: new Date().toISOString(),
      user: "Staff / Portal",
      action: "BOOK_APPOINTMENT",
      entity: `Appointment: ${appointment.serviceName}`,
      details: `Scheduled on ${appointment.date} at ${appointment.startTime} for ${appointment.contactName}`,
      ipAddress: "127.0.0.1",
    });
    this.persist();
    return appointment;
  }

  public updateAppointmentStatus(id: string, status: AppointmentStatus, reason?: string): void {
    const apt = this.data.appointments.find((a) => a.id === id);
    if (apt) {
      apt.status = status;
      if (reason) apt.cancellationReason = reason;
      if (status === "COMPLETED") {
        const contact = this.getContact(apt.contactId);
        if (contact) {
          contact.totalSessionsCompleted = (contact.totalSessionsCompleted || 0) + 1;
        }
      }
      this.addAuditLog({
        id: `aud-${Date.now()}`,
        tenantId: apt.tenantId,
        timestamp: new Date().toISOString(),
        user: "Staff User",
        action: "UPDATE_APPOINTMENT_STATUS",
        entity: `Appointment: ${apt.serviceName}`,
        details: `Status changed to ${status}${reason ? ` (Reason: ${reason})` : ""}`,
        ipAddress: "127.0.0.1",
      });
      this.persist();
    }
  }

  public rescheduleAppointment(id: string, newDate: string, newTime: string): void {
    const apt = this.data.appointments.find((a) => a.id === id);
    if (apt) {
      apt.date = newDate;
      apt.startTime = newTime;
      apt.status = "CONFIRMED";
      const contact = this.getContact(apt.contactId);
      if (contact) {
        contact.nextAppointmentDate = `${newDate} ${newTime}`;
      }
      this.addAuditLog({
        id: `aud-${Date.now()}`,
        tenantId: apt.tenantId,
        timestamp: new Date().toISOString(),
        user: "Client / Staff",
        action: "RESCHEDULE_APPOINTMENT",
        entity: `Appointment: ${apt.serviceName}`,
        details: `Rescheduled to ${newDate} at ${newTime}`,
        ipAddress: "127.0.0.1",
      });
      this.persist();
    }
  }

  // --- MESSAGING & INBOX METHODS ---
  public getMessages(tenantId?: string, contactId?: string): Message[] {
    const tid = tenantId || this.data.activeTenantId;
    return this.data.messages.filter((m) => {
      const matchTenant = m.tenantId === tid;
      if (contactId) return matchTenant && m.contactId === contactId;
      return matchTenant;
    });
  }

  public getConversations(tenantId?: string): Conversation[] {
    const tid = tenantId || this.data.activeTenantId;
    return this.data.conversations.filter((c) => c.tenantId === tid);
  }

  public sendMessage(msg: Omit<Message, "id" | "timestamp" | "status">): Message {
    const newMsg: Message = {
      ...msg,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: "SENT",
    };
    this.data.messages.push(newMsg);

    // Update or create conversation preview
    const conv = this.data.conversations.find(
      (c) => c.tenantId === msg.tenantId && c.contactId === msg.contactId
    );
    if (conv) {
      conv.lastMessagePreview = msg.content;
      conv.lastMessageAt = newMsg.timestamp;
      if (msg.direction === "INBOUND") {
        conv.unreadCount += 1;
      }
    } else {
      const contact = this.getContact(msg.contactId);
      this.data.conversations.unshift({
        id: `conv-${Date.now()}`,
        tenantId: msg.tenantId,
        contactId: msg.contactId,
        contactName: contact?.fullName || msg.senderName,
        contactPhone: contact?.phone || "",
        channel: msg.channel,
        state: "OPEN",
        aiEnabled: false,
        lastMessagePreview: msg.content,
        lastMessageAt: newMsg.timestamp,
        unreadCount: msg.direction === "INBOUND" ? 1 : 0,
      });
    }

    this.persist();
    return newMsg;
  }

  public toggleConversationAi(convId: string, enabled: boolean): void {
    const conv = this.data.conversations.find((c) => c.id === convId);
    if (conv) {
      conv.aiEnabled = enabled;
      this.persist();
    }
  }

  // --- EXERCISES (PHYSIOTHERAPY) ---
  public getExercises(tenantId?: string, contactId?: string): Exercise[] {
    const tid = tenantId || this.data.activeTenantId;
    return this.data.exercises.filter((e) => {
      const matchTenant = e.tenantId === tid;
      if (contactId) return matchTenant && e.contactId === contactId;
      return matchTenant;
    });
  }

  public toggleExerciseCompletion(exerciseId: string, completed: boolean): void {
    const ex = this.data.exercises.find((e) => e.id === exerciseId);
    if (ex) {
      ex.completedToday = completed;
      const today = new Date().toISOString().split("T")[0];
      if (completed && !ex.completedHistory.includes(today)) {
        ex.completedHistory.push(today);
      } else if (!completed) {
        ex.completedHistory = ex.completedHistory.filter((d) => d !== today);
      }
      this.persist();
    }
  }

  // --- WEBSITE CONFIGURATION ---
  public getWebsiteConfig(tenantId?: string): WebsiteConfig {
    const tid = tenantId || this.data.activeTenantId;
    if (this.data.websiteConfigs[tid]) {
      return this.data.websiteConfigs[tid];
    }
    const tenant = this.getTenant(tid);
    const cfg: WebsiteConfig = {
      tenantId: tid,
      hero: {
        badge: `${tenant?.name || "Clinic"} • ${tenant?.city || "India"}`,
        headline: `Welcome to ${tenant?.name || "Our Clinic"}`,
        subheadline: tenant?.branding.tagline || "Providing evidence-based care for your health and wellbeing.",
        ctaText: "Book Appointment",
        ctaLink: "#booking",
      },
      sections: [
        { id: "hero", name: "Hero Header", isEnabled: true, order: 1 },
        { id: "services", name: "Our Services", isEnabled: true, order: 2 },
        { id: "team", name: "Our Team", isEnabled: true, order: 3 },
        { id: "booking_cta", name: "Direct Booking", isEnabled: true, order: 4 },
      ],
      seo: {
        metaTitle: `${tenant?.name || "Clinic"} | Private Practice`,
        metaDescription: tenant?.branding.tagline || "Private practice healthcare.",
      },
    };
    this.data.websiteConfigs[tid] = cfg;
    return cfg;
  }

  public updateWebsiteConfig(tenantId: string, config: Partial<WebsiteConfig>): void {
    const existing = this.getWebsiteConfig(tenantId);
    this.data.websiteConfigs[tenantId] = {
      ...existing,
      ...config,
      hero: { ...existing.hero, ...(config.hero || {}) },
      seo: { ...existing.seo, ...(config.seo || {}) },
    };
    this.addAuditLog({
      id: `aud-${Date.now()}`,
      tenantId,
      timestamp: new Date().toISOString(),
      user: "Staff User",
      action: "UPDATE_WEBSITE",
      entity: "Public Website Sections",
      details: "Updated hero copy and section visibility presets",
      ipAddress: "127.0.0.1",
    });
    this.persist();
  }

  // --- FORMS & SUBMISSIONS ---
  public getForms(tenantId?: string): Form[] {
    const tid = tenantId || this.data.activeTenantId;
    return this.data.forms.filter((f) => f.tenantId === tid);
  }

  public getForm(id: string): Form | undefined {
    return this.data.forms.find((f) => f.id === id);
  }

  public createForm(form: Omit<Form, "id" | "submissionsCount" | "createdAt">): Form {
    const newForm: Form = {
      ...form,
      id: `form-${Date.now()}`,
      submissionsCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.data.forms.unshift(newForm);
    this.addAuditLog({
      id: `aud-${Date.now()}`,
      tenantId: form.tenantId,
      timestamp: new Date().toISOString(),
      user: "Staff User",
      action: "CREATE_FORM",
      entity: "Form Builder",
      details: `Created new form: "${form.title}"`,
      ipAddress: "127.0.0.1",
    });
    this.persist();
    return newForm;
  }

  public updateForm(id: string, updates: Partial<Form>): void {
    const form = this.data.forms.find((f) => f.id === id);
    if (form) {
      Object.assign(form, updates);
      this.persist();
    }
  }

  public getFormSubmissions(tenantId?: string, formId?: string, contactId?: string): FormSubmission[] {
    const tid = tenantId || this.data.activeTenantId;
    return this.data.formSubmissions.filter((sub) => {
      if (sub.tenantId !== tid) return false;
      if (formId && sub.formId !== formId) return false;
      if (contactId && sub.contactId !== contactId) return false;
      return true;
    });
  }

  public submitForm(submission: Omit<FormSubmission, "id" | "submittedAt">): FormSubmission {
    const newSub: FormSubmission = {
      ...submission,
      id: `sub-${Date.now()}`,
      submittedAt: new Date().toISOString(),
    };
    this.data.formSubmissions.unshift(newSub);
    const form = this.data.forms.find((f) => f.id === submission.formId);
    if (form) {
      form.submissionsCount += 1;
    }
    this.persist();
    return newSub;
  }

  // --- REVIEWS ---
  public getReviews(tenantId?: string): Review[] {
    const tid = tenantId || this.data.activeTenantId;
    return this.data.reviews.filter((r) => r.tenantId === tid);
  }

  public toggleReviewPublished(id: string): void {
    const rev = this.data.reviews.find((r) => r.id === id);
    if (rev) {
      rev.isPublished = !rev.isPublished;
      this.persist();
    }
  }

  // --- AUTOMATIONS ---
  public getAutomations(tenantId?: string): AutomationRecipe[] {
    const tid = tenantId || this.data.activeTenantId;
    return this.data.automations.filter((a) => a.tenantId === tid);
  }

  public toggleAutomation(id: string): void {
    const auto = this.data.automations.find((a) => a.id === id);
    if (auto) {
      auto.isEnabled = !auto.isEnabled;
      this.persist();
    }
  }

  // --- KNOWLEDGE BASE ---
  public getKnowledgeDocs(tenantId?: string): KnowledgeDocument[] {
    const tid = tenantId || this.data.activeTenantId;
    return this.data.knowledgeDocs.filter((k) => k.tenantId === tid);
  }

  public addKnowledgeDoc(doc: KnowledgeDocument): void {
    this.data.knowledgeDocs.unshift(doc);
    this.persist();
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(tenantId?: string): AuditLogEntry[] {
    const tid = tenantId || this.data.activeTenantId;
    return this.data.auditLogs.filter((a) => a.tenantId === tid);
  }

  private addAuditLog(entry: AuditLogEntry): void {
    this.data.auditLogs.unshift(entry);
    if (this.data.auditLogs.length > 100) {
      this.data.auditLogs.pop();
    }
  }
}

export const mockStore = new MockStore();
