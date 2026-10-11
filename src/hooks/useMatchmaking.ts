"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { MatchingFilters } from "@/lib/validations";

export type MatchmakingState =
  | "DISCONNECTED"
  | "CONNECTING"
  | "IDLE"
  | "SEARCHING"
  | "CONNECTED"
  | "ENDED"
  | "ERROR";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderUsername: string;
  content: string;
  timestamp: string;
}

export interface MatchPartner {
  userId: string;
  username: string;
  displayName: string;
}

export function useMatchmaking() {
  const [state, setState] = useState<MatchmakingState>("CONNECTING");
  const [matchId, setMatchId] = useState<string | null>(null);
  const [partner, setPartner] = useState<MatchPartner | null>(null);
  const [sharedInterests, setSharedInterests] = useState<string[]>([]);
  const [isInitiator, setIsInitiator] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [endReason, setEndReason] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000";

    const socket = io(wsUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setState("IDLE");
      setErrorMessage(null);
    });

    socket.on("connect_error", (err) => {
      console.warn("[SOCKET_CONNECT_ERROR]", err.message);
      setState("ERROR");
      setErrorMessage(
        err.message === "Authentication required"
          ? "Please log in to start video chatting."
          : "Cannot connect to real-time server. Please verify the server is running."
      );
    });

    socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect") {
        socket.connect();
      }
      setState("DISCONNECTED");
    });

    socket.on("match:searching", () => {
      setState("SEARCHING");
      setMatchId(null);
      setPartner(null);
      setMessages([]);
      setEndReason(null);
    });

    socket.on("match:idle", () => {
      setState("IDLE");
    });

    socket.on("match:found", (data: {
      matchId: string;
      partner: MatchPartner;
      sharedInterests: string[];
      isInitiator: boolean;
    }) => {
      setMatchId(data.matchId);
      setPartner(data.partner);
      setSharedInterests(data.sharedInterests || []);
      setIsInitiator(data.isInitiator);
      setMessages([]);
      setState("CONNECTED");
    });

    socket.on("match:ended", (data: { matchId?: string; reason?: string }) => {
      setState("ENDED");
      setEndReason(data.reason || "Stranger left the conversation.");
    });

    socket.on("chat:message", (msg: ChatMessage) => {
      setMessages((prev) => {
        // Prevent duplicate rendering
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on("chat:error", (data: { message: string }) => {
      console.warn("[CHAT_ERROR]", data.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Start matchmaking queue
  const startMatching = useCallback((filters?: MatchingFilters) => {
    if (!socketRef.current || !socketRef.current.connected) return;
    setErrorMessage(null);
    socketRef.current.emit("match:start", filters);
  }, []);

  // Cancel matchmaking search
  const cancelMatching = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit("match:cancel");
  }, []);

  // Skip to next stranger
  const skipStranger = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit("match:skip", { matchId });
    // Immediately requeue
    socketRef.current.emit("match:start");
  }, [matchId]);

  // End current call
  const endCall = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit("match:end");
  }, []);

  // Send real-time chat message
  const sendChatMessage = useCallback(
    (content: string) => {
      if (!socketRef.current || !matchId) return;
      socketRef.current.emit("chat:send", { matchId, content });
    },
    [matchId]
  );

  return {
    socket: socketRef.current,
    state,
    matchId,
    partner,
    sharedInterests,
    isInitiator,
    messages,
    errorMessage,
    endReason,
    startMatching,
    cancelMatching,
    skipStranger,
    endCall,
    sendChatMessage,
  };
}
