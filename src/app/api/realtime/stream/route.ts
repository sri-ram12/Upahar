import { NextRequest } from "next/server";
import { subscribeRealtimeEvents, RealtimeMessage } from "@/lib/realtime-bus";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Max allowed serverless duration on Vercel

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let isClosed = false;

      const safeClose = () => {
        if (isClosed) return;
        isClosed = true;
        clearInterval(pingInterval);
        clearTimeout(lifetimeTimer);
        unsubscribe();
        try {
          controller.close();
        } catch {}
      };

      // 1. Instruct browser EventSource to reconnect cleanly within 1s when stream cycles
      controller.enqueue(encoder.encode("retry: 1000\n\n"));

      // 2. Send initial connection established message
      const welcome: RealtimeMessage = {
        event: "ORDER_UPDATED",
        payload: { connected: true, message: "Realtime SSE stream active" },
        timestamp: new Date().toISOString(),
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(welcome)}\n\n`));

      // 3. Subscribe to internal EventEmitter bus
      const unsubscribe = subscribeRealtimeEvents((msg) => {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(msg)}\n\n`));
        } catch {
          safeClose();
        }
      });

      // 4. Heartbeat ping every 10 seconds to keep connection alive through intermediate proxies
      const pingInterval = setInterval(() => {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(`: ping ${new Date().toISOString()}\n\n`));
        } catch {
          safeClose();
        }
      }, 10000);

      // 5. Gracefully end stream at 45s (before Vercel's serverless function timeout)
      // This guarantees Vercel finishes the task with a clean 200 OK response and NEVER logs
      // "Vercel Runtime Timeout Error: Task timed out after 300 seconds".
      // The browser EventSource automatically reconnects in 1s without any user-visible disruption.
      const lifetimeTimer = setTimeout(() => {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(`: cycle\n\n`));
        } catch {}
        safeClose();
      }, 45000);

      // 6. Cleanup if client navigates away or aborts request
      req.signal.addEventListener("abort", () => {
        safeClose();
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
