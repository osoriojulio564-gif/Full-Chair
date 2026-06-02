import { getSession } from "@/lib/auth";
import { addSSEConnection, removeSSEConnection } from "@/lib/notifications";

export async function GET() {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode("data: {\"type\":\"connected\"}\n\n"));
      addSSEConnection(session.salonId, controller);

      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          clearInterval(interval);
        }
      }, 30000);
    },
    cancel(controller) {
      removeSSEConnection(session.salonId, controller as unknown as ReadableStreamDefaultController);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
