import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/server-auth';

/**
 * GET /api/clients/profile
 * Return the authenticated client's own profile.
 * Requires: Authorization: Bearer <client JWT>
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthFromRequest(request);
    if (!payload || payload.type !== 'client') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const client = await prisma.client.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        countryOfResidence: true,
        passportNumber: true,
        nationality: true,
        isEmailVerified: true,
        isSendingFormulaireEquivalence: true,
        equivalenceStatus: true,
        equivalenceRejectedAt: true,
        equivalenceRejectionReason: true,
        isSendingFormulaireResidence: true,
        residenceStatus: true,
        residenceRejectedAt: true,
        residenceRejectionReason: true,
        isSendingPartners: true,
        partnerStatus: true,
        partnerRejectedAt: true,
        partnerRejectionReason: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!client) {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('[GET /api/clients/profile]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/clients/profile
 * Update the authenticated client's own profile (non-sensitive fields only).
 * Requires: Authorization: Bearer <client JWT>
 */
export async function PUT(request: NextRequest) {
  try {
    const payload = await getAuthFromRequest(request);
    if (!payload || payload.type !== 'client') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Strip any fields a client is not allowed to self-update
    const {
      password: _p,
      id: _id,
      email: _e,
      isEmailVerified: _v,
      emailVerificationToken: _evt,
      emailVerificationExpires: _eve,
      resetPasswordToken: _rpt,
      resetPasswordExpires: _rpe,
      equivalenceStatus: _es,
      residenceStatus: _rs,
      partnerStatus: _ps,
      ...allowedUpdates
    } = body;

    const updated = await prisma.client.update({
      where: { id: payload.sub },
      data: allowedUpdates,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        countryOfResidence: true,
        passportNumber: true,
        nationality: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PUT /api/clients/profile]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
