import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/clients/auth/reset-password
 * Reset a client's password using the token received via email.
 *
 * Body: { token: string; newPassword: string }
 * Public route — no authentication required.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body as { token: string; newPassword: string };

    if (!token || !newPassword) {
      return NextResponse.json(
        { message: 'Token and new password are required' },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 },
      );
    }

    const client = await prisma.client.findUnique({
      where: { resetPasswordToken: token },
    });

    if (!client) {
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 },
      );
    }

    if (client.resetPasswordExpires && client.resetPasswordExpires < new Date()) {
      return NextResponse.json(
        { message: 'Reset token has expired. Please request a new password reset.' },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.client.update({
      where: { id: client.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('[POST /api/clients/auth/reset-password]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
