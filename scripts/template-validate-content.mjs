#!/usr/bin/env node
/**
 * WG ↔ SaaS Phase 1 content contract validation (A–D).
 * Usage: node scripts/template-validate-content.mjs [templateId]
 *        node scripts/template-validate-content.mjs --all
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import {
  collectSectionsSlotPaths,
  contentSlotIdSet,
  findMarketingLiteralsInTsx,
  getPath,
  getSlotDefinitions,
  grepDataWbSlots,
  loadBuilderManifest,
  sectionsSlots,
} from "./lib/content-contract.mjs";
import { loadTemplateSchemaForAjv, loadUiSchema } from "./lib/load-template-schema.mjs";

const require = createRequire(import.meta.url);
const root = process.cwd();
const arg = process.argv[2];
const allFlag = arg === "--all";

const templateIds = allFlag
  ? fs
      .readdirSync(path.join(root, "templates"), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
  : [arg || "fashion-atelier-v1"];

const uiSchema = loadUiSchema();

const Ajv2020 = require("ajv/dist/2020").default || require("ajv/dist/2020");
const addFormats = require("ajv-formats").default || require("ajv-formats");
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateUi = ajv.compile(uiSchema);

let failed = false;

for (const templateId of templateIds) {
  const templateRoot = path.join(root, "templates", templateId);
  if (!fs.existsSync(templateRoot)) {
    console.error(`Template not found: ${templateId}`);
    failed = true;
    continue;
  }

  const errors = [];
  const defaults = JSON.parse(
    fs.readFileSync(path.join(templateRoot, "defaults.json"), "utf8"),
  );
  const schema = loadTemplateSchemaForAjv(templateRoot);
  const builder = loadBuilderManifest(templateRoot);
  const slots = getSlotDefinitions(builder);
  const slotById = new Map(slots.map((s) => [s.id, s]));
  const contentSlotIds = contentSlotIdSet(builder);
  const srcDir = path.join(templateRoot, "src");
  const wbSlots = grepDataWbSlots(srcDir);

  // --- A Manifest ---
  for (const page of builder.manifest?.pages || []) {
    for (const section of page.sections || []) {
      for (const sid of section.contentSlotIds || []) {
        if (!slotById.has(sid)) {
          errors.push(
            `[A] page ${page.id} section ${section.id} unknown contentSlotId: ${sid}`,
          );
        }
      }
    }
  }

  const slotIds = new Set();
  const fieldPaths = new Set();
  for (const slot of slots) {
    if (!slot.id || !slot.fieldPath) {
      errors.push("[A] slotDefinitions entry missing id or fieldPath");
      continue;
    }
    if (slotIds.has(slot.id)) {
      errors.push(`[A] duplicate slot id: ${slot.id}`);
    }
    slotIds.add(slot.id);
    if (fieldPaths.has(slot.fieldPath)) {
      errors.push(`[A] duplicate fieldPath: ${slot.fieldPath}`);
    }
    fieldPaths.add(slot.fieldPath);

    if (
      slot.fieldPath.startsWith("ui.") &&
      !slot.fieldPath.startsWith("ui.product.")
    ) {
      errors.push(`[A] slot ${slot.id} fieldPath must not be under ui.* (except ui.product.*)`);
    }
    if (slot.fieldPath.startsWith("brand.") && slot.editorSurface !== "none") {
      errors.push(`[A] brand slot ${slot.id} must have editorSurface: none`);
    }
    if (slot.fieldPath.startsWith("navigation.")) {
      errors.push(`[A] slot ${slot.id} fieldPath must not be under navigation.*`);
    }

    if (slot.editorSurface !== "none" && !contentSlotIds.has(slot.id)) {
      errors.push(
        `[A] slot ${slot.id} missing from contentSlotIds (editorSurface not none)`,
      );
    }

    if (
      slot.fieldPath.startsWith("ui.product.") &&
      !slot.generationHint?.trim()
    ) {
      errors.push(`[A] ui.product slot ${slot.id} requires generationHint`);
    }

    if (
      slot.fieldPath.startsWith("sections.") &&
      slot.editorSurface !== "none" &&
      !slot.generationHint?.trim()
    ) {
      errors.push(`[A] slot ${slot.id} requires generationHint`);
    }

    if (slot.kind === "list" && !slot.listSchema) {
      errors.push(`[A] list slot ${slot.id} requires listSchema`);
    }
  }

  const homePage = (builder.manifest?.pages || []).find((p) => p.page === "home");
  const homeSections = new Set(
    (homePage?.sections || []).map((s) => s.id),
  );
  if (!homeSections.has("footer")) {
    errors.push("[A] home page must include footer section with contentSlotIds");
  }

  // --- B Payload / schema ---
  const AjvPayload = new Ajv2020({ allErrors: true, strict: false });
  addFormats(AjvPayload);
  const validatePayload = AjvPayload.compile(schema);
  if (!validatePayload(defaults)) {
    errors.push("[B] defaults.json failed schema validation");
    for (const err of validatePayload.errors || []) {
      errors.push(`  ${err.instancePath || "/"} ${err.message}`);
    }
  }

  for (const slot of sectionsSlots(slots)) {
    const val = getPath(defaults, slot.fieldPath);
    if (val === undefined) {
      errors.push(`[B] fieldPath missing in defaults: ${slot.fieldPath}`);
    }
  }

  if (!defaults.ui) {
    errors.push("[B] defaults.json missing ui root");
  } else if (!validateUi(defaults.ui)) {
    errors.push("[B] defaults.ui failed canonical uiCopy schema");
    for (const err of validateUi.errors || []) {
      errors.push(`  ui${err.instancePath || ""} ${err.message}`);
    }
  }

  // --- C Editor visual ---
  for (const [slotId, files] of wbSlots) {
    if (!slotById.has(slotId)) {
      errors.push(`[C] data-wb-slot "${slotId}" has no slotDefinition (${files[0]})`);
    }
    const slot = slotById.get(slotId);
    if (slot?.fieldPath?.startsWith("ui.")) {
      errors.push(`[C] data-wb-slot "${slotId}" must not target ui.*`);
    }
  }

  for (const slot of sectionsSlots(slots)) {
    if (slot.kind === "list") {
      if (!wbSlots.has(slot.id)) {
        errors.push(`[C] list slot ${slot.id} missing data-wb-slot on container`);
      }
      continue;
    }
    if (["string", "text", "link", "media"].includes(slot.kind)) {
      if (!wbSlots.has(slot.id)) {
        errors.push(`[C] slot ${slot.id} (${slot.kind}) missing data-wb-slot in JSX`);
      }
    }
  }

  // --- D Coverage ---
  const expectedSectionPaths = collectSectionsSlotPaths(defaults.sections);
  const slotSectionPaths = new Set(
    sectionsSlots(slots).map((s) => s.fieldPath),
  );
  for (const fp of expectedSectionPaths) {
    if (!slotSectionPaths.has(fp)) {
      errors.push(`[D] sections copy path missing slot: ${fp}`);
    }
  }
  for (const slot of sectionsSlots(slots)) {
    if (!slot.fieldPath.startsWith("sections.")) continue;
    if (!expectedSectionPaths.has(slot.fieldPath)) {
      errors.push(`[D] orphan sections slot (no copy in defaults): ${slot.fieldPath}`);
    }
  }

  const literals = findMarketingLiteralsInTsx(srcDir);
  for (const hit of literals.slice(0, 30)) {
    errors.push(
      `[D] marketing literal in JSX ${hit.file}:${hit.line} "${hit.text}"`,
    );
  }
  if (literals.length > 30) {
    errors.push(`[D] ... and ${literals.length - 30} more marketing literals`);
  }

  if (errors.length) {
    failed = true;
    console.error(`Content contract FAILED: ${templateId}`);
    errors.forEach((e) => console.error(" -", e));
  } else {
    console.log(`Content contract OK: ${templateId}`);
  }
}

if (failed) process.exit(1);
