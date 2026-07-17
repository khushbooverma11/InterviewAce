# Self-Hosted Coturn Setup Guide

This guide walks through provisioning a Coturn TURN server on a cheap VPS and
wiring it into the InterviewAce API server. Once done, set two environment
variables (`COTURN_HOST` and `COTURN_SECRET`) and the app switches from
OpenRelay's public test servers to your private, dedicated TURN relay.

---

## 1. Choose a VPS Provider

Coturn is extremely lightweight — 1 vCPU + 1 GB RAM comfortably handles hundreds
of simultaneous relayed calls. Bandwidth is the main cost.

| Provider | Cheapest plan | Monthly cost | Notes |
|---|---|---|---|
| **Hetzner** | CX11 (1 vCPU, 2 GB, 20 TB traffic) | ~€4 | Best value in EU |
| **DigitalOcean** | Droplet (1 vCPU, 1 GB, 1 TB traffic) | $6 | Easy UI, NYC/EU/SG |
| **Vultr** | 1 vCPU, 1 GB, 2 TB traffic | $5 | Many regions |
| **Oracle Cloud** | ARM VM (4 vCPU, 24 GB, unlimited!) | **Free** | Requires credit card |
| **Fly.io** | Shared 1 CPU, 256 MB | ~$2 | Good if API is on Fly too |

**Pick a region close to your users.** TURN adds a relay hop — latency matters.
If most users are in the US, pick US-East or US-West. EU users → Frankfurt/Amsterdam.

---

## 2. Create the Server

Example using DigitalOcean (steps are similar for any provider):

1. Create a Droplet → Ubuntu 24.04 LTS → Basic plan → $6/month
2. Add your SSH public key during creation
3. Note the server's **public IP address** — you'll need it throughout this guide

---

## 3. Point a Subdomain at the Server (Required for TLS)

Add a DNS A record:

```
turn.yourdomain.com  →  <server public IP>
```

Use whatever domain registrar you own (Cloudflare, Namecheap, etc.). TLS
(`turns:` protocol) requires a proper hostname — IP addresses don't work with
Let's Encrypt.

If you skip TLS, voice calls still work over `turn:` (UDP/TCP), but they may
be blocked on very restrictive corporate firewalls. **TLS is strongly recommended.**

---

## 4. Install Coturn and Certbot

SSH into the server:

```bash
ssh root@<server-ip>
```

Install Coturn and Certbot (for Let's Encrypt TLS):

```bash
apt update && apt upgrade -y
apt install -y coturn certbot
```

Enable the Coturn daemon:

```bash
# Tell the init system to actually start coturn on boot
sed -i 's/#TURNSERVER_ENABLED=1/TURNSERVER_ENABLED=1/' /etc/default/coturn
```

---

## 5. Get a TLS Certificate

```bash
# Stop anything on port 80 temporarily
systemctl stop apache2 2>/dev/null; systemctl stop nginx 2>/dev/null

certbot certonly --standalone -d turn.yourdomain.com
```

Certbot writes the certificate to:
- `/etc/letsencrypt/live/turn.yourdomain.com/fullchain.pem`
- `/etc/letsencrypt/live/turn.yourdomain.com/privkey.pem`

Auto-renew is already handled by Certbot's systemd timer. Coturn will need to
be reloaded after renewal — add a deploy hook:

```bash
cat > /etc/letsencrypt/renewal-hooks/deploy/restart-coturn.sh << 'EOF'
#!/bin/sh
systemctl reload coturn
EOF
chmod +x /etc/letsencrypt/renewal-hooks/deploy/restart-coturn.sh
```

---

## 6. Generate the Shared Secret

This secret is used by the API server to sign HMAC credentials and by Coturn
to verify them. Generate a strong random value:

```bash
openssl rand -hex 32
# Example output: a3f9b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1
```

**Save this value** — you will set it as `COTURN_SECRET` in the API server.

---

## 7. Configure Coturn

Replace the default config file:

```bash
cat > /etc/turnserver.conf << 'EOF'
# Network
listening-port=3478
tls-listening-port=5349
listening-ip=0.0.0.0
relay-ip=<SERVER_PUBLIC_IP>       # ← replace with your server's public IP
external-ip=<SERVER_PUBLIC_IP>    # ← same

# Realm (any string — typically your domain)
realm=turn.yourdomain.com         # ← replace with your domain

# HMAC REST API auth (credentials are generated server-side and expire after TTL)
use-auth-secret
static-auth-secret=<YOUR_SECRET>  # ← replace with the secret from Step 6

# TLS
cert=/etc/letsencrypt/live/turn.yourdomain.com/fullchain.pem
pkey=/etc/letsencrypt/live/turn.yourdomain.com/privkey.pem

# Performance & security
no-multicast-peers
no-loopback-peers
denied-peer-ip=10.0.0.0-10.255.255.255
denied-peer-ip=192.168.0.0-192.168.255.255
denied-peer-ip=172.16.0.0-172.31.255.255
fingerprint
lt-cred-mech

# Logging (optional — remove in production to reduce I/O)
verbose
log-file=/var/log/coturn/turnserver.log
EOF
```

---

## 8. Open Firewall Ports

Coturn needs several ports open. On the VPS provider's firewall panel **and**
the server's local firewall:

```bash
# UFW (Ubuntu's firewall)
ufw allow 22/tcp        # SSH — keep this!
ufw allow 3478/tcp      # TURN TCP
ufw allow 3478/udp      # TURN UDP
ufw allow 5349/tcp      # TURNS (TLS)
ufw allow 49152:65535/udp  # Relay UDP port range (Coturn default)
ufw enable
```

Also open the same ports in your **VPS provider's firewall** (DigitalOcean →
Networking → Firewalls; Hetzner → Firewall rules; etc.).

---

## 9. Start Coturn and Verify

```bash
mkdir -p /var/log/coturn
systemctl enable coturn
systemctl start coturn
systemctl status coturn   # should show "active (running)"
```

Test that the TURN port is reachable from your laptop:

```bash
# Install turnutils if not present: apt install coturn
turnutils_uclient -T -u testuser -w testpass turn.yourdomain.com
# You should see relay attempts, not immediate connection refused
```

Or use the browser-based tester at https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/ —
add your TURN server URL and HMAC credentials to verify connectivity end-to-end.

---

## 10. Set Environment Variables in the API Server

### On Replit (current hosting)

1. Open **Secrets** in the Replit sidebar
2. Add:
   - `COTURN_HOST` = `turn.yourdomain.com`
   - `COTURN_SECRET` = `<the secret from Step 6>`
3. Restart the API Server workflow

### On Railway / Fly.io / Render (after hosting migration)

Set these as environment variables in your service's dashboard or CLI:

```bash
# Railway
railway variables set COTURN_HOST=turn.yourdomain.com
railway variables set COTURN_SECRET=<your-secret>

# Fly.io
fly secrets set COTURN_HOST=turn.yourdomain.com COTURN_SECRET=<your-secret>

# Render
# Set in the Render dashboard → Service → Environment
```

---

## 11. Remove Old Variables (Cleanup)

Once `COTURN_HOST` and `COTURN_SECRET` are set and tested, remove these from
your secrets — they're no longer needed:

- `METERED_API_KEY`
- `METERED_APP_NAME`

---

## How the Credential Flow Works

```
1. Mobile app requests ICE servers
   GET /api/ice-servers  (authenticated)

2. API server generates time-limited credentials on the fly
   username   = "<unix-timestamp + 24h>:interviewace"
   credential = HMAC-SHA1(COTURN_SECRET, username) → base64

3. API returns iceServers list to the app
   { urls: "turn:turn.yourdomain.com:3478", username, credential }

4. WebRTC uses these credentials to authenticate with Coturn
   Coturn verifies: HMAC-SHA1(secret, username) == credential
   AND: current_time < timestamp embedded in username
   → allows relay if valid, rejects if expired or tampered

5. After 24h the credential expires automatically
   Next ICE negotiation fetches fresh credentials from /api/ice-servers
```

The TURN secret **never leaves your server**. Credentials are scoped to 24 hours
and tied to the username format — even if intercepted they can't be reused after
expiry and can't reveal the underlying secret.

---

## Monitoring and Scaling

**Check active connections:**
```bash
netstat -an | grep 3478 | wc -l
```

**Check bandwidth usage:**
```bash
vnstat -d   # daily; install with: apt install vnstat
```

**When to scale up:**
- More than ~500 simultaneous relayed calls → upgrade to 2 vCPU / 2 GB RAM
- Approaching VPS bandwidth cap → upgrade plan or add a second regional instance

**Multi-region (advanced):**  
For users in different continents, run one Coturn per region and pick the nearest
one server-side based on the user's IP geolocation. Each instance has the same
`COTURN_SECRET` — credentials are interchangeable.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `connection refused` on port 3478 | Firewall not open | Open port in VPS + UFW |
| Coturn starts but calls still fail | `relay-ip` wrong | Set `relay-ip` to public IP, not private |
| TLS errors | Certificate path wrong | Check paths in `turnserver.conf` match Let's Encrypt output |
| Credentials rejected | Secret mismatch | Ensure `COTURN_SECRET` in API === `static-auth-secret` in coturn.conf |
| Works on WiFi, fails on mobile data | Carrier-grade NAT | Confirm TURN UDP port 3478 is open; test with `turns:` port 5349 |
| High CPU on Coturn server | Too many relayed calls | Upgrade VPS; most calls should be direct P2P via STUN |

---

*Once `COTURN_HOST` and `COTURN_SECRET` are set in the API server environment,
the `/api/ice-servers` route automatically switches from OpenRelay to your private
Coturn instance. No app code changes required.*
