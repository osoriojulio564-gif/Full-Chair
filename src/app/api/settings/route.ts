import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const salon = await prisma.salon.findUnique({
    where: { id: session.salonId },
  });

  if (!salon) return NextResponse.json({ error: "Salon not found" }, { status: 404 });

  return NextResponse.json({ salon });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const allowedFields = [
    "name", "description", "phone", "email", "address",
    "city", "country", "timezone", "openTime", "closeTime", "currency",
  ];

  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }

  if (data.name) {
    data.slug = (data.name as string)
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  const salon = await prisma.salon.update({
    where: { id: session.salonId },
    data,
  });

  return NextResponse.json({ salon });
}
