import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/server-auth';

// POST /api/auth/login  — Admin login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 },
      );
    }

    const admin = await prisma.admin.findUnique({ where: { username } });

    if (!admin) {
      return NextResponse.json(
        { message: `Admin account with username '${username}' does not exist.` },
        { status: 401 },
      );
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Password is incorrect. Please check your password and try again.' },
        { status: 401 },
      );
    }

    if (!admin.isEmailVerified) {
      return NextResponse.json(
        { message: 'Email not verified. Please verify your account before logging in.' },
        { status: 401 },
      );
    }

    const token = await signToken({
      sub: admin.id,
      username: admin.username,
      role: admin.role,
      type: 'admin',
    });

    return NextResponse.json({
      access_token: token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        isEmailVerified: admin.isEmailVerified,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    });
  } catch (error) {
    console.error('[POST /api/auth/login]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
