import { useEffect, useRef } from "react";
import { API_BASE_URL, type EventData } from "../types";

type RealtimeEvent =
  | { type: "connection:ready" }
  | { type: "event:created"; event: EventData; message?: string }
  | { type: "event:deleted"; eventId: string; eventName?: string; deletedPhotos?: number; message?: string };

interface RealtimeEventHandlers {
  onEventCreated?: (event: EventData) => void;
  onEventDeleted?: (payload: Extract<RealtimeEvent, { type: "event:deleted" }>) => void;
}

const getRealtimeUrl = () => {
  const baseUrl = new URL(API_BASE_URL);
  baseUrl.protocol = baseUrl.protocol === "https:" ? "wss:" : "ws:";
  baseUrl.pathname = "/ws";
  baseUrl.search = "";
  return baseUrl.toString();
};

export function useRealtimeEvents(handlers: RealtimeEventHandlers) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    const socket = new WebSocket(getRealtimeUrl());

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as RealtimeEvent;

        if (payload.type === "event:created") {
          handlersRef.current.onEventCreated?.(payload.event);
        }

        if (payload.type === "event:deleted") {
          handlersRef.current.onEventDeleted?.(payload);
        }
      } catch (error) {
        console.error("Invalid realtime payload:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("Realtime connection error:", error);
    };

    return () => {
      socket.close();
    };
  }, []);
}
