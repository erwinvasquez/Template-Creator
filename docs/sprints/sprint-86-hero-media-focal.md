# Sprint 86 — Encuadre focal hero (WG)

## Schema / tipos

`$defs.FocalPoint` + en `MediaRef`: `focalPoint?`, `focalPointMobile?` (x, y ∈ [0, 1]).

Aplica a `sections.hero.image` y cada item de `carouselImages[]`.

## Runtime

`mediaRefObjectPosition(ref, viewport)` → `object-position` en `HeroCarouselMedia`.

- Desktop: `focalPoint ?? 50% 50%`
- Móvil (`max-width: 767px`): `focalPointMobile ?? focalPoint ?? 50% 50%`

## Validación

```bash
npm test -- src/commerce/tests/hero-focal-point.test.ts
npm run export:saas
```
