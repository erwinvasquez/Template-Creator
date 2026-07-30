# jewelry-orion-v1

Template package exportable para **IA Builder v2**.

## Contenido del package

| Archivo | Rol |
|---------|-----|
| `manifest.json` | Identidad del template, rutas, capabilities, bloque `commerce`, media slots |
| `schema.json` | JSON Schema del Content Payload (contrato para la herramienta/IA) |
| `commerce.schema.json` | JSON Schema del bloque `manifest.commerce` (Commerce Runtime Contract) |
| `defaults.json` | Payload golden — contenido actual del diseño Orion |
| `README.md` | Esta guía |

## Entradas del package

| Import | Uso |
|--------|-----|
| `@web-generator/jewelry-orion-v1` | Entrada completa (incluye `loadPayload`, requiere Node fs) |
| `@web-generator/jewelry-orion-v1/client` | Entrada client-safe: `JewelryApp`, vistas commerce, `orionCommerceViews`, helpers de rutas |
| `@web-generator/jewelry-orion-v1/styles.css` | CSS de identidad (clase raíz `orion-root`) |

## Preview en este repo

- Selector: [`/`](/)
- Home: [`/t/orion`](/t/orion)
- Colección: [`/t/orion/coleccion`](/t/orion/coleccion)
- Detalle: [`/t/orion/coleccion/anillo-solitaire-aurora`](/t/orion/coleccion/anillo-solitaire-aurora)
- Atelier (about): [`/t/orion/atelier`](/t/orion/atelier)
- Estuche: [`/t/orion/carrito`](/t/orion/carrito)
- Checkout: [`/t/orion/checkout`](/t/orion/checkout)
- Cuenta: [`/t/orion/cuenta`](/t/orion/cuenta) · [`login`](/t/orion/cuenta/login) · [`registro`](/t/orion/cuenta/registro)

## Cómo consume la herramienta este package

1. Registrar `templateId: jewelry-orion-v1` en el registry del Builder.
2. Cargar `manifest.json` + `schema.json` + `defaults.json`.
3. La UI / IA **solo** genera o edita un Content Payload validado contra `schema.json`.
4. El renderer monta el código del template + el payload del sitio.
5. **Nunca** regenerar HTML/CSS/React con la IA.

## Instancia de sitio (ejemplo)

```json
{
  "siteId": "site_demo",
  "templateId": "jewelry-orion-v1",
  "templateVersion": "1.2.0",
  "payload": { "...": "Content Payload (ver defaults.json como base)" }
}
```

## Identidad visual (fija, no editable por la IA)

- Tipografía: **Bodoni Moda** (`--font-bodoni`, encabezados) + **Jost** (`--font-jost`, cuerpo).
- Paleta: negro platino (`#141210`) + acento champán (`#B8956A`) sobre fondo cálido (`#FAFAF8`).
- Header sticky slim, marca alineada a la izquierda, links a la derecha, línea inferior fina al hacer scroll.
- Hero full-bleed con wordmark inferior-izquierda y un único CTA.
- Secciones propias: `signatures` (3 piezas insignia en mosaico cuadrado), `craft` (split 50/50), `materials` (4 paneles de material), `appointment` (banda ink de cita privada).

## Rutas internas del template

Los `href` del payload son **relativos al mount** del template. En este laboratorio el mount es
`/t/orion`; el runtime antepone el base path con `withBasePath`.

`manifest.routes[]` declara solo los `page` del contrato de plataforma:

| `path` | `page` | Nota |
|--------|--------|------|
| `/` | `home` | |
| `/coleccion` | `shop` | Catálogo. Query: `?categoria=<slug>` y/o `?coleccion=<slug>` |
| `/coleccion/[slug]` | `product` | Detalle de pieza |
| `/atelier` | `about` | El path conserva el copy de diseño; el `page` id del contrato es `about` |

**Orion usa `/coleccion` como raíz de catálogo, no `/tienda`.** Todo href de producto que emita el
commerce bridge, los breadcrumbs, los CTA de "explorar" y `resolveNavHref()` resuelven contra
`SHOP_PATH = "/coleccion"`.

Carrito, checkout y cuenta **no** están en `manifest.routes[]`: esas URLs las resuelve la
plataforma. El template aporta la UI (`CartPageView`, `CommerceCartDrawer`, `CheckoutPage`,
`AccountLoginForm`, `AccountRegisterForm`, `AccountDashboard`).

### Navegación (`navigation.primary`)

Dos formas de entrada:

```json
{ "type": "path", "label": "Colección", "href": "/coleccion" }
{ "type": "shopFilter", "label": "Anillos", "categorySlug": "anillos" }
```

`resolveNavHref()` convierte `shopFilter` en `/coleccion?categoria=anillos` (o
`?coleccion=<slug>`). El mapper del SaaS debe validar `categorySlug` / `collectionSlug` contra el
catálogo real del tenant antes de publicar el payload; si un slug ya no existe, la entrada debe
eliminarse o reapuntarse, no dejarse como query muerta.

### Cuenta (`features.accountBasePath`)

Raíz de cuenta relativa al mount. Default `/cuenta`; el SaaS puede fijar `/account` u otro valor
sin tocar la UI. `accountPath(basePath, accountBasePath, segment?)` resuelve `login` y `registro`.

## Commerce Runtime Contract

`manifest.commerce` declara `mode: "preview-only"` y las vistas implementadas. El template exporta
`orionCommerceViews` (`CommerceTemplateViews`) con:

`ProductListing`, `ProductDetail`, `CartPage`, `CartDrawer`, `CheckoutPage` + subcomponentes
tipados (`CheckoutCustomerFields`, `CheckoutShippingSelector`, `CheckoutPaymentSelector`,
`CheckoutDiscountCode`, `CheckoutOrderSummary`, `CheckoutSubmitActions`), `OrderConfirmation`,
`AccountLoginForm`, `AccountRegisterForm`, `AccountDashboard`.

El host conecta APIs y pasa `CheckoutViewModel` + `CheckoutFormState` + actions; **no** dibuja
inputs, radios, cards de pago ni resumen. `CheckoutLayout` (slots `ReactNode`) queda como
compatibilidad y está deprecado para integraciones nuevas.

Sin host inyectado, `JewelryApp` monta `createPayloadCommerceBridge(payload)`: un bridge de preview
alimentado por el catálogo del payload, con hrefs `/coleccion/{slug}`.

## Reglas para la IA

- Emitir únicamente JSON válido según `schema.json`.
- Preferir overrides sobre `defaults.json` en lugar de reinventar todo el payload.
- No inventar secciones, rutas ni layout.
- Imágenes: `MediaRef` con `mediaId` (preferido) o `url` + `alt`.
- `sections.signatures.productIds` debe tener exactamente 3 IDs existentes en `catalog.products`.
- `sections.materials.items` debe tener exactamente 4 elementos.
- Productos/colecciones: referenciar IDs del `catalog`; las secciones solo seleccionan.
- `navigation.primary` requiere `type` (`path` | `shopFilter`); prohibido emitir hrefs con
  query-string a mano.
- Prohibido emitir hrefs de plataforma (`/site/{org}/...`) o rutas de carrito/checkout como si
  fueran del template.

## Versión

- Template: `1.2.0`
- Schema: `1.0.0`
- Commerce: `preview-only` (paridad con `fashion-atelier-v1@1.2.0`)
