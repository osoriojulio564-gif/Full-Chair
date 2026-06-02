import { prisma } from "./prisma";

const connections = new Map<string, Set<ReadableStreamDefaultController>>();

export function addSSEConnection(salonId: string, controller: ReadableStreamDefaultController) {
  if (!connections.has(salonId)) connections.set(salonId, new Set());
  connections.get(salonId)!.add(controller);
}

export function removeSSEConnection(salonId: string, controller: ReadableStreamDefaultController) {
  connections.get(salonId)?.delete(controller);
}

function broadcastToSalon(salonId: string, data: unknown) {
  const salonConns = connections.get(salonId);
  if (!salonConns) return;
  const message = `data: ${JSON.stringify(data)}\n\n`;
  const encoder = new TextEncoder();
  for (const controller of salonConns) {
    try {
      controller.enqueue(encoder.encode(message));
    } catch {
      salonConns.delete(controller);
    }
  }
}

export async function createNotification(
  salonId: string,
  type: string,
  title: string,
  message: string,
  metadata?: Record<string, unknown>
) {
  const notification = await prisma.notification.create({
    data: { salonId, type, title, message, metadata: metadata ? JSON.stringify(metadata) : null },
  });
  broadcastToSalon(salonId, { type: "notification", notification });
  return notification;
}
