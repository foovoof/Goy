// ipinfo.io lite — richer IP metadata. Requires IPINFO_TOKEN.
import { fetchJson } from "../http.js";
import { isPrivateIp } from "../normalize.js";

export const ipinfoProvider = {
  name: "ipinfo",
  accepts: ["ipv4", "ipv6"],
  enabled: () => Boolean(process.env.IPINFO_TOKEN),
  async run(node) {
    if (node.type === "ipv4" && isPrivateIp(node.value)) return null;
    const token = process.env.IPINFO_TOKEN;
    const { ok, data } = await fetchJson(`https://ipinfo.io/${encodeURIComponent(node.value)}?token=${token}`);
    if (!ok || !data) return null;
    const edges = [];
    if (data.org) {
      const asn = String(data.org).split(/\s+/)[0];
      if (/^AS\d+$/i.test(asn)) edges.push({ relation: "announced_by", target: { type: "asn", value: asn.toUpperCase() } });
    }
    if (data.hostname) edges.push({ relation: "reverse_dns", target: { type: "domain", value: String(data.hostname).toLowerCase() } });
    return { finding: { kind: "ipinfo", payload: data }, edges };
  },
};
