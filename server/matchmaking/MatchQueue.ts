import crypto from "crypto";
import { Server as SocketIOServer } from "socket.io";
import prisma from "@/lib/prisma";
import { UserQueueEntry, ActiveMatch } from "./types";
import { IMatchStore } from "./MatchStore";
import { FilterEngine } from "./FilterEngine";

export class MatchQueue {
  private store: IMatchStore;
  private io: SocketIOServer;
  private isProcessing = false;
  private processInterval: NodeJS.Timeout | null = null;

  constructor(store: IMatchStore, io: SocketIOServer) {
    this.store = store;
    this.io = io;
  }

  start() {
    if (this.processInterval) return;
    this.processInterval = setInterval(() => {
      this.processQueue().catch((err) => {
        console.error("[MATCH_QUEUE_PROCESS_ERROR]", err);
      });
    }, 1000);
  }

  stop() {
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
    }
  }

  async enqueue(entry: UserQueueEntry): Promise<void> {
    await this.store.addToQueue(entry);
    // Trigger immediate pass
    setImmediate(() => this.processQueue());
  }

  async dequeue(userId: string): Promise<void> {
    await this.store.removeFromQueue(userId);
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const queue = await this.store.getQueue();
      if (queue.length < 2) {
        return;
      }

      // Sort by waiting time (longest waiting first)
      queue.sort((a, b) => a.joinedAt - b.joinedAt);

      const pairedUserIds = new Set<string>();

      for (let i = 0; i < queue.length; i++) {
        const candidateA = queue[i];
        if (pairedUserIds.has(candidateA.userId)) continue;

        let bestMatch: UserQueueEntry | null = null;
        let bestScore = -1;
        let bestSharedInterests: string[] = [];

        for (let j = i + 1; j < queue.length; j++) {
          const candidateB = queue[j];
          if (pairedUserIds.has(candidateB.userId)) continue;

          const evaluation = await FilterEngine.evaluateEligibility(candidateA, candidateB);
          if (evaluation.eligible && evaluation.score > bestScore) {
            bestScore = evaluation.score;
            bestMatch = candidateB;
            bestSharedInterests = evaluation.sharedInterests;
          }
        }

        if (bestMatch) {
          pairedUserIds.add(candidateA.userId);
          pairedUserIds.add(bestMatch.userId);

          const matchId = `match_${crypto.randomBytes(16).toString("hex")}`;
          const activeMatch: ActiveMatch = {
            matchId,
            user1: {
              userId: candidateA.userId,
              socketId: candidateA.socketId,
              username: candidateA.username,
              displayName: candidateA.displayName,
            },
            user2: {
              userId: bestMatch.userId,
              socketId: bestMatch.socketId,
              username: bestMatch.username,
              displayName: bestMatch.displayName,
            },
            createdAt: Date.now(),
          };

          // Atomically store active match and remove from queue
          await this.store.createActiveMatch(activeMatch);

          // Persist MatchSession in database
          try {
            await prisma.matchSession.create({
              data: {
                id: matchId,
                user1Id: candidateA.userId,
                user2Id: bestMatch.userId,
                status: "CONNECTED",
              },
            });
          } catch (dbErr) {
            console.error("[DB_MATCH_SESSION_CREATE_ERROR]", dbErr);
          }

          // Candidate A is designated WebRTC initiator (creates offer)
          this.io.to(candidateA.socketId).emit("match:found", {
            matchId,
            partner: {
              userId: bestMatch.userId,
              username: bestMatch.username,
              displayName: bestMatch.displayName,
            },
            sharedInterests: bestSharedInterests,
            isInitiator: true,
          });

          // Candidate B is receiver (waits for offer, creates answer)
          this.io.to(bestMatch.socketId).emit("match:found", {
            matchId,
            partner: {
              userId: candidateA.userId,
              username: candidateA.username,
              displayName: candidateA.displayName,
            },
            sharedInterests: bestSharedInterests,
            isInitiator: false,
          });
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  async endMatch(matchId: string, reason: string): Promise<ActiveMatch | null> {
    const match = await this.store.removeActiveMatch(matchId);
    if (match) {
      try {
        await prisma.matchSession.update({
          where: { id: matchId },
          data: {
            status: "TERMINATED",
            terminationReason: reason,
            endedAt: new Date(),
          },
        }).catch(() => {});
      } catch (err) {
        console.error("[DB_MATCH_SESSION_END_ERROR]", err);
      }
    }
    return match;
  }
}
