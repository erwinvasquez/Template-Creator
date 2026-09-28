# Sprint 83 — Home section reorder (track P WG)

**Programa:** Website Builder  
**Prerequisito:** SaaS P-S3 (`layout.pages.home.sectionOrder` en payload)

## Objetivo WG

HomeView dinámico: orden de secciones desde `layout.pages.home.sectionOrder` con fallback a `DEFAULT_HOME_SECTION_ORDER` por template.

## DEFAULT_HOME_SECTION_ORDER (×10)

| Template | Orden default |
|----------|---------------|
| fashion-atelier-v1 | hero → collections → featured → editorial → newsletter |
| fashion-celestine-v1 | hero → occasions → craft → signature → note → accessories |
| fashion-lumen-v1 | hero → wardrobe → arrivals → fabricNote → editorial |
| jewelry-orion-v1 | hero → signatures → craft → materials → appointment |
| academy-voxa-v1 | hero → programs → method → outcomes → books |
| fashion-nova-v1 | hero → dropZone → trendWall → colorPulse → squad → flashLane |
| fashion-velvet-v1 | hero → soirees → goldCraft → nocturne → salon → velvetEdit |
| food-trattoria-v1 | hero → courses → kitchen → signatures → sommelier → pantry |
| food-cantina-v1 | hero → lanes → salsaBar → mercado → fiesta → merch |
| food-patisserie-v1 | hero → viennoiserie → seasonal → celebration → atelierNote → giftBox |

## Entregables

| ID | Archivo | Estado |
|----|---------|--------|
| P-W1 | `schema.json` + `content/types.ts` ×10 — `layout.pages.home.sectionOrder` | ✅ |
| P-W2 | `src/lib/home-section-registry.tsx` + `HomeView.tsx` ×10 | ✅ |
| P-W3 | `template-validate.mjs` + PROOF checklist P | ✅ |

## Smoke manual

1. Lab `/t/atelier` — orden default intacto.
2. Payload con `layout.pages.home.sectionOrder: ["hero","editorial","featured","collections","newsletter"]` — editorial antes de featured.
3. `features.newsletter: false` — sin bloque newsletter aunque esté en order.

## Validación

```bash
npm test -- src/content/tests/home-section-order.test.ts
npm run template:validate -- fashion-atelier-v1  # … ×10
```
