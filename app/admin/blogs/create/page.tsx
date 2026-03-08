'use client';

/**
 * Create Blog Post — Phase 3 placeholder
 *
 * COMPONENTS / HOOKS NEEDED (Phase 4):
 *   - Form with react-hook-form + zod for creating a new post
 *   - Image upload via Cloudinary
 *   - POST /api/blogs  to submit
 */

import { useAdminAuthStore } from '@/lib/stores/admin-auth.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminBlogCreatePage() {
  const router = useRouter();
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAdminAuthStore((state) => state._hasHydrated);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Create New Blog Post</h1>
          <Link href="/admin/blogs" className="text-sm text-purple-600 hover:text-purple-800">
            ← All Posts
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🚧</span>
            <div>
              <h2 className="font-bold text-amber-800 mb-1">Phase 3 — Routing migrated</h2>
              <p className="text-sm text-amber-700">
                Full create-post form will be implemented in <strong>Phase 4</strong>.
                It will call <code>POST /api/blogs</code> with title, content, and image.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
