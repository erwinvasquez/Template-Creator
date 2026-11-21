# `@shopenlinea/commerce-runtime-contract`

Serializable **view models**, **actions**, **capabilities** and **template view props** for ecommerce templates.

## Rules

- No Firebase, Firestore, repositories, pricing or shipping engines.
- Types only — hosts implement `CommerceRuntimeActions` / `CommerceRuntimeBridge`.
- **Capability ≠ permanent UI.** Templates render adaptively (search as icon/modal/bar; omit empty optional fields).

## Consumers

| Consumer | Role |
|----------|------|
| Template packages | Import types + render `ProductListingViewProps`, etc. |
| Template Workspace | `createMockCommerceBridge` implements the bridge |
| SaaS (other repo) | Real bridge against storefront APIs |

## Always preserve in UI

Purchase actions, valid variant selection, unavailability/errors, cart and checkout access — even when optional merchandising fields are hidden.

## Sales mode (stock / made-to-order)

- Capability `salesModeSwitch`: when not `supported`, templates must not render mode chrome (shop switch, prep/closed notices, cart mode line).
- **Placement (all ecommerce templates):** when `supported`, render the mode switch **only on the shop page**, on the **same row as the shop eyebrow**, right-aligned. Separators between options use `|` (e.g. `Entrega inmediata | Bajo pedido`). **Never** put the switch in the site navbar (desktop or mobile).
- Do **not** render generic `ui.salesMode.*.shopBanner` copy next to the switch — labels from `ui.salesMode.nav` are enough. Show prep / closed / reopen lines only when the host sends those fields.
- `maxQuantity` limits +/- controls only — never show “Máx. N” copy.
- Host fields: `preparationPromiseLabel`, `madeToOrderClosed` / `madeToOrderAcceptingOrders`, `madeToOrderReopensAtLabel` — **values only** (no “Preparación:” / “Volvemos” prefixes; templates own prefixes via `ui.salesMode`).
- PDP stock mode: optional `madeToOrderUpsell` (`preparationPromiseLabel` value + `productHref` with `?salesMode=madeToOrder`) when the product also sells MTO; variant `immediateAvailableQty` for upsell copy.
- Query convention: `?salesMode=stock|madeToOrder` from template `ui.salesMode.nav` (host does not inject nav links). Host sets capability only.
- Handoff: `docs/handoffs/sales-mode-saas-integration.md`.
- **No** `CatalogContextViewModel` / `catalogContext` in this contract.

## Product detail — variant option picker

- `ProductDetailViewModel.optionDefinitions` — orden canónico de dimensiones (`name`, `values?`). El host lo envía desde `product.optionDefinitions` (paridad legacy PDP).
- Algoritmo puro en `variantOptionPicker.ts` (exportado desde el paquete):
  - `buildOptionDimensions`, `valuesForDimension`, `selectionsFromVariant`
  - `isOptionValueSelectable`, `resolveVariantForDimensionSelection`, `chipStateForOptionValue`
  - Tipo variante: `{ id, optionValues: { option, value }[] }` — adaptar desde `variant.options` (`name` → `option`).
- `maxAddQtyByVariantId` en template: `(variant.available && (variant.maxQuantity ?? 0) > 0) ? (variant.maxQuantity ?? 0) : 0`
- Regla clave: un chip es selectable si existe variante con ese valor y las dimensiones **anteriores** ya elegidas; no exigir match en dimensiones posteriores.

## Stock → MTO transition (PDP stock mode)

Cuando el host envía `madeToOrderUpsell` y `immediateAvailableQty`, los templates **deben** importar desde `stockToMtoTransition.ts` (no helpers locales en `lib/made-to-order-upsell`).

| Trigger | Condición | Presentación WG |
|---------|-----------|-----------------|
| **A** `quantityExceedsImmediate` | `immediate > 0` y `requestedQty > stockCap` | Modal upsell (R1) |
| **B** `immediateExhausted` | `immediate === 0` y upsell disponible | Panel inline + CTA a `productHref` |

Funciones:

- `canTransitionStockToMto(product, selected?)` — gate común (`productHref` + no `madeToOrderClosed`)
- `resolveStockToMtoTransition(product, selected, requestedQty)` — `null` o trigger A/B
- `shouldOpenStockToMtoModal(trigger)` — solo `true` para trigger A
- `stockCap`, `immediateAvailableQty`, `interpolateCount`

**Orden:** si `immediate === 0`, siempre trigger B (aunque `requestedQty > cap`). No modal con count=0.

## PLP stock → MTO (catálogo)

Cuando el host envía `ProductCardViewModel` en listado con `catalogSalesMode=stock`:

- `stockLabel` sigue siendo `out_of_stock` si no hay inventario inmediato (verdad del canal stock).
- Opcional `madeToOrderUpsell` (mismo tipo que PDP) cuando el producto también vende en MTO.
- Templates importan `resolveCatalogAvailabilityPresentation`, `catalogCardHref`, `shouldHideFromCatalog` desde `catalogStockToMtoHint.ts` (no helpers locales).

| Presentación | Condición | Copy card |
|--------------|-----------|-----------|
| `sold_out` | `out_of_stock` sin upsell | `ui.product.outOfStock` |
| `made_to_order_available` | `out_of_stock` + upsell | `ui.product.buyMadeToOrderCta` |
| `available` / `contact` | resto | sin overlay agotado |

`catalogCardHref(card)` enlaza al PDP MTO (`madeToOrderUpsell.productHref`) cuando aplica. Filtro “ocultar agotados”: `shouldHideFromCatalog` no oculta cards con upsell.

## Category filters (shop listing)

When templates render category chips (commerce `ProductListingView` or demo `ShopCatalog`):

- **Single row** — no `flex-wrap`; use horizontal scroll when categories overflow.
- Container: `category-scroll` + `flex` + `overflow-x-auto` (optional edge bleed: `-mx-6 px-6 md:-mx-8 md:px-8`).
- Chips/links: `shrink-0` so labels do not compress.
- Hide scrollbar in template CSS (not optional):
  ```css
  .category-scroll { scrollbar-width: none; -ms-overflow-style: none; }
  .category-scroll::-webkit-scrollbar { display: none; }
  ```
- `npm run template:validate` enforces this for packages with `ProductListingView`.
