'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllPartners, getPartnerById } from '../api/partners.api';

export const partnerKeys = {
  all: ['admin-partners'] as const,
  allPartners: () => [...partnerKeys.all, 'list'] as const,
  detail: (id: string) => [...partnerKeys.all, 'detail', id] as const,
};

export const useAllPartners = () => {
  return useQuery({
    queryKey: partnerKeys.allPartners(),
    queryFn: getAllPartners,
    staleTime: 1000 * 60 * 5,
  });
};

export const usePartnerById = (id: string) => {
  return useQuery({
    queryKey: partnerKeys.detail(id),
    queryFn: () => getPartnerById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};
