# Sprint 85 — Hero imagen única + carrusel lista (track H WG)

**Programa:** Website Builder
**Prerequisito:** Sprint 84 exportado; contexto UX SaaS hotfix `7432fb79`
**Siguiente:** sync SaaS `phase-85-hero-carousel-list-saas-sync-builder.md`

## Modelo de contenido

| Campo | Rol |
|-------|-----|
| `sections.hero.image` | Imagen única cuando `carouselImages` está vacío |
| `sections.hero.carouselImages` | `MediaRef[]`, máx. 6; si `length >= 1`, **solo** estas slides (no se muestra `image` como slide) |
| `sections.hero.carouselIntervalMs` | Opcional; default 4000 cuando hay carrusel |
| `imageSecondary` / `imageMobile` / `imageMobileSecondary` | Deprecados en schema; sin defaults |

## Slots editor (sync SaaS)

| Slot ID | `fieldPath` | Kind | Required |
|---------|-------------|------|----------|
| `hero.image` | `sections.hero.image` | media | false |
| `hero.carousel` | `sections.hero.carouselImages` | list (MediaRef items) | false |

**Runtime JSX:** slide `i` → `data-wb-slot="hero.carousel.{i}"` en modo lista; modo single → `hero.image`.

**mediaSlots manifest:** `hero.image`, `hero.carousel[]` (count 6).

## Entregables WG

| ID | Estado |
|----|--------|
| H-1 schema + defaults + types ×10 | ✅ |
| H-2 `hero-carousel.tsx` + `Hero.tsx` z-index ×10 | ✅ |
| H-3 builder.manifest + manifest mediaSlots ×10 | ✅ |
| H-4 Vitest `hero-carousel.test.ts` | ✅ |
| H-5 `dist/packages` export | ✅ |

## Smoke manual

1. Defaults: solo `image` + `carouselImages: []` — un slide, ken-burns si aplica.
2. Payload con 2+ items en `carouselImages` — crossfade; `image` no visible.
3. `prefers-reduced-motion` — primera slide fija.
4. Editor: slots `hero.image` vs lista `hero.carousel`.

## Validación

```bash
npm test -- src/commerce/tests/hero-carousel.test.ts
npm run template:validate -- fashion-atelier-v1  # ×10
npm run export:saas
```
