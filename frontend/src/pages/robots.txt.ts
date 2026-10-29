import type { APIRoute } from "astro";
import { absoluteUrl } from "../lib/site";

export const GET: APIRoute = () => {
  const body = ["User-agent: *", "Allow: /", "", `Sitemap: ${absoluteUrl("sitemap.xml")}`, ""].join("\n");
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
};
