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
  | "ADMIN"
  | "PRACTITIONER"
  | "RECEPTIONIST"
  | "MARKETING"
  | "BILLING"
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
