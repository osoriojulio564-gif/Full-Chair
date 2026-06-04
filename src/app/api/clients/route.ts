import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  const where: Record<string, unknown> = { salonId: session.salonId };
  if (q) {
    where.OR = [
      { firstName: { contains: q } },
      { lastName: { contains: q } },
      { phone: { contains: q } },
      { email: { contains: q } },
    ];
  }

  const clients = await prisma.client.findMany({
    where,
    include: { _count: { select: { appointments: true, reviews: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ clients });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const client = await prisma.client.create({
    data: { salonId: session.salonId, ...body },
  });

  await createNotification(
    session.salonId, "NEW_CLIENT", "New Client",
    `${client.firstName} ${client.lastName} was added to your client list`
  );

  return NextResponse.json({ client }, { status: 201 });
}
