const configuredSite = import.meta.env.PUBLIC_SITE_ORIGIN ?? import.meta.env.SITE_ORIGIN ?? "https://www.boardwallah.space";
const configuredApi = import.meta.env.PUBLIC_API_URL ?? "";

export const siteOrigin = String(configuredSite).replace(/\/$/, "");
export const apiBase = String(configuredApi).replace(/\/$/, "");
export const policyVersion = "1.1";
export const calBookingUrl = "https://cal.com/kunal-rai-p0b1tq";

export function absoluteUrl(path: string): string {
  return new URL(path, `${siteOrigin}/`).toString();
}
