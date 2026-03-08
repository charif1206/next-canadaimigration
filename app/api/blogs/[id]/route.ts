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

// GET /api/blogs/[id]  — Public: get single post by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ message: `Post with ID '${id}' not found` }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('[GET /api/blogs/[id]]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/blogs/[id]  — Admin: update a blog post (protected)
 *
 * Accepts multipart/form-data (with optional image) or JSON (text-only update).
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const payload = await getAuthFromRequest(request);
    if (!payload || payload.type !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: `Post with ID '${id}' not found` }, { status: 404 });
    }

    const contentType = request.headers.get('content-type') || '';
    let title: string | undefined;
    let content: string | undefined;
    let published: boolean | undefined;
    let imgUrl: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      title = (formData.get('title') as string) || undefined;
      content = (formData.get('content') as string) || undefined;
      const publishedRaw = formData.get('published');
      if (publishedRaw !== null) published = publishedRaw !== 'false';

      const imageFile = formData.get('image') as File | null;
      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        imgUrl = await uploadImageToCloudinary(buffer, `${Date.now()}-${imageFile.name}`);
      }
    } else {
      const body = await request.json();
      title = body.title;
      content = body.content;
      if (body.published !== undefined) published = body.published;
    }

    const updated = await prisma.post.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(published !== undefined && { published }),
        ...(imgUrl !== undefined && { imgUrl }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PUT /api/blogs/[id]]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/blogs/[id]  — Admin: delete a blog post (protected)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const payload = await getAuthFromRequest(request);
    if (!payload || payload.type !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: `Post with ID '${id}' not found` }, { status: 404 });
    }

    // Delete image from Cloudinary (best-effort, non-blocking)
    if (existing.imgUrl) {
      const publicId = existing.imgUrl
        .split('/')
        .slice(-2)
        .join('/')
        .replace(/\.[^/.]+$/, '');
      cloudinary.uploader.destroy(publicId).catch(console.error);
    }

    await prisma.post.delete({ where: { id } });

    return NextResponse.json({ message: 'Post deleted successfully', id });
  } catch (error) {
    console.error('[DELETE /api/blogs/[id]]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/blogs/[id]/like  — Public/Client: toggle like on a post
// Note: handled here via a different sub-path would need its own route file.
// For toggling likes, see app/api/blogs/[id]/like/route.ts if needed.
