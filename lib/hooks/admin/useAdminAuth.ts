/**
 * Admin Auth Hooks (React Query mutations)
 * Calls /api/auth/* Next.js routes in the same frontend app.
 */

'use client';

import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/lib/stores/admin-auth.store';
import type { AdminLoginFormData, RegisterAdminFormData } from '@/lib/schemas/admin-auth.schema';

interface ErrorResponse {
  response?: { data?: { message?: string } };
}

// ── Login ─────────────────────────────────────────────────────────────────────

export const useAdminLogin = () => {
  const router = useRouter();
  const setAuth = useAdminAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: AdminLoginFormData) => {
      const res = await axios.post('/api/auth/login', data);
      return res.data as { access_token: string; admin: { id: string; username: string; email: string | null; role: string } };
    },
    onSuccess: (data) => {
      setAuth(data.access_token, data.admin);
      toast.success(`Welcome back, ${data.admin.username}!`);
      router.push('/admin');
    },
    onError: (error: ErrorResponse) => {
      const message = error.response?.data?.message || 'Invalid credentials';
      toast.error(message);
    },
    retry: false,
  });
};

// ── Register new admin ────────────────────────────────────────────────────────

export const useRegisterAdmin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: Omit<RegisterAdminFormData, 'confirmPassword'>) => {
      const res = await axios.post('/api/auth/register', data);
      return res.data as { id: string; username: string; email: string; role: string };
    },
    onSuccess: (data) => {
      toast.success(`Admin account created for ${data.username}!`);
      setTimeout(() => router.push('/admin'), 2000);
    },
    onError: (error: ErrorResponse) => {
      const message = error.response?.data?.message || 'Failed to create admin account';
      toast.error(message);
    },
  });
};

// ── Logout ───────────────────────────────────────────────────────────────────

export const useAdminLogout = () => {
  const router = useRouter();
  const clearAuth = useAdminAuthStore((state) => state.clearAuth);

  return () => {
    clearAuth();
    toast.success('Logged out successfully');
    router.push('/admin/login');
  };
};
