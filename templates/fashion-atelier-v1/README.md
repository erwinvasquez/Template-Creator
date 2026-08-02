# fashion-atelier-v1

Template package exportable para **IA Builder v2**.

## Contenido del package

| Archivo | Rol |
|---------|-----|
| `manifest.json` | Identidad del template, rutas, capabilities, media slots |
| `builder.manifest.json` | Descriptor editor + `slotDefinitions` (Phase 0 plug & play) |
| `schema.json` | JSON Schema del Content Payload (contrato para la herramienta/IA) |
| `defaults.json` | Payload golden — contenido actual del diseño Atelier |
| `README.md` | Esta guía |

## API pública canónica (`./client`) — Phase 0

El host SaaS importa **siempre** los mismos símbolos, sin conocer nombres internos:

```ts
import {
  TemplateApp,
  commerceViews,
  TemplateCommerceProvider,
  createPayloadCommerceBridge,
  TEMPLATE_ID,
} from "@web-generator/fashion-atelier-v1/client";
```

| Export | Rol |
|--------|-----|
| `TemplateApp` | Renderer (alias de `AtelierApp`) |
| `commerceViews` | `CommerceTemplateViews` |
| `TemplateCommerceProvider` | Provider del bridge |
| `customMain` (prop) | Host monta checkout/cuenta dentro del shell |

Aliases deprecated (1 release): `AtelierApp`, `atelierCommerceViews`, `AtelierCommerceProvider`.

## Catalog bindings

`manifest.constraints` declara dónde el payload referencia el catálogo (`catalogRefs`) y dónde el SaaS escribe destacados del tenant (`commerceFeaturedProductsPath` / `commerceFeaturedCollectionsPath`). En Atelier: `sections.featured.productIds` y `sections.collections.collectionIds`.

## Preview en este repo

- Selector: [`/`](/)
- Template montado: [`/t/atelier`](/t/atelier)

## Cómo consume la herramienta este package

1. Registrar `templateId: fashion-atelier-v1` en el registry del Builder.
2. Cargar `manifest.json` + `builder.manifest.json` + `schema.json` + `defaults.json`.
3. La UI / IA **solo** genera o edita un Content Payload validado contra `schema.json`.
4. El host monta `TemplateApp` + bridge; **nunca** regenerar HTML/CSS/React con la IA.

## Instancia de sitio (ejemplo)

```json
{
  "siteId": "site_demo",
  "templateId": "fashion-atelier-v1",
  "templateVersion": "1.3.0",
  "payload": { "...": "Content Payload (ver defaults.json como base)" }
}
```

## Rutas internas del template

Los `href` / paths del payload son **relativos al mount** del template (`/`, `/tienda`, `/nosotros`).  
En este laboratorio el mount es `/t/atelier`; el runtime antepone el base path.

### Navegación (`navigation.primary`)

Cada entrada es un `NavLink`:

| `type` | Campos | Resuelve a |
|--------|--------|------------|
| `path` | `label`, `href` | `href` tal cual (ej. `/tienda`, `/nosotros`) |
| `shopFilter` | `label`, `categorySlug?`, `collectionSlug?` | `/tienda?categoria=…` y/o `?coleccion=…` |

El Header usa `resolveNavHref()`. El SaaS debe **permitir** esos links en nav y **validar** `categorySlug` / `collectionSlug` contra el catálogo real del tenant.

**Mapper SaaS (WebsiteProject):** si el editor persiste un href tipo `/tienda?categoria=mujer`, al cargar/guardar el payload conviene mapearlo a `{ type: "shopFilter", label, categorySlug: "mujer" }` (y lo mismo con `coleccion` → `collectionSlug`). No hardcodear slugs en el código del template; solo viven en defaults/fixtures o en el catálogo del tenant.

### Query params de `/tienda` (page `shop`)

| Param | Significado |
|-------|-------------|
| `categoria` | Slug de `catalog.categories[].slug` |
| `coleccion` | Slug de `catalog.collections[].slug` |

Ejemplos: `/tienda?categoria=mujer`, `/tienda?coleccion=otono-essentials`, `/tienda?categoria=mujer&coleccion=otono-essentials`.

### Cuenta (`features.accountBasePath`)

Raíz de rutas de cuenta relativa al mount. Default: `"/cuenta"`. El SaaS puede poner `"/account"` sin parchear componentes (`accountPath()` en Header y formularios).

Cart, checkout y account **no** van en `routes[]`; las resuelve la plataforma.

## Reglas para la IA

- Emitir únicamente JSON válido según `schema.json`.
- Preferir overrides sobre `defaults.json` en lugar de reinventar todo el payload.
- No inventar secciones, rutas ni layout.
- Imágenes: `MediaRef` con `mediaId` (preferido) o `url` + `alt`.
- Productos/colecciones: referenciar IDs del `catalog`; las secciones solo seleccionan.

## Aceptación 1.2.0 (PDP + nav)

| Check | Evidencia |
|-------|-----------|
| Quantity stepper → `addToCart(id, n)` | Lab PDP + Vitest smoke |
| Precio + compareAt + % | PDP / card |
| Stock por variante + CTA | Fixture `product-out-of-stock` |
| Galería multi + thumbs | Seed ≥3 imágenes |
| Contenido enriquecido | highlights / specs / labels si el VM los trae |
| Option pickers multi-dimensión | Fixture `product-variants` |
| `accountBasePath` | defaults `/cuenta`; SaaS puede `/account` |
| Nav shopFilter documentado | Sección mapper arriba |

Fuera de alcance del template: stock real, maxQuantity server, editor nav SaaS, pagos.

## Versión

- Template: `1.3.0`
- Schema: `1.0.0`
- Categorización: ver [`audit/TEMPLATE-CATEGORIZATION.md`](../../audit/TEMPLATE-CATEGORIZATION.md) (`ecommerce-fashion`)
