import { describe, it, expect } from "vitest";
import { FilterEngine } from "../../server/matchmaking/FilterEngine";
import { UserQueueEntry } from "../../server/matchmaking/types";

describe("Matchmaking & Filter Engine", () => {
  const createMockUser = (
    userId: string,
    countries: string[] = [],
    languages: string[] = [],
    interests: string[] = []
  ): UserQueueEntry => ({
    userId,
    socketId: `socket_${userId}`,
    username: `user_${userId}`,
    displayName: `Display ${userId}`,
    joinedAt: Date.now(),
    preferences: {
      preferredCountries: countries,
      preferredLanguages: languages,
      interests,
    },
    previousPartnerIds: [],
  });

  it("never matches a candidate with themselves", async () => {
    const userA = createMockUser("user_1");
    const result = await FilterEngine.evaluateEligibility(userA, userA);

    expect(result.eligible).toBe(false);
    expect(result.score).toBe(-1);
  });

  it("considers two users without preferences eligible with baseline score", async () => {
    const userA = createMockUser("user_1");
    const userB = createMockUser("user_2");
    const result = await FilterEngine.evaluateEligibility(userA, userB);

    expect(result.eligible).toBe(true);
    expect(result.score).toBe(100);
  });

  it("boosts score for overlapping interests", async () => {
    const userA = createMockUser("user_1", [], [], ["gaming", "coding"]);
    const userB = createMockUser("user_2", [], [], ["coding", "music"]);
    const result = await FilterEngine.evaluateEligibility(userA, userB);

    expect(result.eligible).toBe(true);
    expect(result.sharedInterests).toEqual(["coding"]);
    expect(result.score).toBeGreaterThan(100);
  });
});
