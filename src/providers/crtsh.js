// crt.sh certificate transparency — subdomain enumeration. Free, no key.
import { fetchJson } from "../http.js";

export const crtshProvider = {
  name: "crtsh",
  accepts: ["domain"],
  async run(node) {
    const url = `https://crt.sh/?q=%25.${encodeURIComponent(node.value)}&output=json`;
    const { ok, data } = await fetchJson(url, { timeout: 20_000 });
    if (!ok || !Array.isArray(data)) return null;

    const subdomains = new Set();
    for (const row of data) {
      const names = String(row.name_value || "").split(/\n/);
      for (const n of names) {
        const host = n.trim().toLowerCase().replace(/^\*\./, "");
        if (!host || host === node.value) continue;
        if (host.endsWith(`.${node.value}`)) subdomains.add(host);
      }
    }
    if (!subdomains.size) return null;

    const edges = [...subdomains].slice(0, 500).map((sd) => ({
      relation: "subdomain",
      target: { type: "domain", value: sd },
    }));
    return {
      finding: { kind: "certificate_transparency", payload: { count: subdomains.size } },
      edges,
    };
  },
};
