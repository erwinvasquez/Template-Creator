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
