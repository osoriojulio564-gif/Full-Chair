import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staffMember.findMany({
    where: { salonId: session.salonId },
    include: {
      schedule: true,
      services: { include: { service: true } },
      _count: { select: { appointments: true, reviews: true } },
    },
    orderBy: { firstName: "asc" },
  });

  return NextResponse.json({ staff });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const password = await hashPassword(body.password || "changeme123");

  const member = await prisma.staffMember.create({
    data: {
      salonId: session.salonId,
      email: body.email,
      password,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      role: body.role || "STYLIST",
      bio: body.bio,
    },
  });

  const days = [1, 2, 3, 4, 5, 6];
  await Promise.all(
    days.map((d) =>
      prisma.staffSchedule.create({
        data: { staffId: member.id, dayOfWeek: d, startTime: "09:00", endTime: "18:00" },
      })
    )
  );

  return NextResponse.json({ staff: member }, { status: 201 });
}
