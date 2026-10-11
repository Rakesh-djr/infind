import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { parseCookie } from "cookie";
import { validateTokenAndGetUser, SESSION_COOKIE_NAME } from "../src/lib/auth";
import { createMatchStore } from "./matchmaking/MatchStore";
import { MatchQueue } from "./matchmaking/MatchQueue";
import { SignalingManager } from "./signaling/SignalingManager";

const PORT = parseInt(process.env.WS_PORT || "4000", 10);
const CLIENT_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "InFind Realtime Server" }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const io = new SocketIOServer(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    credentials: true,
    methods: ["GET", "POST"],
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

const matchStore = createMatchStore();
const matchQueue = new MatchQueue(matchStore, io);
const signalingManager = new SignalingManager(io, matchStore, matchQueue);

// Start the queue evaluation loop
matchQueue.start();

// Authentication Middleware
io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;
    let token: string | undefined;

    if (cookieHeader) {
      const parsed = parseCookie(cookieHeader);
      token = parsed[SESSION_COOKIE_NAME];
    }

    // Also support auth query parameter for environments where cookies are segregated
    if (!token && socket.handshake.auth?.token) {
      token = socket.handshake.auth.token;
    }

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const user = await validateTokenAndGetUser(token);
    if (!user) {
      return next(new Error("Invalid or expired session"));
    }

    socket.data.user = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      preferences: user.preference
        ? {
            preferredCountries: JSON.parse(user.preference.preferredCountries || "[]"),
            preferredLanguages: JSON.parse(user.preference.preferredLanguages || "[]"),
            interests: JSON.parse(user.preference.interests || "[]"),
          }
        : { preferredCountries: [], preferredLanguages: [], interests: [] },
    };

    next();
  } catch (err) {
    console.error("[SOCKET_AUTH_ERROR]", err);
    next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket) => {
  const user = socket.data.user;
  console.log(`[SOCKET_CONNECT] User ${user.username} (${user.id}) connected [${socket.id}]`);

  // Register signaling & chat handlers
  signalingManager.registerEvents(socket, user);

  // Matchmaking: Start Searching
  socket.on("match:start", async (customFilters?: { preferredCountries?: string[]; preferredLanguages?: string[]; interests?: string[] }) => {
    const preferences = {
      preferredCountries: customFilters?.preferredCountries || user.preferences.preferredCountries,
      preferredLanguages: customFilters?.preferredLanguages || user.preferences.preferredLanguages,
      interests: customFilters?.interests || user.preferences.interests,
    };

    await matchQueue.enqueue({
      userId: user.id,
      socketId: socket.id,
      username: user.username,
      displayName: user.displayName,
      joinedAt: Date.now(),
      preferences,
      previousPartnerIds: [],
    });

    socket.emit("match:searching");
  });

  // Matchmaking: Cancel Search
  socket.on("match:cancel", async () => {
    await matchQueue.dequeue(user.id);
    socket.emit("match:idle");
  });

  // Disconnection handler
  socket.on("disconnect", async () => {
    console.log(`[SOCKET_DISCONNECT] User ${user.username} (${user.id}) disconnected`);
    await matchQueue.dequeue(user.id);

    const activeMatch = await matchStore.getActiveMatchByUserId(user.id);
    if (activeMatch) {
      const isUser1 = activeMatch.user1.userId === user.id;
      const partnerSocketId = isUser1 ? activeMatch.user2.socketId : activeMatch.user1.socketId;

      await matchQueue.endMatch(activeMatch.matchId, "USER_DISCONNECTED");
      io.to(partnerSocketId).emit("match:ended", {
        matchId: activeMatch.matchId,
        reason: "Stranger disconnected.",
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`⚡ InFind Realtime Server running on port ${PORT}`);
  console.log(`⚡ Client Origin allowed: ${CLIENT_ORIGIN}`);
  console.log(`====================================================`);
});
