import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { buildIconSprite, loadIconRegistry } from "./icon-tools.mjs";

const args = process.argv.slice(2);
const aliases = [];
let outputPath = null;
let htmlPath = null;
let includeAll = false;

for (let index = 0; index < args.length; index += 1) {
  const argument = args[index];
  if (argument === "--") continue;
  else if (argument === "--alias") aliases.push(args[++index]);
  else if (argument === "--aliases") aliases.push(...args[++index].split(",").map(value => value.trim()).filter(Boolean));
  else if (argument === "--out") outputPath = resolve(args[++index]);
  else if (argument === "--html") htmlPath = resolve(args[++index]);
  else if (argument === "--all") includeAll = true;
  else if (argument === "--help") {
    console.log("Usage: node scripts/export-icon-sprite.mjs (--alias <semantic/name> ... | --all) [--out <sprite.svg> | --html <page.html>]");
    process.exit(0);
  } else {
    throw new Error(`Unknown argument: ${argument}`);
  }
}

if (outputPath && htmlPath) throw new Error("Choose either --out or --html, not both");
const registry = await loadIconRegistry();
const selectedAliases = includeAll ? Object.keys(registry.aliases) : aliases;
if (selectedAliases.length === 0) throw new Error("Provide at least one --alias, --aliases, or --all");

for (const alias of selectedAliases) {
  if (!registry.aliases[alias]) throw new Error(`Unknown icon alias: ${alias}`);
}

const sprite = await buildIconSprite(selectedAliases, registry);

if (htmlPath) {
  const startMarker = "<!-- TEXT_TO_UI_ICON_SPRITE_START -->";
  const endMarker = "<!-- TEXT_TO_UI_ICON_SPRITE_END -->";
  const block = `${startMarker}\n${sprite}\n${endMarker}`;
  const html = await readFile(htmlPath, "utf8");
  const markerPattern = /<!-- TEXT_TO_UI_ICON_SPRITE_START -->[\s\S]*?<!-- TEXT_TO_UI_ICON_SPRITE_END -->/;
  let nextHtml;
  if (markerPattern.test(html)) nextHtml = html.replace(markerPattern, block);
  else if (/<body\b[^>]*>/i.test(html)) nextHtml = html.replace(/<body\b[^>]*>/i, match => `${match}\n${block}`);
  else throw new Error(`HTML has no <body> element: ${htmlPath}`);
  await writeFile(htmlPath, nextHtml);
  console.error(`Injected ${selectedAliases.length} exact-source icons into ${htmlPath}`);
} else if (outputPath) {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${sprite}\n`);
  console.error(`Wrote ${selectedAliases.length} exact-source icons to ${outputPath}`);
} else {
  process.stdout.write(`${sprite}\n`);
}
