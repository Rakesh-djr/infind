# InFind Security Architecture & Threat Model

Security is a foundational pillar of **InFind**. This document outlines the threat model, mitigation strategies, and security guarantees.

---

## 1. Authentication & Session Protection

### Password Security
- **Algorithm:** Argon2id (OWASP recommended parameter profile: memoryCost 19 MiB, timeCost 2, outputLen 32, parallelism 1).
- **Passphrase Support:** Passwords support up to 128 characters without arbitrary character restriction rules.
- **Zero Plaintext:** Passwords are never stored in plaintext, never logged to stdout/stderr, and omitted from all database selection projections.

### Session Management
- **Token Entropy:** 256-bit cryptographically secure pseudorandom tokens (`crypto.randomBytes(32).toString('hex')`).
- **Database Hashing:** Only the SHA-256 hash of the session token is persisted in the database. A database dump does not expose usable session tokens.
- **Cookie Flags:** Cookies are set with `httpOnly: true`, `sameSite: "lax"`, and `secure: true` in production environments.
- **Session Revocation:** Logout or password changes immediately revoke active session records in the database.

---

## 2. WebRTC & Real-time Signaling Safeguards

### Match-Scoped Signaling Authorization
Signaling events (`signal:offer`, `signal:answer`, `signal:ice-candidate`) require:
1. Valid session credentials on the Socket connection.
2. Verified membership in the specific `matchId` payload.
Sockets cannot send signaling or text messages into rooms or matches where they are not an active participant.

### Peer IP Privacy & TURN Relay
In standard peer-to-peer WebRTC connections, IP addresses can be observed by peers to establish direct UDP hole-punching.
- InFind supports an enforced TURN relay policy (`FORCE_TURN_RELAY=true`).
- When activated, peer connections route exclusively through TURN relays (`iceTransportPolicy: "relay"`), shielding user public IP addresses.

### Short-Lived Ephemeral TURN Credentials
Static TURN passwords are never bundled in frontend JavaScript. Instead, `/api/rtc/turn-credentials` issues temporary 1-hour HMAC-SHA1 tokens tied to the authenticated user ID.

---

## 3. Threat Model & Mitigations

| Threat | Impact | InFind Mitigation |
| :--- | :--- | :--- |
| **Credential Stuffing / Brute-force** | Account Takeover | Argon2id high memory cost prevents GPU cracking; rate limits on login endpoint. |
| **Session Hijacking / XSS** | Account Impersonation | HTTP-only cookies prevent JavaScript access; strict HTML output sanitization. |
| **Unauthorized Match Signaling** | Eavesdropping / Injection | Server-side validation checks socket participant ID against active match store before relaying. |
| **Matchmaking Race Conditions** | Duplicate / Ghost Matches | Atomic queue operations (`MatchStore`) lock entries during pairing sweeps. |
| **Text Chat Spam** | Service Denial / Harassment | Rate limiting (max 5 messages per 2s) and 500-character payload limits. |
| **Banned User Re-entry** | Community Harm | Socket authentication handshake checks account status in database and disconnects banned users immediately. |
| **IDOR in Moderation Actions** | Privilege Escalation | Server endpoints verify user role (`ADMIN` / `MODERATOR`) on every administrative request. |

---

## 4. HTTP Security Headers

Next.js is configured with defensive response headers:
- `X-Frame-Options: DENY` (Clickjacking mitigation)
- `X-Content-Type-Options: nosniff` (MIME-sniffing prevention)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(self), microphone=(self), geolocation=()`
- `poweredByHeader: false` (Suppresses `X-Powered-By: Next.js`)
