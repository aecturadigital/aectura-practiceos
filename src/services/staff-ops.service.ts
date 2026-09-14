import {
  StaffAttendance,
  AttendanceStatus,
  StaffLeave,
  LeaveType,
  LeaveStatus,
  PayrollEntry,
  PaymentMethod,
  StaffActivityEntry,
  StaffUser,
} from "@/types";
import { mockStore } from "@/lib/mock/store";

export interface IStaffOpsService {
  getAttendance(tenantId: string, date?: string): StaffAttendance[];
  markAttendance(
    tenantId: string,
    staffId: string,
    staffName: string,
    date: string,
    status: AttendanceStatus,
    shift: string,
    checkIn?: string,
    checkOut?: string,
    hours?: number,
    notes?: string
  ): StaffAttendance;
  getPayroll(tenantId: string, month?: string): PayrollEntry[];
  recordSalaryPayment(
    payrollId: string,
    method: PaymentMethod,
    reference: string,
    memo: string,
    paidBy: string
  ): PayrollEntry | undefined;
  adjustPayroll(
    payrollId: string,
    adjustmentType: "ADVANCE" | "BONUS" | "DEDUCTION",
    amount: number,
    memo: string
  ): PayrollEntry | undefined;
  getLeaves(tenantId: string, staffId?: string): StaffLeave[];
  requestLeave(
    tenantId: string,
    staffId: string,
    staffName: string,
    type: LeaveType,
    startDate: string,
    endDate: string,
    days: number,
    reason: string
  ): StaffLeave;
  reviewLeave(leaveId: string, status: LeaveStatus, reviewedBy: string): StaffLeave | undefined;
  getActivityLog(tenantId: string): StaffActivityEntry[];
  logStaffActivity(
    tenantId: string,
    staffName: string,
    action: string,
    targetEntity: string,
    details: string,
    category: StaffActivityEntry["category"]
  ): StaffActivityEntry;
}

export class MockStaffOpsService implements IStaffOpsService {
  getAttendance(tenantId: string, date?: string): StaffAttendance[] {
    return mockStore.getStaffAttendance(tenantId, date);
  }

  markAttendance(
    tenantId: string,
    staffId: string,
    staffName: string,
    date: string,
    status: AttendanceStatus,
    shift: string,
    checkIn?: string,
    checkOut?: string,
    hours?: number,
    notes?: string
  ): StaffAttendance {
    return mockStore.markStaffAttendance(
      tenantId,
      staffId,
      staffName,
      date,
      status,
      shift,
      checkIn,
      checkOut,
      hours,
      notes
    );
  }

  getPayroll(tenantId: string, month?: string): PayrollEntry[] {
    return mockStore.getPayroll(tenantId, month);
  }

  recordSalaryPayment(
    payrollId: string,
    method: PaymentMethod,
    reference: string,
    memo: string,
    paidBy: string
  ): PayrollEntry | undefined {
    return mockStore.recordSalaryPayment(payrollId, method, reference, memo, paidBy);
  }

  adjustPayroll(
    payrollId: string,
    adjustmentType: "ADVANCE" | "BONUS" | "DEDUCTION",
    amount: number,
    memo: string
  ): PayrollEntry | undefined {
    return mockStore.adjustPayroll(payrollId, adjustmentType, amount, memo);
  }

  getLeaves(tenantId: string, staffId?: string): StaffLeave[] {
    return mockStore.getStaffLeaves(tenantId, staffId);
  }

  requestLeave(
    tenantId: string,
    staffId: string,
    staffName: string,
    type: LeaveType,
    startDate: string,
    endDate: string,
    days: number,
    reason: string
  ): StaffLeave {
    return mockStore.requestStaffLeave(tenantId, staffId, staffName, type, startDate, endDate, days, reason);
  }

  reviewLeave(leaveId: string, status: LeaveStatus, reviewedBy: string): StaffLeave | undefined {
    return mockStore.reviewStaffLeave(leaveId, status, reviewedBy);
  }

  getActivityLog(tenantId: string): StaffActivityEntry[] {
    return mockStore.getStaffActivityLog(tenantId);
  }

  logStaffActivity(
    tenantId: string,
    staffName: string,
    action: string,
    targetEntity: string,
    details: string,
    category: StaffActivityEntry["category"]
  ): StaffActivityEntry {
    return mockStore.logStaffActivity(tenantId, staffName, action, targetEntity, details, category);
  }
}

export const staffOpsService = new MockStaffOpsService();
