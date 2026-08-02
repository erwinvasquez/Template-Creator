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
| accountBasePath `/cuenta` | defaults + Header |


## Checklist — SaaS editor / plug-and-play

| Check | Evidence |
|-------|----------|
| builder pages ↔ manifest.routes | paths/sections alineados; validate OK |
| contentSlotIds ⊆ slotDefinitions | 22 slots editables (brand.* = editorSurface none) |
| catalogBindings | uno por cada catalogRef |
| themeEditable | primary/secondary/background/fonts |
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


## Checklist — sales mode (stock / a pedido)

| Check | Evidence |
|-------|----------|
| Un solo modo | `salesModeSwitch: unsupported` → sin nav de modos, sin banner shop, sin línea en carrito |
| Ambos modos | Host pone `salesModeSwitch: supported` (+ lab `?dualSalesMode=1`) |
| maxQuantity | Tope en selector +/-; sin copy "Máx. N" |
| Prep / cerrado | Solo si el host envía `preparationPromiseLabel` / `madeToOrderClosed` / reopen label |
| Copy editable | `defaults.ui.salesMode` + schema `UiCopy.salesMode` |
| Query nav | `?salesMode=stock\|madeToOrder` vía `ui.salesMode.nav` + `SHOP_QUERY.salesMode` |
