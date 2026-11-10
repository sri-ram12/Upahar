import { NextRequest } from "next/server";
import { subscribeRealtimeEvents, RealtimeMessage } from "@/lib/realtime-bus";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send initial connection established message
      const welcome: RealtimeMessage = {
        event: "ORDER_UPDATED",
        payload: { connected: true, message: "Realtime SSE stream active" },
        timestamp: new Date().toISOString(),
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(welcome)}\n\n`));

      // 2. Subscribe to internal EventEmitter bus
      const unsubscribe = subscribeRealtimeEvents((msg) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(msg)}\n\n`));
        } catch (e) {
          console.error("Error writing to SSE stream", e);
        }
      });

      // 3. Heartbeat ping every 15 seconds to prevent network timeouts
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping ${new Date().toISOString()}\n\n`));
        } catch (e) {
          clearInterval(pingInterval);
        }
      }, 15000);

      // 4. Cleanup when client disconnects
      req.signal.addEventListener("abort", () => {
        clearInterval(pingInterval);
        unsubscribe();
        try {
          controller.close();
        } catch (e) {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform, no-store",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disables Nginx buffering for zero-delay streaming
    },
  });
}

