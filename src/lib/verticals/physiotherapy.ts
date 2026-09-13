import { VerticalConfig } from "./psychology";

export const physiotherapyVertical: VerticalConfig = {
  id: "physiotherapy",
  displayName: "Physiotherapy & Rehabilitation",
  badge: "Physical Health",
  terminology: {
    contactSingular: "Patient",
    contactPlural: "Patients",
    practitionerTitle: "Physiotherapist",
    sessionTitle: "Rehab Consultation",
    clinicalNotesTitle: "Clinical Physiotherapy Notes",
    chiefConcernLabel: "Chief Complaint",
  },
  defaultBranding: {
    primaryColor: "#0284C7", // Medical Ocean Blue
    accentColor: "#0F172A",
    tagline: "Advanced Musculoskeletal Recovery, Sports Rehabilitation & Mobility Care",
  },
  templates: [
    {
      id: "modern_rehab",
      name: "Modern Rehab",
      description: "Clean, athletic layout engineered for sports physiotherapy clinics and orthopaedic recovery centers.",
      tagline: "Restoring functional biomechanics and athletic performance.",
    },
    {
      id: "sports_performance",
      name: "Sports Performance",
      description: "High-contrast dynamic aesthetic tailored for sports medicine, athletes, and movement analysis studios.",
      tagline: "Evidence-driven sports physiotherapy and strength reconditioning.",
    },
    {
      id: "clinical_premium",
      name: "Clinical Premium",
      description: "Structured medical presentation ideal for post-operative rehabilitation and multidisciplinary clinics.",
      tagline: "Comprehensive post-surgical orthopaedic and geriatric physical therapy.",
    },
  ],
  commonConcerns: [
    "Lower Back Pain & Sciatica",
    "Neck Pain & Cervical Spondylosis",
    "Knee Ligament & Meniscus Rehab",
    "Shoulder Impingement & Rotator Cuff",
    "Post-Operative Orthopaedic Rehab",
    "Sports Injuries (Sprains & Strains)",
    "Hip Osteoarthritis & Mobility",
    "Neurological Stroke Rehabilitation",
    "Geriatric Fall Prevention & Balance",
    "Ergonomic & Postural Correction",
  ],
  defaultServices: [
    {
      name: "Initial Musculoskeletal Assessment (45 min)",
      durationMinutes: 45,
      price: 1200,
      description: "Comprehensive biomechanical evaluation, range of motion testing, and personalized recovery plan.",
      category: "Assessment",
    },
    {
      name: "Follow-Up Physical Therapy Session (30 min)",
      durationMinutes: 30,
      price: 800,
      description: "Manual therapy, joint mobilization, electrotherapy, and targeted corrective exercises.",
      category: "Therapy",
    },
    {
      name: "Sports Injury & Return-to-Play Rehab (60 min)",
      durationMinutes: 60,
      price: 1600,
      description: "Functional movement testing, agility conditioning, and sport-specific biomechanical training.",
      category: "Sports Rehab",
    },
    {
      name: "Post-Operative Orthopaedic Rehabilitation (45 min)",
      durationMinutes: 45,
      price: 1400,
      description: "Post-surgical protocol adherence for ACL reconstruction, total knee/hip replacements, and spinal surgery.",
      category: "Post-Op",
    },
    {
      name: "Dedicated Home Visit Physiotherapy (60 min)",
      durationMinutes: 60,
      price: 2000,
      description: "Specialized in-home mobility and rehabilitation therapy for geriatric or post-surgical recovery.",
      category: "Home Visit",
    },
  ],
  intakeFields: [
    {
      id: "chief_complaint",
      label: "What is your primary area of pain or injury?",
      type: "text",
      required: true,
    },
    {
      id: "pain_scale",
      label: "Current Pain Level (1 to 10)",
      type: "select",
      options: [
        "1-2 (Mild discomfort)",
        "3-4 (Moderate pain, doesn't stop daily tasks)",
        "5-6 (Noticeable pain, interferes with tasks)",
        "7-8 (Severe pain, prevents normal activities)",
        "9-10 (Extreme agonizing pain)",
      ],
      required: true,
    },
    {
      id: "surgery_history",
      label: "Have you had any recent surgeries or imaging (X-ray/MRI)?",
      type: "textarea",
      required: false,
    },
  ],
};
