export interface VerticalConfig {
  id: "psychology" | "physiotherapy" | string;
  displayName: string;
  badge: string;
  terminology: {
    contactSingular: string; // "Client"
    contactPlural: string; // "Clients"
    practitionerTitle: string; // "Psychologist"
    sessionTitle: string; // "Therapy Session"
    clinicalNotesTitle: string; // "Psychotherapy Notes"
    chiefConcernLabel: string; // "Presenting Concern"
  };
  defaultBranding: {
    primaryColor: string;
    accentColor: string;
    tagline: string;
  };
  templates: Array<{
    id: string;
    name: string;
    description: string;
    tagline: string;
  }>;
  commonConcerns: string[];
  defaultServices: Array<{
    name: string;
    durationMinutes: number;
    price: number; // in INR
    description: string;
    category: string;
  }>;
  intakeFields: Array<{
    id: string;
    label: string;
    type: "text" | "textarea" | "select";
    options?: string[];
    required: boolean;
  }>;
}

export const psychologyVertical: VerticalConfig = {
  id: "psychology",
  displayName: "Psychology & Psychotherapy",
  badge: "Mental Healthcare",
  terminology: {
    contactSingular: "Client",
    contactPlural: "Clients",
    practitionerTitle: "Psychologist",
    sessionTitle: "Therapy Session",
    clinicalNotesTitle: "Psychotherapy Session Notes",
    chiefConcernLabel: "Presenting Concern",
  },
  defaultBranding: {
    primaryColor: "#0D9488", // Deep Teal
    accentColor: "#111315",
    tagline: "Compassionate, Evidence-Based Psychological Care & Therapy",
  },
  templates: [
    {
      id: "calm_professional",
      name: "Calm Professional",
      description: "Serene, evidence-focused aesthetic designed for private practices and clinical psychology consultants.",
      tagline: "A safe, structured space for personal healing and cognitive clarity.",
    },
    {
      id: "modern_therapy",
      name: "Modern Therapy",
      description: "Warm, contemporary styling with accessible micro-copy for young adult and couples therapy clinics.",
      tagline: "Evidence-based therapy made accessible, warm, and human.",
    },
    {
      id: "premium_wellness",
      name: "Premium Wellness",
      description: "Refined minimalist presentation suitable for executive counselling and boutique integrative clinics.",
      tagline: "Executive psychological resilience and mental fitness coaching.",
    },
  ],
  commonConcerns: [
    "Anxiety & Panic",
    "Depression & Low Mood",
    "Relationship & Couples",
    "Workplace Burnout & Stress",
    "Trauma & PTSD",
    "Grief & Bereavement",
    "Sleep & Insomnia",
    "Student & Academic Stress",
    "Self-Esteem & Identity",
  ],
  defaultServices: [
    {
      name: "Individual Psychotherapy (50 min)",
      durationMinutes: 50,
      price: 1800,
      description: "One-on-one evidence-based cognitive behavioral therapy and emotional processing.",
      category: "Individual Therapy",
    },
    {
      name: "Couples & Relationship Counselling (80 min)",
      durationMinutes: 80,
      price: 2800,
      description: "Structured relational guidance focusing on communication patterns, conflict resolution, and trust.",
      category: "Couples Counselling",
    },
    {
      name: "Comprehensive Intake & Clinical Assessment (60 min)",
      durationMinutes: 60,
      price: 2200,
      description: "Initial diagnostic screening, developmental history, and collaborative treatment formulation.",
      category: "Assessment",
    },
    {
      name: "Child & Adolescent Therapy (45 min)",
      durationMinutes: 45,
      price: 1800,
      description: "Developmentally tailored psychological support for emotional regulation, school anxiety, and behavioral changes.",
      category: "Youth Therapy",
    },
    {
      name: "Workplace Burnout & Stress Management (50 min)",
      durationMinutes: 50,
      price: 2000,
      description: "Targeted resilience strategies for corporate leaders, professionals, and medical staff.",
      category: "Specialized",
    },
  ],
  intakeFields: [
    {
      id: "primary_concern",
      label: "What primary concerns bring you to therapy today?",
      type: "textarea",
      required: true,
    },
    {
      id: "emergency_contact",
      label: "Emergency Contact Name & Phone Number",
      type: "text",
      required: true,
    },
    {
      id: "previous_therapy",
      label: "Have you attended psychotherapy in the past?",
      type: "select",
      options: [
        "Yes, within the last 12 months",
        "Yes, more than a year ago",
        "No, this is my first time seeking therapy",
      ],
      required: true,
    },
  ],
};
