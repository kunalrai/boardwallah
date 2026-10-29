import type { APIRoute } from "astro";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { modelDir } from "../../../lib/paths";
import { siteOrigin } from "../../../lib/site";

export function getStaticPaths() {
  return readdirSync(modelDir)
    .filter((file) => file.endsWith(".schema.json"))
    .map((file) => ({ params: { name: file.replace(/\.schema\.json$/, "") } }));
}

export const GET: APIRoute = ({ params }) => {
  const name = params.name;
  if (!name || !/^[a-z-]+$/.test(name)) return new Response("Not found", { status: 404 });
  try {
    const json = readFileSync(join(modelDir, `${name}.schema.json`), "utf8").replaceAll(
      "https://[your-domain]",
      siteOrigin,
    );
    return new Response(json, { headers: { "content-type": "application/schema+json; charset=utf-8" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
};
