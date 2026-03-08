/**
 * Admin Forms API
 * Handles fetching form submissions via internal /api/forms routes.
 */

import adminApi from './axios.config';

export interface FormSubmission {
  id: string;
  clientId: string;
  type: 'EQUIVALENCE' | 'RESIDENCE';
  data: Record<string, unknown>;
  fileUrl: string | null;
  createdAt: string;
  client?: {
    id: string;
    name: string;
    email: string;
    passportNumber?: string;
    nationality?: string;
    isEmailVerified?: boolean;
    createdAt: string;
  };
}

/**
 * Fetch all form submissions
 */
export const getAllForms = async (): Promise<FormSubmission[]> => {
  const response = await adminApi.get<FormSubmission[]>('/api/forms');
  return response.data;
};

/**
 * Fetch a single form by ID
 */
export const getFormById = async (id: string): Promise<FormSubmission> => {
  const response = await adminApi.get<FormSubmission>(`/api/forms/${id}`);
  return response.data;
};
