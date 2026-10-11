import { UserQueueEntry, ActiveMatch } from "./types";
import Redis from "ioredis";

export interface IMatchStore {
  addToQueue(entry: UserQueueEntry): Promise<void>;
  removeFromQueue(userId: string): Promise<void>;
  getQueue(): Promise<UserQueueEntry[]>;
  createActiveMatch(match: ActiveMatch): Promise<void>;
  getActiveMatchByUserId(userId: string): Promise<ActiveMatch | null>;
  getActiveMatchByMatchId(matchId: string): Promise<ActiveMatch | null>;
  removeActiveMatch(matchId: string): Promise<ActiveMatch | null>;
  cleanUser(userId: string): Promise<void>;
}

export class MemoryMatchStore implements IMatchStore {
  private queue: Map<string, UserQueueEntry> = new Map();
  private activeMatches: Map<string, ActiveMatch> = new Map();
  private userToMatchMap: Map<string, string> = new Map();

  async addToQueue(entry: UserQueueEntry): Promise<void> {
    // Ensure user is not in active match
    if (this.userToMatchMap.has(entry.userId)) {
      this.removeActiveMatch(this.userToMatchMap.get(entry.userId)!);
    }
    this.queue.set(entry.userId, entry);
  }

  async removeFromQueue(userId: string): Promise<void> {
    this.queue.delete(userId);
  }

  async getQueue(): Promise<UserQueueEntry[]> {
    return Array.from(this.queue.values());
  }

  async createActiveMatch(match: ActiveMatch): Promise<void> {
    this.queue.delete(match.user1.userId);
    this.queue.delete(match.user2.userId);

    this.activeMatches.set(match.matchId, match);
    this.userToMatchMap.set(match.user1.userId, match.matchId);
    this.userToMatchMap.set(match.user2.userId, match.matchId);
  }

  async getActiveMatchByUserId(userId: string): Promise<ActiveMatch | null> {
    const matchId = this.userToMatchMap.get(userId);
    if (!matchId) return null;
    return this.activeMatches.get(matchId) || null;
  }

  async getActiveMatchByMatchId(matchId: string): Promise<ActiveMatch | null> {
    return this.activeMatches.get(matchId) || null;
  }

  async removeActiveMatch(matchId: string): Promise<ActiveMatch | null> {
    const match = this.activeMatches.get(matchId);
    if (!match) return null;

    this.activeMatches.delete(matchId);
    this.userToMatchMap.delete(match.user1.userId);
    this.userToMatchMap.delete(match.user2.userId);
    return match;
  }

  async cleanUser(userId: string): Promise<void> {
    this.queue.delete(userId);
    const matchId = this.userToMatchMap.get(userId);
    if (matchId) {
      await this.removeActiveMatch(matchId);
    }
  }
}

export class RedisMatchStore implements IMatchStore {
  private redis: Redis;
  private memoryFallback: MemoryMatchStore;

  constructor(redisUrl: string) {
    this.memoryFallback = new MemoryMatchStore();
    this.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });
    this.redis.connect().catch((err) => {
      console.warn("[REDIS_CONNECT_WARNING] Falling back to MemoryMatchStore:", err.message);
    });
  }

  async addToQueue(entry: UserQueueEntry): Promise<void> {
    try {
      await this.cleanUser(entry.userId);
      await this.redis.hset("infind:queue", entry.userId, JSON.stringify(entry));
    } catch {
      return this.memoryFallback.addToQueue(entry);
    }
  }

  async removeFromQueue(userId: string): Promise<void> {
    try {
      await this.redis.hdel("infind:queue", userId);
    } catch {
      return this.memoryFallback.removeFromQueue(userId);
    }
  }

  async getQueue(): Promise<UserQueueEntry[]> {
    try {
      const all = await this.redis.hgetall("infind:queue");
      return Object.values(all).map((str) => JSON.parse(str));
    } catch {
      return this.memoryFallback.getQueue();
    }
  }

  async createActiveMatch(match: ActiveMatch): Promise<void> {
    try {
      const pipeline = this.redis.pipeline();
      pipeline.hdel("infind:queue", match.user1.userId, match.user2.userId);
      pipeline.set(`infind:match:${match.matchId}`, JSON.stringify(match), "EX", 3600);
      pipeline.set(`infind:user_match:${match.user1.userId}`, match.matchId, "EX", 3600);
      pipeline.set(`infind:user_match:${match.user2.userId}`, match.matchId, "EX", 3600);
      await pipeline.exec();
    } catch {
      return this.memoryFallback.createActiveMatch(match);
    }
  }

  async getActiveMatchByUserId(userId: string): Promise<ActiveMatch | null> {
    try {
      const matchId = await this.redis.get(`infind:user_match:${userId}`);
      if (!matchId) return null;
      return this.getActiveMatchByMatchId(matchId);
    } catch {
      return this.memoryFallback.getActiveMatchByUserId(userId);
    }
  }

  async getActiveMatchByMatchId(matchId: string): Promise<ActiveMatch | null> {
    try {
      const str = await this.redis.get(`infind:match:${matchId}`);
      return str ? JSON.parse(str) : null;
    } catch {
      return this.memoryFallback.getActiveMatchByMatchId(matchId);
    }
  }

  async removeActiveMatch(matchId: string): Promise<ActiveMatch | null> {
    try {
      const match = await this.getActiveMatchByMatchId(matchId);
      if (!match) return null;

      const pipeline = this.redis.pipeline();
      pipeline.del(`infind:match:${matchId}`);
      pipeline.del(`infind:user_match:${match.user1.userId}`);
      pipeline.del(`infind:user_match:${match.user2.userId}`);
      await pipeline.exec();
      return match;
    } catch {
      return this.memoryFallback.removeActiveMatch(matchId);
    }
  }

  async cleanUser(userId: string): Promise<void> {
    try {
      await this.redis.hdel("infind:queue", userId);
      const matchId = await this.redis.get(`infind:user_match:${userId}`);
      if (matchId) {
        await this.removeActiveMatch(matchId);
      }
    } catch {
      return this.memoryFallback.cleanUser(userId);
    }
  }
}

export function createMatchStore(): IMatchStore {
  if (process.env.REDIS_URL && process.env.REDIS_URL.trim() !== "") {
    return new RedisMatchStore(process.env.REDIS_URL);
  }
  return new MemoryMatchStore();
}
