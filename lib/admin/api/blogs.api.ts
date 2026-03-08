/**
 * Admin Blog Posts API
 * CRUD operations mapped to internal /api/blogs routes.
 */

import adminApi from './axios.config';

export interface Post {
  id: string;
  title: string;
  content: string;
  imgUrl: string;
  likes: string[];
  likesCount: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostsResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreatePostData {
  title: string;
  content: string;
  published?: boolean;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  published?: boolean;
}

/**
 * Get all posts (admin sees drafts too)
 */
export const getAllPosts = async (page = 1, limit = 10): Promise<PostsResponse> => {
  const response = await adminApi.get<PostsResponse>('/api/blogs', {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Get single post by ID
 */
export const getPostById = async (id: string): Promise<Post> => {
  const response = await adminApi.get<Post>(`/api/blogs/${id}`);
  return response.data;
};

/**
 * Create new post with image
 */
export const createPost = async (data: CreatePostData, imageFile: File): Promise<Post> => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('content', data.content);
  if (data.published !== undefined) {
    formData.append('published', String(data.published));
  }
  formData.append('image', imageFile);

  const response = await adminApi.post<Post>('/api/blogs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Update post (optionally including a new image)
 */
export const updatePost = async (
  id: string,
  data: UpdatePostData,
  imageFile?: File,
): Promise<Post> => {
  const formData = new FormData();
  if (data.title !== undefined) formData.append('title', data.title);
  if (data.content !== undefined) formData.append('content', data.content);
  if (data.published !== undefined) formData.append('published', String(data.published));
  if (imageFile) formData.append('image', imageFile);

  const response = await adminApi.put<Post>(`/api/blogs/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Delete post
 */
export const deletePost = async (id: string): Promise<void> => {
  await adminApi.delete(`/api/blogs/${id}`);
};
