import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const config = await prisma.whatsAppConfig.findUnique({
    where: { salonId: session.salonId },
  });

  return NextResponse.json({ config: config || null });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const data = {
    phoneNumberId: body.phoneNumberId || "",
    businessId: body.businessAccountId || "",
    accessToken: body.accessToken || "",
    verifyToken: body.verifyToken || "",
    autoConfirm: body.autoConfirm ?? true,
    isActive: body.sendReminders ?? true,
    reminderHours: body.reminderHours ? parseInt(body.reminderHours, 10) : 24,
    followUpHours: body.followUpHours ? parseInt(body.followUpHours, 10) : 2,
  };

  const config = await prisma.whatsAppConfig.upsert({
    where: { salonId: session.salonId },
    create: {
      salonId: session.salonId,
      ...data,
    },
    update: data,
  });

  return NextResponse.json({ config });
}
