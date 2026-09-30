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
- **Stock → MTO upsell (PDP):** when `madeToOrderUpsell` is set and `variant.immediateAvailableQty > 0`, templates show a modal if the shopper requests more than `maxQuantity` (immediate cap). CTA navigates to `madeToOrderUpsell.productHref` (host includes `?salesMode=madeToOrder`). Copy: `ui.product.stockInsufficientImmediate` (`{count}`), `stockInsufficientMadeToOrderHint`, `buyMadeToOrderCta`.
- Query convention: `?salesMode=stock|madeToOrder` from template `ui.salesMode.nav` (host does not inject nav links). Host sets capability only.
- Handoff: `docs/handoffs/sales-mode-saas-integration.md`.
- **No** `CatalogContextViewModel` / `catalogContext` in this contract.

## Variant option picker (PDP)

- `ProductDetailViewModel.optionDefinitions` — canonical dimension order (`name`, optional `values`). Host sends from product catalog.
- Pure helpers in `variantOptionPicker.ts` (exported from package):
  - `buildOptionDimensions`, `valuesForDimension`, `selectionsFromVariant`
  - `isOptionValueSelectable`, `resolveVariantForDimensionSelection`, `chipStateForOptionValue`
  - `canUseVariantOptionPickers`, `sortOptionValuesAsc`
- Templates map `variant.options` → `optionValues` `{ option, value }` and `maxAddQtyByVariantId` from `available` + `maxQuantity`.

## Stock → MTO transition (PDP)

Import from `stockToMtoTransition.ts` — **do not** duplicate in `lib/made-to-order-upsell`.

- **Trigger A** (`quantityExceedsImmediate`): modal (`shouldOpenStockToMtoModal`) when requested qty exceeds immediate cap.
- **Trigger B** (`immediateExhausted`): inline panel when `immediateAvailableQty === 0` but `madeToOrderUpsell` is set.
- `resolveStockToMtoTransition(product, selected, requestedQty)` — `null` or trigger A/B.
- Copy: `ui.product.stockExhaustedImmediateTitle`, `stockExhaustedMadeToOrderAvailable`, `buyMadeToOrderCta`.

## Stock → MTO hint (PLP / catalog cards)

Import from `catalogAvailabilityPresentation.ts` — **do not** duplicate locally.

- `ProductCardViewModel.madeToOrderUpsell` — same shape as PDP upsell; host sends in **stock** catalog when dual-mode and MTO channel is open.
- `resolveCatalogAvailabilityPresentation(product)` → `available` | `contact` | `sold_out` | `made_to_order_available`.
- `catalogCardHref(product)` — prefer `madeToOrderUpsell.productHref` when `made_to_order_available`.
- Templates: `sold_out` → overlay `ui.product.outOfStock` + dim image; `made_to_order_available` → label `ui.product.buyMadeToOrderCta`, no sold-out overlay/dim.

## Order tracking (public `/track`)

- Types in `tracking.ts`: `OrderTrackingViewModel`, `OrderTrackingViewProps`.
- `CommerceTemplateViews.OrderTracking` + `TemplateAppPageId` `orderTracking`.
- Host maps order + labels → `tracking` prop; template **does not fetch**.
- Layout offset matches template Cart/Confirmation (under fixed/sticky header).
- Voucher: link `payment.voucherViewUrl` only — no upload in template.

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
