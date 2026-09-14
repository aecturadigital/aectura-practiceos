import {
  DocumentRequest,
  DocumentRequestStatus,
  DocumentClassification,
} from "@/types";
import { mockStore } from "@/lib/mock/store";

export interface IDocumentService {
  getDocumentRequests(tenantId: string, contactId?: string): DocumentRequest[];
  createDocumentRequest(
    request: Omit<DocumentRequest, "id" | "status">
  ): DocumentRequest;
  uploadDocument(
    requestId: string,
    fileName: string,
    fileUrl: string
  ): DocumentRequest | undefined;
  reviewDocument(
    requestId: string,
    status: "REVIEWED" | "REJECTED" | "NEEDS_REUPLOAD",
    reviewedBy: string,
    reviewNotes?: string
  ): DocumentRequest | undefined;
}

export class MockDocumentService implements IDocumentService {
  getDocumentRequests(tenantId: string, contactId?: string): DocumentRequest[] {
    return mockStore.getDocumentRequests(tenantId, contactId);
  }

  createDocumentRequest(
    request: Omit<DocumentRequest, "id" | "status">
  ): DocumentRequest {
    return mockStore.createDocumentRequest(request);
  }

  uploadDocument(
    requestId: string,
    fileName: string,
    fileUrl: string
  ): DocumentRequest | undefined {
    return mockStore.uploadDocument(requestId, fileName, fileUrl);
  }

  reviewDocument(
    requestId: string,
    status: "REVIEWED" | "REJECTED" | "NEEDS_REUPLOAD",
    reviewedBy: string,
    reviewNotes?: string
  ): DocumentRequest | undefined {
    return mockStore.reviewDocument(requestId, status, reviewedBy, reviewNotes);
  }
}

export const documentService = new MockDocumentService();
