"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Socket } from "socket.io-client";

export type RTCConnectionStatus =
  | "idle"
  | "negotiating"
  | "connecting"
  | "connected"
  | "disconnected"
  | "failed"
  | "closed";

interface UseWebRTCOptions {
  socket: Socket | null;
  localStream: MediaStream | null;
  matchId: string | null;
  isInitiator: boolean;
  onRemoteStreamReady?: (stream: MediaStream) => void;
  onConnectionChange?: (status: RTCConnectionStatus) => void;
}

export function useWebRTC({
  socket,
  localStream,
  matchId,
  isInitiator,
  onRemoteStreamReady,
  onConnectionChange,
}: UseWebRTCOptions) {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<RTCConnectionStatus>("idle");

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const iceCandidatesQueue = useRef<RTCIceCandidateInit[]>([]);
  const isSettingRemoteDescription = useRef(false);

  const updateStatus = useCallback(
    (status: RTCConnectionStatus) => {
      setConnectionStatus(status);
      onConnectionChange?.(status);
    },
    [onConnectionChange]
  );

  // Close and cleanup active peer connection
  const closePeerConnection = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    setRemoteStream(null);
    iceCandidatesQueue.current = [];
    isSettingRemoteDescription.current = false;
    updateStatus("closed");
  }, [updateStatus]);

  // Initialize Peer Connection & Signaling
  const startPeerConnection = useCallback(async () => {
    if (!socket || !matchId) return;

    closePeerConnection();
    updateStatus("negotiating");

    try {
      // Fetch dynamic STUN/TURN configurations
      let rtcConfig: RTCConfiguration = {
        iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }],
      };

      try {
        const turnRes = await fetch("/api/rtc/turn-credentials");
        if (turnRes.ok) {
          const configData = await turnRes.json();
          if (configData.iceServers) {
            rtcConfig = {
              iceServers: configData.iceServers,
              iceTransportPolicy: configData.iceTransportPolicy || "all",
            };
          }
        }
      } catch (err) {
        console.warn("[TURN_FETCH_WARNING] Using fallback Google STUN:", err);
      }

      const pc = new RTCPeerConnection(rtcConfig);
      pcRef.current = pc;

      // Attach local tracks if stream is available
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }

      // Handle incoming remote tracks
      pc.ontrack = (event) => {
        const [incomingStream] = event.streams;
        if (incomingStream) {
          setRemoteStream(incomingStream);
          onRemoteStreamReady?.(incomingStream);
        }
      };

      // Handle local ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socket.connected) {
          socket.emit("signal:ice-candidate", {
            matchId,
            candidate: event.candidate.toJSON(),
          });
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        switch (pc.connectionState) {
          case "connecting":
            updateStatus("connecting");
            break;
          case "connected":
            updateStatus("connected");
            break;
          case "disconnected":
            updateStatus("disconnected");
            break;
          case "failed":
            updateStatus("failed");
            break;
          case "closed":
            updateStatus("closed");
            break;
        }
      };

      // If initiator, generate SDP Offer
      if (isInitiator) {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);
        socket.emit("signal:offer", {
          matchId,
          sdp: pc.localDescription,
        });
      }
    } catch (err) {
      console.error("[WEBRTC_INIT_ERROR]", err);
      updateStatus("failed");
    }
  }, [closePeerConnection, isInitiator, localStream, matchId, onRemoteStreamReady, socket, updateStatus]);

  // Handle Incoming Signaling Events
  useEffect(() => {
    if (!socket || !matchId) return;

    // Receive Offer (for non-initiator)
    const handleOffer = async (data: { matchId: string; sdp: RTCSessionDescriptionInit }) => {
      if (data.matchId !== matchId || !pcRef.current) return;
      try {
        isSettingRemoteDescription.current = true;
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
        isSettingRemoteDescription.current = false;

        // Drain queued ICE candidates
        while (iceCandidatesQueue.current.length > 0) {
          const candidate = iceCandidatesQueue.current.shift();
          if (candidate) {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          }
        }

        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);

        socket.emit("signal:answer", {
          matchId,
          sdp: pcRef.current.localDescription,
        });
      } catch (err) {
        console.error("[SIGNAL_OFFER_ERROR]", err);
      }
    };

    // Receive Answer (for initiator)
    const handleAnswer = async (data: { matchId: string; sdp: RTCSessionDescriptionInit }) => {
      if (data.matchId !== matchId || !pcRef.current) return;
      try {
        isSettingRemoteDescription.current = true;
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
        isSettingRemoteDescription.current = false;

        // Drain queued ICE candidates
        while (iceCandidatesQueue.current.length > 0) {
          const candidate = iceCandidatesQueue.current.shift();
          if (candidate) {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          }
        }
      } catch (err) {
        console.error("[SIGNAL_ANSWER_ERROR]", err);
      }
    };

    // Receive ICE Candidate
    const handleIceCandidate = async (data: { matchId: string; candidate: RTCIceCandidateInit }) => {
      if (data.matchId !== matchId || !pcRef.current) return;
      try {
        if (pcRef.current.remoteDescription && !isSettingRemoteDescription.current) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } else {
          iceCandidatesQueue.current.push(data.candidate);
        }
      } catch (err) {
        console.error("[SIGNAL_ICE_ERROR]", err);
      }
    };

    socket.on("signal:offer", handleOffer);
    socket.on("signal:answer", handleAnswer);
    socket.on("signal:ice-candidate", handleIceCandidate);

    return () => {
      socket.off("signal:offer", handleOffer);
      socket.off("signal:answer", handleAnswer);
      socket.off("signal:ice-candidate", handleIceCandidate);
    };
  }, [matchId, socket]);

  // Start peer connection when matchId or localStream changes
  useEffect(() => {
    if (matchId && socket) {
      startPeerConnection();
    } else {
      closePeerConnection();
    }

    return () => {
      closePeerConnection();
    };
  }, [matchId, socket, startPeerConnection, closePeerConnection]);

  return {
    remoteStream,
    connectionStatus,
    closePeerConnection,
    restartConnection: startPeerConnection,
  };
}
