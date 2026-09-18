import { readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const imageDirectory = resolve(root, "images", "services");
const pngs = (await readdir(imageDirectory)).filter((name) => extname(name).toLowerCase() === ".png");

for (const name of pngs) {
  const input = resolve(imageDirectory, name);
  const output = resolve(imageDirectory, `${basename(name, ".png")}.webp`);
  await sharp(input)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 84, effort: 6, smartSubsample: true })
    .toFile(output);
  console.log(`${name} -> ${basename(output)}`);
}

const pages = [
  "services.html",
  "product-sourcing.html",
  "documentation-support.html",
  "shipping-returns.html",
  "images/services/README.md",
];

for (const relativePath of pages) {
  const path = resolve(root, relativePath);
  const before = await readFile(path, "utf8");
  const after = before.replace(/(images\/services\/[^\s"`]+)\.png/g, "$1.webp").replace(/`([^`]+)\.png`/g, "`$1.webp`");
  if (after !== before) await writeFile(path, after, "utf8");
}

for (const name of pngs) await unlink(resolve(imageDirectory, name));
console.log(`Updated service-page references and removed ${pngs.length} superseded PNG files.`);
