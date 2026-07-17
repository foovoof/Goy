// GitHub code search — surfaces mentions of a domain/email/hash in public code.
import { fetchJson } from "../http.js";

export const githubProvider = {
  name: "github",
  accepts: ["domain", "email", "sha256", "sha1", "md5"],
  enabled: () => Boolean(process.env.GITHUB_TOKEN),
  async run(node) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) return null;
    const q = `"${node.value}"`;
    const { ok, data } = await fetchJson(`https://api.github.com/search/code?q=${encodeURIComponent(q)}&per_page=20`, {
      headers: {
        authorization: `Bearer ${token}`,
        accept: "application/vnd.github+json",
        "x-github-api-version": "2022-11-28",
      },
    });
    if (!ok || !Array.isArray(data?.items)) return null;
    const items = data.items.map((it) => ({
      repo: it.repository?.full_name,
      path: it.path,
      html_url: it.html_url,
    }));
    return { finding: { kind: "github_code_matches", payload: { total: data.total_count, items } }, edges: [] };
  },
};
