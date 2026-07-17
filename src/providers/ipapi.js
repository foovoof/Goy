// ip-api.com free tier — geo + ASN + org. No key.
import { fetchJson } from "../http.js";
import { isPrivateIp } from "../normalize.js";

export const ipApiProvider = {
  name: "ip-api",
  accepts: ["ipv4", "ipv6"],
  async run(node) {
    if (node.type === "ipv4" && isPrivateIp(node.value)) return null;
    const url = `http://ip-api.com/json/${encodeURIComponent(node.value)}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,reverse,query`;
    const { ok, data } = await fetchJson(url);
    if (!ok || !data || data.status !== "success") return null;

    const edges = [];
    if (data.as) {
      const asn = String(data.as).split(/\s+/)[0];
      if (/^AS\d+$/.test(asn)) edges.push({ relation: "announced_by", target: { type: "asn", value: asn } });
    }
    if (data.reverse) {
      edges.push({ relation: "reverse_dns", target: { type: "domain", value: String(data.reverse).toLowerCase() } });
    }
    return { finding: { kind: "ip_geolocation", payload: data }, edges };
  },
};
