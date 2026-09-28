#!/usr/bin/env node
/**
 * Bulk-rename a cloned fashion template (from celestine base).
 * Usage: node scripts/bootstrap-fashion-template.mjs <templateId> <config.json>
 */
import fs from "node:fs";
import path from "node:path";

const templateId = process.argv[2];
const configPath = process.argv[3];
if (!templateId || !configPath) {
  console.error("Usage: node scripts/bootstrap-fashion-template.mjs <templateId> <config.json>");
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const root = path.join(process.cwd(), "templates", templateId);

const replacements = [
  ["fashion-celestine-v1", config.templateId],
  ["CelestineApp", config.appName ?? `${cap(config.slug)}App`],
  ["celestine", config.slug],
  ["Celestine", cap(config.slug)],
  ["CELESTINE", config.slug.toUpperCase()],
  ["celestine.css", config.cssFile],
  ["Celestine Atelier", config.displayName],
  ["/t/celestine", config.basePath ?? `/t/${config.slug}`],
  ["/coleccion", config.shopPath],
  ["/casa", config.aboutPath],
  ...Object.entries(config.sectionMap ?? {}).flatMap(([from, to]) => [
    [`sections.${from}`, `sections.${to}`],
    [`"${from}"`, `"${to}"`],
    [from.charAt(0).toUpperCase() + from.slice(1), to.charAt(0).toUpperCase() + to.slice(1)],
  ]),
];

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function walk(dir, fn) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.name === "node_modules" || ent.name === ".DS_Store") continue;
    if (ent.isDirectory()) walk(p, fn);
    else fn(p);
  }
}

function applyReplacements(content) {
  let out = content;
  for (const [from, to] of replacements) {
    out = out.split(from).join(to);
  }
  return out;
}

// Rename CSS file
const oldCss = path.join(root, "src/styles/celestine.css");
const newCss = path.join(root, "src/styles", config.cssFile);
if (fs.existsSync(oldCss) && oldCss !== newCss) {
  fs.renameSync(oldCss, newCss);
}

// Rename section component files
for (const [from, to] of Object.entries(config.componentMap ?? {})) {
  const fromPath = path.join(root, "src/components", `${from}.tsx`);
  const toPath = path.join(root, "src/components", `${to}.tsx`);
  if (fs.existsSync(fromPath) && fromPath !== toPath) {
    fs.renameSync(fromPath, toPath);
  }
}

walk(root, (filePath) => {
  if (!/\.(json|ts|tsx|md|css)$/.test(filePath)) return;
  const raw = fs.readFileSync(filePath, "utf8");
  const next = applyReplacements(raw);
  if (next !== raw) fs.writeFileSync(filePath, next);
});

// package.json name
const pkgPath = path.join(root, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
pkg.name = `@web-generator/${config.templateId}`;
pkg.description = `Portable ${config.templateId} template package for IA Builder v2`;
pkg.exports["./styles.css"] = `./src/styles/${config.cssFile}`;
fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

console.log(`Bootstrapped ${templateId}`);
