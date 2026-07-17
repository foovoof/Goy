// URL decomposition — pulls the hostname out of a URL as a pivot.
export const urlProvider = {
  name: "url-decompose",
  accepts: ["url"],
  async run(node) {
    try {
      const u = new URL(node.value);
      const edges = [{ relation: "url_host", target: { type: "domain", value: u.hostname.toLowerCase() } }];
      return {
        finding: {
          kind: "url_parts",
          payload: { host: u.hostname, path: u.pathname, protocol: u.protocol, search: u.search },
        },
        edges,
      };
    } catch {
      return null;
    }
  },
};
