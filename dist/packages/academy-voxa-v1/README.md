# academy-voxa-v1

Template package exportable para **IA Builder v2**. Rubro: **academia de oratoria y comunicación
estratégica** que vende **programas** (cursos en vivo) y **libros** de editorial propia.

Categoría de taxonomía: `ecommerce-courses`. Tags: `courses`, `coaching`, `education`, `books`.

## Contenido del package

| Archivo | Rol |
|---------|-----|
| `builder.manifest.json` | Descriptor editor + `slotDefinitions` (Phase 0 plug & play) |
| `manifest.json` | Identidad del template, rutas, capabilities, bloque `commerce`, media slots |
| `schema.json` | JSON Schema del Content Payload (contrato para la herramienta/IA) |
| `commerce.schema.json` | JSON Schema del bloque `manifest.commerce` (Commerce Runtime Contract) |
| `defaults.json` | Payload golden — contenido actual del diseño Voxa |
| `fixtures/alt-brand.json` | Payload alterno (**Clarion**, mismo diseño, otra marca) |
| `README.md` | Esta guía |
| `PROOF.md` | Evidencia de aceptación (portabilidad + commerce) |

## Entradas del package (plug & play)

| Import | Uso |
|--------|-----|
| `@web-generator/academy-voxa-v1` | Entrada completa (incluye `loadPayload`, requiere Node fs) |
| `@web-generator/academy-voxa-v1/client` | Entrada client-safe canónica |
| `@web-generator/academy-voxa-v1/builder.manifest.json` | Slots editables para el Website Builder |
| `@web-generator/academy-voxa-v1/styles.css` | CSS de identidad (clase raíz `voxa-root`) |

Un host genérico monta el template sin conocer nombres internos:

```ts
import { TemplateApp, commerceViews, TEMPLATE_ID } from "@web-generator/academy-voxa-v1/client";
import builder from "@web-generator/academy-voxa-v1/builder.manifest.json";
```

Exports canónicos: `TemplateApp`, `TemplateAppPage`, `commerceViews`, `TemplateCommerceProvider`,
`useRequiredCommerceHost`, `useHostCart`, `createPayloadCommerceBridge`, `resolveNavHref`,
`accountPath`, `withBasePath`, `TEMPLATE_ID` (`academy-voxa-v1`), `TEMPLATE_SLUG` (`voxa`),
`DEFAULT_BASE_PATH` (`/t/voxa`).

## Catalog bindings

`manifest.constraints.catalogRefs` lista `sections.programs.productIds` y `sections.books.productIds`. El featured de comercio del tenant va a `commerceFeaturedProductsPath` → `sections.programs.productIds` (sin grid de colecciones en home → no hay `commerceFeaturedCollectionsPath`).

## Preview en este repo
Aliases deprecated (1 release): `VoxaApp`, `voxaCommerceViews`, `VoxaCommerceProvider`.

## Preview en este repo

- Home: [`/t/voxa`](/t/voxa)
- Programas: [`/t/voxa/programas`](/t/voxa/programas)
- Detalle: [`/t/voxa/programas/oratoria-esencial`](/t/voxa/programas/oratoria-esencial)
- Academia (about): [`/t/voxa/academia`](/t/voxa/academia)
- Carrito: [`/t/voxa/carrito`](/t/voxa/carrito)
- Checkout: [`/t/voxa/checkout`](/t/voxa/checkout)
- Cuenta: [`/t/voxa/cuenta`](/t/voxa/cuenta) · [`login`](/t/voxa/cuenta/login) · [`registro`](/t/voxa/cuenta/registro)
- Payload alterno: [`/t/voxa?payload=alt-brand`](/t/voxa?payload=alt-brand)

## Identidad visual (fija, no editable por la IA)

- Tipografía: **Fraunces** (`--font-fraunces`, títulos y wordmark) + **Source Sans 3**
  (`--font-source-sans`, cuerpo).
- Paleta: navy profundo (`#14213D`) + acento teal (`#0D9488`) sobre fondo frío claro (`#F4F6F8`);
  tinta `#0B1220` para bandas oscuras.
- Hero full-bleed sobre navy con halo teal radial (`voxa-hero-aura`), wordmark dominante, un
  titular, una línea de apoyo y un grupo de dos CTA.
- Header sticky con marca a la izquierda, nav con subrayado teal al hover, iconos de cuenta y
  carrito a la derecha.
- Secciones propias: `programs` (3 programas destacados en tarjetas 4/3), `method` (3–4 pasos
  numerados sobre `surface`), `outcomes` (split 50/50 con bullets y check teal), `books` (franja
  oscura con la editorial).

## Rutas internas del template

Los `href` del payload son **relativos al mount**. En este laboratorio el mount es `/t/voxa`; el
runtime antepone el base path con `withBasePath`.

| `path` | `page` | Nota |
|--------|--------|------|
| `/` | `home` | |
| `/programas` | `shop` | Catálogo. Query: `?categoria=<slug>` y/o `?coleccion=<slug>` |
| `/programas/[slug]` | `product` | Detalle de programa o libro |
| `/academia` | `about` | El path conserva el copy de diseño; el `page` id del contrato es `about` |

**Voxa usa `/programas` como raíz de catálogo.** Todo href de producto que emita el commerce
bridge, los CTA de "ver programas" y `resolveNavHref()` resuelven contra `SHOP_PATH = "/programas"`.

Carrito, checkout y cuenta **no** están en `manifest.routes[]`: esas URLs las resuelve la
plataforma. El template aporta la UI (`CartPageView`, `CommerceCartDrawer`, `CheckoutPage`,
`AccountLoginForm`, `AccountRegisterForm`, `AccountDashboard`).

### Navegación (`navigation.primary`)

```json
{ "type": "path", "label": "Programas", "href": "/programas" }
{ "type": "shopFilter", "label": "Oratoria", "categorySlug": "oratoria" }
```

`resolveNavHref()` convierte `shopFilter` en `/programas?categoria=oratoria` (o `?coleccion=<slug>`).
El mapper del SaaS debe validar `categorySlug` / `collectionSlug` contra el catálogo real del tenant
antes de publicar el payload.

### Cuenta (`features.accountBasePath`)

Raíz de cuenta relativa al mount. Default `/cuenta`; el SaaS puede fijar `/account` sin tocar la UI.
`accountPath(basePath, accountBasePath, segment?)` resuelve `login` y `registro`.

## Catálogo: programas y libros

El catálogo es único (programas + libros) y se distingue por categoría (`oratoria`, `liderazgo`,
`marca-personal`, `libros`) e itinerario (`fundamentos`, `avanzado`, `editorial-libros`).

Dos campos del contrato se reutilizan con semántica de academia:

| Campo | Programa | Libro |
|-------|----------|-------|
| `metals` | Modalidad (`Online`, `Presencial`) | Formato (`Digital`, `Impreso`) |
| `sizes` | Duración y nivel (`6 semanas`, `Nivel inicial`) | Extensión y encuadernación |

## Commerce Runtime Contract

`manifest.commerce` declara `mode: "preview-only"` y las vistas implementadas. El template exporta
`commerceViews` (`CommerceTemplateViews`) con `ProductListing`, `ProductDetail`, `CartPage`,
`CartDrawer`, `CheckoutPage` + subcomponentes tipados, `OrderConfirmation`, `AccountLoginForm`,
`AccountRegisterForm`, `AccountDashboard`.

Sin host inyectado, `TemplateApp` monta `createPayloadCommerceBridge(payload)`: bridge de preview
alimentado por el catálogo del payload, con hrefs `/programas/{slug}`.

## Reglas para la IA

- Emitir únicamente JSON válido según `schema.json`.
- Preferir overrides sobre `defaults.json` en lugar de reinventar el payload completo.
- No inventar secciones, rutas ni layout.
- Imágenes: `MediaRef` con `mediaId` (preferido) o `url` + `alt`.
- `sections.programs.productIds` debe tener exactamente 3 IDs existentes en `catalog.products`.
- `sections.books.productIds` debe tener entre 2 y 4 IDs existentes.
- `sections.method.steps` debe tener 3 o 4 pasos; `sections.outcomes.bullets`, entre 3 y 6.
- `navigation.primary` requiere `type` (`path` | `shopFilter`); prohibido emitir hrefs con
  query-string a mano.
- Prohibido emitir hrefs de plataforma (`/site/{org}/...`) o rutas de carrito/checkout como si
  fueran del template.

## Validación

```bash
npm run template:validate -- academy-voxa-v1
npm run validate:template-package -- academy-voxa-v1
npm run validate:commerce-manifest
npm run check:template-imports
```

## Versión

- Template: `1.0.0`
- Schema: `1.0.0`
- Commerce: `preview-only`
- Categorización: ver [`audit/TEMPLATE-CATEGORIZATION.md`](../../audit/TEMPLATE-CATEGORIZATION.md) (`ecommerce-courses`)
