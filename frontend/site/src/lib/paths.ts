import { existsSync } from "node:fs";
import { dirname, join, parse } from "node:path";

function findProjectRoot(start: string): string {
  let current = start;
  const root = parse(current).root;
  while (true) {
    if (existsSync(join(current, "spec", "content", "provider.json"))) return current;
    if (current === root) break;
    current = dirname(current);
  }
  throw new Error("Could not find the project spec directory.");
}

export const projectRoot = findProjectRoot(process.cwd());
export const contentDir = join(projectRoot, "spec", "content");
export const policyDir = join(projectRoot, "spec", "policies");
export const specDir = join(projectRoot, "spec");
export const modelDir = join(specDir, "models");
