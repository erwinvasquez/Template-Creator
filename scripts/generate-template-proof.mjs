#!/usr/bin/env node
/**
 * Autogenerate PROOF.md content contract section for a template.
 * Usage: node scripts/generate-template-proof.mjs [templateId]
 */
import fs from "node:fs";
import path from "node:path";
import {
  collectSectionsSlotPaths,
  contentSlotIdSet,
  getSlotDefinitions,
  grepDataWbSlots,
  loadBuilderManifest,
  sectionsSlots,
} from "./lib/content-contract.mjs";
import { loadUiSchema } from "./lib/load-template-schema.mjs";

const templateId = process.argv[2] || "fashion-atelier-v1";
const root = process.cwd();
const templateRoot = path.join(root, "templates", templateId);
const defaults = JSON.parse(
  fs.readFileSync(path.join(templateRoot, "defaults.json"), "utf8"),
);
const builder = loadBuilderManifest(templateRoot);
const slots = getSlotDefinitions(builder);
const sectionSlots = sectionsSlots(slots);
const wbSlots = grepDataWbSlots(path.join(templateRoot, "src"));
const uiSchema = loadUiSchema();

function countUiLeaves(node) {
  let n = 0;
  function walk(v) {
    if (typeof v === "string") {
      n += 1;
      return;
    }
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  }
  walk(node);
  return n;
}

const uiLeaves = countUiLeaves(defaults.ui);
const listSlots = sectionSlots.filter((s) => s.kind === "list").length;
const wbCount = wbSlots.size;

const SALES_MODE_CHECKLIST = [
  "## Checklist — sales mode (stock / a pedido)",
  "",
  "| Check | Evidence |",
  "|-------|----------|",
  "| Un solo modo | `salesModeSwitch: unsupported` → sin switch en shop, sin línea en carrito |",
  "| Ambos modos | Host pone `salesModeSwitch: supported` (+ lab `?dualSalesMode=1`); switch en **fila del eyebrow** del shop (derecha, con `\\|`), **no** en navbar |",
  "| maxQuantity | Tope en selector +/-; sin copy \"Máx. N\" |",
  "| PDP plazo prep | Debajo del CTA/errores; `{ui.salesMode.madeToOrder.preparationLabel}: {product.preparationPromiseLabel}`; toggle `presentation.preparationPromise`; clases `mt-4 text-[11px] font-medium uppercase tracking-[0.14em] text-muted`; prohibido `ui.product.shippingNote` en PDP |",
  "| PDP cerrado | `madeToOrderClosed` / reopen label **encima** del buy box si el host envía |",
  "| Shop prep / cerrado | `SalesModeShopBanner` en listing si `filters.salesMode=madeToOrder`; prefijos `ui.salesMode` solo si el host envía campos en filtros (sin shopBanner genérico duplicado) |",
  "| Upsell stock→MTO | Modal `ui.product.stockUpsellModalTitle`; cuerpo `{count}` = tope inmediato (`stockCap`); hint + CTA; prep con prefijo `ui.salesMode` |",
  "| Stock=0 + dual channel (Trigger B) | Panel inline `stockExhaustedImmediateTitle` + link MTO; sin CTA stock/agotado |",
  "| Stock=2, qty=3 (Trigger A) | Modal upsell regresión; Vitest `opens made-to-order upsell` |",
  "| Copy editable | `defaults.ui.salesMode` + schema `UiCopy.salesMode` |",
  "| Query nav | `?salesMode=stock\\|madeToOrder` vía `ui.salesMode.nav` + `SHOP_QUERY.salesMode` |",
  "| Cart drawer R2 | `useHostCart` + `getCartSnapshot`; sin refetch por `isOpen`; bootstrap solo si snapshot null |",
].join("\n");

const ORDER_TRACKING_CHECKLIST = [
  "## Checklist — order tracking (Sprint U1)",
  "",
  "| Check | Evidence |",
  "|-------|----------|",
  "| OrderTrackingView | `components/commerce/OrderTrackingView.tsx`; props `OrderTrackingViewProps` |",
  "| commerceViews + renderer | `OrderTracking` en `client.ts`; `case orderTracking` en `renderer.tsx` |",
  "| manifest | `commerce.views.orderTracking: true` |",
  "| Layout offset | Mismo padding que Cart/Confirmation del template (header fixed/sticky) |",
  "| Sin fetch host | Vitest `OrderTrackingView.test.tsx` + mock VM |",
  "| Miniaturas líneas | `line.imageUrl` en resumen; placeholder `labels.imagePlaceholder` si falta |",
].join("\n");

const PDP_PRESENTATION_CHECKLIST = [
  "## Checklist — PDP presentation (Sprint N)",
  "",
  "| Check | Evidence |",
  "|-------|----------|",
  "| Toggles visibilidad | `isPdpFieldVisible` + merge SaaS `sections.product.presentation` (sin slot WG) |",
  "| supportedFields | `manifest.capabilities.productDetailPresentation.supportedFields` |",
  "| ui.product slots | Page product `contentSlotIds` + `slotDefinitions` `ui.product.*` (sin `shippingNote`) |",
  "| Prep nota PDP | `{ui.salesMode.madeToOrder.preparationLabel}: {product.preparationPromiseLabel}` debajo CTA; sin `ui.product.shippingNote` en PDP |",
].join("\n");

let table = "| Página | Sección | # slots | slotIds |\n|--------|---------|---------|---------|\n";
for (const page of builder.manifest?.pages || []) {
  for (const section of page.sections || []) {
    const ids = section.contentSlotIds || [];
    if (!ids.length) continue;
    table += `| ${page.id} | ${section.id} | ${ids.length} | ${ids.slice(0, 4).join(", ")}${ids.length > 4 ? "…" : ""} |\n`;
  }
}

const proofPath = path.join(templateRoot, "PROOF.md");
let proof = fs.existsSync(proofPath)
  ? fs.readFileSync(proofPath, "utf8")
  : `# Proof — ${templateId}\n\n`;

const block = `
## Content contract (Phase 1) — autogenerated

| Namespace | Count |
|-----------|-------|
| sections.* slots | ${sectionSlots.length} |
| list slots | ${listSlots} |
| ui.* leaves (defaults) | ${uiLeaves} |
| data-wb-slot ids | ${wbCount} |
| catalogBindings | ${(JSON.parse(fs.readFileSync(path.join(templateRoot, "manifest.json"), "utf8")).constraints?.catalogBindings || []).length} |

${table}

Validation: \`npm run template:validate -- ${templateId}\` (includes content contract A–D).
`;

const hasCommerce = fs.existsSync(
  path.join(templateRoot, "commerce.schema.json"),
);

if (hasCommerce) {
  if (proof.includes("## Checklist — PDP presentation")) {
    proof = proof.replace(
      /## Checklist — PDP presentation[\s\S]*?(?=\n## )/,
      PDP_PRESENTATION_CHECKLIST + "\n\n",
    );
  } else if (proof.includes("## Checklist — sales mode")) {
    proof = proof.replace(
      "## Checklist — sales mode",
      PDP_PRESENTATION_CHECKLIST + "\n\n## Checklist — sales mode",
    );
  } else if (proof.includes("## Content contract (Phase 1)")) {
    proof = proof.replace(
      "## Content contract (Phase 1)",
      PDP_PRESENTATION_CHECKLIST + "\n\n## Content contract (Phase 1)",
    );
  }

  if (proof.includes("## Checklist — order tracking")) {
    proof = proof.replace(
      /## Checklist — order tracking[\s\S]*?(?=\n## )/,
      ORDER_TRACKING_CHECKLIST + "\n\n",
    );
  } else if (proof.includes("## Checklist — sales mode")) {
    proof = proof.replace(
      "## Checklist — sales mode",
      ORDER_TRACKING_CHECKLIST + "\n\n## Checklist — sales mode",
    );
  } else if (proof.includes("## Content contract (Phase 1)")) {
    proof = proof.replace(
      "## Content contract (Phase 1)",
      ORDER_TRACKING_CHECKLIST + "\n\n## Content contract (Phase 1)",
    );
  }

  if (proof.includes("## Checklist — sales mode")) {
    proof = proof.replace(
      /## Checklist — sales mode[\s\S]*?(?=\n## )/,
      SALES_MODE_CHECKLIST + "\n\n",
    );
  } else if (proof.includes("## Content contract (Phase 1)")) {
    proof = proof.replace(
      "## Content contract (Phase 1)",
      SALES_MODE_CHECKLIST + "\n\n## Content contract (Phase 1)",
    );
  }
}

if (proof.includes("## Content contract (Phase 1)")) {
  proof = proof.replace(
    /## Content contract \(Phase 1\)[\s\S]*$/,
    block.trim(),
  );
} else {
  proof += block;
}

fs.writeFileSync(proofPath, proof.trim() + "\n");
console.log(`Updated ${proofPath}`);
