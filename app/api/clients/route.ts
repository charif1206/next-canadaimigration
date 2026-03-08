import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { signToken, getAuthFromRequest } from '@/lib/server-auth';
import { sendVerificationEmail } from '@/lib/email';

// GET /api/clients?page=1&limit=10  — Admin: list all clients (protected)
export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthFromRequest(request);
    if (!payload || payload.type !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          messages: { orderBy: { createdAt: 'desc' }, take: 5 },
        },
      }),
      prisma.client.count(),
    ]);

    return NextResponse.json({
      data: clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[GET /api/clients]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/clients  — Public: register a new client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'name, email and password are required' },
        { status: 400 },
      );
    }

    const existing = await prisma.client.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: `Email '${email}' is already registered. Please log in instead.` },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const client = await prisma.client.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        isEmailVerified: false,
      } as any,
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(email, verificationToken, 'client').catch(console.error);

    const token = await signToken({
      sub: client.id,
      email: client.email,
      type: 'client',
    });

    const { password: _, emailVerificationToken: __, resetPasswordToken: ___, ...clientData } =
      client as any;

    return NextResponse.json({ access_token: token, client: clientData }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/clients]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
