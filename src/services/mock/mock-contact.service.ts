import { Contact } from "@/types";
import { ContactService, ContactFilterOptions } from "../contact.service";
import { mockStore } from "@/lib/mock/store";

export class MockContactService implements ContactService {
  async list(tenantId?: string, filters?: ContactFilterOptions): Promise<Contact[]> {
    let list = mockStore.getContacts(tenantId);
    if (filters) {
      if (filters.status) {
        list = list.filter((c) => c.status === filters.status);
      }
      if (filters.practitionerId) {
        list = list.filter((c) => c.assignedPractitionerId === filters.practitionerId);
      }
      if (filters.tag) {
        list = list.filter((c) => c.tags.includes(filters.tag!));
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(
          (c) =>
            c.fullName.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            c.phone.toLowerCase().includes(q) ||
            (c.chiefComplaint && c.chiefComplaint.toLowerCase().includes(q)) ||
            (c.presentingConcerns && c.presentingConcerns.some((pc) => pc.toLowerCase().includes(q)))
        );
      }
    }
    return list;
  }

  async get(id: string): Promise<Contact | undefined> {
    return mockStore.getContact(id);
  }

  async create(contact: Contact): Promise<Contact> {
    return mockStore.createContact(contact);
  }

  async update(id: string, updates: Partial<Contact>): Promise<Contact | undefined> {
    return mockStore.updateContact(id, updates);
  }

  async delete(id: string): Promise<boolean> {
    return !!mockStore.updateContact(id, { status: "INACTIVE" });
  }
}

export const mockContactService = new MockContactService();
