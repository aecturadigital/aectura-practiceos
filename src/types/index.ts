export type VerticalType = "psychology" | "physiotherapy" | string;

export type PlanId = "presence" | "practiceflow" | "practiceos_ai";

export type TenantStatus = "PREVIEW" | "ACTIVE" | "SUSPENDED" | "ARCHIVED";

export type ContactStatus = "LEAD" | "ACTIVE" | "INACTIVE" | "DISCHARGED";

export type CrmStage =
  | "NEW_ENQUIRY"
  | "CONTACTED"
  | "QUALIFIED"
  | "BOOKED"
  | "VISITED"
  | "CONVERTED"
  | "LOST";

export type AppointmentStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | "RESCHEDULED";

export type AppointmentMode = "IN_PERSON" | "ONLINE" | "HOME_VISIT";

export type ChannelType = "WHATSAPP" | "EMAIL" | "PORTAL" | "SMS";

export type StaffRole =
  | "SUPER_ADMIN"
  | "OWNER"
  | "CLINIC_ADMIN"
  | "ADMIN"
  | "PRACTITIONER"
  | "RECEPTIONIST"
  | "BILLING_ACCOUNTANT"
  | "BILLING"
  | "HR_MANAGER"
  | "READ_ONLY_AUDITOR"
  | "MARKETING"
  | "PATIENT";

export interface StaffUser {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  title: string;
  qualifications: string;
  specialization: string;
  bio: string;
  avatarUrl: string;
  isActive: boolean;
}

export interface ServiceItem {
  id: string;
  tenantId: string;
  name: string;
  durationMinutes: number;
  price: number; // in INR
  description: string;
  category: string;
  isOnlineAvailable: boolean;
  isHomeVisitAvailable: boolean;
}

export interface TenantBranding {
  primaryColor: string;
  accentColor: string;
  font: string;
  buttonStyle: "rounded" | "pill" | "square";
  logoUrl?: string;
  faviconUrl?: string;
  tagline: string;
}

export interface TenantSettings {
  timezone: string;
  currency: string;
  bookingLeadTimeHours: number;
  cancellationCutoffHours: number;
  bufferMinutes: number;
  autoConfirmAppointments: boolean;
  aiReceptionistEnabled: boolean;
  aiTone: "professional" | "warm" | "concise";
  aiName: string;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  legalName: string;
  verticalId: VerticalType;
  planId: PlanId;
  templateId: string;
  status: TenantStatus;
  city: string;
  state: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  existingWebsite?: string;
  googleBusinessUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  branding: TenantBranding;
  team: StaffUser[];
  services: ServiceItem[];
  settings: TenantSettings;
  createdAt: string;
  previewExpiresAt?: string;
  customDomain?: string;
}

export interface Contact {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  avatarUrl?: string;
  status: ContactStatus;
  assignedPractitionerId: string;
  tags: string[];
  notesCount: number;
  lastContactedAt: string;
  createdAt: string;
  city?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;

  // Psychology clinical fields
  presentingConcerns?: string[];
  emergencyContact?: string;
  emergencyPhone?: string;
  riskFlag?: "LOW" | "MEDIUM" | "HIGH" | "CRISIS";
  preferredTherapistId?: string;
  consentSigned?: boolean;
  intakeCompleted?: boolean;
  phq9Score?: number;
  gad7Score?: number;

  // Physiotherapy clinical fields
  chiefComplaint?: string;
  affectedArea?: string;
  painScore?: number; // 1 to 10
  surgeryHistory?: string;
  mobilityLevel?: string;
  exerciseProgrammeAssigned?: boolean;
  rangeOfMotionBaseline?: string;

  // Connected records summary
  totalSessionsCompleted?: number;
  nextAppointmentDate?: string;
  activeDealStage?: CrmStage;
  activeDealValue?: number;

  // Sensitivity & Security
  isRestrictedProfile?: boolean;
  pendingCorrection?: {
    field: string;
    oldValue: string;
    newValue: string;
    requestedBy: string;
    requestedAt: string;
  };
}

export interface CrmDeal {
  id: string;
  tenantId: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  title: string;
  value: number; // in INR
  stage: CrmStage;
  priority: "LOW" | "MEDIUM" | "HIGH";
  source: "WEBSITE" | "WHATSAPP" | "GOOGLE" | "REFERRAL" | "INSTAGRAM" | "PHONE";
  assignedToStaffId: string;
  nextFollowUpDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  tenantId: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  staffId: string;
  staffName: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes: number;
  mode: AppointmentMode;
  status: AppointmentStatus;
  location: string;
  notes?: string;
  cancellationReason?: string;
  intakeFormSubmitted: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  tenantId: string;
  contactId: string;
  channel: ChannelType;
  direction: "INBOUND" | "OUTBOUND";
  senderName: string;
  content: string;
  timestamp: string;
  status: "SENT" | "DELIVERED" | "READ";
  isAiGenerated?: boolean;
}

export interface Conversation {
  id: string;
  tenantId: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  channel: ChannelType;
  state: "OPEN" | "PENDING" | "RESOLVED";
  assignedStaffId?: string;
  aiEnabled: boolean;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface FormField {
  id: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "email"
    | "phone"
    | "number"
    | "date"
    | "select"
    | "multiselect"
    | "radio"
    | "checkbox"
    | "scale"
    | "file"
    | "consent"
    | "heading";
  required: boolean;
  options?: string[];
  placeholder?: string;
  defaultValue?: string | number | boolean;
}

export interface Form {
  id: string;
  tenantId: string;
  title: string;
  type: "CONTACT" | "BOOKING" | "INTAKE" | "CONSENT" | "FEEDBACK";
  description: string;
  fields: FormField[];
  submissionsCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface FormSubmission {
  id: string;
  tenantId: string;
  formId: string;
  formTitle: string;
  contactId?: string;
  contactName: string;
  contactEmail: string;
  answers: Record<string, any>;
  submittedAt: string;
}

export interface Exercise {
  id: string;
  tenantId: string;
  contactId: string;
  title: string;
  instruction: string;
  sets: number;
  reps: number;
  duration: string;
  frequency: string;
  targetMuscle: string;
  completedToday: boolean;
  completedHistory: string[]; // dates YYYY-MM-DD
  mediaUrl?: string;
}

export interface Review {
  id: string;
  tenantId: string;
  authorName: string;
  rating: number; // 1-5
  comment: string;
  source: "GOOGLE" | "INTERNAL" | "PRACTICEOS";
  date: string;
  isPublished: boolean;
  isFeatured: boolean;
  response?: string;
}

export interface AutomationRecipe {
  id: string;
  tenantId: string;
  title: string;
  trigger: string;
  actions: string[];
  isEnabled: boolean;
  lastRunAt: string;
  executionCount: number;
  successRate: number;
  category: "LEADS" | "APPOINTMENTS" | "REVIEWS" | "RETENTION";
  description?: string;
  channel?: string;
  delayMinutes?: number;
}

export interface KnowledgeDocument {
  id: string;
  tenantId: string;
  title: string;
  category:
    | "BUSINESS_INFO"
    | "SERVICES"
    | "PRACTITIONERS"
    | "FAQS"
    | "PRICING"
    | "POLICIES"
    | "DOCUMENTS";
  content: string;
  status: "ACTIVE" | "PROCESSING" | "ERROR";
  lastIndexedAt: string;
  tags?: string[];
  updatedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  tenantId: string;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  details: string;
  ipAddress: string;
}

export interface WebsiteSection {
  id: string;
  name: string;
  isEnabled: boolean;
  order: number;
  variant?: string;
  title?: string;
  subtitle?: string;
}

export interface WebsiteConfig {
  tenantId: string;
  hero: {
    badge: string;
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaLink: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
    imageUrl?: string;
  };
  sections: WebsiteSection[];
  customDomain?: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
}

export interface NotificationItem {
  id: string;
  tenantId: string;
  title: string;
  message: string;
  type: "ENQUIRY" | "APPOINTMENT" | "INTAKE" | "AI_ALERT" | "PAYMENT";
  timestamp: string;
  read: boolean;
  link?: string;
}

// ==========================================
// 1. TREATMENT COURSES & PLAN CYCLES
// ==========================================

export type PlanCycleStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "ACTIVE"
  | "PAYMENT_DUE"
  | "ON_HOLD"
  | "FROZEN"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

export type PlanBillingType =
  | "FIXED_PACKAGE"
  | "MONTHLY"
  | "SESSION_PACKAGE"
  | "WEEKLY"
  | "CUSTOM";

export type SessionFrequency =
  | "DAILY"
  | "WEEKDAYS"
  | "X_PER_WEEK"
  | "WEEKLY"
  | "ALTERNATE_DAYS"
  | "CUSTOM_DATES"
  | "OPEN_PACKAGE";

export type RolloverPolicy =
  | "EXPIRE"
  | "GRACE_PERIOD"
  | "CARRY_FORWARD"
  | "DOCTOR_APPROVAL";

export type NoShowPolicy =
  | "DO_NOT_DEDUCT"
  | "DEDUCT"
  | "REQUIRES_APPROVAL";

export type PlanAdjustmentType =
  | "PRICE"
  | "SESSION_COUNT"
  | "END_DATE"
  | "DURATION"
  | "FREEZE"
  | "EXTENSION"
  | "ROLLOVER"
  | "SERVICE_INCLUSION"
  | "DISCOUNT"
  | "TREATMENT_STATUS";

export interface PlanAdjustment {
  id: string;
  planCycleId: string;
  adjustmentType: PlanAdjustmentType;
  oldValue: string | number;
  newValue: string | number;
  reason: string;
  changedBy: string; // Practitioner or Staff name
  timestamp: string;
}

export interface PlanCycle {
  id: string;
  tenantId: string;
  contactId: string;
  treatmentCourseId: string;
  cycleNumber: number;
  name: string;
  description: string;
  status: PlanCycleStatus;
  startDate: string; // YYYY-MM-DD
  expectedEndDate: string;
  actualEndDate?: string;
  billingType: PlanBillingType;
  price: number; // in INR
  plannedSessions: number;
  completedSessions: number;
  sessionFrequency: SessionFrequency;
  validityDays: number;
  gracePeriodDays: number;
  rolloverPolicy: RolloverPolicy;
  noShowPolicy: NoShowPolicy;
  autoCreateFutureCycles: boolean;
  numberOfExpectedCycles: number;
  notes?: string;
  assignedPractitioner: string; // Staff ID
  assignedPractitionerName: string;
  isFrozen?: boolean;
  freezeReason?: string;
  freezeStartDate?: string;
  freezeEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TreatmentCourse {
  id: string;
  tenantId: string;
  contactId: string;
  contactName: string;
  title: string; // e.g. "Lower Back Rehabilitation"
  treatmentType: string;
  prescribedByStaffId: string;
  prescribedByName: string;
  expectedDurationMonths: number;
  currentCycleNumber: number;
  totalCycles: number;
  status: "ACTIVE" | "COMPLETED" | "ON_HOLD" | "CANCELLED";
  startDate: string;
  targetCompletionDate: string;
  clinicalGoals: string[];
  diagnosisSummary?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 2. TREATMENT SESSIONS & ADD-ONS
// ==========================================

export type TreatmentSessionStatus =
  | "SCHEDULED"
  | "AWAITING_CONFIRMATION"
  | "CONFIRMED"
  | "DECLINED_IN_ADVANCE"
  | "RESCHEDULED"
  | "ATTENDED"
  | "LATE_CANCELLED"
  | "NO_SHOW"
  | "CLINIC_CANCELLED"
  | "PRACTITIONER_CANCELLED";

export interface TreatmentSession {
  id: string;
  tenantId: string;
  contactId: string;
  treatmentCourseId: string;
  planCycleId: string;
  appointmentId?: string;
  practitionerId: string;
  practitionerName: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  status: TreatmentSessionStatus;
  sessionNumber: number;
  isIncludedInPlan: boolean;
  sessionDeducted: boolean;
  attendanceRecordedBy?: string;
  notes?: string;
  createdAt: string;
}

export type AddOnPaymentOption =
  | "CHARGE_NOW"
  | "ADD_TO_BALANCE"
  | "MARK_PAID"
  | "WAIVE"
  | "DISCOUNT";

export interface ProcedureAddOn {
  id: string;
  tenantId: string;
  contactId: string;
  sessionId?: string;
  planCycleId?: string;
  procedureName: string; // e.g. "Dry Needling", "Taping", "IFT"
  price: number; // in INR
  quantity: number;
  notes?: string;
  includedInPlan: boolean;
  waived: boolean;
  discount: number;
  finalAmount: number;
  paymentStatus: "PAID" | "UNPAID" | "WAIVED" | "PROMISED_AT_NEXT_VISIT";
  createdAt: string;
}

// ==========================================
// 3. PATIENT FINANCIAL LEDGER & INVOICING
// ==========================================

export type LedgerTransactionType =
  | "CHARGE"
  | "PAYMENT"
  | "REFUND"
  | "DISCOUNT"
  | "WAIVER"
  | "CREDIT"
  | "ADJUSTMENT"
  | "PACKAGE_SALE"
  | "ADD_ON_SERVICE"
  | "REVERSAL";

export type PaymentMethod =
  | "Cash"
  | "UPI"
  | "Card"
  | "Bank Transfer"
  | "Payment Link"
  | "Other";

export interface LedgerTransaction {
  id: string;
  tenantId: string;
  contactId: string;
  date: string; // YYYY-MM-DD
  amount: number; // in INR
  type: LedgerTransactionType;
  description: string;
  category: "CONSULTATION" | "TREATMENT_PLAN" | "ADD_ON" | "PAYMENT" | "ADJUSTMENT";
  method?: PaymentMethod;
  referenceNumber?: string;
  memo?: string;
  receivedBy?: string; // staff name
  invoiceId?: string;
  receiptId?: string;
  status: "COMPLETED" | "PENDING" | "VOIDED";
  createdAt: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  isCoveredByPlan?: boolean;
}

export interface Invoice {
  id: string;
  tenantId: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  type: "QUOTE" | "INVOICE" | "RECEIPT" | "STATEMENT";
  invoiceNumber: string;
  date: string;
  dueDate: string;
  items: InvoiceLineItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: "DRAFT" | "SENT" | "PAID" | "PARTIAL" | "OVERDUE";
  notes?: string;
  createdAt: string;
}

export interface PaymentReminder {
  id: string;
  tenantId: string;
  contactId: string;
  contactName: string;
  amountDue: number;
  dueDate: string;
  channel: "WHATSAPP" | "SMS" | "EMAIL";
  messageText: string;
  status: "PREPARED" | "DISPATCHED" | "ACKNOWLEDGED" | "PAID";
  dispatchedAt?: string;
  dispatchedBy?: string;
  paymentIntent?: "PROMISED_AT_NEXT_VISIT" | "ONLINE_LINK_GENERATED";
  createdAt: string;
}

// ==========================================
// 4. PATIENT ENGAGEMENT & TRACKERS
// ==========================================

export interface PatientTracker {
  id: string;
  tenantId: string;
  contactId: string;
  name: string; // e.g. "Pain Today", "Sleep Quality", "Exercise Completed"
  type: "SCALE_10" | "PERCENTAGE" | "BOOLEAN" | "TEXT" | "NUMBER";
  unit?: string;
  isEnabled: boolean;
}

export interface TrackerEntry {
  id: string;
  tenantId: string;
  contactId: string;
  trackerId: string;
  trackerName: string;
  date: string; // YYYY-MM-DD
  value: number | string | boolean;
  notes?: string;
}

export interface TreatmentMilestone {
  id: string;
  contactId: string;
  title: string;
  targetSessions: number;
  achieved: boolean;
  achievedAt?: string;
}

export type DocumentClassification =
  | "PUBLIC"
  | "ADMINISTRATIVE"
  | "PATIENT_VISIBLE"
  | "CLINICAL_PRIVATE"
  | "PRACTITIONER_ONLY"
  | "BILLING";

export type DocumentRequestStatus =
  | "REQUESTED"
  | "UPLOADED"
  | "REVIEWED"
  | "REJECTED"
  | "NEEDS_REUPLOAD";

export interface DocumentRequest {
  id: string;
  tenantId: string;
  contactId: string;
  documentType: "MRI" | "X-Ray" | "Prescription" | "Doctor Referral" | "Lab Report" | "Discharge Summary" | "Insurance Document" | "Custom Document";
  requestedBy: string;
  requestedDate: string;
  dueDate: string;
  notes: string;
  visibility: DocumentClassification;
  status: DocumentRequestStatus;
  uploadedFileName?: string;
  uploadedFileUrl?: string;
  uploadedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

// ==========================================
// 5. STAFF OPERATIONS (StaffOps)
// ==========================================

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY" | "LEAVE";

export interface StaffAttendance {
  id: string;
  tenantId: string;
  staffId: string;
  staffName: string;
  date: string; // YYYY-MM-DD
  checkIn?: string; // HH:mm
  checkOut?: string; // HH:mm
  shift: string; // "Morning 9-5", "General", etc.
  hours: number;
  status: AttendanceStatus;
  notes?: string;
}

export type LeaveType = "PAID" | "UNPAID" | "SICK" | "EMERGENCY" | "OTHER";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface StaffLeave {
  id: string;
  tenantId: string;
  staffId: string;
  staffName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  reviewedBy?: string;
  createdAt: string;
}

export interface PayrollEntry {
  id: string;
  tenantId: string;
  staffId: string;
  staffName: string;
  role: string;
  month: string; // e.g. "September 2026"
  baseSalary: number;
  advance: number;
  bonus: number;
  deductions: number;
  payable: number;
  dueDate: string; // e.g. "2026-09-30"
  status: "DUE" | "PAID";
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  paidDate?: string;
  paidBy?: string;
  memo?: string;
}

export interface StaffActivityEntry {
  id: string;
  tenantId: string;
  timestamp: string;
  staffName: string;
  action: string;
  targetEntity: string;
  details: string;
  category: "PATIENT" | "APPOINTMENT" | "BILLING" | "TREATMENT" | "DOCUMENT" | "STAFF";
}
