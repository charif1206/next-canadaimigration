/**
 * Admin section layout
 * Wraps /admin/* with the frontend's existing Providers (React Query)
 * and the react-hot-toast Toaster used by admin pages.
 * Intentionally does NOT share layout with public frontend pages
 * (no Header/Footer).
 */

import type { Metadata } from 'next';
import { Providers } from '@/app/providers';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Canada Immigration — Admin',
  description: 'Admin dashboard for Canada Immigration services',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        }}
      />
    </Providers>
  );
}
