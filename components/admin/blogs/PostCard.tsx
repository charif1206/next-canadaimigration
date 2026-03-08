import type { Post } from '@/lib/admin/api/blogs.api';
import Image from 'next/image';

interface PostCardProps {
  post: Post;
  onUpdate: (post: Post) => void;
  onDelete: (post: Post) => void;
}

export default function PostCard({ post, onUpdate, onDelete }: PostCardProps) {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full bg-gray-200">
        <Image src={post.imgUrl} alt={post.title} fill className="object-cover" />
        {!post.published && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            Draft
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{post.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.content}</p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>📅 {formatDate(post.createdAt)}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onUpdate(post)}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => onDelete(post)}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
}
