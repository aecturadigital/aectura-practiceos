import { mockTenantService } from "./mock/mock-tenant.service";
import { mockContactService } from "./mock/mock-contact.service";
import { mockAppointmentService } from "./mock/mock-appointment.service";
import { mockCrmService } from "./mock/mock-crm.service";
import { mockMessagingService } from "./mock/mock-messaging.service";
import { mockFormService } from "./mock/mock-form.service";
import { mockWebsiteService } from "./mock/mock-website.service";
import { mockAiService } from "./mock/mock-ai.service";
import { mockAnalyticsService } from "./mock/mock-analytics.service";
import { treatmentCourseService } from "./treatment.service";
import { billingService } from "./billing.service";
import { documentService } from "./document.service";
import { staffOpsService } from "./staff-ops.service";

// Export service singletons for application-wide consumption.
// When production backend services (PostgreSQL, n8n, Cloudflare R2, WhatsApp Cloud API)
// are introduced, replace these mock instances with Api* implementations without altering UI components.
export const tenantService = mockTenantService;
export const contactService = mockContactService;
export const appointmentService = mockAppointmentService;
export const crmService = mockCrmService;
export const messagingService = mockMessagingService;
export const formService = mockFormService;
export const websiteService = mockWebsiteService;
export const aiService = mockAiService;
export const analyticsService = mockAnalyticsService;
export { treatmentCourseService } from "./treatment.service";
export { billingService } from "./billing.service";
export { documentService } from "./document.service";
export { staffOpsService } from "./staff-ops.service";

export * from "./tenant.service";
export * from "./contact.service";
export * from "./appointment.service";
export * from "./crm.service";
export * from "./messaging.service";
export * from "./form.service";
export * from "./website.service";
export * from "./ai.service";
export * from "./analytics.service";
export * from "./treatment.service";
export * from "./billing.service";
export * from "./document.service";
export * from "./staff-ops.service";

