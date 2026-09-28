#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { loadTemplateSchemaForAjv } from "./lib/load-template-schema.mjs";
import { validateHostCheckoutSkin } from "./lib/host-checkout-skin-contract.mjs";
import { validateThemeTokenContract } from "./lib/theme-token-contract.mjs";

const require = createRequire(import.meta.url);
const templateId = process.argv[2] || "fashion-atelier-v1";
const root = path.join(process.cwd(), "templates", templateId);

if (!fs.existsSync(root)) {
  console.error(`Template not found: ${templateId}`);
  process.exit(1);
}

const schema = loadTemplateSchemaForAjv(root);
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

  // Catalog binding constraints (canonical SaaS contract)
  const constraints = manifest.constraints || {};
  const hasCatalog =
    Array.isArray(payload.catalog?.products) && payload.catalog.products.length > 0;
  const catalogRefs = constraints.catalogRefs;

  if (hasCatalog && name === "defaults") {
    if (!Array.isArray(catalogRefs) || catalogRefs.length === 0) {
      errors.push(
        `[constraints] ecommerce with catalog requires constraints.catalogRefs (string[])`,
      );
    }
  }

  if (Array.isArray(catalogRefs)) {
    for (const ref of catalogRefs) {
      if (typeof ref !== "string" || !ref.startsWith("sections.")) {
        errors.push(`[constraints:${name}] catalogRefs entry must be sections.* path: ${ref}`);
        continue;
      }
      const value = getPath(payload, ref);
      if (value === undefined) {
        errors.push(`[constraints:${name}] catalogRefs path missing in payload: ${ref}`);
        continue;
      }
      if (!Array.isArray(value)) {
        errors.push(`[constraints:${name}] ${ref} must be an array`);
        continue;
      }
      if (ref.endsWith(".productIds")) {
        for (const id of value) {
          if (!productIds.has(id)) {
            errors.push(`[constraints:${name}] ${ref} missing product ${id}`);
          }
        }
      } else if (ref.endsWith(".collectionIds")) {
        for (const id of value) {
          if (!collectionIds.has(id)) {
            errors.push(`[constraints:${name}] ${ref} missing collection ${id}`);
          }
        }
      } else {
        errors.push(
          `[constraints:${name}] catalogRefs path must end with .productIds or .collectionIds: ${ref}`,
        );
      }
    }

    const featuredProducts = constraints.commerceFeaturedProductsPath;
    const featuredCollections = constraints.commerceFeaturedCollectionsPath;
    if (featuredProducts != null) {
      if (typeof featuredProducts !== "string") {
        errors.push(`[constraints] commerceFeaturedProductsPath must be a string`);
      } else if (!catalogRefs.includes(featuredProducts)) {
        errors.push(
          `[constraints] commerceFeaturedProductsPath must be listed in catalogRefs: ${featuredProducts}`,
        );
      }
    }
    if (featuredCollections != null) {
      if (typeof featuredCollections !== "string") {
        errors.push(`[constraints] commerceFeaturedCollectionsPath must be a string`);
      } else if (!catalogRefs.includes(featuredCollections)) {
        errors.push(
          `[constraints] commerceFeaturedCollectionsPath must be listed in catalogRefs: ${featuredCollections}`,
        );
      }
    }

    // catalogBindings: every catalogRef must have metadata for SaaS section pickers
    if (hasCatalog && name === "defaults") {
      const bindings = constraints.catalogBindings;
      if (!Array.isArray(bindings) || bindings.length === 0) {
        errors.push(
          `[constraints] catalogBindings required (one entry per catalogRefs path)`,
        );
      } else {
        const boundPaths = new Set();
        for (const b of bindings) {
          if (!b || typeof b.path !== "string") {
            errors.push(`[constraints] catalogBindings entry needs path`);
            continue;
          }
          boundPaths.add(b.path);
          if (!catalogRefs.includes(b.path)) {
            errors.push(
              `[constraints] catalogBindings.path not in catalogRefs: ${b.path}`,
            );
          }
          if (b.kind !== "product" && b.kind !== "collection") {
            errors.push(
              `[constraints] catalogBindings.kind must be product|collection: ${b.path}`,
            );
          }
          if (!b.sectionId || typeof b.sectionId !== "string") {
            errors.push(
              `[constraints] catalogBindings.sectionId required: ${b.path}`,
            );
          }
          if (!b.label || typeof b.label !== "object" || !b.label.es) {
            errors.push(
              `[constraints] catalogBindings.label.es required: ${b.path}`,
            );
          }
          if (b.maxItems !== undefined) {
            if (typeof b.maxItems !== "number" || b.maxItems < 1) {
              errors.push(
                `[constraints] catalogBindings.maxItems must be >= 1 when set: ${b.path}`,
              );
            }
          }
        }
        for (const ref of catalogRefs) {
          if (!boundPaths.has(ref)) {
            errors.push(
              `[constraints] catalogRef missing catalogBindings entry: ${ref}`,
            );
          }
        }
      }
    }
  }

  // Legacy length hints (deprecated — no longer enforced)
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

// Drift check: schema Sections.*productIds|collectionIds vs constraints.catalogRefs
function discoverCatalogRefsFromSchema(sch) {
  const sections = sch?.$defs?.Sections?.properties || {};
  const refs = [];
  for (const [sec, def] of Object.entries(sections)) {
    const props = def?.properties || {};
    if (props.productIds) refs.push(`sections.${sec}.productIds`);
    if (props.collectionIds) refs.push(`sections.${sec}.collectionIds`);
  }
  return refs.sort();
}

const declaredRefs = [...(manifest.constraints?.catalogRefs || [])].sort();
const schemaRefs = discoverCatalogRefsFromSchema(schema);
if (schemaRefs.length > 0 && declaredRefs.length > 0) {
  const missing = schemaRefs.filter((r) => !declaredRefs.includes(r));
  const extra = declaredRefs.filter((r) => !schemaRefs.includes(r));
  for (const r of missing) {
    errors.push(
      `[constraints] catalogRefs missing path present in schema: ${r}`,
    );
  }
  for (const r of extra) {
    errors.push(
      `[constraints] catalogRefs has path not in schema Sections: ${r}`,
    );
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
  const bm = builder.manifest || {};
  if (!bm.themeEditable || typeof bm.themeEditable !== "object") {
    errors.push("[builder] themeEditable required (primary/secondary/background/fonts flags)");
  }
  const navFrom = bm.navigation?.primaryFromPayload;
  if (navFrom) {
    const nav = getPath(defaults, navFrom);
    if (!Array.isArray(nav)) {
      errors.push(
        `[builder] navigation.primaryFromPayload not resolvable in defaults: ${navFrom}`,
      );
    }
  } else {
    errors.push("[builder] navigation.primaryFromPayload required");
  }

  const slots =
    bm.capabilities?.contentSupport?.slotDefinitions || [];
  const slotIds = new Set(slots.map((s) => s.id));
  const slotById = new Map(slots.map((s) => [s.id, s]));
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
    if (slot.kind === "list" && !slot.listSchema) {
      errors.push(
        `[builder] list slot ${slot.id} requires listSchema metadata`,
      );
    }
  }
  for (const page of bm.pages || []) {
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

  // routes[].sections (copy pages) ⊆ builder pages with matching section ids
  const routeByPage = new Map(
    (manifest.routes || []).map((r) => [r.page, r]),
  );
  for (const page of bm.pages || []) {
    const route = routeByPage.get(page.page);
    if (!route) {
      errors.push(`[builder] page ${page.id} page kind ${page.page} missing in manifest.routes`);
      continue;
    }
    if (page.path && route.path && page.path !== route.path) {
      errors.push(
        `[builder] page ${page.id} path ${page.path} !== route path ${route.path}`,
      );
    }
    const routeSecs = new Set(route.sections || []);
    for (const section of page.sections || []) {
      // product page may omit related; home/shop/about sections must match
      if (page.page === "product" && section.id === "product") continue;
      if (!routeSecs.has(section.id)) {
        errors.push(
          `[builder] section ${section.id} on page ${page.id} not in manifest.routes sections`,
        );
      }
    }
    // Every non-product route section should appear in builder (copy contract)
    if (page.page !== "product") {
      const builderSecs = new Set((page.sections || []).map((s) => s.id));
      for (const sid of route.sections || []) {
        if (sid === "related" || sid === "footer") continue;
        if (!builderSecs.has(sid)) {
          errors.push(
            `[builder] manifest route section ${sid} missing on builder page ${page.id}`,
          );
        }
      }
    }
  }

  // Static mediaSlots ids (no []) must have a media slotDefinition
  for (const ms of manifest.mediaSlots || []) {
    if (typeof ms.id !== "string" || ms.id.includes("[]")) continue;
    if (ms.section === "catalog") continue;
    const slot = slotById.get(ms.id);
    if (!slot) {
      errors.push(
        `[builder] mediaSlots id ${ms.id} missing matching slotDefinition`,
      );
    } else if (slot.kind !== "media") {
      errors.push(
        `[builder] mediaSlots id ${ms.id} slotDefinition kind must be media`,
      );
    }
  }
}

// Category filter row — single-line horizontal scroll, hidden scrollbar (commerce contract)
const listingPath = path.join(
  root,
  "src",
  "components",
  "commerce",
  "ProductListingView.tsx",
);
const shopCatalogPath = path.join(root, "src", "components", "ShopCatalog.tsx");

function assertCategoryScrollContract(filePath, label) {
  if (!fs.existsSync(filePath)) return;
  const src = fs.readFileSync(filePath, "utf8");
  if (!src.includes("category-scroll")) {
    errors.push(`[commerce] ${label} must use category-scroll for category filters`);
  }
  if (!src.includes("overflow-x-auto")) {
    errors.push(`[commerce] ${label} category row must include overflow-x-auto`);
  }
  if (src.includes("flex flex-wrap gap-2 border-b border-border pb-6")) {
    errors.push(
      `[commerce] ${label} category row must not use flex-wrap (single-line scroll contract)`,
    );
  }
  if (!src.includes("shrink-0")) {
    errors.push(`[commerce] ${label} category chips must include shrink-0`);
  }
}

if (fs.existsSync(listingPath)) {
  assertCategoryScrollContract(listingPath, "ProductListingView.tsx");
  assertCategoryScrollContract(shopCatalogPath, "ShopCatalog.tsx");

  const styleDir = path.join(root, "src", "styles");
  if (fs.existsSync(styleDir)) {
    const styleFiles = fs.readdirSync(styleDir).filter((f) => f.endsWith(".css"));
    const hasCategoryScrollCss = styleFiles.some((f) => {
      const css = fs.readFileSync(path.join(styleDir, f), "utf8");
      return css.includes(".category-scroll") && css.includes("scrollbar-width: none");
    });
    if (!hasCategoryScrollCss) {
      errors.push(
        "[commerce] src/styles/*.css must define .category-scroll (hidden horizontal scrollbar)",
      );
    }
  }
}

// Hero — full viewport height on all breakpoints (template contract)
const heroPath = path.join(root, "src", "components", "Hero.tsx");
if (fs.existsSync(heroPath)) {
  const heroSrc = fs.readFileSync(heroPath, "utf8");
  if (!heroSrc.includes("h-[100svh]")) {
    errors.push("[hero] Hero.tsx section must include h-[100svh]");
  }
  if (!heroSrc.includes("min-h-[640px]")) {
    errors.push("[hero] Hero.tsx section must include min-h-[640px]");
  }
  if (heroSrc.includes("md:h-[92svh]")) {
    errors.push("[hero] Hero.tsx must not use md:h-[92svh] (use h-[100svh] on all breakpoints)");
  }
}

// Phase 0 — client.ts must export canonical symbols (static check)
const clientPath = path.join(root, "src", "client.ts");
if (fs.existsSync(clientPath)) {
  const clientSrc = fs.readFileSync(clientPath, "utf8");
  for (const sym of [
    "TemplateApp",
    "commerceViews",
    "hostCheckoutSkin",
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

for (const msg of validateHostCheckoutSkin(root, manifest)) {
  errors.push(msg);
}

for (const msg of validateThemeTokenContract(root)) {
  errors.push(msg);
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

try {
  execSync(`node scripts/template-validate-content.mjs ${templateId}`, {
    stdio: "inherit",
  });
} catch {
  process.exit(1);
}

try {
  execSync(`node scripts/generate-template-proof.mjs ${templateId}`, {
    stdio: "inherit",
  });
} catch {
  process.exit(1);
}

console.log(
  `Validation OK: ${templateId} (defaults + fixtures + builder.manifest + taxonomy + content contract)`,
);
