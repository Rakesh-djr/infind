import { Server as SocketIOServer, Socket } from "socket.io";
import { IMatchStore } from "../matchmaking/MatchStore";
import { MatchQueue } from "../matchmaking/MatchQueue";
import prisma from "@/lib/prisma";

export class SignalingManager {
  private io: SocketIOServer;
  private store: IMatchStore;
  private matchQueue: MatchQueue;
  private messageRateLimits: Map<string, { count: number; resetAt: number }> = new Map();

  constructor(io: SocketIOServer, store: IMatchStore, matchQueue: MatchQueue) {
    this.io = io;
    this.store = store;
    this.matchQueue = matchQueue;
  }

  registerEvents(socket: Socket, user: { id: string; username: string; displayName: string }) {
    // 1. WebRTC SDP Offer
    socket.on("signal:offer", async (payload: { matchId: string; sdp: RTCSessionDescriptionInit }) => {
      const { matchId, sdp } = payload || {};
      if (!matchId || !sdp) return;

      const match = await this.store.getActiveMatchByMatchId(matchId);
      if (!match) {
        socket.emit("match:error", { message: "Match not found or already terminated" });
        return;
      }

      // Verify caller is one of the match participants
      const isUser1 = match.user1.userId === user.id;
      const isUser2 = match.user2.userId === user.id;
      if (!isUser1 && !isUser2) {
        socket.emit("match:error", { message: "Unauthorized signaling attempt" });
        return;
      }

      const targetSocketId = isUser1 ? match.user2.socketId : match.user1.socketId;
      this.io.to(targetSocketId).emit("signal:offer", { matchId, sdp });
    });

    // 2. WebRTC SDP Answer
    socket.on("signal:answer", async (payload: { matchId: string; sdp: RTCSessionDescriptionInit }) => {
      const { matchId, sdp } = payload || {};
      if (!matchId || !sdp) return;

      const match = await this.store.getActiveMatchByMatchId(matchId);
      if (!match) {
        socket.emit("match:error", { message: "Match not found or already terminated" });
        return;
      }

      const isUser1 = match.user1.userId === user.id;
      const isUser2 = match.user2.userId === user.id;
      if (!isUser1 && !isUser2) {
        socket.emit("match:error", { message: "Unauthorized signaling attempt" });
        return;
      }

      const targetSocketId = isUser1 ? match.user2.socketId : match.user1.socketId;
      this.io.to(targetSocketId).emit("signal:answer", { matchId, sdp });
    });

    // 3. WebRTC ICE Candidate
    socket.on("signal:ice-candidate", async (payload: { matchId: string; candidate: RTCIceCandidateInit }) => {
      const { matchId, candidate } = payload || {};
      if (!matchId || !candidate) return;

      const match = await this.store.getActiveMatchByMatchId(matchId);
      if (!match) return;

      const isUser1 = match.user1.userId === user.id;
      const isUser2 = match.user2.userId === user.id;
      if (!isUser1 && !isUser2) return;

      const targetSocketId = isUser1 ? match.user2.socketId : match.user1.socketId;
      this.io.to(targetSocketId).emit("signal:ice-candidate", { matchId, candidate });
    });

    // 4. Real-time text messaging
    socket.on("chat:send", async (payload: { matchId: string; content: string }) => {
      const { matchId, content } = payload || {};
      if (!matchId || typeof content !== "string") return;

      const trimmed = content.trim();
      if (trimmed.length === 0 || trimmed.length > 500) {
        socket.emit("chat:error", { message: "Message length must be between 1 and 500 characters" });
        return;
      }

      // Check rate limit (max 5 messages per 2 seconds)
      const now = Date.now();
      const userLimit = this.messageRateLimits.get(user.id);
      if (userLimit && userLimit.resetAt > now) {
        if (userLimit.count >= 5) {
          socket.emit("chat:error", { message: "Slow down! You are sending messages too quickly." });
          return;
        }
        userLimit.count++;
      } else {
        this.messageRateLimits.set(user.id, { count: 1, resetAt: now + 2000 });
      }

      const match = await this.store.getActiveMatchByMatchId(matchId);
      if (!match) {
        socket.emit("chat:error", { message: "Match session inactive" });
        return;
      }

      const isUser1 = match.user1.userId === user.id;
      const isUser2 = match.user2.userId === user.id;
      if (!isUser1 && !isUser2) {
        socket.emit("chat:error", { message: "Unauthorized message attempt" });
        return;
      }

      const messageData = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        senderId: user.id,
        senderUsername: user.username,
        content: trimmed,
        timestamp: new Date().toISOString(),
      };

      // Broadcast to partner and back to sender for delivery acknowledgment
      const partnerSocketId = isUser1 ? match.user2.socketId : match.user1.socketId;
      this.io.to(partnerSocketId).emit("chat:message", messageData);
      socket.emit("chat:message", messageData);

      // Async DB record (non-blocking)
      prisma.message.create({
        data: {
          id: messageData.id,
          matchSessionId: matchId,
          senderId: user.id,
          content: trimmed,
        },
      }).catch(() => {});
    });

    // 5. Skip Stranger & Next
    socket.on("match:skip", async (payload: { matchId?: string; requeue?: boolean }) => {
      const match = await this.store.getActiveMatchByUserId(user.id);
      if (match) {
        const isUser1 = match.user1.userId === user.id;
        const partnerSocketId = isUser1 ? match.user2.socketId : match.user1.socketId;

        await this.matchQueue.endMatch(match.matchId, "USER_SKIPPED");
        this.io.to(partnerSocketId).emit("match:ended", {
          matchId: match.matchId,
          reason: "Stranger skipped the call.",
        });
      }

      socket.emit("match:ended", {
        matchId: match?.matchId,
        reason: "You skipped the call.",
      });
    });

    // 6. End Call
    socket.on("match:end", async () => {
      const match = await this.store.getActiveMatchByUserId(user.id);
      if (match) {
        const isUser1 = match.user1.userId === user.id;
        const partnerSocketId = isUser1 ? match.user2.socketId : match.user1.socketId;

        await this.matchQueue.endMatch(match.matchId, "USER_ENDED");
        this.io.to(partnerSocketId).emit("match:ended", {
          matchId: match.matchId,
          reason: "Stranger ended the call.",
        });
        socket.emit("match:ended", {
          matchId: match.matchId,
          reason: "You ended the call.",
        });
      }
    });
  }
}
