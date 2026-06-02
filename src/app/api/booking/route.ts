import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { addMinutesToTime, generateTimeSlots } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("salon");
  const staffId = searchParams.get("staffId");
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date");

  if (!slug || !date) {
    return NextResponse.json({ error: "salon and date required" }, { status: 400 });
  }

  const salon = await prisma.salon.findUnique({ where: { slug } });
  if (!salon) return NextResponse.json({ error: "Salon not found" }, { status: 404 });

  const service = serviceId
    ? await prisma.service.findUnique({ where: { id: serviceId } })
    : null;

  const duration = service?.duration || 30;
  const dayOfWeek = new Date(date).getDay();

  const staffWhere: Record<string, unknown> = { salonId: salon.id, isActive: true };
  if (staffId) staffWhere.id = staffId;

  const staffMembers = await prisma.staffMember.findMany({
    where: staffWhere,
    include: { schedule: { where: { dayOfWeek } } },
  });

  const dateObj = new Date(date);
  const nextDay = new Date(dateObj);
  nextDay.setDate(nextDay.getDate() + 1);

  const existingApts = await prisma.appointment.findMany({
    where: {
      salonId: salon.id,
      date: { gte: dateObj, lt: nextDay },
      status: { not: "CANCELLED" },
    },
  });

  const slots: { time: string; staffId: string; staffName: string }[] = [];

  for (const member of staffMembers) {
    const sched = member.schedule[0];
    if (!sched || sched.isOff) continue;

    const allSlots = generateTimeSlots(sched.startTime, sched.endTime, 30);

    for (const slot of allSlots) {
      const endTime = addMinutesToTime(slot, duration);
      const conflict = existingApts.some(
        (a) => a.staffId === member.id && a.startTime < endTime && a.endTime > slot
      );
      if (!conflict) {
        slots.push({ time: slot, staffId: member.id, staffName: `${member.firstName} ${member.lastName}` });
      }
    }
  }

  return NextResponse.json({ slots, salon: { id: salon.id, name: salon.name } });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { salonSlug, serviceId, staffId, date, startTime, firstName, lastName, phone, email, notes } = body;

    const salon = await prisma.salon.findUnique({ where: { slug: salonSlug } });
    if (!salon) return NextResponse.json({ error: "Salon not found" }, { status: 404 });

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    const endTime = addMinutesToTime(startTime, service.duration);

    let client = await prisma.client.findUnique({
      where: { phone_salonId: { phone, salonId: salon.id } },
    });

    if (!client) {
      client = await prisma.client.create({
        data: { salonId: salon.id, firstName, lastName, phone, email, source: "online" },
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        salonId: salon.id, clientId: client.id, staffId, serviceId,
        date: new Date(date), startTime, endTime, price: service.price,
        notes, source: "ONLINE",
      },
      include: { client: true, staff: true, service: true },
    });

    await createNotification(
      salon.id, "NEW_BOOKING", "New Online Booking",
      `${firstName} ${lastName} booked ${service.name} with ${appointment.staff.firstName} at ${startTime}`
    );

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: "Booking failed" }, { status: 500 });
  }
}
