# InFind Production Deployment Guide

## 1. Architecture Infrastructure Separation

InFind consists of two server components:
1. **Next.js Web Application (HTTP):** Hosts the frontend UI, authentication API endpoints, and database CRUD. Can run on any Node.js host or platform (Vercel, AWS Amplify, Docker).
2. **Real-time Signaling Service (WebSocket):** Requires a persistent Node.js runtime process (such as a Docker container on Fly.io, Railway, Render, or AWS ECS/Fargate) to keep persistent WebSocket connections open.

---

## 2. Production Database (PostgreSQL)

1. Provision a PostgreSQL 15+ database instance (e.g. Supabase, Neon, AWS RDS).
2. Set `DATABASE_URL` in your production environment:
   ```env
   DATABASE_URL="postgresql://user:password@db-host:5432/infind?sslmode=require&schema=public"
   ```
3. Copy `prisma/schema.postgresql.prisma` to `prisma/schema.prisma` and apply migrations:
   ```bash
   npx prisma migrate deploy
   ```

---

## 3. Distributed Coordination with Redis

When scaling the real-time service across multiple instances:
1. Provision a Redis 6+ instance (e.g. Upstash, AWS ElastiCache, Redis Cloud).
2. Provide `REDIS_URL` to the real-time service:
   ```env
   REDIS_URL="rediss://default:password@redis-host:6379"
   ```
   InFind's `MatchStore` will automatically route queues and active match lookups to Redis rather than local in-memory stores.

---

## 4. Docker Deployment for Real-Time Signaling Server

Create a `Dockerfile.realtime` or run via standard container:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 4000
CMD ["npm", "run", "realtime"]
```

---

## 5. Production Readiness Verification Checklist

- [x] Passwords hashed with Argon2id using recommended parameters.
- [x] Unique normalized usernames enforced by database constraint.
- [x] Session tokens generated with 256-bit entropy and stored as SHA-256 hashes.
- [x] WebRTC signaling restricted to active match participants.
- [x] Database blocks strictly prevent rematches in the matchmaking queue.
- [x] Admin endpoints protected by server-side role validation (`ADMIN`/`MODERATOR`).
- [x] STUN and TURN credentials configured with short-lived tokens.
- [x] Security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`) enabled.
- [x] Automated test suite (Vitest) passes completely.
- [x] Next.js production build succeeds with zero compiler errors.
