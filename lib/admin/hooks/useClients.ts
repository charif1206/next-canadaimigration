'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getAllClients,
  getPendingClients,
  getValidatedClients,
  validateClient,
  rejectClient,
  getClientById,
} from '../api/clients.api';
import type { ValidateClientRequest } from '../types/client.types';
import type { FormType } from '../constants/dashboard.constants';

export const clientKeys = {
  all: ['admin-clients'] as const,
  allClients: (page: number) => [...clientKeys.all, 'all', page] as const,
  pending: () => [...clientKeys.all, 'pending'] as const,
  validated: () => [...clientKeys.all, 'validated'] as const,
  detail: (id: string) => [...clientKeys.all, 'detail', id] as const,
};

export const useAllClients = (page: number = 1) => {
  return useQuery({
    queryKey: clientKeys.allClients(page),
    queryFn: () => getAllClients(page, 10),
    staleTime: 1000 * 60 * 5,
  });
};

export const usePendingClients = () => {
  return useQuery({
    queryKey: clientKeys.pending(),
    queryFn: getPendingClients,
    staleTime: 1000 * 60,
  });
};

export const useValidatedClients = () => {
  return useQuery({
    queryKey: clientKeys.validated(),
    queryFn: getValidatedClients,
    staleTime: 1000 * 60 * 5,
  });
};

export const useClientById = (id: string) => {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => getClientById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useValidateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clientId,
      formType,
      data,
    }: {
      clientId: string;
      formType: FormType;
      data?: ValidateClientRequest;
    }) => validateClient(clientId, formType, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      toast.success('Client validated successfully!');
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to validate client';
      toast.error(message);
    },
  });
};

export const useRejectClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clientId,
      formType,
      reason,
    }: {
      clientId: string;
      formType: FormType;
      reason: string;
    }) => rejectClient(clientId, formType, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      toast.success('Client rejected.');
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to reject client';
      toast.error(message);
    },
  });
};
