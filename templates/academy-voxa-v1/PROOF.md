# Proof of acceptance — academy-voxa-v1

Documento formal ampliado (patrón general): [`audit/PACKAGE-PORTABILITY-CONTRACT.md`](../../audit/PACKAGE-PORTABILITY-CONTRACT.md).

## Commands

```bash
# 1. Validate payloads + builder + taxonomía
npm run template:validate -- academy-voxa-v1
npm run validate:template-package -- academy-voxa-v1
npm run validate:commerce-manifest
npm run check:template-imports
npx tsc --noEmit

# 2. Export immutable package
npm run template:export -- academy-voxa-v1

# 3. Lab preview desde defaults.json
npm run dev
# open http://localhost:3000/t/voxa

# 4. Payload alterno (diseño intacto, contenido distinto)
# open http://localhost:3000/t/voxa?payload=alt-brand
```

## Rutas de preview (lab)

| URL | `page` |
|-----|--------|
| `/t/voxa` | `home` |
| `/t/voxa/catalogo` | `shop` |
| `/t/voxa/catalogo/[slug]` | `product` |
| `/t/voxa/academia` | `about` |
| `/t/voxa/carrito` | `cart` (URL de plataforma) |
| `/t/voxa/checkout` | `checkout` (URL de plataforma) |
| `/t/voxa/cuenta`, `/cuenta/login`, `/cuenta/registro` | cuenta (URL de plataforma, `features.accountBasePath`) |

## Checklist — package portable

| Step | Evidence |
|------|----------|
| Sin contenido Voxa hardcodeado en JSX | Runtime en `templates/academy-voxa-v1/src`; todo el copy sale del payload |
| Render desde `defaults.json` | `/t/voxa` usa `loadPayload()` |
| Payload alterno | `/t/voxa?payload=alt-brand` → marca **Clarion**, paleta y copy distintos |
| Diseño intacto | Mismas secciones/componentes; solo cambian copy, media y tokens |
| Export | `dist/packages/academy-voxa-v1` + `BUILD_INFO.json` + `IMMUTABLE` |
| Distinto de los demás templates | Secciones propias (`programs`, `method`, `outcomes`, `books`, `about`), tipografías Fraunces/Source Sans 3, paleta navy + teal, hero con halo radial, tarjetas 4/3 |
| Nav home (Tier C) | `fixed` + `glass-dark` sobre hero; texto blanco; al scroll → `glass` + texto brand |
| API canónica | `TemplateApp`, `commerceViews`, `customMain` en `src/client.ts` / `src/renderer.tsx` |

## Checklist — Commerce Runtime Contract

| Requisito | Evidencia |
|-----------|-----------|
| CommerceHost en vez de CartProvider | `src/lib/commerce-host.tsx` (`TemplateCommerceProvider`, `useHostCart`); sin `cart-context` local |
| `routes[].page` ∈ `{ home, shop, product, about }` | `manifest.json`; `/academia` → `page: "about"` |
| Shop path propio (`/catalogo`) | `SHOP_PATH` en `src/content/resolve.ts`; hrefs del bridge y de las tarjetas |
| Cart/checkout/account fuera de `routes[]` | `manifest.routes[]` con 4 entradas; URLs las inyecta el host |
| `CommerceTemplateViews` completo | `commerceViews` en `src/client.ts` |
| CheckoutPage tipado (sin slots `ReactNode`) | `src/components/commerce/CheckoutPage.tsx` + subcomponentes; `CheckoutLayout` solo compat deprecada |
| Account UI en el template | `src/components/account/*`; auth la resuelve el host |
| NavLink `path` \| `shopFilter` | `schema.json` `$defs/NavLink`; `resolveNavHref()` |
| `features.accountBasePath` | `defaults.json` → `/cuenta`; `accountPath()` |
| Mock Bridge alimenta el mismo CheckoutPage | `VoxaLabShell` + `useLabCommerceHost(fixture, { shopPath: "/catalogo" })` |

## Taxonomía

| Campo | Valor |
|-------|-------|
| `manifest.category` | `ecommerce-courses` |
| `descriptor.templateId` | `voxa` (slug corto = `TEMPLATE_SLUG`) |
| `descriptor.websiteType` | `ecommerce` |
| `descriptor.industryTags` | `courses`, `coaching`, `education`, `books` |
| `descriptor.status` | `published` → `active` en el SaaS |
| Versión | `1.0.0` en `package.json`, `manifest.json`, `defaults.templateVersion`, fixture y descriptor |

## Semántica del catálogo

`metals` = modalidad (`Online` / `Presencial`) o formato del libro (`Digital` / `Impreso`).
`sizes` = duración y nivel del programa, o extensión y encuadernación del libro. Los nombres de campo
se conservan por compatibilidad del contrato de catálogo; el copy visible ya es de academia
(`Modalidad`, `Duración`).

## Gaps conocidos

- `ProductDetailCommerceView` dispara `setState` dentro de un `useEffect` al cambiar de variante
  (misma deuda heredada del resto de templates).
- `commerce.mode` sigue en `preview-only`: `contractVersion` se fijará al conectar el runtime real.
- `src/components/ShopCatalog.tsx` y `src/components/ProductCard.tsx` quedan como render payload-only
  (el listado de `/catalogo` ya pasa por `CommerceAwareCatalog`).
- No hay tests de Vitest específicos de Voxa; la suite existente cubre `fashion-atelier-v1` y
  `jewelry-orion-v1`.


## Checklist — SaaS editor / plug-and-play

| Check | Evidence |
|-------|----------|
| builder pages ↔ manifest.routes | paths/sections alineados; validate OK |
| contentSlotIds ⊆ slotDefinitions | 30 slots editables (brand.* = editorSurface none) |
| catalogBindings | uno por cada catalogRef |
| themeEditable | primary/secondary/background/fonts |
| navigation.primaryFromPayload | `navigation.primary` en defaults |
| data-wb-slot | copy/media/CTA estáticos en src/components |
| CommerceAwareCatalog | skip setCatalogFilters si !hasPayloadTaxonomy |

### Secciones builder (slots por sección)

| Página | Secciones (nº slots) |
|--------|----------------------|
| home `/` | hero(5), programs(2), method(4), outcomes(5), books(3) |
| shop `/catalogo` | shop(3) |
| product `/catalogo/[slug]` | product(0) |
| about `/academia` | about(6) |

### catalogBindings

| path | kind | sectionId | label (es) | maxItems |
|------|------|-----------|------------|----------|
| `sections.programs.productIds` | product | `programs` | Programas destacados | 6 |
| `sections.books.productIds` | product | `books` | Libros | 6 |

### List slots

- `method.steps` → `sections.method.steps` + listSchema (object, 3–4)
- `outcomes.bullets` → `sections.outcomes.bullets` + listSchema (string, 3–6)


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


## Checklist — home section order (Sprint P)

| Check | Evidence |
|-------|----------|
| Registry | `src/lib/home-section-registry.tsx` + `DEFAULT_HOME_SECTION_ORDER` |
| HomeView dinámico | `renderHomeSections(payload)` — sin JSX estático de secciones |
| Schema | `layout.pages.home.sectionOrder` optional (enum section ids) |
| Hero @0 | `resolveHomeSectionOrder` fuerza `hero` primero |
| Footer | Excluido del registry (renderer) |
| features.newsletter | `shouldRenderHomeSection` oculta newsletter si `false` |


## Checklist — hero lista carrusel (Sprint 85)

| Check | Evidence |
|-------|----------|
| Schema | `carouselImages` max 6; secondary/móvil deprecados |
| Runtime | `resolveHeroSlides`: lista ≥1 ignora `hero.image` como slide |
| Animación | Solo activa + saliente en DOM; fade 1s sin ghosting |
| Z-index | Carrusel `z-0`; scrim `z-[1] pointer-events-none`; copy `z-10` |
| Slots SaaS | `hero.image`, `hero.carousel` (list), slides `hero.carousel.N` en JSX |

## Checklist — hero carousel + móvil (Sprint 84)

| Check | Evidence |
|-------|----------|
| Schema hero | `imageSecondary`, `imageMobile`, `imageMobileSecondary`, `carouselIntervalMs` opcionales |
| Carrusel | `HeroCarouselMedia` fade; intervalo default 4000ms; 1 slide → sin timer |
| Reduced motion | `prefers-reduced-motion` → primera imagen fija |
| Slots editor | `hero.image` + secondary/móvil en `builder.manifest` |
| Migración | Solo `image` → mismo aspecto que antes |

## Checklist — PLP stock→MTO (Sprint R6)

| Check | Evidence |
|-------|----------|
| Helper contrato | `resolveCatalogAvailabilityPresentation` + `catalogCardHref` (sin lib local) |
| made_to_order_available | Banner/label `ui.product.buyMadeToOrderCta`; imagen sin dim agotado |
| sold_out | Overlay `ui.product.outOfStock` + opacity (comportamiento previo) |
| href MTO | `catalogCardHref(product)` → `?salesMode=madeToOrder` |
| Preview bridge | `cardAvailabilityFields` en `toCard` con `?dualSalesMode=1` |
| Vitest | `catalogAvailabilityPresentation.test.ts` + `CommerceProductCard.test.tsx` |


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
| sections.* slots | 38 |
| list slots | 6 |
| ui.* leaves (defaults) | 110 |
| data-wb-slot ids | 38 |
| catalogBindings | 2 |

| Página | Sección | # slots | slotIds |
|--------|---------|---------|---------|
| home | hero | 6 | hero.ctaPrimary, hero.ctaSecondary, hero.headline, hero.image… |
| home | programs | 2 | programs.eyebrow, programs.title |
| home | method | 4 | method.body, method.eyebrow, method.steps, method.title |
| home | outcomes | 5 | outcomes.body, outcomes.bullets, outcomes.eyebrow, outcomes.image… |
| home | books | 3 | books.cta, books.eyebrow, books.title |
| home | footer | 4 | footer.blurb, footer.columns, footer.copyrightName, footer.tagline |
| shop | shop | 3 | shop.description, shop.eyebrow, shop.title |
| product | product | 18 | product.addToCart, product.addingToCart, product.outOfStock, product.contact… |
| about | about | 11 | about.bannerImage, about.blocks, about.closing.body, about.closing.cta… |


Validation: `npm run template:validate -- academy-voxa-v1` (includes content contract A–D).
