import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/server-auth';

// GET /api/clients/pending?limit=10
// Returns all clients that have at least one pending form submission (admin-only)
export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthFromRequest(request);
    if (!payload || payload.type !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const formType = searchParams.get('formType') as
      | 'equivalence'
      | 'residence'
      | 'partner'
      | null;

    // Build filter per form type if specified, otherwise all pending
    let where: Record<string, unknown>;
    if (formType === 'equivalence') {
      where = { isSendingFormulaireEquivalence: true, equivalenceStatus: 'pending' };
    } else if (formType === 'residence') {
      where = { isSendingFormulaireResidence: true, residenceStatus: 'pending' };
    } else if (formType === 'partner') {
      where = { isSendingPartners: true, partnerStatus: 'pending' };
    } else {
      where = {
        OR: [
          { equivalenceStatus: 'pending' },
          { residenceStatus: 'pending' },
          { partnerStatus: 'pending' },
        ],
      };
    }

    const clients = await prisma.client.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error('[GET /api/clients/pending]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
