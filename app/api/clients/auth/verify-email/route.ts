import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/clients/auth/verify-email?token=<token>
 * Verify a client's email address using the one-time token sent on registration.
 * Public route — no authentication required.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { message: 'Verification token is required' },
        { status: 400 },
      );
    }

    const client = await prisma.client.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!client) {
      return NextResponse.json(
        { message: 'Invalid or expired verification token' },
        { status: 400 },
      );
    }

    if (client.isEmailVerified) {
      return NextResponse.json({ message: 'Email already verified', alreadyVerified: true });
    }

    if (client.emailVerificationExpires && client.emailVerificationExpires < new Date()) {
      return NextResponse.json(
        { message: 'Verification token has expired. Please register again.' },
        { status: 400 },
      );
    }

    await prisma.client.update({
      where: { id: client.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return NextResponse.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('[GET /api/clients/auth/verify-email]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
