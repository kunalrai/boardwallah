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
    "enquiry/",
    "booking/",
    "login/",
    "policies/privacy/",
    "policies/consent/",
    "policies/cancellation-refund/",
    "resources/",
    "resources/real-numbers/",
    "resources/polynomials/",
    "resources/linear-equations-in-two-variables/",
    "resources/quadratic-equations/",
    "resources/arithmetic-progressions/",
    "resources/triangles/",
    "resources/coordinate-geometry/",
    "resources/introduction-to-trigonometry/",
    "resources/applications-of-trigonometry/",
    "resources/circles/",
    "resources/areas-related-to-circles/",
    "resources/surface-areas-and-volumes/",
    "resources/statistics/",
    "resources/probability/",
    "resources/chemical-reactions-equations/",
    "resources/acids-bases-salts/",
    "resources/metals-non-metals/",
    "resources/carbon-and-its-compounds/",
    "resources/light-reflection-refraction/",
    "resources/human-eye-colourful-world/",
    "resources/electricity/",
    "resources/magnetic-effects-electric-current/",
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
