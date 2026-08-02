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
| shop `/vestidos` | shop(3) |
| product `/vestidos/[slug]` | product(0) |
| about `/casa` | about(4) |

### catalogBindings

| path | kind | sectionId | label (es) | maxItems |
|------|------|-----------|------------|----------|
| `sections.signature.productIds` | product | `signature` | Looks firma | 8 |
| `sections.accessories.productIds` | product | `accessories` | Accesorios | 12 |
| `sections.occasions.collectionIds` | collection | `occasions` | Ocasiones | 4 |

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
