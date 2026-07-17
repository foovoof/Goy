// AbuseIPDB reports. Requires ABUSEIPDB_API_KEY.
import { fetchJson } from "../http.js";

export const abuseIpDbProvider = {
  name: "abuseipdb",
  accepts: ["ipv4"],
  enabled: () => Boolean(process.env.ABUSEIPDB_API_KEY),
  async run(node) {
    const key = process.env.ABUSEIPDB_API_KEY;
    const { ok, data } = await fetchJson(`https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(node.value)}&maxAgeInDays=90&verbose`, {
      headers: { key, accept: "application/json" },
    });
    if (!ok || !data?.data) return null;
    return { finding: { kind: "abuseipdb", payload: data.data }, edges: [] };
  },
};
