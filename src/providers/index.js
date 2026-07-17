import { dnsProvider } from "./dns.js";
import { rdapProvider } from "./rdap.js";
import { crtshProvider } from "./crtsh.js";
import { waybackProvider } from "./wayback.js";
import { ipApiProvider } from "./ipapi.js";
import { hackerTargetProvider } from "./hackertarget.js";
import { bgpViewProvider } from "./bgpview.js";
import { shodanProvider } from "./shodan.js";
import { virustotalProvider } from "./virustotal.js";
import { hibpProvider } from "./hibp.js";
import { securityTrailsProvider } from "./securitytrails.js";
import { githubProvider } from "./github.js";
import { ipinfoProvider } from "./ipinfo.js";
import { abuseIpDbProvider } from "./abuseipdb.js";
import { urlscanProvider } from "./urlscan.js";
import { urlProvider } from "./url.js";
import { emailProvider } from "./email.js";

export const allProviders = [
  urlProvider,
  emailProvider,
  dnsProvider,
  rdapProvider,
  crtshProvider,
  waybackProvider,
  ipApiProvider,
  hackerTargetProvider,
  bgpViewProvider,
  shodanProvider,
  virustotalProvider,
  hibpProvider,
  securityTrailsProvider,
  githubProvider,
  ipinfoProvider,
  abuseIpDbProvider,
  urlscanProvider,
];

export function providersFor(type) {
  return allProviders.filter((p) => p.accepts.includes(type) && (!p.enabled || p.enabled()));
}

export function enabledProviders() {
  return allProviders.filter((p) => !p.enabled || p.enabled()).map((p) => p.name);
}
