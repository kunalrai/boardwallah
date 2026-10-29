const configuredSite = import.meta.env.PUBLIC_SITE_ORIGIN ?? "http://localhost:4321";
const configuredApi = import.meta.env.PUBLIC_API_URL ?? "http://localhost:8787";

export const siteOrigin = String(configuredSite).replace(/\/$/, "");
export const apiBase = String(configuredApi).replace(/\/$/, "");
export const policyVersion = "1.0";

export function absoluteUrl(path: string): string {
  return new URL(path, `${siteOrigin}/`).toString();
}
