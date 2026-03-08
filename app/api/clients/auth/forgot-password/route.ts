import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';

/**
 * POST /api/clients/auth/forgot-password
 * Send a password-reset email to a registered client.
 *
 * Body: { email: string }
 * Public route — no authentication required.
 * Always returns 200 to prevent email enumeration.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body as { email: string };

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // Always return the same success message to prevent email enumeration
    const successMsg = {
      message: 'If an account with that email exists, a password reset link has been sent.',
    };

    const client = await prisma.client.findUnique({ where: { email } });
    if (!client) {
      return NextResponse.json(successMsg);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.client.update({
      where: { id: client.id },
      data: { resetPasswordToken: resetToken, resetPasswordExpires: resetExpires },
    });

    // Send email asynchronously — do not await so the response is fast
    sendPasswordResetEmail(email, resetToken).catch(console.error);

    return NextResponse.json(successMsg);
  } catch (error) {
    console.error('[POST /api/clients/auth/forgot-password]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
