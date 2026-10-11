import prisma from "@/lib/prisma";
import { UserQueueEntry } from "./types";

export interface MatchScore {
  eligible: boolean;
  score: number;
  sharedInterests: string[];
}

export class FilterEngine {
  /**
   * Check if user A and user B can be matched, taking blocks and preferences into account.
   */
  static async evaluateEligibility(
    candidateA: UserQueueEntry,
    candidateB: UserQueueEntry
  ): Promise<MatchScore> {
    // 1. Never match with self
    if (candidateA.userId === candidateB.userId) {
      return { eligible: false, score: -1, sharedInterests: [] };
    }

    // 2. Check blocks in database
    const blockExists = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: candidateA.userId, blockedId: candidateB.userId },
          { blockerId: candidateB.userId, blockedId: candidateA.userId },
        ],
      },
    });

    if (blockExists) {
      return { eligible: false, score: -1, sharedInterests: [] };
    }

    let score = 100; // Base compatibility

    // 3. Avoid immediate rematch if other options exist
    if (
      candidateA.previousPartnerIds.includes(candidateB.userId) ||
      candidateB.previousPartnerIds.includes(candidateA.userId)
    ) {
      score -= 50;
    }

    // 4. Country preferences
    const prefA_countries = candidateA.preferences.preferredCountries;
    const prefB_countries = candidateB.preferences.preferredCountries;

    if (prefA_countries.length > 0 && prefB_countries.length > 0) {
      const countryOverlap = prefA_countries.filter((c) => prefB_countries.includes(c));
      if (countryOverlap.length > 0) {
        score += 30;
      }
    }

    // 5. Language preferences
    const prefA_lang = candidateA.preferences.preferredLanguages;
    const prefB_lang = candidateB.preferences.preferredLanguages;

    if (prefA_lang.length > 0 && prefB_lang.length > 0) {
      const langOverlap = prefA_lang.filter((l) => prefB_lang.includes(l));
      if (langOverlap.length > 0) {
        score += 40;
      } else {
        // If both explicitly selected languages but have 0 overlap, reduce score
        score -= 40;
      }
    }

    // 6. Shared interests
    const interestsA = candidateA.preferences.interests.map((i) => i.toLowerCase().trim());
    const interestsB = candidateB.preferences.interests.map((i) => i.toLowerCase().trim());

    const sharedInterests = interestsA.filter((i) => interestsB.includes(i));
    score += sharedInterests.length * 20;

    return {
      eligible: true,
      score,
      sharedInterests,
    };
  }
}
