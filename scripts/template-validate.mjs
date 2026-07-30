#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const templateId = process.argv[2] || "fashion-atelier-v1";
const root = path.join(process.cwd(), "templates", templateId);

if (!fs.existsSync(root)) {
  console.error(`Template not found: ${templateId}`);
  process.exit(1);
}

const schema = JSON.parse(fs.readFileSync(path.join(root, "schema.json"), "utf8"));
const defaults = JSON.parse(fs.readFileSync(path.join(root, "defaults.json"), "utf8"));
const manifest = fs.existsSync(path.join(root, "manifest.json"))
  ? JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"))
  : {};

const Ajv2020 = require("ajv/dist/2020").default || require("ajv/dist/2020");
const addFormats = require("ajv-formats").default || require("ajv-formats");
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const errors = [];

function validatePayload(name, payload) {
  if (!validate(payload)) {
    errors.push(`[schema:${name}] invalid`);
    for (const err of validate.errors || []) {
      errors.push(`  ${err.instancePath || "/"} ${err.message}`);
    }
  }

  if (!payload.catalog) return;

  const categoryIds = new Set((payload.catalog.categories || []).map((c) => c.id));
  const collectionIds = new Set((payload.catalog.collections || []).map((c) => c.id));
  const productIds = new Set((payload.catalog.products || []).map((p) => p.id));

  for (const p of payload.catalog.products || []) {
    if (!categoryIds.has(p.categoryId)) {
      errors.push(`[semantic:${name}] product ${p.id} bad categoryId`);
    }
    if (p.collectionId && !collectionIds.has(p.collectionId)) {
      errors.push(`[semantic:${name}] product ${p.id} bad collectionId`);
    }
  }

  // Optional manifest-driven constraints
  const constraints = manifest.constraints || {};
  if (constraints.featuredProductPath) {
    const ids = getPath(payload, constraints.featuredProductPath) || [];
    for (const id of ids) {
      if (!productIds.has(id)) {
        errors.push(`[semantic:${name}] featured product missing ${id}`);
      }
    }
  }
  if (constraints.collectionIdsPath) {
    const ids = getPath(payload, constraints.collectionIdsPath) || [];
    for (const id of ids) {
      if (!collectionIds.has(id)) {
        errors.push(`[semantic:${name}] collection missing ${id}`);
      }
    }
    if (
      typeof constraints.collectionsCount === "number" &&
      ids.length !== constraints.collectionsCount
    ) {
      errors.push(
        `[semantic:${name}] ${constraints.collectionIdsPath} must have length ${constraints.collectionsCount}`,
      );
    }
  }
}

function getPath(obj, dotted) {
  return dotted.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

validatePayload("defaults", defaults);

const fixturesDir = path.join(root, "fixtures");
if (fs.existsSync(fixturesDir)) {
  for (const file of fs.readdirSync(fixturesDir).filter((f) => f.endsWith(".json"))) {
    const fixture = JSON.parse(fs.readFileSync(path.join(fixturesDir, file), "utf8"));
    validatePayload(file, fixture);
  }
}

// Phase 0 — builder.manifest.json (editor slot contract)
const builderPath = path.join(root, "builder.manifest.json");
if (!fs.existsSync(builderPath)) {
  errors.push("[builder] missing builder.manifest.json");
} else {
  const builder = JSON.parse(fs.readFileSync(builderPath, "utf8"));
  if (builder.templateId && builder.templateId !== templateId) {
    errors.push(
      `[builder] templateId mismatch: ${builder.templateId} !== ${templateId}`,
    );
  }
  if (!builder.descriptor?.displayName) {
    errors.push("[builder] descriptor.displayName required");
  }
  const slots =
    builder.manifest?.capabilities?.contentSupport?.slotDefinitions || [];
  const slotIds = new Set(slots.map((s) => s.id));
  for (const slot of slots) {
    if (!slot.id || !slot.fieldPath) {
      errors.push("[builder] slotDefinitions entries need id + fieldPath");
      continue;
    }
    const value = getPath(defaults, slot.fieldPath);
    if (value === undefined) {
      errors.push(
        `[builder] fieldPath not in defaults: ${slot.fieldPath} (slot ${slot.id})`,
      );
    }
  }
  for (const page of builder.manifest?.pages || []) {
    for (const section of page.sections || []) {
      for (const sid of section.contentSlotIds || []) {
        if (!slotIds.has(sid)) {
          errors.push(
            `[builder] page ${page.id} section ${section.id} unknown contentSlotId: ${sid}`,
          );
        }
      }
    }
  }
}

// Phase 0 — client.ts must export canonical symbols (static check)
const clientPath = path.join(root, "src", "client.ts");
if (fs.existsSync(clientPath)) {
  const clientSrc = fs.readFileSync(clientPath, "utf8");
  for (const sym of [
    "TemplateApp",
    "commerceViews",
    "TemplateCommerceProvider",
    "useRequiredCommerceHost",
    "useHostCart",
    "createPayloadCommerceBridge",
  ]) {
    if (!clientSrc.includes(sym)) {
      errors.push(`[client] missing canonical export symbol: ${sym}`);
    }
  }
  if (!clientSrc.includes("customMain") && !fs.readFileSync(path.join(root, "src", "renderer.tsx"), "utf8").includes("customMain")) {
    errors.push("[renderer] missing customMain prop");
  }
}

if (errors.length) {
  console.error(`Validation FAILED for ${templateId}`);
  errors.forEach((e) => console.error(" -", e));
  process.exit(1);
}

// Taxonomy + descriptor contract (closed enums)
try {
  execSync(`node scripts/validate-template-package.mjs ${templateId}`, {
    stdio: "inherit",
  });
} catch {
  process.exit(1);
}

console.log(`Validation OK: ${templateId} (defaults + fixtures + builder.manifest + taxonomy)`);
