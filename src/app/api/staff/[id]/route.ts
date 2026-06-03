import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  const staff = await prisma.staffMember.findFirst({
    where: { id, salonId: session.salonId },
    include: {
      schedule: { orderBy: { dayOfWeek: "asc" } },
      services: { include: { service: true } },
      appointments: {
        include: { client: true, service: true },
        orderBy: { date: "desc" },
        take: 10,
      },
      reviews: {
        include: { client: true },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { appointments: true, reviews: true },
      },
    },
  });

  if (!staff) {
    return NextResponse.json({ error: "Staff not found" }, { status: 404 });
  }

  return NextResponse.json({ staff });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  // Verify staff belongs to this salon
  const existing = await prisma.staffMember.findFirst({
    where: { id, salonId: session.salonId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Staff not found" }, { status: 404 });
  }

  const body = await req.json();

  if (body.type === "info") {
    const updated = await prisma.staffMember.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        email: body.email,
        bio: body.bio,
        role: body.role,
      },
    });
    return NextResponse.json({ staff: updated });
  }

  if (body.type === "schedule") {
    const scheduleData: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isOff: boolean;
    }[] = body.schedule;

    await Promise.all(
      scheduleData.map((day) =>
        prisma.staffSchedule.upsert({
          where: {
            staffId_dayOfWeek: {
              staffId: id,
              dayOfWeek: day.dayOfWeek,
            },
          },
          update: {
            startTime: day.startTime,
            endTime: day.endTime,
            isOff: day.isOff,
          },
          create: {
            staffId: id,
            dayOfWeek: day.dayOfWeek,
            startTime: day.startTime,
            endTime: day.endTime,
            isOff: day.isOff,
          },
        })
      )
    );

    const updatedSchedule = await prisma.staffSchedule.findMany({
      where: { staffId: id },
      orderBy: { dayOfWeek: "asc" },
    });

    return NextResponse.json({ schedule: updatedSchedule });
  }

  return NextResponse.json({ error: "Invalid update type" }, { status: 400 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  // Don't allow deleting yourself
  if (id === session.id) {
    return NextResponse.json(
      { error: "You cannot delete your own account" },
      { status: 400 }
    );
  }

  // Verify staff belongs to this salon
  const existing = await prisma.staffMember.findFirst({
    where: { id, salonId: session.salonId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Staff not found" }, { status: 404 });
  }

  await prisma.staffMember.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
