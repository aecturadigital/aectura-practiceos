import {
  TreatmentCourse,
  PlanCycle,
  PlanAdjustment,
  TreatmentSession,
  ProcedureAddOn,
  PlanCycleStatus,
  TreatmentSessionStatus,
  AddOnPaymentOption,
} from "@/types";
import { mockStore } from "@/lib/mock/store";

export interface ITreatmentCourseService {
  getCourses(tenantId: string, contactId?: string): TreatmentCourse[];
  getCourseById(courseId: string): TreatmentCourse | undefined;
  getActivePlanCycle(contactId: string): PlanCycle | undefined;
  getPlanCycles(treatmentCourseId: string): PlanCycle[];
  getSessions(planCycleId: string): TreatmentSession[];
  getAdjustments(planCycleId: string): PlanAdjustment[];
  getAddOns(contactId: string): ProcedureAddOn[];
  createCourse(course: Omit<TreatmentCourse, "id" | "createdAt" | "updatedAt">): TreatmentCourse;
  createPlanCycle(cycle: Omit<PlanCycle, "id" | "createdAt" | "updatedAt">): PlanCycle;
  updatePlanCycle(
    cycleId: string,
    updates: Partial<PlanCycle>,
    adjustmentReason?: string,
    changedBy?: string
  ): PlanCycle | undefined;
  recordSessionAttendance(
    sessionId: string,
    status: TreatmentSessionStatus,
    deductSession: boolean,
    recordedBy: string,
    notes?: string
  ): TreatmentSession | undefined;
  addProcedureAddOn(
    addOn: Omit<ProcedureAddOn, "id" | "createdAt">,
    paymentOption: AddOnPaymentOption
  ): ProcedureAddOn;
  freezePlan(
    cycleId: string,
    durationDays: number,
    reason: string,
    approvedBy: string
  ): PlanCycle | undefined;
  unfreezePlan(cycleId: string, reason: string, approvedBy: string): PlanCycle | undefined;
  extendPlan(
    cycleId: string,
    additionalDays: number,
    additionalSessions: number,
    reason: string,
    approvedBy: string
  ): PlanCycle | undefined;
  activateNextCycle(courseId: string, activatedBy: string): PlanCycle | undefined;
}

export class MockTreatmentCourseService implements ITreatmentCourseService {
  getCourses(tenantId: string, contactId?: string): TreatmentCourse[] {
    return mockStore.getTreatmentCourses(tenantId, contactId);
  }

  getCourseById(courseId: string): TreatmentCourse | undefined {
    return mockStore.getTreatmentCourseById(courseId);
  }

  getActivePlanCycle(contactId: string): PlanCycle | undefined {
    return mockStore.getActivePlanCycle(contactId);
  }

  getPlanCycles(treatmentCourseId: string): PlanCycle[] {
    return mockStore.getPlanCycles(treatmentCourseId);
  }

  getSessions(planCycleId: string): TreatmentSession[] {
    return mockStore.getTreatmentSessions(planCycleId);
  }

  getAdjustments(planCycleId: string): PlanAdjustment[] {
    return mockStore.getPlanAdjustments(planCycleId);
  }

  getAddOns(contactId: string): ProcedureAddOn[] {
    return mockStore.getProcedureAddOns(contactId);
  }

  createCourse(course: Omit<TreatmentCourse, "id" | "createdAt" | "updatedAt">): TreatmentCourse {
    return mockStore.createTreatmentCourse(course);
  }

  createPlanCycle(cycle: Omit<PlanCycle, "id" | "createdAt" | "updatedAt">): PlanCycle {
    return mockStore.createPlanCycle(cycle);
  }

  updatePlanCycle(
    cycleId: string,
    updates: Partial<PlanCycle>,
    adjustmentReason?: string,
    changedBy?: string
  ): PlanCycle | undefined {
    return mockStore.updatePlanCycle(cycleId, updates, adjustmentReason, changedBy);
  }

  recordSessionAttendance(
    sessionId: string,
    status: TreatmentSessionStatus,
    deductSession: boolean,
    recordedBy: string,
    notes?: string
  ): TreatmentSession | undefined {
    return mockStore.recordSessionAttendance(sessionId, status, deductSession, recordedBy, notes);
  }

  addProcedureAddOn(
    addOn: Omit<ProcedureAddOn, "id" | "createdAt">,
    paymentOption: AddOnPaymentOption
  ): ProcedureAddOn {
    return mockStore.addProcedureAddOn(addOn, paymentOption);
  }

  freezePlan(
    cycleId: string,
    durationDays: number,
    reason: string,
    approvedBy: string
  ): PlanCycle | undefined {
    return mockStore.freezePlan(cycleId, durationDays, reason, approvedBy);
  }

  unfreezePlan(cycleId: string, reason: string, approvedBy: string): PlanCycle | undefined {
    return mockStore.unfreezePlan(cycleId, reason, approvedBy);
  }

  extendPlan(
    cycleId: string,
    additionalDays: number,
    additionalSessions: number,
    reason: string,
    approvedBy: string
  ): PlanCycle | undefined {
    return mockStore.extendPlan(cycleId, additionalDays, additionalSessions, reason, approvedBy);
  }

  activateNextCycle(courseId: string, activatedBy: string): PlanCycle | undefined {
    return mockStore.activateNextCycle(courseId, activatedBy);
  }
}

export const treatmentCourseService = new MockTreatmentCourseService();
