/**
 * GDPR and Analytics Types
 * These are application-level types, not database entities
 */

export enum DataSubjectRequestType {
  ACCESS = 'access',
  RECTIFICATION = 'rectification',
  ERASURE = 'erasure',
  PORTABILITY = 'portability',
  RESTRICTION = 'restriction',
  OBJECTION = 'objection',
}

export enum RequestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

export interface DataSubjectRequest {
  id: string;
  type: DataSubjectRequestType;
  status: RequestStatus;
  userId?: string;
  email: string;
  requestData?: Record<string, unknown>;
  responseData?: Record<string, unknown>;
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
}

export interface GDPRCompliance {
  handleRequest(request: DataSubjectRequest): Promise<void>;
  exportUserData(userId: string): Promise<Record<string, unknown>>;
  deleteUserData(userId: string): Promise<void>;
  anonymizeUserData(userId: string): Promise<void>;
}
