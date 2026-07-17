// BGPView — ASN details, prefixes, peers. Free, no key required.
import { fetchJson } from "../http.js";

export const bgpViewProvider = {
  name: "bgpview",
  accepts: ["asn", "ipv4", "ipv6"],
  async run(node) {
    if (node.type === "asn") {
      const asnNumber = node.value.replace(/^AS/, "");
      const { ok, data } = await fetchJson(`https://api.bgpview.io/asn/${asnNumber}`);
      if (!ok || data?.status !== "ok") return null;
      const { data: asn } = data;
      const edges = [];
      const prefixes = await fetchJson(`https://api.bgpview.io/asn/${asnNumber}/prefixes`);
      if (prefixes.ok && prefixes.data?.data?.ipv4_prefixes) {
        for (const p of prefixes.data.data.ipv4_prefixes.slice(0, 50)) {
          if (p.prefix) edges.push({ relation: "announces", target: { type: "cidr", value: p.prefix } });
        }
      }
      return { finding: { kind: "asn_details", payload: asn }, edges };
    }
    const { ok, data } = await fetchJson(`https://api.bgpview.io/ip/${encodeURIComponent(node.value)}`);
    if (!ok || data?.status !== "ok") return null;
    const edges = [];
    for (const p of data.data?.prefixes || []) {
      if (p.asn?.asn) edges.push({ relation: "announced_by", target: { type: "asn", value: `AS${p.asn.asn}` } });
    }
    return { finding: { kind: "bgp_ip", payload: data.data }, edges };
  },
};
