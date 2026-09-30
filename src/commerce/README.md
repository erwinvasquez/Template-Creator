# Template Workspace — Commerce Runtime

Laboratorio desacoplado del SaaS. Los templates no conocen Firebase ni repositories.

## Arquitectura

```text
Content Payload  →  marketing / theme / home
Commerce Runtime Contract  →  view models + actions
Mock Commerce Bridge  →  fixtures in-memory
Template Views (Atelier / Orion)  →  UI
```

## Package

`@shopenlinea/commerce-runtime-contract` en [`packages/commerce-runtime-contract`](../packages/commerce-runtime-contract).

## Lab — catálogo del template vs fixtures

**Por defecto** (sin `?commerce=`), los lab shells usan `createPayloadCommerceBridge(payload)`:
el catálogo del `defaults.json` del template (Voxa cursos, Orion joyas, Atelier moda).

**Con `?commerce=…`**, el Mock Bridge compartido (seed de lab) sustituye el host.

| URL | Qué ves |
|-----|---------|
| `/t/voxa/catalogo` | Catálogo Voxa (payload) |
| `/t/voxa/catalogo?commerce=catalog-empty` | Fixture vacío |
| `/t/atelier/tienda?commerce=catalog-default` | Catálogo mock + cursor |
| `/t/atelier/tienda?commerce=catalog-search-empty` | Búsqueda sin resultados |
| `/t/atelier/tienda/abrigo-cashmere-stone?commerce=product-variants` | Variantes mock |
| `/t/atelier/tienda/producto-agotado` | Sin stock (slug de lab) |
| `/t/atelier/checkout?commerce=checkout-pickup` | Checkout slots pickup |
| `/t/atelier/checkout?commerce=checkout-delivery` | Checkout slots delivery |
| `/t/atelier/carrito?commerce=cart-promotion` | Carrito mock con ítems |

Los mismos fixtures corren en Orion/Voxa cambiando el prefijo y el path de tienda:
`/t/orion/coleccion?commerce=catalog-default`, `/t/voxa/checkout?commerce=checkout-pickup`, etc.

## Shop path por template

El mock bridge no asume `/tienda`. `createMockCommerceBridge(fixture, options)` acepta:

```ts
type MockCommerceBridgeOptions = {
  shopPath?: string;    // default "/tienda" — reescribe los hrefs de producto
  checkoutHref?: string; // default "/checkout"
};
```

`useLabCommerceHost(fixture | null, options)` — con fixture crea el mock; con `null`/vacío
devuelve `null` y el lab shell cae al payload bridge. Orion/Voxa pasan `{ shopPath: SHOP_PATH }`
desde sus LabShells, así que las cards, el PDP y las líneas del carrito mock
devuelven `/coleccion/{slug}` o `/catalogo/{slug}`.

## Añadir un fixture

1. Extiende `CommerceFixtureId` en [`src/commerce/fixtures/ids.ts`](fixtures/ids.ts).
2. Rama en [`createMockCommerceBridge`](mock/createMockCommerceBridge.ts).
3. Si el fixture emite hrefs de producto, pásalos por `rewriteHref` para respetar `shopPath`.
4. Historia Storybook opcional en [`src/commerce/stories`](stories/).

## Validaciones

```bash
npm run typecheck:contract
npm run check:template-imports
npm run validate:commerce-manifest
npm run test:commerce
```

## Adaptive rendering

Capabilities = soporte técnico. Atelier y Orion muestran búsqueda/filtros solo con datos; omiten specs/related vacíos; no inventan placeholders.

## Límites (`preview-only`)

- Mock Bridge sin red.
- Checkout = **CheckoutPage tipado** del template; el lab solo pasa VM + form state + actions (sin HTML del host).
- Account login/register aún no están en el contrato: la UI vive en el template
  (`AccountLoginForm` / `AccountRegisterForm` / `AccountDashboard`) y el host resuelve auth.

## SaaS (otro repo)

```tsx
const Views = templateRegistry.getViews(templateId);
return (
  <Views.CheckoutPage
    checkout={vm}
    state={formState}
    capabilities={caps}
    actions={bridge.actions}
    onStateChange={setFormPatch}
  />
);
```

Prohibido que el host dibuje inputs/radios/cards de pago. Implementar `createCommerceRuntimeBridge`; `manifest.commerce.mode = "runtime"`.
