/**
 * Admin Client API Functions
 * All API calls map to internal Next.js /api/* routes.
 */

import adminApi from './axios.config';
import {
  Client,
  ClientsResponse,
  ValidateClientRequest,
  ValidateClientResponse,
} from '../types/client.types';

/**
 * Get all clients with pagination
 */
export const getAllClients = async (
  page: number = 1,
  limit: number = 10,
): Promise<ClientsResponse> => {
  const response = await adminApi.get<ClientsResponse>(
    `/api/clients?page=${page}&limit=${limit}`,
  );
  return response.data;
};

/**
 * Get last 10 pending clients waiting for validation
 */
export const getPendingClients = async (): Promise<Client[]> => {
  const response = await adminApi.get<Client[]>('/api/clients/pending?limit=10');
  return response.data;
};

/**
 * Get last 10 recently validated clients
 */
export const getValidatedClients = async (): Promise<Client[]> => {
  const response = await adminApi.get<Client[]>('/api/clients/recent?limit=10');
  return response.data;
};

/**
 * Validate or reject a client's form submission
 */
export const validateClient = async (
  clientId: string,
  formType: 'equivalence' | 'residence' | 'partner',
  data?: ValidateClientRequest,
): Promise<ValidateClientResponse> => {
  const response = await adminApi.post<ValidateClientResponse>('/api/clients/validate', {
    clientId,
    formType,
    action: 'validated',
    reason: data?.notes,
  });
  return response.data;
};

/**
 * Reject a client's form submission
 */
export const rejectClient = async (
  clientId: string,
  formType: 'equivalence' | 'residence' | 'partner',
  reason: string,
): Promise<ValidateClientResponse> => {
  const response = await adminApi.post<ValidateClientResponse>('/api/clients/validate', {
    clientId,
    formType,
    action: 'rejected',
    reason,
  });
  return response.data;
};

/**
 * Get client form data (submission + status)
 */
export const getClientFormData = async (
  clientId: string,
  formType: 'equivalence' | 'residence' | 'partner',
) => {
  const response = await adminApi.get(`/api/clients/${clientId}/forms/${formType}`);
  return response.data;
};

/**
 * Get single client by ID
 */
export const getClientById = async (clientId: string): Promise<Client> => {
  const response = await adminApi.get<Client>(`/api/clients/${clientId}`);
  return response.data;
};
