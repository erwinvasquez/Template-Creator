# Handoff WG → SaaS — Sales mode (stock / made-to-order)

**Estado:** listo para sync  
**Owner contrato + UI templates:** Web Generator (este repo)  
**Owner host/bridge:** Shopenlinea SaaS  

> **No usar** `CatalogContextViewModel` / `catalog-context.ts` / `catalogContext` en el host como contrato de templates. Fue provisional en SaaS; los packages WG **no** lo consumen.

---

## 1. Versión WG

| Campo | Valor |
|-------|--------|
| Repo | Web Generator |
| Commit | `dae08a61a63f2b75f9c987b502d53af25a870fd2` (`dae08a6`) |
| Packages | `dist/packages/{fashion-atelier-v1,fashion-celestine-v1,jewelry-orion-v1,academy-voxa-v1}/` |
| Contract | `packages/commerce-runtime-contract/` (`@shopenlinea/commerce-runtime-contract`) |

Tras el sync SaaS: copiar esos `dist/packages/*` → `packages/*` y correr `pnpm template:registry:sync`.

---

## 2. Campos host → template (oficial)

### Capability

| Campo | Cuándo |
|-------|--------|
| `capabilities.salesModeSwitch` | `"supported"` **solo** si la org tiene **ambos** canales (stock + a pedido). En caso contrario `"unsupported"` (o omitir → preview default unsupported). |

Si no es `supported` → el template **no** pinta chrome de modo (nav de modos, banner shop, línea de modo en carrito).

### `ProductFilterViewModel` (listing)

Enviar estos campos **cuando** `salesModeSwitch === "supported"` **y** `salesMode === "madeToOrder"`:

| Campo | Tipo | Notas |
|-------|------|--------|
| `salesMode` | `"stock" \| "madeToOrder"` | Siempre en filters |
| `madeToOrderAcceptingOrders` | `boolean?` | `false` → banner de cerrado |
| `preparationPromiseLabel` | `string \| null?` | **Solo valor** (`"3–5 días"`). Sin prefijo “Preparación:” |
| `madeToOrderReopensAtLabel` | `string \| null?` | **Solo valor** de reapertura (`"10:00"`). Sin prefijo “Volvemos” |

En modo `stock` (aunque dual-mode esté on): no hace falta mandar prep/cerrado/reopen.

### `ProductDetailViewModel` (PDP, contexto made-to-order)

| Campo | Tipo | Notas |
|-------|------|--------|
| `preparationPromiseLabel` | `string \| null?` | **Solo valor**; el template añade `ui.salesMode.madeToOrder.preparationLabel` |
| `madeToOrderClosed` | `boolean?` | Bloquea compra + mensaje |
| `madeToOrderReopensAtLabel` | `string \| null?` | Valor de reopen; template puede prefijar `reopensPrefix` |

### `CartViewModel`

| Campo | Tipo | Notas |
|-------|------|--------|
| `salesMode` | `SalesMode` | Ya existía |
| `madeToOrderAcceptingOrders` | `boolean?` | Dual-mode: si `false` + MTO → warning antes de checkout |

### `maxQuantity`

Tope del selector +/-. **Nunca** enviar copy de “Máx. N” para UI: el template no lo muestra.

### Nav

El host **no** inyecta enlaces de modo. Viven en el payload del template:

`defaults.json` → `ui.salesMode.nav[]` → `{ salesMode, label, href }`

El host solo pone `salesModeSwitch: "supported"`. El template lee la query `?salesMode=stock|madeToOrder` y llama `setCatalogFilters({ salesMode })`.

---

## 3. Ejemplo bridge — dual-mode + MTO abierto

```ts
const capabilities = {
  ...baseCapabilities,
  salesModeSwitch: "supported", // ambos canales en la org
};

const filters: ProductFilterViewModel = {
  salesMode: "madeToOrder",
  madeToOrderAcceptingOrders: true,
  preparationPromiseLabel: "3–5 días", // valor solo
  madeToOrderReopensAtLabel: null,
  categories: [...],
  collections: [...],
  brands: [...],
};

const product: ProductDetailViewModel = {
  // ...resto
  canAddToCart: true,
  madeToOrderClosed: false,
  preparationPromiseLabel: "3–5 días",
  madeToOrderReopensAtLabel: null,
};

const cart: CartViewModel = {
  // ...resto
  salesMode: "madeToOrder",
  madeToOrderAcceptingOrders: true,
};
```

### MTO cerrado (listing + PDP + cart)

```ts
filters.madeToOrderAcceptingOrders = false;
filters.preparationPromiseLabel = null;
filters.madeToOrderReopensAtLabel = "10:00"; // valor solo

product.madeToOrderClosed = true;
product.madeToOrderReopensAtLabel = "10:00";
product.canAddToCart = false;

cart.madeToOrderAcceptingOrders = false;
```

---

## 4. URLs de lab (WG monorepo)

Preview single-mode (sin chrome): rutas normales sin query dual.

Dual-mode:

| Template | Lab |
|----------|-----|
| Atelier | `/t/atelier/tienda?dualSalesMode=1&salesMode=madeToOrder` |
| Celestine | `/t/celestine/vestidos?dualSalesMode=1&salesMode=madeToOrder` |
| Orion | `/t/orion/coleccion?dualSalesMode=1&salesMode=madeToOrder` |
| Voxa | `/t/voxa/programas?dualSalesMode=1&salesMode=madeToOrder` |

También acepta `salesModeSwitch=1`. Stock dual: `salesMode=stock`.

Nav hrefs en defaults:

| Template | stock | madeToOrder |
|----------|-------|-------------|
| Atelier | `/tienda?salesMode=stock` | `/tienda?salesMode=madeToOrder` |
| Celestine | `/vestidos?salesMode=stock` | `/vestidos?salesMode=madeToOrder` |
| Orion | `/coleccion?salesMode=stock` | `/coleccion?salesMode=madeToOrder` |
| Voxa | `/programas?salesMode=stock` | `/programas?salesMode=madeToOrder` |

---

## 5. Checklist verificación manual (SaaS post-sync)

- [ ] Org **un solo** canal → sin pestañas/banner/línea de modo en storefront
- [ ] Org **ambos** canales → `salesModeSwitch: "supported"`; aparecen nav de modos (desde payload) + banner en shop
- [ ] Entrar por `?salesMode=madeToOrder` filtra/contexto MTO; stock análogo
- [ ] PDP MTO muestra prep solo si el host mandó `preparationPromiseLabel` (valor); prefijo sale del payload
- [ ] MTO cerrado: mensaje claro + CTA deshabilitado; reopen si hay `madeToOrderReopensAtLabel`
- [ ] Carrito dual-mode: línea “Compra bajo pedido” / “entrega inmediata”; warning si MTO no acepta pedidos
- [ ] Selector cantidad respeta `maxQuantity` **sin** texto “Máx. N”
- [ ] No depende de `catalogContext` en el template

---

## 6. División de responsabilidades

| WG | SaaS |
|----|------|
| Contrato tipado + UI templates | Bridge: capability + filters + PDP + cart fields |
| `ui.salesMode` copy + nav hrefs | Resolver qué canales tiene la org |
| Lab preview dual-mode | Paths reales / query al montar tienda |
| `dist/packages` export | `template:registry:sync` |

**Frase de cierre:** mostrar modo de catálogo solo cuando el negocio vende de las dos formas; nunca enseñar el máximo de unidades; en a pedido: plazo (valor host) + aviso si no se puede pedir.
