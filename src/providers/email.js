// Email decomposition — pulls the domain from an email as a pivot.
export const emailProvider = {
  name: "email-decompose",
  accepts: ["email"],
  async run(node) {
    const domain = node.value.split("@")[1];
    if (!domain) return null;
    return {
      finding: { kind: "email_parts", payload: { domain } },
      edges: [{ relation: "email_domain", target: { type: "domain", value: domain.toLowerCase() } }],
    };
  },
};
