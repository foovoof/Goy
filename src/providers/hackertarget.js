// HackerTarget hostsearch — reverse-DNS / subdomain listing. Free tier, rate-limited.
import { fetchText } from "../http.js";

export const hackerTargetProvider = {
  name: "hackertarget",
  accepts: ["domain", "ipv4"],
  async run(node) {
    const endpoint = node.type === "domain" ? "hostsearch" : "reverseiplookup";
    const url = `https://api.hackertarget.com/${endpoint}/?q=${encodeURIComponent(node.value)}`;
    const { ok, data } = await fetchText(url);
    if (!ok || !data || /error|API count exceeded/i.test(data)) return null;

    const edges = [];
    for (const line of String(data).split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (node.type === "domain") {
        const [host, ip] = trimmed.split(",");
        if (host && host !== node.value) {
          edges.push({ relation: "subdomain", target: { type: "domain", value: host.toLowerCase() } });
        }
        if (ip && /^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
          edges.push({ relation: "resolves_to_ipv4", target: { type: "ipv4", value: ip } });
        }
      } else {
        edges.push({ relation: "hosted_domain", target: { type: "domain", value: trimmed.toLowerCase() } });
      }
    }
    if (!edges.length) return null;
    return { finding: { kind: "hackertarget", payload: { count: edges.length } }, edges: edges.slice(0, 200) };
  },
};
