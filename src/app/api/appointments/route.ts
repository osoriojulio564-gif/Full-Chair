import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const date = searchParams.get("date");

  const where: Record<string, unknown> = { salonId: session.salonId };
  if (status) where.status = status;
  if (date) {
    const d = new Date(date);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    where.date = { gte: d, lt: next };
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: { client: true, staff: true, service: true },
    orderBy: [{ date: "desc" }, { startTime: "asc" }],
    take: 50,
  });

  return NextResponse.json({ appointments });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { clientId, staffId, serviceId, date, startTime, endTime, price, notes, source } = body;

  const appointment = await prisma.appointment.create({
    data: {
      salonId: session.salonId, clientId, staffId, serviceId,
      date: new Date(date), startTime, endTime, price,
      notes, source: source || "ONLINE",
    },
    include: { client: true, staff: true, service: true },
  });

  await createNotification(
    session.salonId, "NEW_BOOKING", "New Appointment",
    `${appointment.client.firstName} booked ${appointment.service.name} with ${appointment.staff.firstName} at ${startTime}`
  );

  return NextResponse.json({ appointment }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status: newStatus } = await req.json();

  const appointment = await prisma.appointment.update({
    where: { id },
    data: { status: newStatus },
    include: { client: true, service: true },
  });

  if (newStatus === "CANCELLED") {
    await createNotification(
      session.salonId, "CANCELLATION", "Appointment Cancelled",
      `${appointment.client.firstName}'s ${appointment.service.name} appointment was cancelled`
    );
  }

  return NextResponse.json({ appointment });
}
