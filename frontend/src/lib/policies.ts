import { readFileSync } from "node:fs";
import { join } from "node:path";
import { policyDir } from "./paths";

export interface Policy {
  slug: string;
  title: string;
  description: string;
  markdown: string;
}

const metadata: Record<string, { title: string; description: string }> = {
  privacy: {
    title: "Privacy policy",
    description: "What the tuition service collects, why it collects it, and how long it keeps it.",
  },
  consent: {
    title: "Consent policy",
    description: "How parent consent is requested and verified for a minor's trial booking.",
  },
  "cancellation-refund": {
    title: "Cancellation and refund policy",
    description: "Trial cancellation, paid-plan refunds, missed sessions and tutor replacement.",
  },
};

export const policySlugs = ["privacy", "consent", "cancellation-refund"];

export function loadPolicy(slug: string): Policy {
  const meta = metadata[slug];
  if (!meta) throw new Error(`Unknown policy: ${slug}`);
  const markdown = readFileSync(join(policyDir, `${slug}.md`), "utf8");
  return { slug, ...meta, markdown };
}
