'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllForms, getFormById } from '../api/forms.api';

export const formKeys = {
  all: ['admin-forms'] as const,
  allForms: () => [...formKeys.all, 'list'] as const,
  detail: (id: string) => [...formKeys.all, 'detail', id] as const,
};

export const useAllForms = () => {
  return useQuery({
    queryKey: formKeys.allForms(),
    queryFn: getAllForms,
    staleTime: 1000 * 60 * 5,
  });
};

export const useFormById = (id: string) => {
  return useQuery({
    queryKey: formKeys.detail(id),
    queryFn: () => getFormById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};
