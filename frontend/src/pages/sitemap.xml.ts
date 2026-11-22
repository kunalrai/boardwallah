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
    "resources/life-processes/",
    "resources/control-and-coordination/",
    "resources/how-do-organisms-reproduce/",
    "resources/heredity/",
    "resources/our-environment/",
    "resources/the-rise-of-nationalism-in-europe/",
    "resources/nationalism-in-india/",
    "resources/the-making-of-a-global-world/",
    "resources/print-culture-and-the-modern-world/",
    "resources/power-sharing/",
    "resources/federalism/",
    "resources/gender-religion-and-caste/",
    "resources/political-parties/",
    "resources/outcomes-of-democracy/",
    "resources/development/",
    "resources/sectors-of-the-indian-economy/",
    "resources/money-and-credit/",
    "resources/globalisation-and-the-indian-economy/",
    "resources/resources-and-development/",
    "resources/forest-and-wildlife-resources/",
    "resources/water-resources/",
    "resources/agriculture/",
    "resources/minerals-and-energy-resources/",
    "resources/manufacturing-industries/",
    "resources/lifelines-of-national-economy/",
    "resources/hindi-vyavaharik-vyakaran/",
    "resources/hindi-kshitij-gadhya-khand/",
    "resources/hindi-kshitij-kavya-khand/",
    "resources/hindi-kritika/",
    "resources/hindi-rachanatmak-lekhan/",
    "resources/english-first-flight-prose/",
    "resources/english-first-flight-poetry/",
    "resources/english-footprints-without-feet/",
    "resources/english-grammar-and-writing/",
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
