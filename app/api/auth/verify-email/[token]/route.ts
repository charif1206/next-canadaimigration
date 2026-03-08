import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/auth/verify-email/[token]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ message: 'Verification token is required' }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!admin) {
      return NextResponse.json(
        { message: 'Invalid or expired verification token' },
        { status: 400 },
      );
    }

    if (admin.isEmailVerified) {
      return NextResponse.json({ message: 'Email already verified', alreadyVerified: true });
    }

    if (admin.emailVerificationExpires && admin.emailVerificationExpires < new Date()) {
      return NextResponse.json(
        { message: 'Verification token has expired. Please request a new one.' },
        { status: 400 },
      );
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return NextResponse.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('[GET /api/auth/verify-email]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
