"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { RealtimeEventType, RealtimeMessage } from "@/lib/realtime-bus";

interface RealtimeHookOptions {
  onEvent?: (event: RealtimeEventType, payload: any, fullMsg: RealtimeMessage) => void;
  onOrderCreated?: (payload: any) => void;
  onOrderUpdated?: (payload: any) => void;
  onOrderDelivered?: (payload: any) => void;
  onEmergencyStopChanged?: (payload: any) => void;
  onRiderStatusChanged?: (payload: any) => void;
  onRiderLocationUpdated?: (payload: any) => void;
  onMenuItemUpdated?: (payload: any) => void;
  enabled?: boolean;
}

export function useRealtimeEvents(options: RealtimeHookOptions = {}) {
  const {
    onEvent,
    onOrderCreated,
    onOrderUpdated,
    onOrderDelivered,
    onEmergencyStopChanged,
    onRiderStatusChanged,
    onRiderLocationUpdated,
    onMenuItemUpdated,
    enabled = true,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastEventTime, setLastEventTime] = useState<Date | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Keep references to callbacks so they don't trigger re-subscriptions
  const callbacksRef = useRef({
    onEvent,
    onOrderCreated,
    onOrderUpdated,
    onOrderDelivered,
    onEmergencyStopChanged,
    onRiderStatusChanged,
    onRiderLocationUpdated,
    onMenuItemUpdated,
  });

  useEffect(() => {
    callbacksRef.current = {
      onEvent,
      onOrderCreated,
      onOrderUpdated,
      onOrderDelivered,
      onEmergencyStopChanged,
      onRiderStatusChanged,
      onRiderLocationUpdated,
      onMenuItemUpdated,
    };
  });

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;
    let isDisposed = false;

    const connect = () => {
      if (isDisposed) return;

      try {
        eventSource = new EventSource("/api/realtime/stream");

        eventSource.onopen = () => {
          if (isDisposed) return;
          setIsConnected(true);
          setConnectionError(null);
        };

        eventSource.onmessage = (event) => {
          if (isDisposed) return;
          try {
            const data: RealtimeMessage = JSON.parse(event.data);
            setLastEventTime(new Date());

            const {
              onEvent,
              onOrderCreated,
              onOrderUpdated,
              onOrderDelivered,
              onEmergencyStopChanged,
              onRiderStatusChanged,
              onRiderLocationUpdated,
              onMenuItemUpdated,
            } = callbacksRef.current;

            if (onEvent) onEvent(data.event, data.payload, data);

            switch (data.event) {
              case "ORDER_CREATED":
                if (onOrderCreated) onOrderCreated(data.payload);
                break;
              case "ORDER_UPDATED":
                if (onOrderUpdated) onOrderUpdated(data.payload);
                break;
              case "ORDER_DELIVERED":
                if (onOrderDelivered) onOrderDelivered(data.payload);
                break;
              case "EMERGENCY_STOP_CHANGED":
                if (onEmergencyStopChanged) onEmergencyStopChanged(data.payload);
                break;
              case "RIDER_STATUS_CHANGED":
                if (onRiderStatusChanged) onRiderStatusChanged(data.payload);
                break;
              case "RIDER_LOCATION_UPDATED":
                if (onRiderLocationUpdated) onRiderLocationUpdated(data.payload);
                break;
              case "MENU_ITEM_UPDATED":
                if (onMenuItemUpdated) onMenuItemUpdated(data.payload);
                break;
            }
          } catch (err) {
            // Non-JSON message like ping/heartbeat
          }
        };

        eventSource.onerror = (e) => {
          if (isDisposed) return;
          setIsConnected(false);
          setConnectionError("Connection lost, reconnecting...");
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Exponential retry in 3 seconds
          reconnectTimeout = setTimeout(connect, 3000);
        };
      } catch (err: any) {
        setIsConnected(false);
        setConnectionError(err.message || "Failed to establish SSE stream");
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      isDisposed = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [enabled]);

  return {
    isConnected,
    lastEventTime,
    connectionError,
  };
}

