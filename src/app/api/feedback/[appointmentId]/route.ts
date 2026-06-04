import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { appointmentId: string } }
) {
  const { appointmentId } = params;

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      salon: { select: { name: true, googlePlaceId: true, plan: true } },
      service: { select: { name: true } },
      staff: { select: { firstName: true, lastName: true } },
      client: { select: { firstName: true } },
      review: { select: { id: true } },
    },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    appointment: {
      id: appointment.id,
      salonName: appointment.salon.name,
      serviceName: appointment.service.name,
      staffName: `${appointment.staff.firstName} ${appointment.staff.lastName}`,
      clientName: appointment.client.firstName,
      googlePlaceId: appointment.salon.googlePlaceId,
      plan: appointment.salon.plan,
      hasReview: !!appointment.review,
    },
  });
}
