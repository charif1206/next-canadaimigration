import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/server-auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a Buffer to Cloudinary and return the secure URL.
 */
async function uploadToCloudinary(
  buffer: Buffer,
  filename: string,
  folder: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto', public_id: filename },
      (error, result) => {
        if (error) return reject(error);
        resolve(result!.secure_url);
      },
    );
    stream.end(buffer);
  });
}

// GET /api/forms  — Admin: get all form submissions (protected)
export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthFromRequest(request);
    if (!payload || payload.type !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const forms = await prisma.formSubmission.findMany({
      include: {
        client: {
          select: { id: true, name: true, email: true, passportNumber: true, nationality: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(forms);
  } catch (error) {
    console.error('[GET /api/forms]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/forms  — Submit a form (equivalence, residence, or partner)
 *
 * Accepts multipart/form-data:
 * - type: "EQUIVALENCE" | "RESIDENCE" | "PARTNER"
 * - data: JSON string of form fields
 * - file (optional): portfolio / document file
 *
 * Requires client JWT authentication.
 *
 * ⚠️ FILE UPLOAD NOTE:
 * Next.js App Router does NOT use Multer. We use the native Web API
 * request.formData() to parse multipart data, then stream the file buffer
 * directly to Cloudinary using cloudinary.uploader.upload_stream().
 * This is equivalent to the NestJS FileInterceptor + CloudinaryService pattern.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthFromRequest(request);
    if (!payload || payload.type !== 'client') {
      return NextResponse.json(
        { message: 'Unauthorized: client token required' },
        { status: 401 },
      );
    }

    const clientId = payload.sub;

    let formType: string;
    let formData: Record<string, unknown>;
    let fileUrl: string | null = null;

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // Parse multipart
      const formDataRaw = await request.formData();
      formType = (formDataRaw.get('type') as string)?.toUpperCase();
      const dataStr = formDataRaw.get('data') as string;
      formData = dataStr ? JSON.parse(dataStr) : {};

      // Handle file upload to Cloudinary
      const file = formDataRaw.get('file') as File | null;
      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const folder =
          formType === 'EQUIVALENCE'
            ? 'canada-immigration/equivalence'
            : 'canada-immigration/residence';
        const filename = `${Date.now()}-${file.name}`;
        fileUrl = await uploadToCloudinary(buffer, filename, folder);
      }
    } else {
      // JSON body (e.g. partner form - no file)
      const body = await request.json();
      formType = (body.type as string)?.toUpperCase();
      formData = body.data || body;
    }

    if (!formType) {
      return NextResponse.json({ message: 'type is required' }, { status: 400 });
    }

    // Persist form submission
    const submission = await prisma.formSubmission.create({
      data: {
        type: formType,
        data: formData as any,
        fileUrl,
        clientId,
      },
    });

    // Update client status based on form type
    if (formType === 'EQUIVALENCE') {
      await prisma.client.update({
        where: { id: clientId },
        data: {
          isSendingFormulaireEquivalence: true,
          equivalenceStatus: 'pending',
          ...(fileUrl ? { folderEquivalence: fileUrl } : {}),
        },
      });
    } else if (formType === 'RESIDENCE') {
      await prisma.client.update({
        where: { id: clientId },
        data: {
          isSendingFormulaireResidence: true,
          residenceStatus: 'pending',
          ...(fileUrl ? { folderResidence: fileUrl } : {}),
        },
      });
    } else if (formType === 'PARTNER') {
      await prisma.client.update({
        where: { id: clientId },
        data: {
          isSendingPartners: true,
          partnerStatus: 'pending',
        },
      });
    }

    return NextResponse.json(
      { message: `${formType} form submitted successfully`, submission },
      { status: 201 },
    );
  } catch (error) {
    console.error('[POST /api/forms]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
