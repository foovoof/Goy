# Goy — Recursive OSINT Engine

Goy is a real, running OSINT engine. You submit any indicator (domain, IP,
email, hash, URL, ASN, or a free-text query that contains one), and Goy
pivots recursively across many public sources to build a knowledge graph of
everything reachable.

## What it actually does

1. **Normalize** — detects the type of the input (domain / ipv4 / ipv6 /
   email / md5 / sha1 / sha256 / url / asn / cidr / free-text).
2. **Fan out** — dispatches the indicator to every provider that accepts
   that type. Providers run in parallel with a per-request queue.
3. **Extract** — every provider response is parsed for new indicators
   (subdomains from crt.sh, IPs from DNS, related domains from RDAP,
   hashes from VirusTotal, breached emails from HIBP, etc.).
4. **Pivot** — new indicators are enqueued at `depth + 1` and re-run
   through the fan-out until `MAX_DEPTH` or `MAX_NODES` is reached.
5. **Store** — every node and edge is persisted in Postgres so the graph
   can be re-opened, exported, or extended.

## Sources (real APIs, no mocks)

Always available (no key required):

- **DNS-over-HTTPS** (Cloudflare `1.1.1.1`) — A, AAAA, MX, NS, TXT, CNAME
- **RDAP** (rdap.org) — domain registration + IP allocation
- **crt.sh** — certificate transparency subdomain enumeration
- **Wayback Machine** — CDX index of historical URLs
- **ip-api.com** — IP geolocation + ASN (free tier)
- **HackerTarget** — reverse DNS / hostsearch (free tier, rate-limited)
- **BGPView** — ASN → prefixes and peers

Enabled when keys are provided (add them as env vars on Render):

- **Shodan** (`SHODAN_API_KEY`) — host banners, open ports, vulns
- **VirusTotal v3** (`VIRUSTOTAL_API_KEY`) — file/URL/IP/domain reputation
- **HaveIBeenPwned v3** (`HIBP_API_KEY`) — email breach exposure
- **SecurityTrails** (`SECURITYTRAILS_API_KEY`) — passive DNS, subdomains
- **GitHub** (`GITHUB_TOKEN`) — code search for leaked secrets/mentions
- **ipinfo.io** (`IPINFO_TOKEN`) — richer IP context
- **AbuseIPDB** (`ABUSEIPDB_API_KEY`) — abuse reports
- **urlscan.io** (`URLSCAN_API_KEY`) — screenshots + related domains

## API

`POST /api/search`
```json
{ "query": "example.com", "depth": 3 }
```
returns `{ "jobId": "..." }`.

`GET /api/graph/:jobId` — full graph (nodes + edges).
`GET /api/job/:jobId`   — job status and progress.
`GET /healthz`          — liveness.

## Deploy on Render

1. Push this repo to GitHub.
2. Create a new **Blueprint** on Render pointing at the repo.
3. Render reads `render.yaml`, provisions Postgres and the web service.
4. Add the optional API keys under the service → **Environment**.
5. Open the service URL — the web UI is served from `/`.

## Local development

```bash
cp .env.example .env
# fill DATABASE_URL and optional keys
npm install
npm run migrate
npm run dev
open http://localhost:3000
```

## Safety

Goy queries public, non-authenticated data. It does not attempt to log in
to any third-party service, scrape private accounts, or bypass
authentication. Respect the terms of service of each provider you enable.
