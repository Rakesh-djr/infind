# InFind 🎥

> **Meet strangers. Find connections.**

**InFind** is a secure, modern, responsive random stranger video chat web application built with Next.js (App Router), TypeScript, WebRTC, Socket.IO, Prisma ORM, and Tailwind CSS.

---

## 🌟 Key Features

- **Spontaneous Video Chatting:** Instant random pairing with strangers across the globe via live encrypted WebRTC audio and video.
- **Server-Authoritative Matchmaking Engine:**
  - Real, atomic matching queues (no fake users or simulated connections).
  - Mutual block list enforcement at the database level.
  - Multi-preference weighting (country, language, and shared interests).
  - Prevention of self-matches and immediate rematch loops.
- **Hardware & Call Controls:**
  - One-click microphone mute/unmute and camera toggle.
  - Picture-in-Picture (PiP) local mirror video preview.
  - Instant **Next Stranger** skip and **End Call** controls with clean track teardown.
- **Real-Time Text Messaging:**
  - In-call chat with timestamping and active participant validation.
  - Server-side rate limiting (max 5 messages per 2s) and 500-character payload limits.
- **User Safety, Moderation & Privacy:**
  - Instant user reporting with categorized violations (Harassment, Nudity, Spam, Threats, Impersonation).
  - Permanent user blocking (ends current match and prevents all future rematches).
  - Role-protected Admin Moderation Console (`/admin`) for incident triage and account disciplinary sanctions (Suspend, Ban, Reinstate).
  - Strict **No Recording** policy: WebRTC streams are peer-to-peer and never recorded.
- **Hardened Authentication:**
  - Case-insensitive unique username enforcement via database constraints.
  - Argon2id password hashing (OWASP parameters: 19 MiB memory, 2 iterations).
  - Cryptographically secure 256-bit session tokens stored as SHA-256 hashes in HTTP-only cookies.
  - Real-time live username availability checking.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript (Strict Mode), Tailwind CSS, Lucide Icons, React Hook Form, Zod |
| **Backend & APIs** | Node.js, Next.js Route Handlers, Socket.IO Real-time Server |
| **Real-time & Media** | WebRTC (DTLS-SRTP), STUN/TURN ICE negotiation, Socket.IO WebSockets |
| **Database** | PostgreSQL / SQLite via Prisma ORM |
| **Security & Auth** | `@node-rs/argon2` (Argon2id), SHA-256 hashed session cookies |
| **Testing** | Vitest, TypeScript compiler (`tsc`) |

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites
- Node.js 18+ (tested on Node 20 & 24)
- npm 9+

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(The default `.env` includes zero-config local settings ready for immediate execution).*

### 4. Database Setup & Seeding
Initialize the database and seed initial test accounts:
```bash
# Push schema and create tables
npm run prisma:push

# Seed admin and test accounts
npm run prisma:seed
```

Seeded credentials for quick testing:
- **Admin account:** `@admin` / `InFindSecureAdmin2026!`
- **Test User 1:** `@Alex_Dev` / `InFindAlex123!`
- **Test User 2:** `@Sam_Connect` / `InFindSam123!`

---

## 🏃 Running the Application

InFind requires both the Next.js web application and the real-time signaling service:

### Terminal 1 — Next.js Web Application
```bash
npm run dev
```
Accessible at: **http://localhost:3000**

### Terminal 2 — Real-time Matchmaking & Signaling Server
```bash
npm run realtime
```
Runs on port **4000** (`WS_PORT`).

---

## 🧪 Running Automated Tests

Run the full Vitest automated test suite:
```bash
npm run test
```

Run TypeScript strict type checking:
```bash
npx tsc --noEmit
```

Build the production bundle:
```bash
npm run build
```

---

## 📁 Project Structure

```
infind/
├── src/
│   ├── app/
│   │   ├── page.tsx               # Public landing page
│   │   ├── chat/page.tsx          # Main InFind video chat application
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx     # Secure login
│   │   │   └── register/page.tsx  # Registration with live availability check
│   │   ├── settings/page.tsx      # User settings & privacy
│   │   ├── admin/page.tsx         # Admin moderation console
│   │   ├── guidelines/page.tsx    # Community guidelines
│   │   ├── terms/page.tsx         # Terms of service
│   │   ├── privacy/page.tsx       # Privacy policy
│   │   └── api/                   # Server API routes
│   ├── components/
│   │   ├── brand/                 # Original vector Logo & Header
│   │   ├── video/                 # LocalVideo, RemoteVideo, CallControls, Badges
│   │   ├── chat/                  # Real-time text messaging drawer
│   │   ├── filters/               # Matching preferences dialog
│   │   ├── safety/                # ReportModal & BlockModal
│   │   └── ui/                    # Design system components
│   ├── hooks/
│   │   ├── useAuth.tsx            # Session state hook
│   │   ├── useMediaDevices.ts     # Camera, microphone, and track toggles
│   │   ├── useMatchmaking.ts      # Queue coordinator & message dispatcher
│   │   └── useWebRTC.ts           # Peer connection & ICE candidate exchange
│   └── lib/
│       ├── auth.ts                # Argon2id hashing & session management
│       ├── brand.ts               # Brand tokens & copy
│       ├── prisma.ts              # Singleton database client
│       └── validations.ts         # Zod schemas & normalization
├── server/
│   ├── socketServer.ts            # Persistent Socket.IO & auth middleware
│   ├── matchmaking/
│   │   ├── MatchQueue.ts          # Server-authoritative queue sweep & pairing
│   │   ├── MatchStore.ts          # Redis & In-Memory state adapters
│   │   └── FilterEngine.ts        # Compatibility scoring & block checks
│   └── signaling/
│       └── SignalingManager.ts    # WebRTC offer/answer/ICE exchange
├── prisma/
│   ├── schema.prisma              # Database models
│   ├── schema.postgresql.prisma   # PostgreSQL production schema
│   └── seed.ts                    # Initial admin & demo data seed
├── tests/
│   ├── unit/                      # Username, auth, filterEngine, validations
│   └── integration/               # Database registration uniqueness
└── docs/
    ├── ARCHITECTURE.md            # System architecture & flows
    ├── SECURITY.md                # Threat model & cryptographic specs
    ├── TURN_CONFIGURATION.md      # STUN/TURN & Coturn setup
    └── DEPLOYMENT.md              # Production deployment guide
```

---

## 🔒 Security Principles

- **Argon2id Hashing:** Password hashing uses OWASP-standard parameters.
- **Session Tokens:** High-entropy 256-bit random tokens stored as SHA-256 hashes in database; transported solely via secure HTTP-only cookies.
- **Match-Scoped Signaling:** Sockets can only transmit SDP offers, answers, ICE candidates, and text messages to verified participants of their active match session.
- **Zero Video Storage:** InFind never records or archives live video or audio streams.
- **TURN Relay Privacy:** Optional `FORCE_TURN_RELAY="true"` setting ensures peer IP addresses are never exposed to other participants.

---

## 📄 License

ISC License &copy; 2026 InFind Technologies. All rights reserved.
