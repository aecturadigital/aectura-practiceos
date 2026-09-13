import { Appointment, AppointmentStatus } from "@/types";
import { AppointmentService, AppointmentFilterOptions } from "../appointment.service";
import { mockStore } from "@/lib/mock/store";

export class MockAppointmentService implements AppointmentService {
  async list(tenantId?: string, filters?: AppointmentFilterOptions): Promise<Appointment[]> {
    let list = mockStore.getAppointments(tenantId);
    if (filters) {
      if (filters.practitionerId) {
        list = list.filter((a) => a.staffId === filters.practitionerId);
      }
      if (filters.date) {
        list = list.filter((a) => a.date === filters.date);
      }
      if (filters.status) {
        list = list.filter((a) => a.status === filters.status);
      }
    }
    return list;
  }

  async get(id: string): Promise<Appointment | undefined> {
    return mockStore.getAppointment(id);
  }

  async create(appointment: Appointment): Promise<Appointment> {
    return mockStore.createAppointment(appointment);
  }

  async updateStatus(id: string, status: AppointmentStatus, reason?: string): Promise<void> {
    mockStore.updateAppointmentStatus(id, status, reason);
  }

  async reschedule(id: string, newDate: string, newTime: string): Promise<void> {
    mockStore.rescheduleAppointment(id, newDate, newTime);
  }
}

export const mockAppointmentService = new MockAppointmentService();
