import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/server-auth';

// GET /api/clients/recent?limit=10
// Returns clients that have at least one validated form submission (admin-only)
export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthFromRequest(request);
    if (!payload || payload.type !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const clients = await prisma.client.findMany({
      where: {
        OR: [
          { equivalenceStatus: 'validated' },
          { residenceStatus: 'validated' },
          { partnerStatus: 'validated' },
        ],
      },
      take: limit,
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error('[GET /api/clients/recent]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
