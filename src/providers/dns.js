// DNS-over-HTTPS via Cloudflare 1.1.1.1 — no key needed.
import { fetchJson } from "../http.js";

const TYPES = ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA"];

export const dnsProvider = {
  name: "dns",
  accepts: ["domain"],
  async run(node) {
    const results = [];
    for (const type of TYPES) {
      const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(node.value)}&type=${type}`;
      const { ok, data } = await fetchJson(url, { headers: { accept: "application/dns-json" } });
      if (!ok || !data?.Answer) continue;
      for (const ans of data.Answer) {
        results.push({ type, name: ans.name, data: ans.data, ttl: ans.TTL });
      }
    }
    if (!results.length) return null;

    const edges = [];
    for (const r of results) {
      if (r.type === "A" || r.type === "AAAA") {
        edges.push({
          relation: r.type === "A" ? "resolves_to_ipv4" : "resolves_to_ipv6",
          target: { type: r.type === "A" ? "ipv4" : "ipv6", value: r.data },
        });
      } else if (r.type === "MX") {
        const host = String(r.data).split(/\s+/).pop()?.replace(/\.$/, "");
        if (host) edges.push({ relation: "mx", target: { type: "domain", value: host.toLowerCase() } });
      } else if (r.type === "NS") {
        const host = String(r.data).replace(/\.$/, "").toLowerCase();
        edges.push({ relation: "ns", target: { type: "domain", value: host } });
      } else if (r.type === "CNAME") {
        const host = String(r.data).replace(/\.$/, "").toLowerCase();
        edges.push({ relation: "cname", target: { type: "domain", value: host } });
      }
    }
    return { finding: { kind: "dns_records", payload: results }, edges };
  },
};
