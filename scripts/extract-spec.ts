import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, normalize } from "node:path";

const root = join(import.meta.dir, "..");
const source = await readFile(join(root, "spec.md"), "utf8");

const pattern =
  /^### ([A-Za-z0-9_./-]+)\r?\n(?:[ \t]*\r?\n)?```(json|yaml|gherkin|markdown)\r?\n([\s\S]*?)\r?\n```/gm;

let count = 0;
for (const match of source.matchAll(pattern)) {
  const [, relativePath, , body] = match;
  if (!relativePath || body === undefined) continue;
  const target = normalize(join(root, "spec", relativePath));
  if (!target.startsWith(join(root, "spec"))) {
    throw new Error(`Refusing to write outside spec/: ${relativePath}`);
  }
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, `${body.replace(/\r\n/g, "\n")}\n`, "utf8");
  count += 1;
}

console.log(`Extracted ${count} spec files into spec/`);
