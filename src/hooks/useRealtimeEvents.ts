"use client";

import { useEffect, useState, useRef } from "react";
import { RealtimeEventType, RealtimeMessage } from "@/lib/realtime-bus";

export interface RealtimeHookOptions {
  onEvent?: (event: RealtimeEventType, payload: any, fullMsg: RealtimeMessage) => void;
  onOrderCreated?: (payload: any) => void;
  onOrderUpdated?: (payload: any) => void;
  onOrderDelivered?: (payload: any) => void;
  onEmergencyStopChanged?: (payload: any) => void;
  onRiderStatusChanged?: (payload: any) => void;
  onRiderLocationUpdated?: (payload: any) => void;
  onMenuItemUpdated?: (payload: any) => void;
  onSubsiteUpdated?: (payload: any) => void;
  enabled?: boolean;
}

type EventCallback = (msg: RealtimeMessage) => void;

// ============================================================================
// SINGLETON EVENTSOURCE CONNECTION MANAGER
// Consolidates multiple hook calls (Navbar, CartContext, Orders) into 1 connection
// ============================================================================
class RealtimeConnectionManager {
  private static instance: RealtimeConnectionManager | null = null;
  private eventSource: EventSource | null = null;
  private subscribers = new Set<EventCallback>();
  private reconnectTimeout: any = null;
  private closeTimeout: any = null;
  private _isConnected = false;
  private _lastEventTime: Date | null = null;
  private connectionChangeListeners = new Set<(connected: boolean) => void>();

  static getInstance(): RealtimeConnectionManager {
    if (!RealtimeConnectionManager.instance) {
      RealtimeConnectionManager.instance = new RealtimeConnectionManager();
    }
    return RealtimeConnectionManager.instance;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  get lastEventTime(): Date | null {
    return this._lastEventTime;
  }

  subscribe(callback: EventCallback, onConnectionChange?: (connected: boolean) => void): () => void {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }

    this.subscribers.add(callback);
    if (onConnectionChange) {
      this.connectionChangeListeners.add(onConnectionChange);
      onConnectionChange(this._isConnected);
    }

    if (!this.eventSource) {
      this.connect();
    }

    return () => {
      this.subscribers.delete(callback);
      if (onConnectionChange) {
        this.connectionChangeListeners.delete(onConnectionChange);
      }

      // If no active subscribers remain, close connection after 5 seconds to avoid churn
      if (this.subscribers.size === 0) {
        this.closeTimeout = setTimeout(() => {
          if (this.subscribers.size === 0) {
            this.disconnect();
          }
        }, 5000);
      }
    };
  }

  private connect() {
    if (typeof window === "undefined" || this.eventSource) return;

    try {
      this.eventSource = new EventSource("/api/realtime/stream");

      this.eventSource.onopen = () => {
        this._isConnected = true;
        this.notifyConnection(true);
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data: RealtimeMessage = JSON.parse(event.data);
          this._lastEventTime = new Date();
          // Dispatch to all subscribers
          this.subscribers.forEach((cb) => {
            try {
              cb(data);
            } catch (err) {
              console.error("Error in realtime subscriber callback:", err);
            }
          });
        } catch {
          // Heartbeat ping or cycle signal
        }
      };

      this.eventSource.onerror = () => {
        this._isConnected = false;
        this.notifyConnection(false);

        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }

        // Reconnect after 1.5 seconds if subscribers are still waiting
        if (this.subscribers.size > 0 && !this.reconnectTimeout) {
          this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            if (this.subscribers.size > 0) {
              this.connect();
            }
          }, 1500);
        }
      };
    } catch (err) {
      this._isConnected = false;
      this.notifyConnection(false);
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectTimeout = null;
        this.connect();
      }, 3000);
    }
  }

  private disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this._isConnected = false;
    this.notifyConnection(false);
  }

  private notifyConnection(connected: boolean) {
    this.connectionChangeListeners.forEach((fn) => {
      try {
        fn(connected);
      } catch {}
    });
  }
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
    onSubsiteUpdated,
    enabled = true,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastEventTime, setLastEventTime] = useState<Date | null>(null);

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
    onSubsiteUpdated,
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
      onSubsiteUpdated,
    };
  });

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const manager = RealtimeConnectionManager.getInstance();

    const handleMessage = (data: RealtimeMessage) => {
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
        onSubsiteUpdated,
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
        case "SUBSITE_UPDATED":
          if (onSubsiteUpdated) onSubsiteUpdated(data.payload);
          break;
      }
    };

    const unsubscribe = manager.subscribe(handleMessage, (connected) => {
      setIsConnected(connected);
    });

    return () => {
      unsubscribe();
    };
  }, [enabled]);

  return {
    isConnected,
    lastEventTime,
    connectionError: null,
  };
}
