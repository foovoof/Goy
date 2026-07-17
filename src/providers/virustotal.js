// VirusTotal v3. Requires VIRUSTOTAL_API_KEY.
import { fetchJson } from "../http.js";

export const virustotalProvider = {
  name: "virustotal",
  accepts: ["domain", "ipv4", "url", "md5", "sha1", "sha256"],
  enabled: () => Boolean(process.env.VIRUSTOTAL_API_KEY),
  async run(node) {
    const key = process.env.VIRUSTOTAL_API_KEY;
    if (!key) return null;
    let path;
    if (node.type === "domain") path = `domains/${encodeURIComponent(node.value)}`;
    else if (node.type === "ipv4") path = `ip_addresses/${encodeURIComponent(node.value)}`;
    else if (node.type === "url") path = `urls/${Buffer.from(node.value).toString("base64url").replace(/=+$/, "")}`;
    else path = `files/${node.value}`;

    const { ok, data } = await fetchJson(`https://www.virustotal.com/api/v3/${path}`, {
      headers: { "x-apikey": key },
    });
    if (!ok || !data?.data) return null;
    return { finding: { kind: "virustotal", payload: data.data.attributes || data.data }, edges: [] };
  },
};
