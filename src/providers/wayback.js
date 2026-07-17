// Wayback Machine CDX index — historical URLs seen for a host.
import { fetchJson } from "../http.js";

export const waybackProvider = {
  name: "wayback",
  accepts: ["domain", "url"],
  async run(node) {
    const host = node.type === "url" ? new URL(node.value).hostname : node.value;
    const url = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(host)}/*&output=json&fl=timestamp,original,statuscode&collapse=urlkey&limit=200`;
    const { ok, data } = await fetchJson(url, { timeout: 20_000 });
    if (!ok || !Array.isArray(data) || data.length < 2) return null;

    const urls = data.slice(1).map((row) => ({ ts: row[0], url: row[1], status: row[2] }));
    return {
      finding: { kind: "wayback_snapshots", payload: { count: urls.length, samples: urls.slice(0, 20) } },
      edges: [],
    };
  },
};
