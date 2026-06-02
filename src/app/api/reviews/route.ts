import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reviews = await prisma.review.findMany({
    where: { salonId: session.salonId },
    include: { client: true, staff: true, appointment: { include: { service: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ reviews });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { appointmentId, rating, comment } = body;

  const apt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { review: true },
  });

  if (!apt) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  if (apt.review) return NextResponse.json({ error: "Already reviewed" }, { status: 409 });

  const review = await prisma.review.create({
    data: {
      salonId: apt.salonId,
      clientId: apt.clientId,
      staffId: apt.staffId,
      appointmentId: apt.id,
      rating,
      comment,
    },
  });

  return NextResponse.json({ review }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, response } = await req.json();
  const review = await prisma.review.update({ where: { id }, data: { response } });

  return NextResponse.json({ review });
}
