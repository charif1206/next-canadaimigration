export interface Client {
  id: string;
  name: string;
  email: string;
  passportNumber?: string;
  nationality?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;

  // Form status flags
  isSendingFormulaireEquivalence?: boolean;
  isSendingFormulaireResidence?: boolean;
  isSendingPartners?: boolean;

  // Status fields
  equivalenceStatus?: 'pending' | 'validated' | 'rejected';
  residenceStatus?: 'pending' | 'validated' | 'rejected';
  partnerStatus?: 'pending' | 'validated' | 'rejected';

  // Rejection info
  equivalenceRejectionReason?: string;
  residenceRejectionReason?: string;
  partnerRejectionReason?: string;
}

export interface ClientsResponse {
  data: Client[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ValidateClientRequest {
  notes?: string;
}

export interface ValidateClientResponse {
  message: string;
  client: Client;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
