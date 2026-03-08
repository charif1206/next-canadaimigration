import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';

// POST /api/auth/forgot-password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // Always return success to avoid revealing registered emails (security)
    const successMsg = {
      message: 'If an account with that email exists, a password reset link has been sent.',
    };

    const admin = await prisma.admin.findFirst({ where: { email } });
    if (!admin) {
      return NextResponse.json(successMsg);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.admin.update({
      where: { id: admin.id },
      data: { resetPasswordToken: resetToken, resetPasswordExpires: resetExpires },
    });

    // Send email (non-blocking)
    sendPasswordResetEmail(email, resetToken).catch(console.error);

    return NextResponse.json(successMsg);
  } catch (error) {
    console.error('[POST /api/auth/forgot-password]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
