import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stunUrls = (
    process.env.STUN_SERVERS || "stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302"
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const iceServers: RTCIceServer[] = [
    {
      urls: stunUrls,
    },
  ];

  // If TURN credentials or server are configured:
  const turnServer = process.env.TURN_SERVER_URL;
  const turnUsername = process.env.TURN_USERNAME;
  const turnCredential = process.env.TURN_CREDENTIAL;
  const turnSecret = process.env.TURN_SHARED_SECRET;

  if (turnServer) {
    if (turnSecret) {
      // Ephemeral short-lived TURN credentials (RFC 5766 standard using HMAC-SHA1)
      const expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour validity
      const username = `${expiry}:${user.id}`;
      const hmac = crypto.createHmac("sha1", turnSecret);
      hmac.update(username);
      const credential = hmac.digest("base64");

      iceServers.push({
        urls: [turnServer],
        username,
        credential,
      });
    } else if (turnUsername && turnCredential) {
      // Static configured TURN
      iceServers.push({
        urls: [turnServer],
        username: turnUsername,
        credential: turnCredential,
      });
    }
  }

  return NextResponse.json({
    iceServers,
    iceTransportPolicy: process.env.FORCE_TURN_RELAY === "true" ? "relay" : "all",
  });
}
