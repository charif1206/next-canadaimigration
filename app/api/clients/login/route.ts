import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/server-auth';

/**
 * POST /api/clients/login
 * Authenticate an existing client and return a JWT.
 *
 * Body: { email: string; password: string }
 * Public route — no authentication required.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body as { email: string; password: string };

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 },
      );
    }

    const client = await prisma.client.findUnique({ where: { email } });
    if (!client) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 },
      );
    }

    const isPasswordValid = await bcrypt.compare(password, client.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 },
      );
    }

    if (!client.isEmailVerified) {
      return NextResponse.json(
        { message: 'Please verify your email address before logging in' },
        { status: 403 },
      );
    }

    const payload = {
      sub: client.id,
      email: client.email,
      type: 'client' as const,
    };

    const token = await signToken(payload);

    const { password: _, emailVerificationToken: __, resetPasswordToken: ___, ...safeClient } = client;

    return NextResponse.json({
      access_token: token,
      client: safeClient,
    });
  } catch (error) {
    console.error('[POST /api/clients/login]', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}
