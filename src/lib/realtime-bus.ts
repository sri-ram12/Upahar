import { EventEmitter } from "events";

// Global singleton EventEmitter to ensure it persists across hot reloads in Next.js
declare global {
  // eslint-disable-next-line no-var
  var __upaharRealtimeBus: EventEmitter | undefined;
}

const realtimeBus: EventEmitter = globalThis.__upaharRealtimeBus || new EventEmitter();
realtimeBus.setMaxListeners(200);

if (process.env.NODE_ENV !== "production") {
  globalThis.__upaharRealtimeBus = realtimeBus;
}

export type RealtimeEventType =
  | "ORDER_CREATED"
  | "ORDER_UPDATED"
  | "ORDER_DELIVERED"
  | "EMERGENCY_STOP_CHANGED"
  | "RIDER_STATUS_CHANGED"
  | "RIDER_LOCATION_UPDATED"
  | "MENU_ITEM_UPDATED";

export interface RealtimeMessage {
  event: RealtimeEventType;
  payload: any;
  timestamp: string;
}

/**
 * Broadcast an instant real-time event to all connected clients
 */
export function broadcastRealtimeEvent(event: RealtimeEventType, payload: any) {
  const message: RealtimeMessage = {
    event,
    payload,
    timestamp: new Date().toISOString(),
  };
  realtimeBus.emit("realtime-message", message);
}

/**
 * Subscribe to the real-time event bus
 */
export function subscribeRealtimeEvents(listener: (msg: RealtimeMessage) => void) {
  realtimeBus.on("realtime-message", listener);
  return () => {
    realtimeBus.off("realtime-message", listener);
  };
}

export { realtimeBus };

