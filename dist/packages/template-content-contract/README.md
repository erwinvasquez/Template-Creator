# `@web-generator/template-content-contract`

Canonical **strict** `ui.*` JSON Schema for WG template packages (SaaS Phase 1).

## Rules

- `ui.*` is **payload-only** in Phase 1: no `slotDefinitions`, no `data-wb-slot`.
- Templates reference `uiCopy.schema.json` from `schema.json`.
- Seed copy in `uiCopy.defaults.seed.json` — adapt per template voice in `defaults.json`.

## Branches

| Branch | Purpose |
|--------|---------|
| `chrome` | Header chrome (cart, account, menu aria) |
| `account` | Login / register / dashboard labels |
| `listing` | Shop search, categories, loading |
| `checkout` | Checkout section titles + validation errors |
| `errors` | Generic commerce errors |
| `cart`, `product`, `shop`, `notFound`, `salesMode` | Existing ecommerce microcopy |

See `audit/WG-SAAS-CONTENT-CONTRACT-PHASE1.md`.
