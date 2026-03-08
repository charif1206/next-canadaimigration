import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/server-auth';

// GET /api/auth/profile  — Get current admin profile (protected)
export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthFromRequest(request);
    if (!payload || payload.type !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { message: 'Admin account not found. Please log in again.' },
        { status: 404 },
      );
    }

    return NextResponse.json(admin);
  } catch (error) {
    console.error('[GET /api/auth/profile]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
