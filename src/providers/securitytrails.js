// SecurityTrails passive DNS + subdomains. Requires SECURITYTRAILS_API_KEY.
import { fetchJson } from "../http.js";

export const securityTrailsProvider = {
  name: "securitytrails",
  accepts: ["domain", "ipv4"],
  enabled: () => Boolean(process.env.SECURITYTRAILS_API_KEY),
  async run(node) {
    const key = process.env.SECURITYTRAILS_API_KEY;
    if (!key) return null;
    if (node.type === "domain") {
      const { ok, data } = await fetchJson(`https://api.securitytrails.com/v1/domain/${encodeURIComponent(node.value)}/subdomains?children_only=false`, { headers: { APIKEY: key } });
      if (!ok || !Array.isArray(data?.subdomains)) return null;
      const edges = data.subdomains.slice(0, 300).map((sd) => ({
        relation: "subdomain",
        target: { type: "domain", value: `${sd}.${node.value}`.toLowerCase() },
      }));
      return { finding: { kind: "securitytrails_subdomains", payload: { count: data.subdomains.length } }, edges };
    }
    const { ok, data } = await fetchJson(`https://api.securitytrails.com/v1/ips/nearby/${encodeURIComponent(node.value)}`, { headers: { APIKEY: key } });
    if (!ok || !data) return null;
    return { finding: { kind: "securitytrails_ip", payload: data }, edges: [] };
  },
};
