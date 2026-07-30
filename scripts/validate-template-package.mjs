#!/usr/bin/env node
/**
 * Validate a template package against closed taxonomy + builder descriptor contract.
 * Usage: node scripts/validate-template-package.mjs [templateId]
 *        (default: all templates under templates/)
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const taxonomy = require("../packages/template-taxonomy/templateTaxonomy.json");

const root = process.cwd();
const arg = process.argv[2];
const templateIds = arg
  ? [arg]
  : fs
      .readdirSync(path.join(root, "templates"), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

const websiteTypeSet = new Set(taxonomy.websiteTypes);
const categorySet = new Set(taxonomy.primaryCategories);
const tagSet = new Set(taxonomy.industryTags);
const statusSet = new Set(taxonomy.statusValues);

let failed = false;

function fail(templateId, msg) {
  failed = true;
  console.error(` - [${templateId}] ${msg}`);
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function getSlugFromMeta(templateRoot) {
  const metaPath = path.join(templateRoot, "src", "meta.ts");
  if (!fs.existsSync(metaPath)) return null;
  const src = fs.readFileSync(metaPath, "utf8");
  const m = src.match(/TEMPLATE_SLUG\s*=\s*["']([^"']+)["']/);
  return m ? m[1] : null;
}

for (const templateId of templateIds) {
  const templateRoot = path.join(root, "templates", templateId);
  if (!fs.existsSync(templateRoot)) {
    fail(templateId, "template directory not found");
    continue;
  }

  const manifestPath = path.join(templateRoot, "manifest.json");
  const builderPath = path.join(templateRoot, "builder.manifest.json");
  const pkgPath = path.join(templateRoot, "package.json");

  if (!fs.existsSync(manifestPath)) {
    fail(templateId, "missing manifest.json");
    continue;
  }
  if (!fs.existsSync(builderPath)) {
    fail(templateId, "missing builder.manifest.json");
    continue;
  }
  if (!fs.existsSync(pkgPath)) {
    fail(templateId, "missing package.json");
    continue;
  }

  const manifest = readJson(manifestPath);
  const builder = readJson(builderPath);
  const pkg = readJson(pkgPath);
  const slug = getSlugFromMeta(templateRoot);
  const d = builder.descriptor || {};

  if (manifest.templateId && manifest.templateId !== templateId) {
    fail(templateId, `manifest.templateId !== folder (${manifest.templateId})`);
  }
  if (builder.templateId && builder.templateId !== templateId) {
    fail(templateId, `builder.templateId !== folder (${builder.templateId})`);
  }

  if (!manifest.category) {
    fail(templateId, "manifest.category required");
  } else if (!categorySet.has(manifest.category)) {
    fail(
      templateId,
      `manifest.category "${manifest.category}" not in primaryCategories`,
    );
  }

  if (!d.websiteType) {
    fail(templateId, "descriptor.websiteType required");
  } else if (!websiteTypeSet.has(d.websiteType)) {
    fail(
      templateId,
      `descriptor.websiteType "${d.websiteType}" not in websiteTypes`,
    );
  }

  if (manifest.category && d.websiteType) {
    if (!manifest.category.startsWith(`${d.websiteType}-`)) {
      fail(
        templateId,
        `manifest.category "${manifest.category}" must start with websiteType "${d.websiteType}-"`,
      );
    }
  }

  if (!Array.isArray(d.industryTags) || d.industryTags.length === 0) {
    fail(templateId, "descriptor.industryTags must be a non-empty array");
  } else {
    for (const tag of d.industryTags) {
      if (!tagSet.has(tag)) {
        fail(templateId, `industryTag "${tag}" not in taxonomy`);
      }
    }
  }

  if (!d.status) {
    fail(templateId, "descriptor.status required");
  } else if (!statusSet.has(d.status)) {
    fail(templateId, `descriptor.status "${d.status}" invalid`);
  }

  if (!d.templateId) {
    fail(templateId, "descriptor.templateId (short slug) required");
  } else if (slug && d.templateId !== slug) {
    fail(
      templateId,
      `descriptor.templateId "${d.templateId}" !== TEMPLATE_SLUG "${slug}"`,
    );
  } else if (d.templateId === templateId) {
    fail(
      templateId,
      "descriptor.templateId must be short slug (atelier), not package id",
    );
  }

  if (!d.latestVersion) {
    fail(templateId, "descriptor.latestVersion required");
  } else if (d.latestVersion !== pkg.version) {
    fail(
      templateId,
      `descriptor.latestVersion "${d.latestVersion}" !== package.json "${pkg.version}"`,
    );
  } else if (manifest.version && d.latestVersion !== manifest.version) {
    fail(
      templateId,
      `descriptor.latestVersion !== manifest.version (${manifest.version})`,
    );
  }

  for (const field of ["displayName", "description"]) {
    const v = d[field];
    if (!v || typeof v !== "object" || Array.isArray(v)) {
      fail(templateId, `descriptor.${field} must be { es, en? } object`);
    } else if (typeof v.es !== "string" || !v.es.trim()) {
      fail(templateId, `descriptor.${field}.es required`);
    }
  }
}

if (failed) {
  console.error("\nvalidate:template-package FAILED");
  console.error(
    `Taxonomy: packages/template-taxonomy/templateTaxonomy.json — see audit/TEMPLATE-CATEGORIZATION.md`,
  );
  process.exit(1);
}

console.log(
  `validate:template-package OK (${templateIds.length} template(s))`,
);
