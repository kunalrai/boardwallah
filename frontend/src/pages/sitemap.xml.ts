import type { APIRoute } from "astro";
import { loadContent } from "../lib/content";
import { absoluteUrl } from "../lib/site";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export const GET: APIRoute = () => {
  const { provider } = loadContent();
  const paths = [
    "",
    "subjects/",
    "plans/",
    "book/",
    "enquiry/",
    "booking/",
    "policies/privacy/",
    "policies/consent/",
    "policies/cancellation-refund/",
  ];
  const urls = paths.map(
    (path) =>
      `  <url><loc>${escapeXml(absoluteUrl(path))}</loc><lastmod>${escapeXml(provider.last_updated)}</lastmod></url>`,
  );
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
  return new Response(body, { headers: { "content-type": "application/xml; charset=utf-8" } });
};
