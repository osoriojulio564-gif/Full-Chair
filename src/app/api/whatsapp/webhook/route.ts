import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (value?.statuses) {
      for (const status of value.statuses) {
        await prisma.whatsAppMessage.updateMany({
          where: { waMessageId: status.id },
          data: { status: status.status?.toUpperCase() || "DELIVERED" },
        });
      }
    }

    if (value?.messages) {
      for (const msg of value.messages) {
        await prisma.whatsAppMessage.create({
          data: {
            direction: "INBOUND",
            phoneNumber: msg.from,
            message: msg.text?.body || "[media]",
            status: "READ",
            waMessageId: msg.id,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
