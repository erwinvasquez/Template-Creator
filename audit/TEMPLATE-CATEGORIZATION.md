# TEMPLATE CATEGORIZATION — Web Generator ↔ SaaS

**Estado:** contrato activo  
**Fuente de verdad taxonomía:** [`packages/template-taxonomy/templateTaxonomy.json`](../packages/template-taxonomy/templateTaxonomy.json)  
**Fuente de verdad por template:** `builder.manifest.json` (editor) + `manifest.json` (runtime)

El SaaS **no** bootstrappea metadata de categoría: la lee del package exportado.

---

## Dos capas

### 1. `manifest.json` (runtime / galería WG)

```json
{
  "templateId": "fashion-atelier-v1",
  "category": "ecommerce-fashion",
  "version": "1.3.0"
}
```

| Campo | Rol |
|-------|-----|
| `category` | Categoría primaria corta y **estable**. No renombrar sin migración. |
| `templateId` | Id del package (`fashion-atelier-v1`). |
| `version` | SemVer del package. |

**Naming:** `{websiteType}-{industry}`  
Ejemplos: `ecommerce-fashion`, `ecommerce-jewelry`, `ecommerce-courses`, `ecommerce-books`, `ecommerce-coaching`, `landing-coaching`.

Valores válidos: `primaryCategories[]` en la taxonomía.

### 2. `builder.manifest.json` (editor / SaaS)

```json
{
  "schemaVersion": "1.0.0",
  "templateId": "fashion-atelier-v1",
  "descriptor": {
    "templateId": "atelier",
    "latestVersion": "1.3.0",
    "status": "published",
    "websiteType": "ecommerce",
    "industryTags": ["fashion", "luxury", "apparel"],
    "displayName": { "es": "Atelier Moda", "en": "Atelier Fashion" },
    "description": {
      "es": "E-commerce de moda premium.",
      "en": "Premium fashion ecommerce."
    }
  },
  "manifest": { "...": "pages, navigation, themeDefaults, slotDefinitions" }
}
```

| Campo | Uso SaaS |
|-------|----------|
| `descriptor.templateId` | Registry id **corto** (`atelier`, `orion`) = `TEMPLATE_SLUG`. **No** el package id. |
| `descriptor.latestVersion` | Debe coincidir con `package.json` / `manifest.version`. |
| `websiteType` | Tabs principales (`ecommerce`, `landing`, `booking`, …). |
| `industryTags` | Filtros multi-tag (solo vocabulario cerrado). |
| `status` | Visibilidad WG → mapeo SaaS abajo. |
| `displayName` / `description` | UI del wizard (i18n `es` / `en`). |

Root `templateId` = package id (`fashion-atelier-v1`).  
`descriptor.templateId` = slug corto (`atelier`).

---

## Status WG → SaaS

| WG (`status`) | SaaS |
|---------------|------|
| `draft` | `draft` |
| `published` | `active` |
| `deprecated` | `archived` |

Solo se permiten esos tres valores WG (`statusValues` en taxonomía).

---

## Coaching / cursos / libros

| `primaryCategory` | Cuándo usarla |
|-------------------|---------------|
| `ecommerce-courses` | Venta de cursos / academia digital (catálogo + checkout). |
| `ecommerce-books` | Libros físicos o ebooks. |
| `ecommerce-coaching` | Coaches que venden programas/packs vía ecommerce. |
| `landing-coaching` | Landing de captura / lead gen (sin tienda completa). |
| `booking-coaching` | Reserva de sesiones 1:1. |

Tags útiles: `coaching`, `courses`, `education`, `books`, `digital`, `membership`, `info-products`.

---

## Templates actuales

| Package | `manifest.category` | `descriptor.templateId` | `industryTags` |
|---------|---------------------|-------------------------|----------------|
| `fashion-atelier-v1` | `ecommerce-fashion` | `atelier` | fashion, luxury, apparel |
| `jewelry-orion-v1` | `ecommerce-jewelry` | `orion` | jewelry, luxury, ecommerce |

---

## Reglas de validación (CI)

`npm run validate:template-package -- <templateId>` (también corre dentro de `template:validate` / `template:export`):

1. `manifest.category` ∈ `primaryCategories`
2. Prefijo de `category` = `descriptor.websiteType`
3. `descriptor.websiteType` ∈ `websiteTypes`
4. Cada `industryTags[]` ∈ `industryTags`
5. `descriptor.status` ∈ `statusValues`
6. `descriptor.templateId` = `TEMPLATE_SLUG` del package (`src/meta.ts`)
7. `descriptor.latestVersion` = `package.json` version
8. `displayName` / `description` son objetos con al menos `es`

---

## Qué NO hacer

- No inventar tags fuera del enum.
- No poner package id en `descriptor.templateId`.
- No bootstrappear category/tags en el SaaS si faltan en el package.
- No hardcodear rutas de tienda en el host; vienen de `manifest.routes`.
