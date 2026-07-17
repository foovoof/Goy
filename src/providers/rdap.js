// RDAP via rdap.org — domain registration, nameservers, contacts (redacted).
import { fetchJson } from "../http.js";

export const rdapProvider = {
  name: "rdap",
  accepts: ["domain", "ipv4", "ipv6", "asn"],
  async run(node) {
    let url;
    if (node.type === "domain") url = `https://rdap.org/domain/${encodeURIComponent(node.value)}`;
    else if (node.type === "ipv4" || node.type === "ipv6") url = `https://rdap.org/ip/${encodeURIComponent(node.value)}`;
    else if (node.type === "asn") url = `https://rdap.org/autnum/${node.value.replace(/^AS/, "")}`;
    else return null;

    const { ok, data } = await fetchJson(url);
    if (!ok || !data || typeof data !== "object") return null;

    const edges = [];
    if (Array.isArray(data.nameservers)) {
      for (const ns of data.nameservers) {
        const host = String(ns.ldhName || ns.unicodeName || "").toLowerCase().replace(/\.$/, "");
        if (host) edges.push({ relation: "ns", target: { type: "domain", value: host } });
      }
    }
    if (Array.isArray(data.entities)) {
      for (const ent of data.entities) {
        if (Array.isArray(ent.vcardArray)) {
          for (const entry of ent.vcardArray[1] || []) {
            if (entry[0] === "email" && typeof entry[3] === "string") {
              edges.push({ relation: "contact_email", target: { type: "email", value: entry[3].toLowerCase() } });
            }
          }
        }
      }
    }

    const payload = {
      handle: data.handle,
      ldhName: data.ldhName,
      startAddress: data.startAddress,
      endAddress: data.endAddress,
      name: data.name,
      country: data.country,
      status: data.status,
      events: data.events,
    };
    return { finding: { kind: "rdap", payload }, edges };
  },
};
