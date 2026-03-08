import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';

// POST /api/auth/register  — Register a new admin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, role } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'username, email and password are required' },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters' },
        { status: 400 },
      );
    }

    const existingByUsername = await prisma.admin.findUnique({ where: { username } });
    if (existingByUsername) {
      return NextResponse.json(
        { message: `Username '${username}' is already taken.` },
        { status: 409 },
      );
    }

    const existingByEmail = await prisma.admin.findFirst({ where: { email } });
    if (existingByEmail) {
      return NextResponse.json(
        { message: `Email '${email}' is already registered.` },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const admin = await prisma.admin.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: role || 'admin',
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        isEmailVerified: false,
      },
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(email, verificationToken, 'admin').catch(console.error);

    const { password: _, emailVerificationToken: __, resetPasswordToken: ___, ...safeAdmin } = admin;

    return NextResponse.json(safeAdmin, { status: 201 });
  } catch (error) {
    console.error('[POST /api/auth/register]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
