import axiosInstance from '../axios';

/**
 * Forms API - Frontend
 * Handles form submissions for equivalence, residence, and partner forms
 */

export interface PartnerFormData {
  agencyName: string;
  managerName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  clientCount?: string;
  message?: string;
}

export interface FormSubmissionResponse {
  success: boolean;
  message: string;
  formId: string;
  status: string;
}

/**
 * Submit equivalence form (with file upload)
 */
export const submitEquivalenceForm = async (formData: FormData): Promise<FormSubmissionResponse> => {
  formData.set('type', 'equivalence');
  const { data } = await axiosInstance.post('/forms', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

/**
 * Submit residence form (with file upload)
 */
export const submitResidenceForm = async (formData: FormData): Promise<FormSubmissionResponse> => {
  formData.set('type', 'residence');
  const { data } = await axiosInstance.post('/forms', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

/**
 * Submit partner form (no file upload)
 */
export const submitPartnerForm = async (formData: PartnerFormData): Promise<FormSubmissionResponse> => {
  const { data } = await axiosInstance.post('/partners', formData);
  return data;
};

/**
 * Get all form submissions (admin only)
 */
export const getAllForms = async () => {
  const { data } = await axiosInstance.get('/forms');
  return data;
};

/**
 * Get forms by client ID
 */
export const getFormsByClientId = async (clientId: string) => {
  const { data } = await axiosInstance.get(`/forms/${clientId}`);
  return data;
};
