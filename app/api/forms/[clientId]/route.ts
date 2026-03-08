import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/server-auth';

// GET /api/forms/[clientId]  — Get all form submissions for a specific client
// Accessible by the client themselves or an admin
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> },
) {
  try {
    const payload = await getAuthFromRequest(request);
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { clientId } = await params;

    // Clients can only see their own forms
    if (payload.type === 'client' && payload.sub !== clientId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const forms = await prisma.formSubmission.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(forms);
  } catch (error) {
    console.error('[GET /api/forms/[clientId]]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
