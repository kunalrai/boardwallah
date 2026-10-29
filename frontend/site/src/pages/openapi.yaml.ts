import type { APIRoute } from "astro";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { specDir } from "../lib/paths";
import { siteOrigin } from "../lib/site";

export const GET: APIRoute = () => {
  const yaml = readFileSync(join(specDir, "api", "openapi.yaml"), "utf8").replaceAll(
    "https://[your-domain]",
    siteOrigin,
  );
  return new Response(yaml, { headers: { "content-type": "application/yaml; charset=utf-8" } });
};
