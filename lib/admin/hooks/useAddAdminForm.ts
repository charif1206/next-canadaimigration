'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  registerAdminSchema,
  type RegisterAdminFormData,
} from '@/lib/schemas/admin-auth.schema';
import { useRegisterAdmin } from '@/lib/hooks/admin/useAdminAuth';
import { prepareRegistrationData } from '../utils/formData.utils';
import { FORM_DEFAULTS } from '../constants/addAdmin.constants';

export function useAddAdminForm() {
  const { mutate: registerAdmin, isPending, isSuccess } = useRegisterAdmin();

  const form = useForm<RegisterAdminFormData>({
    resolver: zodResolver(registerAdminSchema),
    mode: 'onChange',
    defaultValues: { ...FORM_DEFAULTS },
  });

  useEffect(() => {
    if (isSuccess) {
      form.reset();
    }
  }, [isSuccess, form]);

  const onSubmit = (data: RegisterAdminFormData) => {
    const registerData = prepareRegistrationData(data);
    registerAdmin(registerData);
  };

  return { form, isPending, isSuccess, onSubmit };
}
