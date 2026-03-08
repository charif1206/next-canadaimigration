'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuthStore } from '@/lib/stores/admin-auth.store';
import { useAllPosts } from '@/lib/admin/hooks/useBlogs';
import type { Post } from '@/lib/admin/api/blogs.api';
import PostCard from '@/components/admin/blogs/PostCard';
import CreatePostModal from '@/components/admin/blogs/CreatePostModal';
import UpdatePostModal from '@/components/admin/blogs/UpdatePostModal';
import DeletePostModal from '@/components/admin/blogs/DeletePostModal';

export default function AdminBlogsPage() {
  const router = useRouter();
  const user = useAdminAuthStore((state) => state.user);
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAdminAuthStore((state) => state._hasHydrated);

  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [updateModalState, setUpdateModalState] = useState<{ isOpen: boolean; post: Post | null }>({
    isOpen: false,
    post: null,
  });
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; post: Post | null }>({
    isOpen: false,
    post: null,
  });

  const { data, isLoading } = useAllPosts(currentPage, 12);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated || !isAuthenticated) return null;

  const totalPages = data?.pagination.totalPages ?? 0;
  const totalPosts = data?.pagination.total ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Blog Posts Management</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your blog posts, create new content, and moderate existing posts
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-semibold">{user?.username}</span>
              </span>
              <Link
                href="/admin"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="mb-6 flex justify-between items-center">
          <div className="text-gray-600">
            {data && (
              <span>
                Showing <span className="font-semibold">{data.posts.length}</span> of{' '}
                <span className="font-semibold">{totalPosts}</span> posts
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Create New Post
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading posts...</p>
            </div>
          </div>
        )}

        {/* Posts Grid */}
        {!isLoading && data && data.posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onUpdate={(p) => setUpdateModalState({ isOpen: true, post: p })}
                onDelete={(p) => setDeleteModalState({ isOpen: true, post: p })}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && data && data.posts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-6">Create your first blog post to get started</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Create First Post
            </button>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage <= 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    page === currentPage
                      ? 'bg-purple-600 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage >= totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreatePostModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

      {updateModalState.post && (
        <UpdatePostModal
          isOpen={updateModalState.isOpen}
          onClose={() => setUpdateModalState({ isOpen: false, post: null })}
          post={updateModalState.post}
        />
      )}

      {deleteModalState.post && (
        <DeletePostModal
          isOpen={deleteModalState.isOpen}
          onClose={() => setDeleteModalState({ isOpen: false, post: null })}
          post={deleteModalState.post}
        />
      )}
    </div>
  );
}
