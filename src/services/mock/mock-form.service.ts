import { Form, FormSubmission } from "@/types";
import { FormService } from "../form.service";
import { mockStore } from "@/lib/mock/store";

export class MockFormService implements FormService {
  async list(tenantId?: string): Promise<Form[]> {
    return mockStore.getForms(tenantId);
  }

  async get(id: string): Promise<Form | undefined> {
    return mockStore.getForm(id);
  }

  async submit(submission: FormSubmission): Promise<FormSubmission> {
    return mockStore.submitForm(submission);
  }
}

export const mockFormService = new MockFormService();

