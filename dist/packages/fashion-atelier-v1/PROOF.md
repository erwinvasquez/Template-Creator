# Proof of acceptance — fashion-atelier-v1

Documento formal ampliado: [`audit/PACKAGE-PORTABILITY-CONTRACT.md`](../../audit/PACKAGE-PORTABILITY-CONTRACT.md).

## Commands

```bash
# 1–2. Validate + export immutable package
npm run template:validate -- fashion-atelier-v1
npm run template:export -- fashion-atelier-v1

# 3. Lab preview from defaults.json
npm run dev
# open http://localhost:3000/t/atelier

# 4. Alternate payload (design intact, content changes)
# open http://localhost:3000/t/atelier?payload=alt-brand

# 5–7. Clean host imports ONLY dist/
npm install --prefix hosts/clean-host
npm run build --prefix hosts/clean-host
npm run start --prefix hosts/clean-host
# open http://localhost:3010
```

## Checklist

| Step | Evidence |
|------|----------|
| No hardcoded Atelier content in JSX | Runtime under `templates/fashion-atelier-v1/src`; content from payload |
| Render from defaults.json | `/t/atelier` loads `loadPayload()` |
| Alt payload | `/t/atelier?payload=alt-brand` → brand LUMEN |
| Design intact | Same sections/components; only copy/media change |
| Export | `dist/packages/fashion-atelier-v1` + `BUILD_INFO.json` + `IMMUTABLE` |
| Clean host | Depends on `file:../../dist/packages/fashion-atelier-v1` |
| Same template | Clean host uses `AtelierApp` + `loadPayload()` from dist package |

## Aceptación commerce 1.2.0

```bash
npm test -- src/commerce/tests/ProductDetailCommerceView.test.tsx
# Lab:
# /t/atelier/tienda/abrigo-cashmere-stone?commerce=product-variants
# /t/atelier/tienda/producto-agotado?commerce=product-out-of-stock
```

| Check | OK |
|-------|----|
| Cantidad > 1 en addToCart | Vitest |
| compareAt + % | Vitest + UI |
| Agotado deshabilita CTA | Vitest |
| Galería ≥3 / pickers | Mock seed + lab |
| Variant picker paridad Shopify (sin deadlock) | `variantOptionPicker` contrato + Vitest Material Y |
| accountBasePath `/cuenta` | defaults + Header |


## Checklist — SaaS editor / plug-and-play

| Check | Evidence |
|-------|----------|
| builder pages ↔ manifest.routes | paths/sections alineados; validate OK |
| contentSlotIds ⊆ slotDefinitions | 22 slots editables (brand.* = editorSurface none) |
| catalogBindings | uno por cada catalogRef |
| themeEditable | primary/secondary/background/fonts |
| theme template-only | `ink`, `text`, `muted`, `border`, `surface`, `cta`/`ctaHover` (deprecated alias → primary/secondary en runtime) — ver [`audit/TEMPLATE-THEME-TOKEN-MAP.md`](../../audit/TEMPLATE-THEME-TOKEN-MAP.md) |
| navigation.primaryFromPayload | `navigation.primary` en defaults |
| data-wb-slot | copy/media/CTA estáticos en src/components |
| CommerceAwareCatalog | skip setCatalogFilters si !hasPayloadTaxonomy |

### Secciones builder (slots por sección)

| Página | Secciones (nº slots) |
|--------|----------------------|
| home `/` | hero(4), collections(2), featured(2), editorial(4), newsletter(3) |
| shop `/tienda` | shop(3) |
| product `/tienda/[slug]` | product(0) |
| about `/nosotros` | about(4) |

### catalogBindings

| path | kind | sectionId | label (es) | maxItems |
|------|------|-----------|------------|----------|
| `sections.featured.productIds` | product | `featured` | Piezas destacadas | 8 |
| `sections.collections.collectionIds` | collection | `collections` | Colecciones | 3 |

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
| sections.* slots | 41 |
| list slots | 4 |
| ui.* leaves (defaults) | 109 |
| data-wb-slot ids | 41 |
| catalogBindings | 2 |

| Página | Sección | # slots | slotIds |
|--------|---------|---------|---------|
| home | hero | 6 | hero.ctaPrimary, hero.ctaSecondary, hero.headline, hero.image… |
| home | collections | 3 | collections.eyebrow, collections.itemCtaLabel, collections.title |
| home | featured | 3 | featured.eyebrow, featured.title, featured.viewAll |
| home | editorial | 5 | editorial.body, editorial.cta, editorial.eyebrow, editorial.image… |
| home | newsletter | 6 | newsletter.eyebrow, newsletter.placeholder, newsletter.submitLabel, newsletter.subtitle… |
| home | footer | 4 | footer.blurb, footer.columns, footer.copyrightName, footer.tagline |
| shop | shop | 3 | shop.description, shop.eyebrow, shop.title |
| product | product | 18 | product.addToCart, product.addingToCart, product.outOfStock, product.contact… |
| about | about | 11 | about.bannerImage, about.blocks, about.closing.body, about.closing.cta… |


Validation: `npm run template:validate -- fashion-atelier-v1` (includes content contract A–D).
