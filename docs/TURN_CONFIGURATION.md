# InFind STUN & TURN Infrastructure Setup Guide

WebRTC connections rely on Interactive Connectivity Establishment (ICE) to negotiate media channels between two peers.

---

## 1. Why STUN and TURN are Required

- **STUN (Session Traversal Utilities for NAT):** Discovers the client's public IP and port when behind standard NAT routers. Default public Google STUN servers (`stun:stun.l.google.com:19302`) work for ~80% of network environments.
- **TURN (Traversal Using Relays around NAT):** When peers are behind symmetric NATs, cellular carriers, or strict corporate firewalls, direct P2P UDP packet transmission fails. A TURN server acts as a secure media relay so calls always connect.

---

## 2. Deploying a Dedicated Coturn Server

### Option A: Docker Deployment

```bash
docker run -d --net=host \
  --name coturn \
  coturn/coturn \
  -n --log-file=stdout \
  --min-port=49152 --max-port=65535 \
  --fingerprint --lt-cred-mech \
  --realm=turn.yourdomain.com \
  --use-auth-secret \
  --static-auth-secret="YOUR_RANDOM_HIGH_ENTROPY_SECRET"
```

### Option B: Ubuntu / Debian Server

1. Install Coturn:
   ```bash
   sudo apt-get update && sudo apt-get install -y coturn
   ```

2. Edit `/etc/turnserver.conf`:
   ```ini
   listening-port=3478
   tls-listening-port=5349
   min-port=49152
   max-port=65535
   realm=turn.yourdomain.com
   fingerprint
   lt-cred-mech
   use-auth-secret
   static-auth-secret=YOUR_RANDOM_HIGH_ENTROPY_SECRET
   total-quota=100
   bps-capacity=0
   stale-nonce
   no-loopback-peers
   no-multicast-peers
   ```

3. Enable and restart the service:
   ```bash
   sudo systemctl enable coturn
   sudo systemctl restart coturn
   ```

4. Firewall Rules:
   - Allow UDP and TCP port `3478` (STUN/TURN)
   - Allow UDP and TCP port `5349` (TURNS TLS)
   - Allow UDP ports `49152:65535` (Dynamic relay traffic)

---

## 3. Configuring InFind Environment

Add the following to your InFind `.env` file:

```env
# URL of your TURN server (e.g. turn:turn.yourdomain.com:3478?transport=udp)
TURN_SERVER_URL="turn:turn.yourdomain.com:3478?transport=udp"

# The shared secret matching `static-auth-secret` in your Coturn configuration
TURN_SHARED_SECRET="YOUR_RANDOM_HIGH_ENTROPY_SECRET"

# Optional: Force all WebRTC traffic through TURN relay for 100% peer IP concealment
FORCE_TURN_RELAY="false"
```

InFind's `/api/rtc/turn-credentials` endpoint will automatically generate ephemeral HMAC-SHA1 credentials for authenticated users with a 1-hour expiration.
