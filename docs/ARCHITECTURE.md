# InFind Architecture Specification

**Brand:** InFind  
**Tagline:** Meet strangers. Find connections.

---

## 1. System Overview

InFind is built around a decoupled full-stack architecture that combines an HTTP web application with a persistent real-time signaling and matchmaking service:

```
                      ┌──────────────────────────────────────────────┐
                      │              Web Browser (Client)            │
                      │  Next.js (React 18) + Tailwind + WebRTC API │
                      └───────▲──────────────────────────────▲───────┘
                              │                              │
                    HTTPS API │                              │ WSS (Socket.IO)
                    Requests  │                              │ Realtime Signaling
                              ▼                              ▼
                 ┌─────────────────────────┐    ┌─────────────────────────┐
                 │ Next.js App Router (HTTP)│    │ Real-time Service (WS)  │
                 │ - Authentication API    │    │ - Cookie Auth Handshake │
                 │ - User & Preferences API│    │ - Matchmaking Queue     │
                 │ - Moderation & Reports  │    │ - WebRTC Signaling      │
                 │ - Ephemeral TURN Token  │    │ - Real-time Text Chat   │
                 └────────────┬────────────┘    └────────────┬────────────┘
                              │                              │
                              ▼                              ▼
                 ┌────────────────────────────────────────────────────────┐
                 │           Shared Database & Coordination               │
                 │ - PostgreSQL via Prisma ORM (Persistent data)         │
                 │ - Redis / In-Memory Store (Ephemeral queue & matches)  │
                 └────────────────────────────────────────────────────────┘
```

---

## 2. Matchmaking Engine Lifecycle

1. **User Authentication:** When an authenticated user navigates to `/chat`, the browser establishes a WebSocket connection to the real-time server.
2. **Handshake Verification:** The Socket.IO middleware parses the `infind_session` HTTP-only cookie, hashes the token with SHA-256, and queries Prisma to verify the session. Suspended or banned accounts are rejected immediately.
3. **Queue Entry (`match:start`):** The user triggers matching with optional preferences (country, language, topic tags). The server adds a `UserQueueEntry` to the `MatchStore`.
4. **Queue Evaluation:** The server-authoritative queue loop runs every second:
   - Candidates are ordered by wait time (longest waiting prioritized).
   - `FilterEngine.evaluateEligibility(candidateA, candidateB)` checks:
     - Self-matching prevention (`userIdA !== userIdB`).
     - Database block mutual verification (neither user has blocked the other).
     - Overlap score for countries, languages, and shared interest tags.
     - Avoidance of immediate repeat rematches.
5. **Pairing & Notification (`match:found`):** When two compatible candidates are found:
   - An active match ID is atomically generated (`match_<randomBytes>`).
   - The match is recorded in the database `MatchSession` table.
   - `candidateA` is designated as the WebRTC **Initiator**.
   - `candidateB` is designated as the WebRTC **Receiver**.

---

## 3. WebRTC Signaling Flow

```
User A (Initiator)                   Realtime Server                  User B (Receiver)
       │                                    │                                    │
       ├─── getUserMedia()                  │                   getUserMedia() ──┤
       │                                    │                                    │
       ├─── creates SDP Offer               │                                    │
       ├─── signal:offer (sdp) ────────────>│                                    │
       │    [verifies match participation]  ├─── signal:offer (sdp) ────────────>│
       │                                    │    sets remote description         │
       │                                    │    creates SDP Answer              │
       │                                    │<── signal:answer (sdp) ────────────┤
       │<── signal:answer (sdp) ────────────┤                                    │
       │    sets remote description         │                                    │
       │                                    │                                    │
       ├─── signal:ice-candidate ──────────>│                                    │
       │                                    ├─── signal:ice-candidate ──────────>│
       │<── signal:ice-candidate ───────────┤<── signal:ice-candidate ───────────┤
       │                                    │                                    │
       ▼                                                                         ▼
       └────────────────── P2P Encrypted Audio/Video Stream ─────────────────────┘
```

---

## 4. Teardown and Resource Cleanup

- When a user clicks **Next** or **End Call**, or disconnects unexpectedly:
  1. The server marks the active `MatchSession` as `TERMINATED`.
  2. The partner's socket receives `match:ended` with the termination reason.
  3. All local MediaStream tracks (`getTracks().forEach(t => t.stop())`) are terminated.
  4. The `RTCPeerConnection` instance is closed and listeners removed.
  5. The queue entry is cleanly released.
