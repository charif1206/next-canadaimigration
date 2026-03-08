/**
 * Form Data Utilities
 */

import type { RegisterAdminFormData } from '@/lib/schemas/admin-auth.schema';

export function prepareRegistrationData(data: RegisterAdminFormData) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { confirmPassword, ...registerData } = data;
  return registerData;
}
