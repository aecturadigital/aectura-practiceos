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
    timezone: string; // e.g. "Asia/Kolkata"
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
    timezone: string;
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
    name: "Soulmates Therapy Centre",
    legalName: "Soulmates Therapy Centre",
    slug: "soulmates-hypnotherapy",
    tagline: "Every soul has a story, find yours…",
    leadPractitioner: "Col Umakant Saxena",
  },
  brand: {
    primaryColor: "#064E3B",
    accentColor: "#D4AF37",
    crestLetter: "S",
  },
  location: {
    address: "209, One Place, Opposite Salunke Vihar Road, Wanworie",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    postalCode: "411040",
    timezone: "Asia/Kolkata",
    googleMapsUrl: "https://maps.google.com/?q=Soulmates+Therapy+Centre+One+Place+Wanworie+Pune",
  },
  contact: {
    primaryPhone: "+919970523794",
    displayPhone: "+91 99705 23794",
    whatsapp: "+919970523794",
    email: "info@soulmateshypnotherapy.com",
  },
  practitioners: [
    {
      id: "practitioner_umakant_saxena",
      name: "Col Umakant Saxena",
      title: "Founder & Chief Clinical Hypnotherapist",
      militaryBackground: "Retired Indian Armed Forces Colonel, Ex-Army Officer & Computer Engineer",
      qualifications: [
        "Ex-Army Officer & Computer Engineer",
        "M.Sc. Counseling & Spiritual Health",
        "Certified Clinical Hypnotherapist & Regression Specialist",
        "Over 4 Decades of High-Altitude Himalayan Sadhna",
      ],
      bio: "Col Umakant Saxena combines rigorous scientific discipline with over four decades of deep spiritual practice. Having conducted high-altitude Himalayan sadhnas since 1972, he has helped over 1,100 individuals overcome chronic anxiety, depression, phobias, and deep-seated psychosomatic conditions through safe, medicine-free subconscious regression.",
      quote: "Every soul has a story, find yours… The subconscious mind holds the keys to healing emotional trauma and chronic somatic tension safely without medications.",
    },
  ],
  services: [
    {
      id: "hypno-consult",
      name: "Clinical Hypnotherapy & Anxiety Relief",
      category: "Individual Therapy",
      durationMinutes: 60,
      price: 2500,
      currency: "INR",
      badge: "Most Popular",
      description: "Diagnostic intake and subconscious regression. Targets panic triggers, emotional distress, and subconscious blocks.",
      suitableFor: ["Acute Anxiety", "Panic Episodes", "Psychosomatic Symptoms", "Stress Management"],
    },
    {
      id: "plr-intensive",
      name: "Past Life Regression (PLR) Deep Therapy",
      category: "Transpersonal Hypnotherapy",
      durationMinutes: 150,
      price: 5000,
      currency: "INR",
      badge: "Deep Trance",
      description: "Deep somnambulistic trance exploration designed to resolve inexplicable phobias, recurring relationship patterns, and somatic pains.",
      suitableFor: ["Inexplicable Phobias", "Karmic Traumas", "Spiritual Exploration", "Relational Loops"],
    },
    {
      id: "online-telehealth",
      name: "Online Video Hypnotherapy Consultation",
      category: "Telehealth",
      durationMinutes: 60,
      price: 2500,
      currency: "INR",
      badge: "Worldwide",
      description: "Secure 1-on-1 virtual clinical hypnotherapy session for clients across India and globally via Google Meet.",
      suitableFor: ["Remote Patients", "Anxiety Management", "Stress Reduction", "Sleep Issues"],
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
    timezone: "Asia/Kolkata",
    requirePhoneVerification: false,
  },
  publicCopy: {
    heroBadge: "Medicine-Free Clinical Hypnotherapy • Led by Col Umakant Saxena",
    heroHeadline: "Heal the Subconscious Root Cause of Anxiety, Insomnia & Trauma",
    heroSubheadline:
      "Combining military precision with deep subconscious neuroscience to resolve chronic emotional distress, panic triggers, and somatic tension in structured, measurable clinical sessions.",
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
        clientName: "Poorva (31)",
        location: "Madhya Pradesh",
        program: "Past Life Regression",
        narrative: "I was experiencing unexplainable emotional heaviness and recurring anxieties that conventional medicine could not diagnose. Col Umakant Saxena guided me through a deep PLR session. Once brought to consciousness, the emotional knots dissolved completely. I feel renewed and light.",
        rating: 5,
      },
      {
        clientName: "Ms. Vasanta",
        location: "Koregaon Park, Pune",
        program: "Clinical Hypnotherapy",
        narrative: "I had suffered from panic attacks and insomnia for over 4 years. After just 5 sessions of clinical hypnotherapy at Soulmates Therapy Centre, my anxiety disappeared. Col Saxena's calm presence and spiritual depth made me feel completely safe. No medicines, no side effects.",
        rating: 5,
      },
      {
        clientName: "Dr. K. Mehta (MBBS)",
        location: "Pune",
        program: "Clinical Hypnotherapy",
        narrative: "As a medical doctor, I was initially analytical about hypnotherapy. However, witnessing Col Saxena's scientific approach convinced me. His work on psychosomatic disorders and past life regression is truly remarkable.",
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

/**
 * Returns the deployment timezone for scheduling calculations.
 */
export function getClinicTimezone(): string {
  return soulmatesClinicConfig.bookingSettings.timezone || "Asia/Kolkata";
}

/**
 * Validates and resolves an authorized practitioner against the clinic configuration.
 * Prevents arbitrary practitioner ID fabrication from public clients.
 */
export function resolveClinicPractitioner(
  clinicConfig: ClinicConfig,
  practitionerParam?: string | null
): ClinicPractitionerConfig | null {
  if (!practitionerParam) {
    // Default to lead practitioner configured in manifest
    return (
      clinicConfig.practitioners.find(
        (p) =>
          p.id === clinicConfig.identity.leadPractitioner ||
          p.name === clinicConfig.identity.leadPractitioner
      ) || clinicConfig.practitioners[0] || null
    );
  }

  // Look up explicitly authorized practitioner by id or name
  return (
    clinicConfig.practitioners.find(
      (p) => p.id === practitionerParam || p.name === practitionerParam
    ) || null
  );
}
