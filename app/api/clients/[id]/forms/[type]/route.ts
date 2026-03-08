import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/server-auth';

// GET /api/clients/[id]/forms/[type]
// Returns form data + status for a specific client and form type (admin-only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; type: string }> },
) {
  try {
    const payload = await getAuthFromRequest(request);
    if (!payload || payload.type !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id: clientId, type: formType } = await params;

    if (!['equivalence', 'residence', 'partner'].includes(formType)) {
      return NextResponse.json(
        { message: 'formType must be equivalence, residence or partner' },
        { status: 400 },
      );
    }

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return NextResponse.json(
        { message: `Client with ID '${clientId}' not found.` },
        { status: 404 },
      );
    }

    let status: string | null = null;
    let rejectedAt: Date | null = null;
    let rejectionReason: string | null = null;
    let submission: Record<string, unknown> | null = null;

    if (formType === 'equivalence') {
      status = client.equivalenceStatus ?? null;
      rejectedAt = client.equivalenceRejectedAt ?? null;
      rejectionReason = client.equivalenceRejectionReason ?? null;

      const form = await prisma.formSubmission.findFirst({
        where: { clientId, type: 'EQUIVALENCE' },
        orderBy: { createdAt: 'desc' },
      });
      submission = (form?.data as Record<string, unknown>) ?? null;
    } else if (formType === 'residence') {
      status = client.residenceStatus ?? null;
      rejectedAt = client.residenceRejectedAt ?? null;
      rejectionReason = client.residenceRejectionReason ?? null;

      const form = await prisma.formSubmission.findFirst({
        where: { clientId, type: 'RESIDENCE' },
        orderBy: { createdAt: 'desc' },
      });
      submission = (form?.data as Record<string, unknown>) ?? null;
    } else if (formType === 'partner') {
      status = client.partnerStatus ?? null;
      rejectedAt = client.partnerRejectedAt ?? null;
      rejectionReason = client.partnerRejectionReason ?? null;

      // Partner submissions are stored separately without clientId link.
      // Try to find by matching email in submission data.
      const allPartners = await prisma.partnerSubmission.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      const matched = allPartners.find((p) => {
        const data = p.data as Record<string, unknown>;
        return data?.email === client.email;
      });
      submission = matched ? (matched.data as Record<string, unknown>) : null;
    }

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        passportNumber: client.passportNumber,
        nationality: client.nationality,
      },
      status,
      rejectedAt,
      rejectionReason,
      submission,
    });
  } catch (error) {
    console.error('[GET /api/clients/[id]/forms/[type]]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
