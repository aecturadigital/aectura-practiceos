---
name: ai-receptionist
description: >-
  Governs conversational AI triage, tenant knowledge retrieval, intent classification,
  and medical safety guardrails. Defines the pipeline from inbound message to tenant/contact
  resolution, action execution, and human escalation. Enforces strict prohibitions on medical
  advice, invented fees, and diagnosis. Activate whenever implementing chat endpoints, LLM prompts,
  retrieval engines, or AI safety filters.
---

# AI Receptionist & Clinical Triage Guardrails

The AI Receptionist provides 24/7 client communication across web chat, WhatsApp, and SMS. Because it operates within healthcare contexts, it is held to the highest safety and architectural standards.

---

## 1. The Execution Pipeline

Every inbound message MUST progress through the following sequential pipeline:

```
[ Inbound Message (SMS / WhatsApp / Web Chat) ]
                       |
                       v
            [ 1. Tenant Resolution ]
            Extract tenant from inbound phone/domain/URL.
                       |
                       v
            [ 2. Contact Resolution ]
            Lookup contact by phone/email. If not found, create "lead".
                       |
                       v
         [ 3. Intent Classification & Triage ]
         Classify: Emergency? Booking inquiry? Reschedule? Clinical question?
                       |
                       +---> [ EMERGENCY DETECTED ] ---> Immediate Crisis Response + Escalate
                       |
                       v
         [ 4. Tenant Knowledge Retrieval ]
         Retrieve clinic FAQs, services, accepted insurance, parking, hours.
         STRICT ISOLATION: Query vector database filtered by `tenant_id`.
                       |
                       v
            [ 5. LLM Prompt Formulation ]
            Inject tenant tone, vertical terms, and verified clinic facts.
                       |
                       v
             [ 6. Bounded Action Check ]
             Can AI perform action? (e.g. check availability, send booking link).
             If medical or complex: escalate to staff.
                       |
                       v
       [ 7. Response Dispatch & Human Escalation ]
       Deliver response to patient; update conversation timeline.
```

---

## 2. Uncompromising Safety Boundaries

> **MEDICAL SAFETY VIOLATIONS ARE ZERO TOLERANCE.**

The AI Receptionist is an **administrative coordinator and front-desk assistant**, NOT a doctor or therapist.

### The 6 Absolute Prohibitions
1. **NO DIAGNOSIS**: Never attempt to evaluate symptoms or diagnose any physical or psychological condition.
   - *Example Prompt*: "Do you think my chest pain is an anxiety attack?"
   - *Required Response*: "I cannot evaluate physical or medical symptoms. If you are experiencing chest pain or a medical emergency, please call 911 or visit your nearest emergency room immediately."
2. **NO PRESCRIPTIONS OR MEDICATION ADVICE**: Never discuss dosages, drug interactions, or recommend medications.
3. **NO INVENTED FEES**: Only quote prices retrieved from verified `services` records in PostgreSQL. If a price is unlisted, state: "I'll have our billing coordinator confirm the fee for you."
4. **NO INVENTED DOCTOR CREDENTIALS**: Only state qualifications and credentials explicitly published in the clinic's practitioner profile.
5. **NO GUARANTEED OUTCOMES**: Never say "Dr. Smith will cure your depression" or "This treatment will fix your back pain". Use neutral, realistic terms: "Dr. Smith specializes in evidence-based therapy for depression."
6. **NO CROSS-TENANT KNOWLEDGE RETRIEVAL**: Vector search queries MUST include the strict metadata filter `tenant_id == current_tenant_id`. It is a critical flaw for Clinic A's bot to mention Clinic B's practitioners or policies.

---

## 3. Crisis & Escalation Protocol

If any message contains keywords associated with self-harm, suicide, severe domestic violence, or acute physical distress:
1. Immediately trigger the Crisis Protocol:
   - Provide national crisis helpline resources (e.g., 988 Suicide & Crisis Lifeline in US/Canada, 111/999 in UK).
   - Clarify that the chat is an automated service and cannot provide emergency response.
2. Emit an immediate high-priority webhook `conversation.needs_human` with tag `emergency_flagged`.
3. Notify the on-call clinic practitioner and front-desk team via SMS/push alert.
