# Phase F — Manifest ↔ schema audit (WG)

**Fecha:** 2026-08-05  
**Sprint:** Website Builder visual editor — Fase F (WG manifest + nav icons)

## Acciones en este PR

| Template | Slot | Mismatch | Acción |
|----------|------|----------|--------|
| jewelry-orion-v1 | `materials.items` | manifest `title`/`body` vs schema `name`/`description`/`image` | **Corregido** en `builder.manifest.json` + `sync-builder-slots.mjs` |

## Revisado — sin cambio (alineado o fuera de alcance WG)

| Template | Slot | Notas |
|----------|------|--------|
| fashion-atelier-v1 | `atelier.blocks` | manifest `title`/`body` = schema |
| fashion-atelier-v1 | `appointment.steps` | manifest `title`/`body` = schema |
| fashion-celestine-v1 | `atelier.blocks`, `appointment.steps` | igual convención title/body |
| fashion-lumen-v1 | list slots propios | keys alineadas con schema |
| academy-voxa-v1 | `method.steps`, etc. | title/body alineados |
| jewelry-orion-v1 | `atelier.blocks` | title/body alineados (sección about, no materials) |
| *todos* | `footer.columns` + `links` anidado | manifest correcto; editor nested list = **SaaS Fase G** |

## Header icons (5 templates)

Cart + account en nav sólido: `text-secondary hover:text-primary` (igual que links).  
Nav transparente/dark: `text-white` / `text-white/80`. Badge contador: `bg-primary` sin cambio.
