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
  TreatmentCourse,
  PlanCycle,
  PlanAdjustment,
  TreatmentSession,
  ProcedureAddOn,
  LedgerTransaction,
  Invoice,
  PaymentReminder,
  PatientTracker,
  TrackerEntry,
  TreatmentMilestone,
  DocumentRequest,
  StaffAttendance,
  StaffLeave,
  PayrollEntry,
  StaffActivityEntry,
  TreatmentSessionStatus,
  AddOnPaymentOption,
  PaymentMethod,
  AttendanceStatus,
  LeaveType,
  LeaveStatus,
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
  SEED_TREATMENT_COURSES,
  SEED_PLAN_CYCLES,
  SEED_PLAN_ADJUSTMENTS,
  SEED_TREATMENT_SESSIONS,
  SEED_PROCEDURE_ADD_ONS,
  SEED_LEDGER_TRANSACTIONS,
  SEED_INVOICES,
  SEED_PAYMENT_REMINDERS,
  SEED_DOCUMENT_REQUESTS,
  SEED_PATIENT_TRACKERS,
  SEED_TRACKER_ENTRIES,
  SEED_TREATMENT_MILESTONES,
  SEED_STAFF_ATTENDANCE,
  SEED_STAFF_LEAVES,
  SEED_PAYROLL_ENTRIES,
  SEED_STAFF_ACTIVITY,
} from "./seed";

const STORAGE_KEY = "aectura_mock_store_v4";

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
  treatmentCourses: TreatmentCourse[];
  planCycles: PlanCycle[];
  planAdjustments: PlanAdjustment[];
  treatmentSessions: TreatmentSession[];
  procedureAddOns: ProcedureAddOn[];
  ledgerTransactions: LedgerTransaction[];
  invoices: Invoice[];
  paymentReminders: PaymentReminder[];
  patientTrackers: PatientTracker[];
  trackerEntries: TrackerEntry[];
  treatmentMilestones: TreatmentMilestone[];
  documentRequests: DocumentRequest[];
  staffAttendance: StaffAttendance[];
  staffLeaves: StaffLeave[];
  payrollEntries: PayrollEntry[];
  staffActivity: StaffActivityEntry[];
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
    treatmentCourses: [...SEED_TREATMENT_COURSES],
    planCycles: [...SEED_PLAN_CYCLES],
    planAdjustments: [...SEED_PLAN_ADJUSTMENTS],
    treatmentSessions: [...SEED_TREATMENT_SESSIONS],
    procedureAddOns: [...SEED_PROCEDURE_ADD_ONS],
    ledgerTransactions: [...SEED_LEDGER_TRANSACTIONS],
    invoices: [...SEED_INVOICES],
    paymentReminders: [...SEED_PAYMENT_REMINDERS],
    patientTrackers: [...SEED_PATIENT_TRACKERS],
    trackerEntries: [...SEED_TRACKER_ENTRIES],
    treatmentMilestones: [...SEED_TREATMENT_MILESTONES],
    documentRequests: [...SEED_DOCUMENT_REQUESTS],
    staffAttendance: [...SEED_STAFF_ATTENDANCE],
    staffLeaves: [...SEED_STAFF_LEAVES],
    payrollEntries: [...SEED_PAYROLL_ENTRIES],
    staffActivity: [...SEED_STAFF_ACTIVITY],
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
          treatmentCourses: parsed.treatmentCourses?.length ? parsed.treatmentCourses : defaults.treatmentCourses,
          planCycles: parsed.planCycles?.length ? parsed.planCycles : defaults.planCycles,
          planAdjustments: parsed.planAdjustments?.length ? parsed.planAdjustments : defaults.planAdjustments,
          treatmentSessions: parsed.treatmentSessions?.length ? parsed.treatmentSessions : defaults.treatmentSessions,
          procedureAddOns: parsed.procedureAddOns?.length ? parsed.procedureAddOns : defaults.procedureAddOns,
          ledgerTransactions: parsed.ledgerTransactions?.length ? parsed.ledgerTransactions : defaults.ledgerTransactions,
          invoices: parsed.invoices?.length ? parsed.invoices : defaults.invoices,
          paymentReminders: parsed.paymentReminders?.length ? parsed.paymentReminders : defaults.paymentReminders,
          patientTrackers: parsed.patientTrackers?.length ? parsed.patientTrackers : defaults.patientTrackers,
          trackerEntries: parsed.trackerEntries?.length ? parsed.trackerEntries : defaults.trackerEntries,
          treatmentMilestones: parsed.treatmentMilestones?.length ? parsed.treatmentMilestones : defaults.treatmentMilestones,
          documentRequests: parsed.documentRequests?.length ? parsed.documentRequests : defaults.documentRequests,
          staffAttendance: parsed.staffAttendance?.length ? parsed.staffAttendance : defaults.staffAttendance,
          staffLeaves: parsed.staffLeaves?.length ? parsed.staffLeaves : defaults.staffLeaves,
          payrollEntries: parsed.payrollEntries?.length ? parsed.payrollEntries : defaults.payrollEntries,
          staffActivity: parsed.staffActivity?.length ? parsed.staffActivity : defaults.staffActivity,
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
    if (id === "cnt-01" || id === "cnt-mw-priya" || id === "cnt-mp-priya") {
      const match = this.data.contacts.find((c) => c.id === id);
      if (match) return match;
      return this.data.contacts.find((c) => c.id === "cnt-mw-priya" || c.id === "cnt-mp-priya");
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

  // ==========================================
  // TREATMENT COURSES & PLAN CYCLES METHODS
  // ==========================================

  public getTreatmentCourses(tenantId?: string, contactId?: string): TreatmentCourse[] {
    const tid = tenantId || this.data.activeTenantId;
    return this.data.treatmentCourses.filter(
      (c) => c.tenantId === tid && (!contactId || c.contactId === contactId)
    );
  }

  public getTreatmentCourseById(courseId: string): TreatmentCourse | undefined {
    return this.data.treatmentCourses.find((c) => c.id === courseId);
  }

  public getActivePlanCycle(contactId: string): PlanCycle | undefined {
    return this.data.planCycles.find(
      (p) => (p.contactId === contactId || (contactId.includes("priya") && p.contactId.includes("priya"))) &&
             (p.status === "ACTIVE" || p.status === "PAYMENT_DUE" || p.status === "ON_HOLD" || p.status === "FROZEN")
    ) || this.data.planCycles.find((p) => p.contactId === contactId);
  }

  public getPlanCycles(treatmentCourseId: string): PlanCycle[] {
    return this.data.planCycles.filter((p) => p.treatmentCourseId === treatmentCourseId);
  }

  public getTreatmentSessions(planCycleId: string): TreatmentSession[] {
    return this.data.treatmentSessions.filter((s) => s.planCycleId === planCycleId);
  }

  public getPlanAdjustments(planCycleId: string): PlanAdjustment[] {
    return this.data.planAdjustments.filter((a) => a.planCycleId === planCycleId);
  }

  public getProcedureAddOns(contactId: string): ProcedureAddOn[] {
    return this.data.procedureAddOns.filter(
      (a) => a.contactId === contactId || (contactId.includes("priya") && a.contactId.includes("priya"))
    );
  }

  public createTreatmentCourse(course: Omit<TreatmentCourse, "id" | "createdAt" | "updatedAt">): TreatmentCourse {
    const newCourse: TreatmentCourse = {
      ...course,
      id: `course-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.treatmentCourses.unshift(newCourse);
    this.persist();
    return newCourse;
  }

  public createPlanCycle(cycle: Omit<PlanCycle, "id" | "createdAt" | "updatedAt">): PlanCycle {
    const newCycle: PlanCycle = {
      ...cycle,
      id: `cycle-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.planCycles.push(newCycle);
    this.persist();
    return newCycle;
  }

  public updatePlanCycle(
    cycleId: string,
    updates: Partial<PlanCycle>,
    adjustmentReason?: string,
    changedBy: string = "Dr. Rajesh Kulkarni"
  ): PlanCycle | undefined {
    const cycle = this.data.planCycles.find((p) => p.id === cycleId);
    if (!cycle) return undefined;

    if (adjustmentReason) {
      if (updates.price !== undefined && updates.price !== cycle.price) {
        this.addPlanAdjustment({
          id: `adj-${Date.now()}-1`,
          planCycleId: cycle.id,
          adjustmentType: "PRICE",
          oldValue: `₹${cycle.price}`,
          newValue: `₹${updates.price}`,
          reason: adjustmentReason,
          changedBy,
          timestamp: new Date().toISOString(),
        });
      }
      if (updates.plannedSessions !== undefined && updates.plannedSessions !== cycle.plannedSessions) {
        this.addPlanAdjustment({
          id: `adj-${Date.now()}-2`,
          planCycleId: cycle.id,
          adjustmentType: "SESSION_COUNT",
          oldValue: `${cycle.plannedSessions} sessions`,
          newValue: `${updates.plannedSessions} sessions`,
          reason: adjustmentReason,
          changedBy,
          timestamp: new Date().toISOString(),
        });
      }
      if (updates.expectedEndDate && updates.expectedEndDate !== cycle.expectedEndDate) {
        this.addPlanAdjustment({
          id: `adj-${Date.now()}-3`,
          planCycleId: cycle.id,
          adjustmentType: "END_DATE",
          oldValue: cycle.expectedEndDate,
          newValue: updates.expectedEndDate,
          reason: adjustmentReason,
          changedBy,
          timestamp: new Date().toISOString(),
        });
      }
    }

    Object.assign(cycle, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return cycle;
  }

  public addPlanAdjustment(adjustment: PlanAdjustment): void {
    this.data.planAdjustments.unshift(adjustment);
    this.persist();
  }

  public recordSessionAttendance(
    sessionId: string,
    status: TreatmentSessionStatus,
    deductSession: boolean,
    recordedBy: string = "Dr. Rajesh Kulkarni",
    notes?: string
  ): TreatmentSession | undefined {
    const session = this.data.treatmentSessions.find((s) => s.id === sessionId);
    if (!session) return undefined;

    session.status = status;
    session.sessionDeducted = deductSession;
    session.attendanceRecordedBy = recordedBy;
    if (notes) session.notes = notes;

    const cycle = this.data.planCycles.find((p) => p.id === session.planCycleId);
    if (cycle && deductSession && status === "ATTENDED") {
      cycle.completedSessions = Math.min(cycle.plannedSessions, cycle.completedSessions + 1);
      cycle.updatedAt = new Date().toISOString();
    }

    this.logStaffActivity(
      session.tenantId,
      recordedBy,
      "RECORD_ATTENDANCE",
      `Session #${session.sessionNumber}`,
      `Marked session ${status}. Deducted: ${deductSession ? "Yes" : "No"}.`,
      "TREATMENT"
    );

    this.persist();
    return session;
  }

  public addProcedureAddOn(
    addOn: Omit<ProcedureAddOn, "id" | "createdAt">,
    paymentOption: AddOnPaymentOption
  ): ProcedureAddOn {
    const newAddOn: ProcedureAddOn = {
      ...addOn,
      id: `addon-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    if (paymentOption === "MARK_PAID" || paymentOption === "CHARGE_NOW") {
      newAddOn.paymentStatus = "PAID";
      this.recordLedgerCharge(
        addOn.tenantId,
        addOn.contactId,
        addOn.finalAmount,
        `${addOn.procedureName} (Procedure Add-On)`,
        "ADD_ON"
      );
      this.recordLedgerPayment(
        addOn.tenantId,
        addOn.contactId,
        addOn.finalAmount,
        "UPI",
        `TXN-${Date.now()}`,
        `Payment for ${addOn.procedureName} add-on procedure`,
        "Clinic Staff"
      );
    } else if (paymentOption === "ADD_TO_BALANCE") {
      newAddOn.paymentStatus = "UNPAID";
      this.recordLedgerCharge(
        addOn.tenantId,
        addOn.contactId,
        addOn.finalAmount,
        `${addOn.procedureName} (Procedure Add-On)`,
        "ADD_ON"
      );
    } else if (paymentOption === "WAIVE") {
      newAddOn.paymentStatus = "WAIVED";
      newAddOn.waived = true;
      newAddOn.finalAmount = 0;
    }

    this.data.procedureAddOns.unshift(newAddOn);
    this.persist();
    return newAddOn;
  }

  public freezePlan(
    cycleId: string,
    durationDays: number,
    reason: string,
    approvedBy: string = "Dr. Rajesh Kulkarni"
  ): PlanCycle | undefined {
    const cycle = this.data.planCycles.find((p) => p.id === cycleId);
    if (!cycle) return undefined;

    const currentEnd = new Date(cycle.expectedEndDate);
    currentEnd.setDate(currentEnd.getDate() + durationDays);
    const newEnd = currentEnd.toISOString().split("T")[0];

    this.addPlanAdjustment({
      id: `adj-${Date.now()}`,
      planCycleId: cycle.id,
      adjustmentType: "FREEZE",
      oldValue: `Active (ends ${cycle.expectedEndDate})`,
      newValue: `Frozen for ${durationDays} days (new end ${newEnd})`,
      reason,
      changedBy: approvedBy,
      timestamp: new Date().toISOString(),
    });

    cycle.status = "FROZEN";
    cycle.isFrozen = true;
    cycle.freezeReason = reason;
    cycle.freezeStartDate = new Date().toISOString().split("T")[0];
    cycle.expectedEndDate = newEnd;
    cycle.updatedAt = new Date().toISOString();

    this.persist();
    return cycle;
  }

  public unfreezePlan(cycleId: string, reason: string, approvedBy: string): PlanCycle | undefined {
    const cycle = this.data.planCycles.find((p) => p.id === cycleId);
    if (!cycle) return undefined;

    cycle.status = "ACTIVE";
    cycle.isFrozen = false;
    cycle.updatedAt = new Date().toISOString();

    this.addPlanAdjustment({
      id: `adj-${Date.now()}`,
      planCycleId: cycle.id,
      adjustmentType: "FREEZE",
      oldValue: "FROZEN",
      newValue: "ACTIVE",
      reason: `Unfrozen: ${reason}`,
      changedBy: approvedBy,
      timestamp: new Date().toISOString(),
    });

    this.persist();
    return cycle;
  }

  public extendPlan(
    cycleId: string,
    additionalDays: number,
    additionalSessions: number,
    reason: string,
    approvedBy: string = "Dr. Rajesh Kulkarni"
  ): PlanCycle | undefined {
    const cycle = this.data.planCycles.find((p) => p.id === cycleId);
    if (!cycle) return undefined;

    const oldDate = cycle.expectedEndDate;
    const oldSessions = cycle.plannedSessions;

    if (additionalDays > 0) {
      const dt = new Date(cycle.expectedEndDate);
      dt.setDate(dt.getDate() + additionalDays);
      cycle.expectedEndDate = dt.toISOString().split("T")[0];
      this.addPlanAdjustment({
        id: `adj-${Date.now()}-days`,
        planCycleId: cycle.id,
        adjustmentType: "EXTENSION",
        oldValue: `Ends ${oldDate}`,
        newValue: `Ends ${cycle.expectedEndDate} (+${additionalDays} days)`,
        reason,
        changedBy: approvedBy,
        timestamp: new Date().toISOString(),
      });
    }

    if (additionalSessions > 0) {
      cycle.plannedSessions += additionalSessions;
      this.addPlanAdjustment({
        id: `adj-${Date.now()}-sessions`,
        planCycleId: cycle.id,
        adjustmentType: "SESSION_COUNT",
        oldValue: `${oldSessions} sessions`,
        newValue: `${cycle.plannedSessions} sessions (+${additionalSessions})`,
        reason,
        changedBy: approvedBy,
        timestamp: new Date().toISOString(),
      });
    }

    cycle.updatedAt = new Date().toISOString();
    this.persist();
    return cycle;
  }

  public activateNextCycle(courseId: string, activatedBy: string = "Clinic Staff"): PlanCycle | undefined {
    const scheduledCycle = this.data.planCycles.find(
      (p) => p.treatmentCourseId === courseId && p.status === "SCHEDULED"
    );
    if (!scheduledCycle) return undefined;

    scheduledCycle.status = "ACTIVE";
    scheduledCycle.startDate = new Date().toISOString().split("T")[0];
    const newEnd = new Date();
    newEnd.setDate(newEnd.getDate() + scheduledCycle.validityDays);
    scheduledCycle.expectedEndDate = newEnd.toISOString().split("T")[0];
    scheduledCycle.updatedAt = new Date().toISOString();

    const course = this.data.treatmentCourses.find((c) => c.id === courseId);
    if (course) {
      course.currentCycleNumber = scheduledCycle.cycleNumber;
      course.updatedAt = new Date().toISOString();
    }

    // Record ledger charge for new cycle
    this.recordLedgerCharge(
      scheduledCycle.tenantId,
      scheduledCycle.contactId,
      scheduledCycle.price,
      `${scheduledCycle.name} (Cycle ${scheduledCycle.cycleNumber})`,
      "TREATMENT_PLAN"
    );

    this.logStaffActivity(
      scheduledCycle.tenantId,
      activatedBy,
      "ACTIVATE_CYCLE",
      scheduledCycle.name,
      `Activated cycle ${scheduledCycle.cycleNumber}. Added ₹${scheduledCycle.price} to patient ledger.`,
      "TREATMENT"
    );

    this.persist();
    return scheduledCycle;
  }

  // ==========================================
  // BILLING & FINANCIAL LEDGER METHODS
  // ==========================================

  public getPatientLedger(tenantId: string, contactId: string) {
    const isPriya = contactId.includes("priya");
    const txs = this.data.ledgerTransactions.filter(
      (t) => (t.contactId === contactId || (isPriya && t.contactId.includes("priya"))) &&
             (t.tenantId === tenantId || tenantId === "tenant-motionplus")
    );

    const totalCharges = txs
      .filter((t) => t.type === "CHARGE" || t.type === "PACKAGE_SALE" || t.type === "ADD_ON_SERVICE")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalPayments = txs
      .filter((t) => t.type === "PAYMENT")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalDiscounts = txs
      .filter((t) => t.type === "DISCOUNT" || t.type === "CREDIT")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWaivers = txs
      .filter((t) => t.type === "WAIVER")
      .reduce((sum, t) => sum + t.amount, 0);

    const netOutstanding = Math.max(0, totalCharges - totalPayments - totalDiscounts - totalWaivers);

    return {
      contactId,
      totalCharges,
      totalPayments,
      totalDiscounts,
      totalWaivers,
      netOutstanding,
      transactions: txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    };
  }

  public getLedgerTransactions(tenantId?: string): LedgerTransaction[] {
    const tid = tenantId || this.data.activeTenantId;
    return this.data.ledgerTransactions.filter((t) => t.tenantId === tid);
  }

  public recordLedgerCharge(
    tenantId: string,
    contactId: string,
    amount: number,
    description: string,
    category: LedgerTransaction["category"],
    referenceNumber?: string
  ): LedgerTransaction {
    const tx: LedgerTransaction = {
      id: `tx-${Date.now()}`,
      tenantId,
      contactId,
      date: new Date().toISOString().split("T")[0],
      amount,
      type: "CHARGE",
      description,
      category,
      referenceNumber,
      status: "COMPLETED",
      createdAt: new Date().toISOString(),
    };
    this.data.ledgerTransactions.unshift(tx);
    this.persist();
    return tx;
  }

  public recordLedgerPayment(
    tenantId: string,
    contactId: string,
    amount: number,
    method: PaymentMethod,
    referenceNumber: string,
    memo: string,
    receivedBy: string
  ): LedgerTransaction {
    const tx: LedgerTransaction = {
      id: `tx-${Date.now()}`,
      tenantId,
      contactId,
      date: new Date().toISOString().split("T")[0],
      amount,
      type: "PAYMENT",
      description: `Payment via ${method}`,
      category: "PAYMENT",
      method,
      referenceNumber,
      memo,
      receivedBy,
      receiptId: `RCPT-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "COMPLETED",
      createdAt: new Date().toISOString(),
    };
    this.data.ledgerTransactions.unshift(tx);

    this.logStaffActivity(
      tenantId,
      receivedBy,
      "RECORD_PAYMENT",
      `Payment ₹${amount}`,
      `Received ₹${amount} via ${method}. Ref: ${referenceNumber}.`,
      "BILLING"
    );

    this.persist();
    return tx;
  }

  public getInvoices(tenantId?: string, contactId?: string): Invoice[] {
    const tid = tenantId || this.data.activeTenantId;
    return this.data.invoices.filter(
      (inv) => inv.tenantId === tid && (!contactId || inv.contactId === contactId)
    );
  }

  public createInvoice(invoice: Omit<Invoice, "id" | "createdAt">): Invoice {
    const newInv: Invoice = {
      ...invoice,
      id: `inv-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.invoices.unshift(newInv);
    this.persist();
    return newInv;
  }

  public getPaymentReminders(tenantId?: string): PaymentReminder[] {
    const tid = tenantId || this.data.activeTenantId;
    return this.data.paymentReminders.filter((r) => r.tenantId === tid);
  }

  public sendPaymentReminder(
    tenantId: string,
    contactId: string,
    amountDue: number,
    channel: "WHATSAPP" | "SMS" | "EMAIL",
    messageText: string,
    dispatchedBy: string = "Clinic Front Desk"
  ): PaymentReminder {
    const contact = this.getContact(contactId);
    const reminder: PaymentReminder = {
      id: `rem-${Date.now()}`,
      tenantId,
      contactId,
      contactName: contact?.fullName || "Patient",
      amountDue,
      dueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      channel,
      messageText,
      status: "DISPATCHED",
      dispatchedAt: new Date().toISOString(),
      dispatchedBy,
      createdAt: new Date().toISOString(),
    };
    this.data.paymentReminders.unshift(reminder);

    // Also send an outbound message to contact inbox
    this.sendMessage({
      tenantId,
      contactId,
      direction: "OUTBOUND",
      channel: channel === "WHATSAPP" ? "WHATSAPP" : channel === "EMAIL" ? "EMAIL" : "SMS",
      senderName: dispatchedBy,
      content: messageText,
    });

    this.logStaffActivity(
      tenantId,
      dispatchedBy,
      "SEND_REMINDER",
      contact?.fullName || "Patient",
      `Dispatched ₹${amountDue} payment reminder via ${channel}.`,
      "BILLING"
    );

    this.persist();
    return reminder;
  }

  public simulateOnlinePayment(reminderId: string): void {
    const reminder = this.data.paymentReminders.find((r) => r.id === reminderId);
    if (!reminder) return;

    reminder.status = "PAID";
    this.recordLedgerPayment(
      reminder.tenantId,
      reminder.contactId,
      reminder.amountDue,
      "Payment Link",
      `PLINK-${Date.now()}`,
      "Settled online via PracticeOS payment link",
      "Razorpay Gateway"
    );

    this.persist();
  }

  // ==========================================
  // DOCUMENT REQUESTS & UPLOAD METHODS
  // ==========================================

  public getDocumentRequests(tenantId?: string, contactId?: string): DocumentRequest[] {
    const tid = tenantId || this.data.activeTenantId;
    return this.data.documentRequests.filter(
      (d) => d.tenantId === tid && (!contactId || d.contactId === contactId)
    );
  }

  public createDocumentRequest(request: Omit<DocumentRequest, "id" | "status">): DocumentRequest {
    const newDoc: DocumentRequest = {
      ...request,
      id: `doc-${Date.now()}`,
      status: "REQUESTED",
    };
    this.data.documentRequests.unshift(newDoc);

    this.logStaffActivity(
      request.tenantId,
      request.requestedBy,
      "REQUEST_DOCUMENT",
      `${request.documentType} Request`,
      `Requested ${request.documentType} from patient. Due ${request.dueDate}.`,
      "DOCUMENT"
    );

    this.persist();
    return newDoc;
  }

  public uploadDocument(requestId: string, fileName: string, fileUrl: string): DocumentRequest | undefined {
    const req = this.data.documentRequests.find((d) => d.id === requestId);
    if (!req) return undefined;

    req.status = "UPLOADED";
    req.uploadedFileName = fileName;
    req.uploadedFileUrl = fileUrl;
    req.uploadedAt = new Date().toISOString();

    this.logStaffActivity(
      req.tenantId,
      "Patient Portal",
      "UPLOAD_DOCUMENT",
      fileName,
      `Patient uploaded ${req.documentType} (${fileName}) via self-service portal.`,
      "DOCUMENT"
    );

    this.persist();
    return req;
  }

  public reviewDocument(
    requestId: string,
    status: "REVIEWED" | "REJECTED" | "NEEDS_REUPLOAD",
    reviewedBy: string,
    reviewNotes?: string
  ): DocumentRequest | undefined {
    const req = this.data.documentRequests.find((d) => d.id === requestId);
    if (!req) return undefined;

    req.status = status;
    req.reviewedBy = reviewedBy;
    if (reviewNotes) req.reviewNotes = reviewNotes;

    this.persist();
    return req;
  }

  // ==========================================
  // PATIENT ENGAGEMENT & TRACKERS METHODS
  // ==========================================

  public getPatientTrackers(tenantId: string, contactId: string): PatientTracker[] {
    return this.data.patientTrackers.filter(
      (t) => t.contactId === contactId || (contactId.includes("priya") && t.contactId.includes("priya"))
    );
  }

  public getTrackerEntries(tenantId: string, contactId: string): TrackerEntry[] {
    return this.data.trackerEntries.filter(
      (e) => e.contactId === contactId || (contactId.includes("priya") && e.contactId.includes("priya"))
    );
  }

  public addTrackerEntry(entry: Omit<TrackerEntry, "id">): TrackerEntry {
    const newEntry: TrackerEntry = {
      ...entry,
      id: `entry-${Date.now()}`,
    };
    this.data.trackerEntries.push(newEntry);
    this.persist();
    return newEntry;
  }

  public getMilestones(contactId: string): TreatmentMilestone[] {
    return this.data.treatmentMilestones.filter(
      (m) => m.contactId === contactId || (contactId.includes("priya") && m.contactId.includes("priya"))
    );
  }

  // ==========================================
  // STAFF OPERATIONS METHODS
  // ==========================================

  public getStaffAttendance(tenantId?: string, date?: string): StaffAttendance[] {
    const tid = tenantId || this.data.activeTenantId;
    return this.data.staffAttendance.filter(
      (a) => a.tenantId === tid && (!date || a.date === date)
    );
  }

  public markStaffAttendance(
    tenantId: string,
    staffId: string,
    staffName: string,
    date: string,
    status: AttendanceStatus,
    shift: string,
    checkIn?: string,
    checkOut?: string,
    hours: number = 8.0,
    notes?: string
  ): StaffAttendance {
    const existing = this.data.staffAttendance.find((a) => a.staffId === staffId && a.date === date);
    if (existing) {
      existing.status = status;
      if (checkIn) existing.checkIn = checkIn;
      if (checkOut) existing.checkOut = checkOut;
      existing.hours = hours;
      if (notes) existing.notes = notes;
      this.persist();
      return existing;
    }

    const newAtt: StaffAttendance = {
      id: `att-${Date.now()}`,
      tenantId,
      staffId,
      staffName,
      date,
      shift,
      status,
      checkIn: checkIn || "09:00",
      checkOut,
      hours,
      notes,
    };
    this.data.staffAttendance.unshift(newAtt);
    this.persist();
    return newAtt;
  }

  public getPayroll(tenantId?: string, month?: string): PayrollEntry[] {
    const tid = tenantId || this.data.activeTenantId;
    return this.data.payrollEntries.filter(
      (p) => p.tenantId === tid && (!month || p.month === month)
    );
  }

  public recordSalaryPayment(
    payrollId: string,
    method: PaymentMethod,
    reference: string,
    memo: string,
    paidBy: string
  ): PayrollEntry | undefined {
    const entry = this.data.payrollEntries.find((p) => p.id === payrollId);
    if (!entry) return undefined;

    entry.status = "PAID";
    entry.paymentMethod = method;
    entry.paymentReference = reference;
    entry.memo = memo;
    entry.paidBy = paidBy;
    entry.paidDate = new Date().toISOString().split("T")[0];

    this.logStaffActivity(
      entry.tenantId,
      paidBy,
      "DISBURSE_SALARY",
      `Salary: ${entry.staffName}`,
      `Paid ₹${entry.payable} via ${method}. Ref: ${reference}.`,
      "STAFF"
    );

    this.persist();
    return entry;
  }

  public adjustPayroll(
    payrollId: string,
    adjustmentType: "ADVANCE" | "BONUS" | "DEDUCTION",
    amount: number,
    memo: string
  ): PayrollEntry | undefined {
    const entry = this.data.payrollEntries.find((p) => p.id === payrollId);
    if (!entry) return undefined;

    if (adjustmentType === "ADVANCE") {
      entry.advance += amount;
    } else if (adjustmentType === "BONUS") {
      entry.bonus += amount;
    } else if (adjustmentType === "DEDUCTION") {
      entry.deductions += amount;
    }

    entry.payable = entry.baseSalary - entry.advance + entry.bonus - entry.deductions;
    if (memo) entry.memo = memo;

    this.persist();
    return entry;
  }

  public getStaffLeaves(tenantId?: string, staffId?: string): StaffLeave[] {
    const tid = tenantId || this.data.activeTenantId;
    return this.data.staffLeaves.filter(
      (l) => l.tenantId === tid && (!staffId || l.staffId === staffId)
    );
  }

  public requestStaffLeave(
    tenantId: string,
    staffId: string,
    staffName: string,
    type: LeaveType,
    startDate: string,
    endDate: string,
    days: number,
    reason: string
  ): StaffLeave {
    const leave: StaffLeave = {
      id: `leave-${Date.now()}`,
      tenantId,
      staffId,
      staffName,
      type,
      startDate,
      endDate,
      days,
      reason,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    this.data.staffLeaves.unshift(leave);
    this.persist();
    return leave;
  }

  public reviewStaffLeave(leaveId: string, status: LeaveStatus, reviewedBy: string): StaffLeave | undefined {
    const leave = this.data.staffLeaves.find((l) => l.id === leaveId);
    if (!leave) return undefined;

    leave.status = status;
    leave.reviewedBy = reviewedBy;
    this.persist();
    return leave;
  }

  public getStaffActivityLog(tenantId?: string): StaffActivityEntry[] {
    const tid = tenantId || this.data.activeTenantId;
    return this.data.staffActivity.filter((a) => a.tenantId === tid);
  }

  public logStaffActivity(
    tenantId: string,
    staffName: string,
    action: string,
    targetEntity: string,
    details: string,
    category: StaffActivityEntry["category"]
  ): StaffActivityEntry {
    const entry: StaffActivityEntry = {
      id: `act-${Date.now()}`,
      tenantId,
      timestamp: new Date().toISOString(),
      staffName,
      action,
      targetEntity,
      details,
      category,
    };
    this.data.staffActivity.unshift(entry);
    this.persist();
    return entry;
  }

}

export const mockStore = new MockStore();
