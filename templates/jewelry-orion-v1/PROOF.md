# Proof of acceptance — jewelry-orion-v1

Documento formal ampliado (patrón general): [`audit/PACKAGE-PORTABILITY-CONTRACT.md`](../../audit/PACKAGE-PORTABILITY-CONTRACT.md).

## Commands

```bash
# 1–2. Validate payloads + commerce manifest
npm run template:validate -- jewelry-orion-v1
npm run validate:commerce-manifest
npm run check:template-imports
npx tsc --noEmit
npx vitest run

# 3. Export immutable package
npm run template:export -- jewelry-orion-v1

# 4. Lab preview from defaults.json
npm run dev
# open http://localhost:3000/t/orion

# 5. Alternate payload (design intact, content changes)
# open http://localhost:3000/t/orion?payload=alt-brand
```

## Rutas de preview (lab)

| URL | `page` |
|-----|--------|
| `/t/orion` | `home` |
| `/t/orion/coleccion` | `shop` |
| `/t/orion/coleccion/[slug]` | `product` |
| `/t/orion/atelier` | `about` |
| `/t/orion/carrito` | `cart` (URL de plataforma) |
| `/t/orion/checkout` | `checkout` (URL de plataforma) |
| `/t/orion/cuenta`, `/cuenta/login`, `/cuenta/registro` | cuenta (URL de plataforma, `features.accountBasePath`) |

## Checklist — package portable

| Step | Evidence |
|------|----------|
| No hardcoded Orion content in JSX | Runtime under `templates/jewelry-orion-v1/src`; content from payload |
| Render from defaults.json | `/t/orion` loads `loadPayload()` |
| Alt payload | `/t/orion?payload=alt-brand` → brand AURELIA |
| Design intact | Same sections/components; only copy/media change |
| Export | `dist/packages/jewelry-orion-v1` + `BUILD_INFO.json` + `IMMUTABLE` |
| Different from fashion-atelier-v1 | Distinct schema sections (`signatures`, `craft`, `materials`, `appointment`, `atelier`), distinct fonts (Bodoni Moda/Jost), distinct palette (champagne platinum), distinct header/hero/footer layout, square product cards |
| Same template | `JewelryApp` + `loadPayload()` from the package |

## Checklist — Commerce Runtime Contract 1.2.0

| Requisito | Evidencia |
|-----------|-----------|
| CommerceHost en vez de CartProvider | `src/lib/commerce-host.tsx` (`OrionCommerceProvider`, `useHostCart`); `src/lib/cart-context.tsx` eliminado |
| `routes[].page` ∈ `{ home, shop, product, about }` | `manifest.json`; `/atelier` → `page: "about"` |
| Shop path propio (`/coleccion`) | `SHOP_PATH` en `src/content/resolve.ts`; test `OrionProductDetail.test.tsx` verifica todos los hrefs |
| Sin hrefs de plataforma | `check:template-imports` + hrefs del bridge siempre `/coleccion/{slug}` |
| Cart/checkout/account fuera de `routes[]` | `manifest.routes[]` solo 4 entradas; URLs las inyecta el host |
| `CommerceTemplateViews` completo | `orionCommerceViews` en `src/client.ts` |
| CheckoutPage tipado (sin slots `ReactNode`) | `src/components/commerce/CheckoutPage.tsx` + subcomponentes; `CheckoutLayout` solo compat deprecada |
| Account UI en el template | `src/components/account/*`; auth la resuelve el host |
| NavLink `path` \| `shopFilter` | `schema.json` `$defs/NavLink`; `resolveNavHref()` |
| `features.accountBasePath` | `defaults.json` → `/cuenta`; `accountPath()` |
| Mock Bridge alimenta el mismo CheckoutPage | `OrionLabShell` + `useLabCommerceHost(fixture, { shopPath: "/coleccion" })` |
| `manifest.commerce` validado | `npm run validate:commerce-manifest` (AJV + reglas de negocio, ambos templates) |

## Mapper SaaS — `shopFilter`

Al publicar un payload el SaaS debe:

1. Resolver `categorySlug` contra `catalog.categories[].slug` del tenant y `collectionSlug` contra
   `catalog.collections[].slug`.
2. Rechazar o reapuntar la entrada si el slug no existe (no dejar queries muertas).
3. No reescribir la entrada a `type: "path"` con query-string: el template resuelve el href.

## Gaps conocidos

- `ProductDetailCommerceView` dispara `setState` dentro de un `useEffect` al cambiar de variante
  (misma deuda que `fashion-atelier-v1`; `react-hooks/set-state-in-effect` lo marca en ambos).
- `commerce.mode` sigue en `preview-only`: `contractVersion` se fijará al conectar el runtime real.
- `src/components/ShopCatalog.tsx` y `src/components/ProductCard.tsx` quedan como render payload-only
  (el listado de `/coleccion` ya pasa por `CommerceAwareCatalog`).


## Checklist — SaaS editor / plug-and-play

| Check | Evidence |
|-------|----------|
| builder pages ↔ manifest.routes | paths/sections alineados; validate OK |
| contentSlotIds ⊆ slotDefinitions | 23 slots editables (brand.* = editorSurface none) |
| catalogBindings | uno por cada catalogRef |
| themeEditable | primary/secondary/background/fonts |
| navigation.primaryFromPayload | `navigation.primary` en defaults |
| data-wb-slot | copy/media/CTA estáticos en src/components |
| CommerceAwareCatalog | skip setCatalogFilters si !hasPayloadTaxonomy |

### Secciones builder (slots por sección)

| Página | Secciones (nº slots) |
|--------|----------------------|
| home `/` | hero(4), signatures(2), craft(4), materials(2), appointment(4) |
| shop `/coleccion` | shop(3) |
| product `/coleccion/[slug]` | product(0) |
| about `/atelier` | atelier(4) |

### catalogBindings

| path | kind | sectionId | label (es) | maxItems |
|------|------|-----------|------------|----------|
| `sections.signatures.productIds` | product | `signatures` | Piezas insignia | 6 |

### List slots

- (ninguno)


## Checklist — PDP presentation (Sprint N)

| Check | Evidence |
|-------|----------|
| Toggles visibilidad | `isPdpFieldVisible` + merge SaaS `sections.product.presentation` (sin slot WG) |
| supportedFields | `manifest.capabilities.productDetailPresentation.supportedFields` |
| ui.product slots | Page product `contentSlotIds` + `slotDefinitions` `ui.product.*` (sin `shippingNote`) |
| Prep nota PDP | `{ui.salesMode.madeToOrder.preparationLabel}: {product.preparationPromiseLabel}` debajo CTA; sin `ui.product.shippingNote` en PDP |


## Checklist — order tracking (Sprint U1)

| Check | Evidence |
|-------|----------|
| OrderTrackingView | `components/commerce/OrderTrackingView.tsx`; props `OrderTrackingViewProps` |
| commerceViews + renderer | `OrderTracking` en `client.ts`; `case orderTracking` en `renderer.tsx` |
| manifest | `commerce.views.orderTracking: true` |
| Layout offset | Mismo padding que Cart/Confirmation del template (header fixed/sticky) |
| Sin fetch host | Vitest `OrderTrackingView.test.tsx` + mock VM |
| Miniaturas líneas | `line.imageUrl` en resumen; placeholder `labels.imagePlaceholder` si falta |


## Checklist — sales mode (stock / a pedido)

| Check | Evidence |
|-------|----------|
| Un solo modo | `salesModeSwitch: unsupported` → sin switch en shop, sin línea en carrito |
| Ambos modos | Host pone `salesModeSwitch: supported` (+ lab `?dualSalesMode=1`); switch en **fila del eyebrow** del shop (derecha, con `\|`), **no** en navbar |
| maxQuantity | Tope en selector +/-; sin copy "Máx. N" |
| PDP plazo prep | Debajo del CTA/errores; `{ui.salesMode.madeToOrder.preparationLabel}: {product.preparationPromiseLabel}`; toggle `presentation.preparationPromise`; clases `mt-4 text-[11px] font-medium uppercase tracking-[0.14em] text-muted`; prohibido `ui.product.shippingNote` en PDP |
| PDP cerrado | `madeToOrderClosed` / reopen label **encima** del buy box si el host envía |
| Shop prep / cerrado | `SalesModeShopBanner` en listing si `filters.salesMode=madeToOrder`; prefijos `ui.salesMode` solo si el host envía campos en filtros (sin shopBanner genérico duplicado) |
| Upsell stock→MTO | Modal `ui.product.stockUpsellModalTitle`; cuerpo `{count}` = tope inmediato (`stockCap`); hint + CTA; prep con prefijo `ui.salesMode` |
| Stock=0 + dual channel (Trigger B) | Panel inline `stockExhaustedImmediateTitle` + link MTO; sin CTA stock/agotado |
| Stock=2, qty=3 (Trigger A) | Modal upsell regresión; Vitest `opens made-to-order upsell` |
| Copy editable | `defaults.ui.salesMode` + schema `UiCopy.salesMode` |
| Query nav | `?salesMode=stock\|madeToOrder` vía `ui.salesMode.nav` + `SHOP_QUERY.salesMode` |
| Cart drawer R2 | `useHostCart` + `getCartSnapshot`; sin refetch por `isOpen`; bootstrap solo si snapshot null |


## Content contract (Phase 1) — autogenerated

| Namespace | Count |
|-----------|-------|
| sections.* slots | 36 |
| list slots | 4 |
| ui.* leaves (defaults) | 109 |
| data-wb-slot ids | 36 |
| catalogBindings | 1 |

| Página | Sección | # slots | slotIds |
|--------|---------|---------|---------|
| home | hero | 4 | hero.ctaPrimary, hero.headline, hero.image, hero.subheadline |
| home | signatures | 2 | signatures.eyebrow, signatures.title |
| home | craft | 5 | craft.body, craft.cta, craft.eyebrow, craft.image… |
| home | materials | 3 | materials.eyebrow, materials.items, materials.title |
| home | appointment | 4 | appointment.body, appointment.cta, appointment.eyebrow, appointment.title |
| home | footer | 4 | footer.blurb, footer.columns, footer.copyrightName, footer.tagline |
| shop | shop | 3 | shop.description, shop.eyebrow, shop.title |
| product | product | 18 | product.addToCart, product.addingToCart, product.outOfStock, product.contact… |
| about | atelier | 11 | atelier.bannerImage, atelier.blocks, atelier.closing.body, atelier.closing.cta… |


Validation: `npm run template:validate -- jewelry-orion-v1` (includes content contract A–D).
