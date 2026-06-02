import { prisma } from "./prisma";

export async function sendWhatsAppMessage({
  to,
  message,
  salonId,
  appointmentId,
}: {
  to: string;
  message: string;
  salonId: string;
  appointmentId?: string;
}) {
  const config = await prisma.whatsAppConfig.findUnique({ where: { salonId } });
  if (!config || !config.isActive) return null;

  const url = `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message },
      }),
    });

    const data = await response.json();

    await prisma.whatsAppMessage.create({
      data: {
        appointmentId,
        direction: "OUTBOUND",
        phoneNumber: to,
        message,
        status: response.ok ? "SENT" : "FAILED",
        waMessageId: data.messages?.[0]?.id,
      },
    });

    return data;
  } catch (error) {
    console.error("[WhatsApp] Failed:", error);
    await prisma.whatsAppMessage.create({
      data: {
        appointmentId,
        direction: "OUTBOUND",
        phoneNumber: to,
        message,
        status: "FAILED",
      },
    });
    return null;
  }
}

export async function sendBookingConfirmation(appointmentId: string) {
  const apt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { client: true, staff: true, service: true, salon: true },
  });
  if (!apt) return;

  const dateStr = apt.date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return sendWhatsAppMessage({
    to: apt.client.phone,
    message: `Your appointment is booked! ${apt.service.name} with ${apt.staff.firstName} on ${dateStr} at ${apt.startTime}. See you at ${apt.salon.name}!`,
    salonId: apt.salonId,
    appointmentId: apt.id,
  });
}

export async function sendReviewRequest(appointmentId: string) {
  const apt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { client: true, salon: true },
  });
  if (!apt) return;

  const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/review/${apt.id}`;

  return sendWhatsAppMessage({
    to: apt.client.phone,
    message: `Thanks for visiting ${apt.salon.name}! Rate your experience: ${reviewUrl}`,
    salonId: apt.salonId,
    appointmentId: apt.id,
  });
}
