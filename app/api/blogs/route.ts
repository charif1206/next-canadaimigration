import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/server-auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImageToCloudinary(buffer: Buffer, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'canada-immigration/blogs', public_id: filename, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result!.secure_url);
      },
    );
    stream.end(buffer);
  });
}

// GET /api/blogs?page=1&limit=10&published=true
// Public: returns only published posts. Admin (with token): returns all posts.
export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthFromRequest(request);
    const isAdmin = payload?.type === 'admin';

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const publishedParam = searchParams.get('published');
    const skip = (page - 1) * limit;

    // Non-admin users always see only published posts
    let where: Record<string, unknown> = {};
    if (!isAdmin) {
      where = { published: true };
    } else if (publishedParam !== null) {
      where = { published: publishedParam === 'true' };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[GET /api/blogs]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/blogs  — Admin: create a new blog post (protected)
 *
 * Accepts multipart/form-data:
 * - title: string
 * - content: string
 * - published?: "true" | "false"
 * - image: image file (required)
 *
 * ⚠️ FILE UPLOAD NOTE:
 * Uses native request.formData() + cloudinary.uploader.upload_stream().
 * Equivalent to NestJS FileInterceptor + CloudinaryService.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthFromRequest(request);
    if (!payload || payload.type !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const published = formData.get('published') !== 'false';
    const imageFile = formData.get('image') as File | null;

    if (!title || !content) {
      return NextResponse.json({ message: 'title and content are required' }, { status: 400 });
    }

    if (!imageFile) {
      return NextResponse.json({ message: 'image is required' }, { status: 400 });
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `${Date.now()}-${imageFile.name}`;
    const imgUrl = await uploadImageToCloudinary(buffer, filename);

    const post = await prisma.post.create({
      data: { title, content, imgUrl, published },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('[POST /api/blogs]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
