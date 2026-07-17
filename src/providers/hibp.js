// HaveIBeenPwned v3. Requires HIBP_API_KEY.
import { fetchJson } from "../http.js";

export const hibpProvider = {
  name: "hibp",
  accepts: ["email"],
  enabled: () => Boolean(process.env.HIBP_API_KEY),
  async run(node) {
    const key = process.env.HIBP_API_KEY;
    if (!key) return null;
    const url = `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(node.value)}?truncateResponse=false`;
    const { ok, status, data } = await fetchJson(url, { headers: { "hibp-api-key": key } });
    if (status === 404) return { finding: { kind: "hibp_clean", payload: { breaches: [] } }, edges: [] };
    if (!ok || !Array.isArray(data)) return null;
    const edges = data
      .filter((b) => b.Domain)
      .map((b) => ({ relation: "breached_at", target: { type: "domain", value: String(b.Domain).toLowerCase() } }));
    return { finding: { kind: "hibp_breaches", payload: { count: data.length, breaches: data } }, edges };
  },
};
