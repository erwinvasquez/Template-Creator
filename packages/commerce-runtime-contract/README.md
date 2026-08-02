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

- Capability `salesModeSwitch`: when not `supported`, templates must not render mode chrome (nav tabs, shop mode banner, cart mode line).
- `maxQuantity` limits +/- controls only — never show “Máx. N” copy.
- Host fields: `preparationPromiseLabel`, `madeToOrderClosed` / `madeToOrderAcceptingOrders`, `madeToOrderReopensAtLabel` — **values only** (no “Preparación:” / “Volvemos” prefixes; templates own prefixes via `ui.salesMode`).
- Query/nav convention: `?salesMode=stock|madeToOrder` from template `ui.salesMode.nav` (host does not inject nav).
- Handoff: `docs/handoffs/sales-mode-saas-integration.md`.
- **No** `CatalogContextViewModel` / `catalogContext` in this contract.
