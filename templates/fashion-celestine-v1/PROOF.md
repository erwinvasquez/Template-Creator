# Proof of acceptance — fashion-celestine-v1

Documento formal: [`audit/PACKAGE-PORTABILITY-CONTRACT.md`](../../audit/PACKAGE-PORTABILITY-CONTRACT.md).

## Commands

```bash
npm run template:validate -- fashion-celestine-v1
npm run template:export -- fashion-celestine-v1
npm run dev
# open /t/celestine
```


## Checklist — SaaS editor / plug-and-play

| Check | Evidence |
|-------|----------|
| builder pages ↔ manifest.routes | paths/sections alineados; validate OK |
| contentSlotIds ⊆ slotDefinitions | 24 slots editables (brand.* = editorSurface none) |
| catalogBindings | uno por cada catalogRef |
| themeEditable | primary/secondary/background/fonts |
| navigation.primaryFromPayload | `navigation.primary` en defaults |
| data-wb-slot | copy/media/CTA estáticos en src/components |
| CommerceAwareCatalog | skip setCatalogFilters si !hasPayloadTaxonomy |

### Secciones builder (slots por sección)

| Página | Secciones (nº slots) |
|--------|----------------------|
| home `/` | hero(4), occasions(2), craft(3), signature(2), note(3), accessories(3) |
| shop `/coleccion` | shop(3) |
| product `/coleccion/[slug]` | product(0) |
| about `/casa` | about(4) |

### catalogBindings

| path | kind | sectionId | label (es) | maxItems |
|------|------|-----------|------------|----------|
| `sections.signature.productIds` | product | `signature` | Looks firma | 8 |
| `sections.accessories.productIds` | product | `accessories` | Accesorios | 12 |
| `sections.occasions.collectionIds` | collection | `occasions` | Ocasiones | 4 |

**Badge «Look firma»:** semántica de la sección `signature`, no del catálogo global. `getSignatureProducts` fuerza `isFeatured: true`; `getAccessoryProducts` fuerza `isFeatured: false` aunque `catalog.products[].badges` incluya `featured`. Shop/PLA (`CommerceProductCard`) sigue leyendo badges del runtime commerce. Test: `src/commerce/tests/celestine-section-featured.test.ts`.

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
| sections.* slots | 40 |
| list slots | 4 |
| ui.* leaves (defaults) | 109 |
| data-wb-slot ids | 40 |
| catalogBindings | 3 |

| Página | Sección | # slots | slotIds |
|--------|---------|---------|---------|
| home | hero | 5 | hero.ctaPrimary, hero.ctaSecondary, hero.headline, hero.image… |
| home | occasions | 2 | occasions.eyebrow, occasions.title |
| home | craft | 4 | craft.body, craft.eyebrow, craft.steps, craft.title |
| home | signature | 3 | signature.eyebrow, signature.title, signature.viewAll |
| home | note | 4 | note.body, note.cta, note.eyebrow, note.title |
| home | accessories | 4 | accessories.body, accessories.cta, accessories.eyebrow, accessories.title |
| home | footer | 4 | footer.blurb, footer.columns, footer.copyrightName, footer.tagline |
| shop | shop | 3 | shop.description, shop.eyebrow, shop.title |
| product | product | 18 | product.addToCart, product.addingToCart, product.outOfStock, product.contact… |
| about | about | 11 | about.bannerImage, about.blocks, about.closing.body, about.closing.cta… |


Validation: `npm run template:validate -- fashion-celestine-v1` (includes content contract A–D).
