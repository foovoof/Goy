// Shodan host lookup. Requires SHODAN_API_KEY.
import { fetchJson } from "../http.js";

export const shodanProvider = {
  name: "shodan",
  accepts: ["ipv4", "ipv6", "domain"],
  enabled: () => Boolean(process.env.SHODAN_API_KEY),
  async run(node) {
    const key = process.env.SHODAN_API_KEY;
    if (!key) return null;
    let url;
    if (node.type === "domain") url = `https://api.shodan.io/dns/domain/${encodeURIComponent(node.value)}?key=${key}`;
    else url = `https://api.shodan.io/shodan/host/${encodeURIComponent(node.value)}?key=${key}&minify=true`;
    const { ok, data } = await fetchJson(url);
    if (!ok || !data) return null;

    const edges = [];
    if (node.type === "domain") {
      for (const rec of data.data || []) {
        if (rec.type === "A" && rec.value) edges.push({ relation: "resolves_to_ipv4", target: { type: "ipv4", value: rec.value } });
        if (rec.type === "AAAA" && rec.value) edges.push({ relation: "resolves_to_ipv6", target: { type: "ipv6", value: rec.value } });
        if (rec.subdomain) edges.push({ relation: "subdomain", target: { type: "domain", value: `${rec.subdomain}.${node.value}`.toLowerCase() } });
      }
    } else {
      for (const host of data.hostnames || []) {
        edges.push({ relation: "reverse_dns", target: { type: "domain", value: String(host).toLowerCase() } });
      }
      if (data.asn) edges.push({ relation: "announced_by", target: { type: "asn", value: String(data.asn).toUpperCase() } });
    }
    return { finding: { kind: "shodan", payload: data }, edges };
  },
};
