import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint: fetch active services for a salon by slug (no auth required)
export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get("salon");
  if (!slug) return NextResponse.json({ error: "salon required" }, { status: 400 });

  const salon = await prisma.salon.findUnique({ where: { slug } });
  if (!salon) return NextResponse.json({ error: "Salon not found" }, { status: 404 });

  const services = await prisma.service.findMany({
    where: { salonId: salon.id, isActive: true },
    select: { id: true, name: true, duration: true, price: true, category: true, color: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ services, salon: { id: salon.id, name: salon.name, currency: salon.currency } });
}
