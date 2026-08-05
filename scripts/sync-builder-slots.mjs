#!/usr/bin/env node
/**
 * Sync builder.manifest slotDefinitions + contentSlotIds from defaults sections.* paths.
 */
import fs from "node:fs";
import path from "node:path";
import {
  collectSectionsSlotPaths,
  getPath,
} from "./lib/content-contract.mjs";

const templateId = process.argv[2] || "fashion-atelier-v1";
const root = process.cwd();
const templateRoot = path.join(root, "templates", templateId);
const defaults = JSON.parse(
  fs.readFileSync(path.join(templateRoot, "defaults.json"), "utf8"),
);
const builderPath = path.join(templateRoot, "builder.manifest.json");
const builder = JSON.parse(fs.readFileSync(builderPath, "utf8"));
const slots = builder.manifest.capabilities.contentSupport.slotDefinitions;

const brandSlots = slots.filter((s) => s.fieldPath?.startsWith("brand."));
const paths = [...collectSectionsSlotPaths(defaults.sections)].sort();

function inferKind(fieldPath, value) {
  if (fieldPath.endsWith(".cta") || fieldPath.endsWith(".ctaPrimary") || fieldPath.endsWith(".ctaSecondary") || fieldPath.endsWith(".viewAll")) {
    return "link";
  }
  if (fieldPath.includes("image") || fieldPath.includes("bannerImage")) {
    return "media";
  }
  if (Array.isArray(value)) {
    return "list";
  }
  if (
    fieldPath.endsWith(".body") ||
    fieldPath.endsWith(".blurb") ||
    fieldPath.endsWith(".subtitle") ||
    fieldPath.endsWith(".successMessage") ||
    fieldPath.endsWith(".description")
  ) {
    return "text";
  }
  return "string";
}

function listSchemaFor(fieldPath) {
  if (fieldPath.endsWith(".blocks")) {
    return {
      itemType: "object",
      fields: [
        { key: "id", kind: "string", label: "ID" },
        { key: "title", kind: "string", label: "Título" },
        { key: "body", kind: "text", label: "Texto" },
      ],
    };
  }
  if (fieldPath.endsWith(".locations.items") || fieldPath.endsWith(".maisons.items")) {
    return {
      itemType: "object",
      fields: [
        { key: "city", kind: "string", label: "Ciudad" },
        { key: "address", kind: "text", label: "Dirección" },
        { key: "hours", kind: "string", label: "Horario" },
      ],
    };
  }
  if (fieldPath.endsWith(".faculty.items")) {
    return {
      itemType: "object",
      fields: [
        { key: "name", kind: "string", label: "Nombre" },
        { key: "role", kind: "string", label: "Cargo" },
        { key: "bio", kind: "text", label: "Bio" },
      ],
    };
  }
  if (fieldPath.endsWith(".materials.items")) {
    return {
      itemType: "object",
      fields: [
        { key: "title", kind: "string", label: "Título" },
        { key: "body", kind: "text", label: "Texto" },
      ],
    };
  }
  if (fieldPath.endsWith(".steps")) {
    return {
      itemType: "object",
      fields: [
        { key: "title", kind: "string", label: "Título" },
        { key: "body", kind: "text", label: "Texto" },
      ],
    };
  }
  if (fieldPath.endsWith(".bullets")) {
    return { itemType: "string", label: "Bullet" };
  }
  if (fieldPath.endsWith(".columns")) {
    return {
      itemType: "object",
      fields: [
        { key: "title", kind: "string", label: "Título columna" },
        {
          key: "links",
          kind: "list",
          label: "Enlaces",
          listSchema: {
            itemType: "object",
            fields: [
              { key: "label", kind: "string", label: "Etiqueta" },
              { key: "href", kind: "string", label: "URL" },
            ],
          },
        },
      ],
    };
  }
  return { itemType: "object", fields: [] };
}

function sectionIdForFieldPath(fieldPath) {
  const rel = fieldPath.replace(/^sections\./, "");
  return rel.split(".")[0];
}

const newSlots = [];
for (const fieldPath of paths) {
  const id = fieldPath.replace(/^sections\./, "");
  const value = getPath(defaults, fieldPath);
  const kind = inferKind(fieldPath, value);
  const slot = {
    id,
    fieldPath,
    kind,
    label: id.replace(/\./g, " "),
    generationHint: `Copy de sección ${sectionIdForFieldPath(fieldPath)}; tono del template.`,
    required: true,
    localeScope: "both",
  };
  if (kind === "list") {
    slot.listSchema = listSchemaFor(fieldPath);
  }
  newSlots.push(slot);
}

builder.manifest.capabilities.contentSupport.slotDefinitions = [
  ...newSlots,
  ...brandSlots,
];

// Map section id -> slot ids
const sectionSlotMap = new Map();
for (const slot of newSlots) {
  const sec = sectionIdForFieldPath(slot.fieldPath);
  if (!sectionSlotMap.has(sec)) sectionSlotMap.set(sec, []);
  sectionSlotMap.get(sec).push(slot.id);
}

for (const page of builder.manifest.pages) {
  for (const section of page.sections || []) {
    const ids = sectionSlotMap.get(section.id);
    if (ids) {
      section.contentSlotIds = ids;
    }
  }
}

// Ensure footer on home
const home = builder.manifest.pages.find((p) => p.page === "home");
if (home && !home.sections.some((s) => s.id === "footer")) {
  home.sections.push({
    id: "footer",
    contentSlotIds: sectionSlotMap.get("footer") || [],
  });
}

fs.writeFileSync(builderPath, `${JSON.stringify(builder, null, 2)}\n`);
console.log(`Synced ${newSlots.length} section slots for ${templateId}`);
