import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/server-auth';

// GET /api/partners  — Admin: get all partner submissions (protected)
export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthFromRequest(request);
    if (!payload || payload.type !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const partners = await prisma.partnerSubmission.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(partners);
  } catch (error) {
    console.error('[GET /api/partners]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/partners  — Submit a partner application (public or authenticated client)
 *
 * Body (JSON):
 * {
 *   agencyName: string
 *   contactName: string
 *   email: string
 *   phone?: string
 *   website?: string
 *   description?: string
 *   [any other partner fields]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.agencyName || !body.email) {
      return NextResponse.json(
        { message: 'agencyName and email are required' },
        { status: 400 },
      );
    }

    // Extract optional client ID from JWT (if authenticated)
    const payload = await getAuthFromRequest(request);
    const clientId = payload?.type === 'client' ? payload.sub : null;

    // Persist partner submission
    await prisma.partnerSubmission.create({
      data: {
        type: 'PARTNER',
        data: body as any,
      },
    });

    // Update client's partner status if authenticated
    if (clientId) {
      await prisma.client.update({
        where: { id: clientId },
        data: {
          isSendingPartners: true,
          partnerStatus: 'pending',
        },
      });
    }

    return NextResponse.json(
      { message: 'Partner application submitted successfully' },
      { status: 201 },
    );
  } catch (error) {
    console.error('[POST /api/partners]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
