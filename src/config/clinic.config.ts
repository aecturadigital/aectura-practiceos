export interface ClinicPractitionerConfig {
  id: string;
  name: string;
  title: string;
  militaryBackground?: string;
  qualifications: string[];
  bio: string;
  quote?: string;
  avatarUrl?: string;
}

export interface ClinicServiceConfig {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  price: number;
  currency: string;
  description: string;
  suitableFor: string[];
  badge?: string;
}

export interface ClinicWorkingHoursConfig {
  days: number[]; // 1 = Monday ... 6 = Saturday, 0 = Sunday
  startTime: string; // "10:30"
  endTime: string; // "19:30"
  slotDurationMinutes: number; // 60
  bufferMinutes: number; // 15
}

export interface ClinicConfig {
  identity: {
    id: string;
    name: string;
    legalName: string;
    slug: string;
    tagline: string;
    leadPractitioner: string;
  };
  brand: {
    primaryColor: string;
    accentColor: string;
    crestLetter: string;
  };
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    googleMapsUrl?: string;
  };
  contact: {
    primaryPhone: string;
    displayPhone: string;
    whatsapp: string;
    email: string;
  };
  practitioners: ClinicPractitionerConfig[];
  services: ClinicServiceConfig[];
  workingHours: ClinicWorkingHoursConfig;
  bookingSettings: {
    initialStatus: "SCHEDULED" | "AWAITING_CONFIRMATION";
    outboxEventType: "appointment.created";
    advanceNoticeHours: number;
    maxAdvanceDays: number;
    requirePhoneVerification: boolean;
  };
  publicCopy: {
    heroBadge: string;
    heroHeadline: string;
    heroSubheadline: string;
    tranceSteps: Array<{ step: string; title: string; description: string }>;
    caseVignettes: Array<{
      clientName: string;
      location: string;
      program: string;
      narrative: string;
      rating: number;
    }>;
  };
  featureFlags: {
    enableOnlineTelehealth: boolean;
    enableHoneypotValidation: boolean;
    enablePlatformLanding: boolean;
  };
}

/**
 * Soulmates Hypnotherapy & Mind-Body Wellness Center (Canonical Clinic Manifest)
 * Gold Master implementation instance for Pune clinic deployment.
 */
export const soulmatesClinicConfig: ClinicConfig = {
  identity: {
    id: "clinic_soulmates",
    name: "Soulmates Hypnotherapy",
    legalName: "Soulmates Hypnotherapy & Mind-Body Wellness Center LLP",
    slug: "soulmates-hypnotherapy",
    tagline: "Evidence-Based Clinical Hypnotherapy & Transpersonal Wellness",
    leadPractitioner: "Col Umakant Saxena (Retd)",
  },
  brand: {
    primaryColor: "#080B0F",
    accentColor: "#D4AF37",
    crestLetter: "S",
  },
  location: {
    address: "Wanowrie Clinical Suite",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    postalCode: "411040",
    googleMapsUrl: "https://maps.google.com/?q=Wanowrie+Pune+Maharashtra",
  },
  contact: {
    primaryPhone: "+919823012345",
    displayPhone: "+91 98230 12345",
    whatsapp: "+919823012345",
    email: "care@soulmatestherapy.com",
  },
  practitioners: [
    {
      id: "practitioner_umakant_saxena",
      name: "Col Umakant Saxena",
      title: "Senior Clinical Hypnotherapist & Founder",
      militaryBackground: "Retired Indian Armed Forces Colonel with distinguished command service",
      qualifications: [
        "Certified Clinical Hypnotherapist (IMDHA/EKAA)",
        "Transpersonal Regression Therapy Practitioner",
        "Autonomic Stress & Trauma Desensitization Specialist",
      ],
      bio: "Following decades of distinguished military leadership, Col Saxena dedicated his career to the science of subconscious trauma release. Trained through EKAA and the International Medical and Dental Hypnotherapy Association, he combines military discipline with clinical empathy.",
      quote: "The conscious mind analyzes, plans, and worries; but the subconscious mind governs emotional memory and autonomic reactivity. Through clinical trance, we neutralize decades of unresolved tension in structured sessions.",
    },
  ],
  services: [
    {
      id: "hypno-consult",
      name: "Clinical Hypnotherapy Assessment",
      category: "Individual Therapy",
      durationMinutes: 60,
      price: 2500,
      currency: "INR",
      badge: "Most Popular",
      description: "Diagnostic intake and initial trance induction. Targets panic triggers, emotional distress, and subconscious blocks.",
      suitableFor: ["Acute Anxiety", "Panic Episodes", "Psychosomatic Symptoms", "Stress Management"],
    },
    {
      id: "anxiety-course",
      name: "3-Session Anxiety & Somatic Pack",
      category: "Structured Treatment",
      durationMinutes: 180,
      price: 7500,
      currency: "INR",
      badge: "High Efficacy",
      description: "Evidence-based 3-stage hypnotherapy protocol. Deep hypnotic desensitization followed by permanent emotional anchoring.",
      suitableFor: ["Generalized Anxiety (GAD)", "Performance Anxiety", "Chronic Overthinking", "Burnout"],
    },
    {
      id: "plr-intensive",
      name: "Past Life Regression (PLR) Session",
      category: "Transpersonal Hypnotherapy",
      durationMinutes: 120,
      price: 5000,
      currency: "INR",
      badge: "Deep Trance",
      description: "Deep somnambulistic trance exploration designed to resolve inexplicable phobias, recurring relationship patterns, and somatic pains.",
      suitableFor: ["Inexplicable Phobias", "Karmic Traumas", "Spiritual Exploration", "Relational Loops"],
    },
    {
      id: "insomnia-protocol",
      name: "Sleep Architecture Hypnotherapy",
      category: "Neurological Protocol",
      durationMinutes: 60,
      price: 2500,
      currency: "INR",
      description: "Reprograms the autonomic nervous system to accelerate sleep onset, eliminate awakenings, and restore delta wave sleep.",
      suitableFor: ["Chronic Insomnia", "Racing Thoughts at Bedtime", "Sleep Anxiety", "Non-Restorative Sleep"],
    },
    {
      id: "phobia-desensitize",
      name: "Rapid Phobia Desensitization",
      category: "Cognitive Trance",
      durationMinutes: 60,
      price: 2500,
      currency: "INR",
      description: "Focused neuro-linguistic and trance dissociation protocol to permanently disarm acute phobic triggers.",
      suitableFor: ["Fear of Heights / Flying", "Claustrophobia", "Public Speaking Panic", "Medical Phobias"],
    },
    {
      id: "habit-cessation",
      name: "Habit & Smoking Cessation",
      category: "Behavioral Transformation",
      durationMinutes: 90,
      price: 3500,
      currency: "INR",
      description: "Rewires compulsive cravings by replacing dopamine anticipation pathways at the subconscious identity level.",
      suitableFor: ["Nicotine Addiction", "Emotional Overeating", "Compulsive Habits", "Stress-Driven Cravings"],
    },
  ],
  workingHours: {
    days: [1, 2, 3, 4, 5, 6], // Monday to Saturday
    startTime: "10:30",
    endTime: "19:30",
    slotDurationMinutes: 60,
    bufferMinutes: 15,
  },
  bookingSettings: {
    initialStatus: "SCHEDULED",
    outboxEventType: "appointment.created",
    advanceNoticeHours: 4,
    maxAdvanceDays: 30,
    requirePhoneVerification: false,
  },
  publicCopy: {
    heroBadge: "Evidence-Based Clinical Hypnotherapy • Led by Col Umakant Saxena",
    heroHeadline: "Heal the Subconscious Root Cause of Anxiety, Insomnia & Trauma",
    heroSubheadline: "Specialized clinical hypnotherapy and transpersonal regression conducted with military precision and deep clinical empathy in Wanowrie, Pune and worldwide via secure telehealth.",
    tranceSteps: [
      {
        step: "01",
        title: "Somatic Brainwave Deceleration",
        description: "Through progressive muscle relaxation and breath anchors, beta brainwaves (stress state) decelerate into receptive alpha and deep theta frequencies.",
      },
      {
        step: "02",
        title: "Subconscious Root Cause Discovery",
        description: "We safely guide your focus back to initial sensitizing events where subconscious emotional knots formed, releasing accumulated somatic tension.",
      },
      {
        step: "03",
        title: "Cognitive Reframing & Anchoring",
        description: "Old traumatic charges are neutralized and replaced with positive, autonomic anchors for permanent neuro-linguistic emotional stabilization.",
      },
    ],
    caseVignettes: [
      {
        clientName: "Priya S.",
        location: "Pune",
        program: "Anxiety Protocol",
        narrative: "I suffered from generalized anxiety and heart palpitations before executive board meetings for nearly eight years. After three sessions with Col Umakant, the panic trigger was completely defused. His presence is incredibly grounding.",
        rating: 5,
      },
      {
        clientName: "Rajesh V.",
        location: "Pune",
        program: "PLR Therapy",
        narrative: "The Past Life Regression session resolved a persistent claustrophobia that modern medication could not touch. Col Saxena's structured military approach ensures you feel 100% safe throughout the entire deep trance.",
        rating: 5,
      },
    ],
  },
  featureFlags: {
    enableOnlineTelehealth: true,
    enableHoneypotValidation: true,
    enablePlatformLanding: false, // Strict Production Default: internal/B2B landing is disabled
  },
};

/**
 * Returns the active clinic configuration for this deployment.
 */
export function getClinicConfig(): ClinicConfig {
  return soulmatesClinicConfig;
}
