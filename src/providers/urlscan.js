// urlscan.io — search recent scans for a domain/url/IP.
import { fetchJson } from "../http.js";

export const urlscanProvider = {
  name: "urlscan",
  accepts: ["domain", "ipv4", "url"],
  enabled: () => Boolean(process.env.URLSCAN_API_KEY),
  async run(node) {
    const key = process.env.URLSCAN_API_KEY;
    let q;
    if (node.type === "domain") q = `domain:${node.value}`;
    else if (node.type === "ipv4") q = `ip:${node.value}`;
    else q = `page.url:"${node.value}"`;
    const { ok, data } = await fetchJson(`https://urlscan.io/api/v1/search/?q=${encodeURIComponent(q)}&size=20`, {
      headers: { "api-key": key },
    });
    if (!ok || !Array.isArray(data?.results)) return null;
    const edges = [];
    for (const r of data.results) {
      const domain = r.page?.domain;
      const ip = r.page?.ip;
      if (domain && domain !== node.value) edges.push({ relation: "urlscan_domain", target: { type: "domain", value: String(domain).toLowerCase() } });
      if (ip) edges.push({ relation: "urlscan_ip", target: { type: "ipv4", value: ip } });
    }
    return { finding: { kind: "urlscan", payload: { count: data.results.length, results: data.results.slice(0, 10) } }, edges };
  },
};
