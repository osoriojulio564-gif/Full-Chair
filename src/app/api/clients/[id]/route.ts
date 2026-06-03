import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;

  const client = await prisma.client.findFirst({
    where: { id, salonId: session.salonId },
    include: {
      appointments: {
        include: { service: true, staff: true },
        orderBy: [{ date: "desc" }, { startTime: "asc" }],
      },
      reviews: {
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { appointments: true, reviews: true },
      },
    },
  });

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json({ client });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;

  // Verify client belongs to this salon
  const existing = await prisma.client.findFirst({
    where: { id, salonId: session.salonId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const body = await req.json();
  const { firstName, lastName, phone, email, notes, tags } = body;

  const data: Record<string, unknown> = {};
  if (firstName !== undefined) data.firstName = firstName;
  if (lastName !== undefined) data.lastName = lastName;
  if (phone !== undefined) data.phone = phone;
  if (email !== undefined) data.email = email;
  if (notes !== undefined) data.notes = notes;
  if (tags !== undefined) data.tags = tags;

  const client = await prisma.client.update({
    where: { id },
    data,
    include: {
      appointments: {
        include: { service: true, staff: true },
        orderBy: [{ date: "desc" }, { startTime: "asc" }],
      },
      reviews: {
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { appointments: true, reviews: true },
      },
    },
  });

  return NextResponse.json({ client });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;

  // Verify client belongs to this salon
  const existing = await prisma.client.findFirst({
    where: { id, salonId: session.salonId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  await prisma.client.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
