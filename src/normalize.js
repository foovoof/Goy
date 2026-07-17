// Detect the type of an indicator and normalize it into a canonical form.
// Types: domain, ipv4, ipv6, cidr, email, url, md5, sha1, sha256, asn, text

const RE = {
  ipv4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
  ipv6: /^[0-9a-fA-F:]+$/,
  cidr: /^([^/\s]+)\/(\d{1,3})$/,
  domain: /^(?=.{1,253}$)(?!-)(?:[a-zA-Z0-9-]{1,63}(?<!-)\.)+[a-zA-Z]{2,63}$/,
  email: /^[^\s@]+@([^\s@]+\.[^\s@]+)$/,
  url: /^https?:\/\/[^\s]+$/i,
  md5: /^[a-f0-9]{32}$/i,
  sha1: /^[a-f0-9]{40}$/i,
  sha256: /^[a-f0-9]{64}$/i,
  asn: /^AS?\d+$/i,
};

export function detect(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return { type: "text", value: "" };

  if (RE.url.test(s)) return { type: "url", value: s };
  if (RE.email.test(s)) return { type: "email", value: s.toLowerCase() };
  if (RE.ipv4.test(s)) return { type: "ipv4", value: s };
  if (RE.cidr.test(s)) {
    const [, base, mask] = s.match(RE.cidr);
    if (RE.ipv4.test(base) || RE.ipv6.test(base)) {
      return { type: "cidr", value: `${base}/${mask}` };
    }
  }
  if (s.includes(":") && RE.ipv6.test(s)) return { type: "ipv6", value: s.toLowerCase() };
  if (RE.md5.test(s)) return { type: "md5", value: s.toLowerCase() };
  if (RE.sha1.test(s)) return { type: "sha1", value: s.toLowerCase() };
  if (RE.sha256.test(s)) return { type: "sha256", value: s.toLowerCase() };
  if (RE.asn.test(s)) return { type: "asn", value: s.toUpperCase().replace(/^AS?/, "AS") };
  if (RE.domain.test(s)) return { type: "domain", value: s.toLowerCase() };

  return { type: "text", value: s };
}

// Extract every indicator we can find inside an arbitrary string / object.
export function extractIndicators(input) {
  const text = typeof input === "string" ? input : JSON.stringify(input ?? "");
  const found = new Map();

  const patterns = [
    ["email", /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g],
    ["url", /https?:\/\/[^\s"'<>()]+/gi],
    ["ipv4", /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g],
    ["sha256", /\b[a-f0-9]{64}\b/gi],
    ["sha1", /\b[a-f0-9]{40}\b/gi],
    ["md5", /\b[a-f0-9]{32}\b/gi],
    ["asn", /\bAS\d{1,7}\b/g],
    // Domain last so hex hashes don't get matched here.
    ["domain", /\b(?=[a-z0-9-]{1,63}\.)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.){1,}[a-z]{2,24}\b/gi],
  ];

  for (const [type, re] of patterns) {
    const matches = text.match(re) || [];
    for (const m of matches) {
      const { type: t, value } = detect(m);
      if (t === "text") continue;
      // Ignore common noise domains.
      if (t === "domain" && /^(w3\.org|schema\.org|example\.(com|org|net))$/.test(value)) continue;
      const key = `${t}:${value}`;
      if (!found.has(key)) found.set(key, { type: t, value });
    }
  }
  return [...found.values()];
}

export function isPrivateIp(ip) {
  if (!RE.ipv4.test(ip)) return false;
  const [a, b] = ip.split(".").map(Number);
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}
