# Sprint 84 — Hero carrusel + imágenes móvil (track H WG)

**Programa:** Website Builder
**Prerequisito:** ninguno en SaaS; sync SaaS en fase posterior (overlay storefront).

## Objetivo WG

Hero con hasta dos imágenes por viewport (desktop / móvil), carrusel fade automático cada 4s si hay más de una imagen efectiva; `prefers-reduced-motion` fija la primera.

## Campos `sections.hero`

| Campo | Rol |
|-------|-----|
| `image` | Desktop principal (required) |
| `imageSecondary?` | Segunda desktop |
| `imageMobile?` | Principal móvil (fallback `image`) |
| `imageMobileSecondary?` | Segunda móvil (fallback `imageSecondary`) |
| `carouselIntervalMs?` | Default 4000 |

## Entregables

| ID | Archivo | Estado |
|----|---------|--------|
| H-1 | `schema.json` + `types.ts` ×10 | ✅ |
| H-2 | `src/lib/hero-carousel.tsx` + `Hero.tsx` ×10 | ✅ |
| H-3 | `builder.manifest.json` + `manifest.json` mediaSlots + PROOF ×10 | ✅ |
| H-T | `src/commerce/tests/hero-carousel.test.ts` | ✅ |

## Anti-regresión storefront (Sprint 83)

Sin cambios en commerce, Header, HomeView registry, `createPayloadCommerceBridge`, etc.

## Smoke manual

1. Lab home — una sola `image`: sin parpadeo ni timer.
2. Payload con `image` + `imageSecondary`: crossfade ~4s en desktop ancho.
3. DevTools móvil + `imageMobile`: usa asset móvil en primer slide.
4. OS “reducir movimiento”: imagen fija.

## Validación

```bash
npm test -- src/commerce/tests/hero-carousel.test.ts
npm run template:validate -- fashion-atelier-v1  # … ×10
npm run template:export -- fashion-atelier-v1      # … ×10
```
