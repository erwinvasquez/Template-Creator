#!/usr/bin/env node
/**
 * Sprint P — generate home-section-registry.tsx + HomeView wiring per template.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

/** @type {Record<string, { order: string[], sections: Record<string, string>, featureGates?: Record<string, string> }>} */
const TEMPLATE_CONFIG = {
  "fashion-atelier-v1": {
    order: ["hero", "collections", "featured", "editorial", "newsletter"],
    sections: {
      hero: "Hero",
      collections: "CollectionStrip",
      featured: "FeaturedProducts",
      editorial: "EditorialBanner",
      newsletter: "Newsletter",
    },
    featureGates: { newsletter: "newsletter" },
  },
  "fashion-celestine-v1": {
    order: ["hero", "occasions", "craft", "signature", "note", "accessories"],
    sections: {
      hero: "Hero",
      occasions: "OccasionsStrip",
      craft: "CraftBand",
      signature: "SignatureLooks",
      note: "AtelierNote",
      accessories: "AccessoriesLane",
    },
  },
  "fashion-lumen-v1": {
    order: ["hero", "wardrobe", "arrivals", "fabricNote", "editorial"],
    sections: {
      hero: "Hero",
      wardrobe: "WardrobeStrip",
      arrivals: "ArrivalsGrid",
      fabricNote: "FabricNote",
      editorial: "EditorialBand",
    },
  },
  "jewelry-orion-v1": {
    order: ["hero", "signatures", "craft", "materials", "appointment"],
    sections: {
      hero: "Hero",
      signatures: "Signatures",
      craft: "CraftBand",
      materials: "MaterialsRow",
      appointment: "AppointmentBand",
    },
  },
  "academy-voxa-v1": {
    order: ["hero", "programs", "method", "outcomes", "books"],
    sections: {
      hero: "Hero",
      programs: "ProgramsStrip",
      method: "MethodBand",
      outcomes: "OutcomesBand",
      books: "BooksBand",
    },
  },
  "fashion-nova-v1": {
    order: ["hero", "dropZone", "trendWall", "colorPulse", "squad", "flashLane"],
    sections: {
      hero: "Hero",
      dropZone: "DropZone",
      trendWall: "TrendWall",
      colorPulse: "ColorPulse",
      squad: "SquadStrip",
      flashLane: "FlashLane",
    },
  },
  "fashion-velvet-v1": {
    order: ["hero", "soirees", "goldCraft", "nocturne", "salon", "velvetEdit"],
    sections: {
      hero: "Hero",
      soirees: "SoireesMarquee",
      goldCraft: "GoldCraftBand",
      nocturne: "NocturneGrid",
      salon: "SalonNote",
      velvetEdit: "VelvetEditLane",
    },
  },
  "food-trattoria-v1": {
    order: ["hero", "courses", "kitchen", "signatures", "sommelier", "pantry"],
    sections: {
      hero: "Hero",
      courses: "CoursesStrip",
      kitchen: "KitchenBand",
      signatures: "SignatureDishes",
      sommelier: "SommelierNote",
      pantry: "PantryLane",
    },
  },
  "food-cantina-v1": {
    order: ["hero", "lanes", "salsaBar", "mercado", "fiesta", "merch"],
    sections: {
      hero: "Hero",
      lanes: "TacoLanes",
      salsaBar: "SalsaBar",
      mercado: "MercadoStrip",
      fiesta: "FiestaBand",
      merch: "MerchLane",
    },
  },
  "food-patisserie-v1": {
    order: [
      "hero",
      "viennoiserie",
      "seasonal",
      "celebration",
      "atelierNote",
      "giftBox",
    ],
    sections: {
      hero: "Hero",
      viennoiserie: "ViennoiserieGrid",
      seasonal: "SeasonalBand",
      celebration: "CelebrationCakes",
      atelierNote: "PatisserieNote",
      giftBox: "GiftBoxLane",
    },
  },
};

function registrySource(templateId, config) {
  const imports = [
    ...new Set(Object.values(config.sections)),
  ]
    .sort()
    .map((c) => `import { ${c} } from "../components/${c}";`)
    .join("\n");

  const registryEntries = Object.entries(config.sections)
    .map(([id, comp]) => `  ${id}: () => <${comp} />,`)
    .join("\n");

  const featureGateBlock =
    Object.keys(config.featureGates ?? {}).length > 0
      ? `${Object.entries(config.featureGates)
          .map(
            ([sectionId, featureKey]) =>
              `  if (sectionId === "${sectionId}" && payload.features?.${featureKey} === false) {
    return false;
  }`,
          )
          .join("\n")}
  return true;`
      : "  return true;";

  const defaultOrderJson = JSON.stringify(config.order, null, 2).replace(
    /\n/g,
    "\n  ",
  );

  return `"use client";

import { Fragment, type ReactNode } from "react";
import type { ContentPayload } from "../content/types";
${imports}

export const DEFAULT_HOME_SECTION_ORDER = ${defaultOrderJson} as const;

export type HomeSectionId = (typeof DEFAULT_HOME_SECTION_ORDER)[number];

const HOME_SECTION_REGISTRY: Record<
  HomeSectionId,
  () => ReactNode
> = {
${registryEntries}
};

const REGISTRY_IDS = Object.keys(
  HOME_SECTION_REGISTRY,
) as HomeSectionId[];

/** Footer lives in renderer — never mount from HomeView. */
const EXCLUDED_HOME_SECTIONS = new Set<string>(["footer"]);

export function resolveHomeSectionOrder(payload: ContentPayload): HomeSectionId[] {
  const custom = payload.layout?.pages?.home?.sectionOrder;
  const base = (custom?.length ? custom : [...DEFAULT_HOME_SECTION_ORDER]).filter(
    (id): id is HomeSectionId =>
      REGISTRY_IDS.includes(id as HomeSectionId) &&
      !EXCLUDED_HOME_SECTIONS.has(id),
  );
  const deduped = [...new Set(base)];
  if (deduped[0] !== "hero") {
    return ["hero", ...deduped.filter((id) => id !== "hero")];
  }
  return deduped;
}

export function shouldRenderHomeSection(
  sectionId: HomeSectionId,
  payload: ContentPayload,
): boolean {
${featureGateBlock}
}

export function renderHomeSections(payload: ContentPayload): ReactNode[] {
  return resolveHomeSectionOrder(payload)
    .filter((id) => shouldRenderHomeSection(id, payload))
    .map((id) => (
      <Fragment key={id}>{HOME_SECTION_REGISTRY[id]()}</Fragment>
    ));
}
`;
}

function homeViewSource() {
  return `"use client";

import { useSiteContent } from "../../lib/site-content";
import { renderHomeSections } from "../../lib/home-section-registry";

export function HomeView() {
  const { payload } = useSiteContent();
  return <>{renderHomeSections(payload)}</>;
}
`;
}

function patchSchema(schemaPath, sectionIds) {
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  if (!schema.properties.layout) {
    schema.properties.layout = { $ref: "#/$defs/Layout" };
  }
  schema.$defs.Layout = {
    type: "object",
    additionalProperties: false,
    properties: {
      pages: {
        type: "object",
        additionalProperties: false,
        properties: {
          home: {
            type: "object",
            additionalProperties: false,
            properties: {
              sectionOrder: {
                type: "array",
                minItems: 1,
                items: {
                  type: "string",
                  enum: sectionIds,
                },
              },
            },
          },
        },
      },
    },
  };
  fs.writeFileSync(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);
}

function patchTypes(typesPath) {
  let src = fs.readFileSync(typesPath, "utf8");
  if (!src.includes("export type HomePageLayout")) {
    src = src.replace(
      "export type ContentPayload = {",
      `export type HomePageLayout = {
  sectionOrder?: string[];
};

export type Layout = {
  pages?: {
    home?: HomePageLayout;
  };
};

export type ContentPayload = {`,
    );
  }
  if (!src.includes("layout?: Layout")) {
    src = src.replace(
      /(features\?:[\s\S]*?;\n)(  navigation:)/,
      "$1  layout?: Layout;\n$2",
    );
  }
  fs.writeFileSync(typesPath, src);
}

for (const [templateId, config] of Object.entries(TEMPLATE_CONFIG)) {
  const templateRoot = path.join(root, "templates", templateId);
  const registryPath = path.join(
    templateRoot,
    "src/lib/home-section-registry.tsx",
  );
  fs.writeFileSync(registryPath, registrySource(templateId, config));

  fs.writeFileSync(
    path.join(templateRoot, "src/components/pages/HomeView.tsx"),
    homeViewSource(),
  );

  patchSchema(path.join(templateRoot, "schema.json"), config.order);
  patchTypes(path.join(templateRoot, "src/content/types.ts"));

  console.log("bootstrapped", templateId);
}
