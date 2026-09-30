import fs from "node:fs";
import path from "node:path";

export const TECHNICAL_LEAF_KEYS = new Set([
  "id",
  "slug",
  "type",
  "mediaId",
  "categoryId",
  "collectionId",
  "productId",
  "categorySlug",
  "collectionSlug",
  "href",
  "label",
  "alt",
  "city",
  "address",
  "hours",
]);

export const ID_ARRAY_SUFFIXES = ["productIds", "collectionIds", "categoryIds"];

export const JSX_ALLOWLIST_LITERALS = new Set(["", "—", "...", "|", "·", "•"]);

export function getPath(obj, dotPath) {
  if (!dotPath) return obj;
  const parts = dotPath.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

export function isExcludedRootNamespace(dotPath) {
  return (
    dotPath.startsWith("catalog.") ||
    dotPath.startsWith("brand.") ||
    dotPath.startsWith("navigation.") ||
    dotPath.startsWith("ui.")
  );
}

export function isIdArrayKey(key) {
  return ID_ARRAY_SUFFIXES.some((s) => key === s || key.endsWith(s));
}

export function isLinkObject(val) {
  return (
    val &&
    typeof val === "object" &&
    !Array.isArray(val) &&
    typeof val.label === "string" &&
    typeof val.href === "string"
  );
}

export function isMediaObject(val) {
  if (!val || typeof val !== "object" || Array.isArray(val)) return false;
  return typeof val.alt === "string" && (val.mediaId != null || val.url != null);
}

/**
 * Collect marketing copy paths under sections.* that require slots.
 * Returns fieldPaths (dot notation from payload root).
 */
export function collectSectionsSlotPaths(sections) {
  const paths = new Set();

  function walk(value, relPath) {
    if (value == null) return;

    if (typeof value === "string") {
      const key = relPath.split(".").pop() ?? "";
      if (!TECHNICAL_LEAF_KEYS.has(key)) {
        paths.add(`sections.${relPath}`);
      }
      return;
    }

    if (Array.isArray(value)) {
      const key = relPath.split(".").pop() ?? "";
      if (isIdArrayKey(key)) return;
      if (value.length === 0) return;
      const first = value[0];
      if (typeof first === "string") {
        paths.add(`sections.${relPath}`);
        return;
      }
      if (typeof first === "object") {
        paths.add(`sections.${relPath}`);
      }
      return;
    }

    if (typeof value === "object") {
      if (isLinkObject(value) || isMediaObject(value)) {
        paths.add(`sections.${relPath}`);
        return;
      }
      for (const [k, v] of Object.entries(value)) {
        walk(v, relPath ? `${relPath}.${k}` : k);
      }
    }
  }

  if (sections && typeof sections === "object") {
    for (const [k, v] of Object.entries(sections)) {
      walk(v, k);
    }
  }

  return paths;
}

/** All string leaves under ui.* for completeness check. */
export function collectUiLeafPaths(ui, prefix = "ui") {
  const paths = [];
  function walk(value, rel) {
    if (value == null) return;
    if (typeof value === "string") {
      paths.push(`${prefix}.${rel}`);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, i) => walk(item, `${rel}[${i}]`));
      return;
    }
    if (typeof value === "object") {
      for (const [k, v] of Object.entries(value)) {
        walk(v, rel ? `${rel}.${k}` : k);
      }
    }
  }
  if (ui && typeof ui === "object") walk(ui, "");
  return paths.map((p) => p.replace(/\.\[/g, "["));
}

export function collectUiSchemaLeafPaths(schemaNode, prefix = "ui") {
  const paths = [];
  function walk(node, rel, requiredSet) {
    if (!node) return;
    if (node.type === "string" && node.minLength) {
      paths.push(`${prefix}.${rel}`);
      return;
    }
    if (node.type === "array" && node.items) {
      walk(node.items, `${rel}[]`, new Set(node.items.required || []));
      return;
    }
    if (node.properties) {
      const req = new Set(node.required || []);
      for (const [k, sub] of Object.entries(node.properties)) {
        walk(sub, rel ? `${rel}.${k}` : k, req);
      }
    }
  }
  walk(schemaNode, "", new Set());
  return paths;
}

export function grepDataWbSlots(srcDir) {
  const slots = new Map();
  function walkDir(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules") continue;
        walkDir(full);
      } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".jsx")) {
        const text = fs.readFileSync(full, "utf8");
        const re = /data-wb-slot="([^"]+)"/g;
        let m;
        while ((m = re.exec(text)) !== null) {
          const id = m[1];
          if (!slots.has(id)) slots.set(id, []);
          slots.get(id).push(full);
        }
      }
    }
  }
  if (fs.existsSync(srcDir)) walkDir(srcDir);
  registerHeroCarouselEditorSlots(slots, srcDir);
  return slots;
}

/** Sprint 85: hero media slots are assigned dynamically in `hero-carousel.tsx`. */
export function registerHeroCarouselEditorSlots(wbSlots, srcDir) {
  const heroLib = path.join(srcDir, "lib", "hero-carousel.tsx");
  if (!fs.existsSync(heroLib)) return;
  const ids = ["hero.image", "hero.carousel"];
  for (const id of ids) {
    if (!wbSlots.has(id)) wbSlots.set(id, [heroLib]);
  }
}

const ACCENT_RE = /[áéíóúñüÁÉÍÓÚÑÜ¿¡]/;
const WORD_RE = /[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ]{3,}/g;

export function findMarketingLiteralsInTsx(srcDir) {
  const hits = [];
  const skipLineRe =
    /className|import |from ["']|strokeWidth|sizes=|var\(--|href=\{|href="|key=|type=|id=|htmlFor=|aria-|@shopenlinea|\/tienda|\/coleccion|\$\{|text-|bg-|hover:|px-|border-|outline-|tracking-|font-|rounded-|cursor-|opacity-|transition-|w-full|max-w-|grid-|flex |gap-|space-|object-|animate-|sr-only|role=|fill|stroke|current-password|email|password|optionValue/;

  function walkDir(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules") continue;
        walkDir(full);
      } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".jsx")) {
        const lines = fs.readFileSync(full, "utf8").split("\n");
        lines.forEach((line, idx) => {
          if (skipLineRe.test(line)) return;
          const trimmed = line.trim();
          if (trimmed.startsWith("//")) return;

          // JSX text children: >...accent...<
          const textChild = trimmed.match(/>([^<{]+)</);
          if (textChild) {
            const t = textChild[1].trim();
            if (t.length >= 4 && ACCENT_RE.test(t) && !JSX_ALLOWLIST_LITERALS.has(t)) {
              hits.push({ file: full, line: idx + 1, text: t.slice(0, 80) });
            }
          }

          // Quoted strings with Spanish accents (marketing copy indicator)
          const dq = trimmed.match(/"([^"\\]{4,})"/g) || [];
          for (const m of dq) {
            const inner = m.slice(1, -1);
            if (JSX_ALLOWLIST_LITERALS.has(inner)) continue;
            if (!ACCENT_RE.test(inner)) continue;
            if (inner.includes("/") && !ACCENT_RE.test(inner.replace(/\/[a-z]+/gi, ""))) continue;
            hits.push({ file: full, line: idx + 1, text: inner.slice(0, 80) });
          }
        });
      }
    }
  }
  if (fs.existsSync(srcDir)) walkDir(srcDir);
  return hits;
}

export function loadBuilderManifest(templateRoot) {
  const p = path.join(templateRoot, "builder.manifest.json");
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export function getSlotDefinitions(builder) {
  return builder.manifest?.capabilities?.contentSupport?.slotDefinitions || [];
}

export function slotFieldPaths(slots) {
  return slots.map((s) => s.fieldPath).filter(Boolean);
}

export function sectionsSlots(slots) {
  return slots.filter(
    (s) =>
      s.fieldPath?.startsWith("sections.") &&
      s.editorSurface !== "none",
  );
}

export function contentSlotIdSet(builder) {
  const ids = new Set();
  for (const page of builder.manifest?.pages || []) {
    for (const section of page.sections || []) {
      for (const id of section.contentSlotIds || []) {
        ids.add(id);
      }
    }
  }
  return ids;
}

export function deepMerge(target, source) {
  const out = { ...target };
  for (const [k, v] of Object.entries(source)) {
    if (
      v &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      target[k] &&
      typeof target[k] === "object" &&
      !Array.isArray(target[k])
    ) {
      out[k] = deepMerge(target[k], v);
    } else if (v !== undefined) {
      out[k] = v;
    }
  }
  return out;
}
