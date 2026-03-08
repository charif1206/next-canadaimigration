import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/server-auth';

// GET /api/clients/[id]  — Admin: get client by ID (protected)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const payload = await getAuthFromRequest(request);
    if (!payload || payload.type !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'desc' } } },
    });

    if (!client) {
      return NextResponse.json(
        { message: `Client with ID '${id}' not found.` },
        { status: 404 },
      );
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('[GET /api/clients/[id]]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/clients/[id]  — Admin: update client fields (protected)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const payload = await getAuthFromRequest(request);
    if (!payload || payload.type !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Strip sensitive fields that must not be updated via this endpoint
    const { password, emailVerificationToken, resetPasswordToken, ...updateData } = body as any;

    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { message: `Client with ID '${id}' not found.` },
        { status: 404 },
      );
    }

    const updated = await prisma.client.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PUT /api/clients/[id]]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/clients/[id]  — Admin: delete client (protected)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const payload = await getAuthFromRequest(request);
    if (!payload || payload.type !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { message: `Client with ID '${id}' not found.` },
        { status: 404 },
      );
    }

    await prisma.client.delete({ where: { id } });

    return NextResponse.json({ message: 'Client deleted successfully', id });
  } catch (error) {
    console.error('[DELETE /api/clients/[id]]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
