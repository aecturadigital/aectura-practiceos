import { PlanId } from "@/types";
export type { PlanId };

export type FeatureKey =
  | "website"
  | "booking"
  | "crm"
  | "contacts"
  | "portal"
  | "forms"
  | "reviews"
  | "analytics"
  | "email"
  | "whatsapp"
  | "automations"
  | "ai"
  | "knowledge_base"
  | "clinical"
  | "payments"
  | "advanced_reporting";

export interface PlanDefinition {
  id: PlanId;
  name: string;
  tagline: string;
  setupFeeInr: number;
  monthlyFeeInr: number;
  isPopular?: boolean;
  features: string[];
  entitledFeatures: Record<FeatureKey, boolean>;
  limits: {
    maxPractitioners: number;
    maxContacts: number;
    storageGb: number;
    monthlyAiMessages: number;
  };
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  presence: {
    id: "presence",
    name: "Aectura Presence",
    tagline: "The modern clinical digital storefront for private practices",
    setupFeeInr: 17900,
    monthlyFeeInr: 999,
    features: [
      "Premium Practice Website",
      "Responsive Medical Modern Design",
      "Custom Domain Routing Architecture",
      "Services Catalog & Practitioner Profiles",
      "Lead Enquiry & Contact Forms",
      "Basic Booking Request Flow",
      "Click-to-WhatsApp CTA",
      "Interactive Location Map",
      "Basic Traffic & Enquiry Analytics",
      "Managed High-Performance Cloud Hosting",
    ],
    entitledFeatures: {
      website: true,
      booking: true, // basic booking requests
      crm: false,
      contacts: false,
      portal: false,
      forms: true, // basic contact forms
      reviews: true,
      analytics: true, // basic
      email: false,
      whatsapp: true, // direct CTA
      automations: false,
      ai: false,
      knowledge_base: false,
      clinical: false,
      payments: false,
      advanced_reporting: false,
    },
    limits: {
      maxPractitioners: 3,
      maxContacts: 100,
      storageGb: 5,
      monthlyAiMessages: 0,
    },
  },
  practiceflow: {
    id: "practiceflow",
    name: "Aectura PracticeFlow",
    tagline: "Complete clinic operations, CRM, booking engine & patient management",
    setupFeeInr: 39900,
    monthlyFeeInr: 2499,
    isPopular: true,
    features: [
      "Everything in Presence, plus:",
      "Full Multi-Provider Calendar & Scheduling Engine",
      "360° Patient & Client Record Cards",
      "Interactive CRM Kanban Pipeline",
      "Client & Patient Self-Service Portal",
      "Automated Follow-ups & 24h Reminders Architecture",
      "Custom Intake & Clinical Consent Forms",
      "Practice Reviews Management",
      "Multi-Staff Access & Role Roster",
      "Clinical Exercise Programme (Physiotherapy)",
      "Comprehensive Practice Performance Analytics",
    ],
    entitledFeatures: {
      website: true,
      booking: true,
      crm: true,
      contacts: true,
      portal: true,
      forms: true,
      reviews: true,
      analytics: true,
      email: true,
      whatsapp: true,
      automations: true,
      ai: false,
      knowledge_base: false,
      clinical: true,
      payments: true,
      advanced_reporting: false,
    },
    limits: {
      maxPractitioners: 10,
      maxContacts: 5000,
      storageGb: 20,
      monthlyAiMessages: 0,
    },
  },
  practiceos_ai: {
    id: "practiceos_ai",
    name: "Aectura PracticeOS AI",
    tagline: "The autonomous clinic with conversational AI triage & triage intelligence",
    setupFeeInr: 69900,
    monthlyFeeInr: 3999,
    features: [
      "Everything in PracticeFlow, plus:",
      "Autonomous 24/7 AI Receptionist (WhatsApp & Web)",
      "Tenant Knowledge Base RAG Ingestion",
      "Human Handoff & Receptionist Takeover Alerts",
      "AI Assisted Booking & Automated Screening",
      "Conversational Sentiment & Lead Scoring",
      "Automated WhatsApp Recall & Reactivation",
      "Advanced Practice Intelligence & Forecasting",
      "Priority VIP Implementation & Support SLA",
    ],
    entitledFeatures: {
      website: true,
      booking: true,
      crm: true,
      contacts: true,
      portal: true,
      forms: true,
      reviews: true,
      analytics: true,
      email: true,
      whatsapp: true,
      automations: true,
      ai: true,
      knowledge_base: true,
      clinical: true,
      payments: true,
      advanced_reporting: true,
    },
    limits: {
      maxPractitioners: 25,
      maxContacts: 50000,
      storageGb: 100,
      monthlyAiMessages: 3000,
    },
  },
};

export const PLAN_CONFIGS = PLANS;

export function getPlan(planId: string): PlanDefinition {
  return PLANS[planId as PlanId] || PLANS.practiceflow;
}

export function hasFeature(planId: string, feature: FeatureKey): boolean {
  const plan = getPlan(planId);
  return !!plan.entitledFeatures[feature];
}

export interface UpgradeInfo {
  featureName: string;
  requiredPlanName: string;
  requiredPlanId: PlanId;
  description: string;
}

export const FEATURE_UPGRADES: Record<FeatureKey, UpgradeInfo> = {
  ai: {
    featureName: "AI Receptionist & Triage",
    requiredPlanName: "PracticeOS AI",
    requiredPlanId: "practiceos_ai",
    description: "Deploy an autonomous 24/7 conversational receptionist trained on your clinic guidelines.",
  },
  knowledge_base: {
    featureName: "AI Knowledge Base & Indexing",
    requiredPlanName: "PracticeOS AI",
    requiredPlanId: "practiceos_ai",
    description: "Ingest practice FAQs, policies, and practitioner bios for accurate instant patient answers.",
  },
  crm: {
    featureName: "CRM Pipeline & Deal Flow",
    requiredPlanName: "PracticeFlow",
    requiredPlanId: "practiceflow",
    description: "Track enquiries through visual Kanban stages from initial contact to completed care.",
  },
  contacts: {
    featureName: "360° Patient & Client Database",
    requiredPlanName: "PracticeFlow",
    requiredPlanId: "practiceflow",
    description: "Maintain comprehensive clinical history, intake responses, and communication timelines.",
  },
  booking: {
    featureName: "Full Multi-Provider Calendar",
    requiredPlanName: "PracticeFlow",
    requiredPlanId: "practiceflow",
    description: "Configure multi-provider rosters, buffer rules, and direct appointment scheduling.",
  },
  portal: {
    featureName: "Client / Patient Self-Service Portal",
    requiredPlanName: "PracticeFlow",
    requiredPlanId: "practiceflow",
    description: "Empower patients to view upcoming sessions, reschedule, view home exercises, and message staff.",
  },
  automations: {
    featureName: "Workflow Automation Engine",
    requiredPlanName: "PracticeFlow",
    requiredPlanId: "practiceflow",
    description: "Automate 24-hour appointment reminders, review sequences, and new enquiry outreach.",
  },
  clinical: {
    featureName: "Clinical Exercises & Clinical Notes",
    requiredPlanName: "PracticeFlow",
    requiredPlanId: "practiceflow",
    description: "Assign personalized home exercise programmes and record clinical consultation notes.",
  },
  advanced_reporting: {
    featureName: "Advanced AI & Growth Intelligence",
    requiredPlanName: "PracticeOS AI",
    requiredPlanId: "practiceos_ai",
    description: "Access practitioner utilization forecasting, conversion leakage reports, and AI resolution rates.",
  },
  website: {
    featureName: "Practice Website",
    requiredPlanName: "Presence",
    requiredPlanId: "presence",
    description: "Manage your modern clinic website and practitioner profiles.",
  },
  forms: {
    featureName: "Clinical Forms & Intakes",
    requiredPlanName: "PracticeFlow",
    requiredPlanId: "practiceflow",
    description: "Custom digital intake forms, PHQ-9/GAD-7, and medical consent questionnaires.",
  },
  reviews: {
    featureName: "Reputation & Review Management",
    requiredPlanName: "PracticeFlow",
    requiredPlanId: "practiceflow",
    description: "Collect and showcase authentic patient testimonials and Google reviews.",
  },
  analytics: {
    featureName: "Practice Analytics",
    requiredPlanName: "PracticeFlow",
    requiredPlanId: "practiceflow",
    description: "Monitor enquiry volume, booking conversion rates, and revenue trends.",
  },
  email: {
    featureName: "Email Confirmations & Notifications",
    requiredPlanName: "PracticeFlow",
    requiredPlanId: "practiceflow",
    description: "Automated booking confirmations and transactional emails.",
  },
  whatsapp: {
    featureName: "WhatsApp Conversational Engine",
    requiredPlanName: "PracticeFlow",
    requiredPlanId: "practiceflow",
    description: "Two-way patient communication over official WhatsApp channels.",
  },
  payments: {
    featureName: "Payment & Invoice Integration",
    requiredPlanName: "PracticeFlow",
    requiredPlanId: "practiceflow",
    description: "Issue digital invoices and accept online appointment deposits.",
  },
};
