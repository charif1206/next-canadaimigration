import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

// POST /api/auth/reset-password/[token]
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { password } = body;

    if (!password || password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters' },
        { status: 400 },
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { resetPasswordToken: token },
    });

    if (!admin) {
      return NextResponse.json(
        { message: 'Invalid or expired password reset token' },
        { status: 400 },
      );
    }

    if (admin.resetPasswordExpires && admin.resetPasswordExpires < new Date()) {
      return NextResponse.json(
        { message: 'Password reset token has expired. Please request a new one.' },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('[POST /api/auth/reset-password]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
