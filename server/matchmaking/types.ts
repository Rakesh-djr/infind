export interface UserQueueEntry {
  userId: string;
  socketId: string;
  username: string;
  displayName: string;
  joinedAt: number;
  preferences: {
    preferredCountries: string[];
    preferredLanguages: string[];
    interests: string[];
  };
  previousPartnerIds: string[]; // Track recent partners to avoid immediate rematch loops
}

export interface ActiveMatch {
  matchId: string;
  user1: {
    userId: string;
    socketId: string;
    username: string;
    displayName: string;
  };
  user2: {
    userId: string;
    socketId: string;
    username: string;
    displayName: string;
  };
  createdAt: number;
}
