import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/server-auth';

/**
 * POST /api/clients/validate
 * Validate (approve/reject) a client's form submission.
 *
 * Body:
 * {
 *   clientId: string
 *   formType: "equivalence" | "residence" | "partner"
 *   action: "validated" | "rejected"
 *   reason?: string  (required when action = "rejected")
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthFromRequest(request);
    if (!payload || payload.type !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { clientId, formType, action, reason } = body as {
      clientId: string;
      formType: 'equivalence' | 'residence' | 'partner';
      action: 'validated' | 'rejected';
      reason?: string;
    };

    if (!clientId || !formType || !action) {
      return NextResponse.json(
        { message: 'clientId, formType and action are required' },
        { status: 400 },
      );
    }

    if (!['equivalence', 'residence', 'partner'].includes(formType)) {
      return NextResponse.json(
        { message: 'formType must be equivalence, residence or partner' },
        { status: 400 },
      );
    }

    if (!['validated', 'rejected'].includes(action)) {
      return NextResponse.json(
        { message: 'action must be validated or rejected' },
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

    const updateData: Record<string, unknown> = {};

    switch (formType) {
      case 'equivalence':
        updateData.equivalenceStatus = action;
        if (action === 'rejected') {
          updateData.equivalenceRejectedAt = new Date();
          updateData.equivalenceRejectionReason = reason || 'No reason provided';
        } else {
          updateData.equivalenceRejectedAt = null;
          updateData.equivalenceRejectionReason = null;
        }
        break;
      case 'residence':
        updateData.residenceStatus = action;
        if (action === 'rejected') {
          updateData.residenceRejectedAt = new Date();
          updateData.residenceRejectionReason = reason || 'No reason provided';
        } else {
          updateData.residenceRejectedAt = null;
          updateData.residenceRejectionReason = null;
        }
        break;
      case 'partner':
        updateData.partnerStatus = action;
        if (action === 'rejected') {
          updateData.partnerRejectedAt = new Date();
          updateData.partnerRejectionReason = reason || 'No reason provided';
        } else {
          updateData.partnerRejectedAt = null;
          updateData.partnerRejectionReason = null;
        }
        break;
    }

    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: updateData,
    });

    return NextResponse.json({
      message: `${formType} form ${action} for client '${client.name}'`,
      client: updatedClient,
    });
  } catch (error) {
    console.error('[POST /api/clients/validate]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
