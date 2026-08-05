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
- Query convention: `?salesMode=stock|madeToOrder` from template `ui.salesMode.nav` (host does not inject nav links). Host sets capability only.
- Handoff: `docs/handoffs/sales-mode-saas-integration.md`.
- **No** `CatalogContextViewModel` / `catalogContext` in this contract.

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
