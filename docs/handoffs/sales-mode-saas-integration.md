# Handoff WG → SaaS — Sales mode (stock / made-to-order)

**Estado:** listo para sync  
**Owner contrato + UI templates:** Web Generator (este repo)  
**Owner host/bridge:** Shopenlinea SaaS  

> **No usar** `CatalogContextViewModel` / `catalog-context.ts` / `catalogContext` en el host como contrato de templates. Fue provisional en SaaS; los packages WG **no** lo consumen.

### Cambio UX (chrome de modo)

- Switch **fuera del navbar** del sitio.
- Solo en **página shop**, fila del **eyebrow**, derecha, opciones con `|`.
- Sin `shopBanner` genérico; avisos prep/cerrado solo si el host manda campos.
- **Sin campos API nuevos** — misma capability + query `?salesMode=`.

---

## 1. Versión WG

| Campo | Valor |
|-------|--------|
| Repo | Web Generator |
| Commit (packages + contract) | `0dae7c7ede36f4266e764fb4c4d42f7b43eb02fe` (`0dae7c7`) |
| Tip `main` (incl. handoff) | `e8920a6` — packages/contract en `0dae7c7`; tip incluye handoff |
| Packages | `dist/packages/{fashion-atelier-v1,fashion-celestine-v1,jewelry-orion-v1,academy-voxa-v1}/` |
| Contract | `packages/commerce-runtime-contract/` (`@shopenlinea/commerce-runtime-contract`) |

Tras el sync SaaS: copiar esos `dist/packages/*` → `packages/*` y correr `pnpm template:registry:sync`.

---

## 2. Campos host → template (oficial)

### Capability

| Campo | Cuándo |
|-------|--------|
| `capabilities.salesModeSwitch` | `"supported"` **solo** si la org tiene **ambos** canales (stock + a pedido). En caso contrario `"unsupported"` (o omitir → preview default unsupported). |

Si no es `supported` → el template **no** pinta chrome de modo (switch en shop, avisos prep/cerrado, línea de modo en carrito).

### `ProductFilterViewModel` (listing)

Enviar estos campos **cuando** `salesModeSwitch === "supported"` **y** `salesMode === "madeToOrder"`:

| Campo | Tipo | Notas |
|-------|------|--------|
| `salesMode` | `"stock" \| "madeToOrder"` | Siempre en filters |
| `madeToOrderAcceptingOrders` | `boolean?` | `false` → aviso de cerrado (no caja `shopBanner`) |
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

### Switch de modo (convención UI — todos los templates)

El host **no** inyecta enlaces de modo ni chrome en el navbar del storefront. Labels/hrefs viven en el payload:

`defaults.json` → `ui.salesMode.nav[]` → `{ salesMode, label, href }`

El host solo pone `salesModeSwitch: "supported"`. El template:

1. Muestra el switch **solo en la página de shop**, **misma fila que el eyebrow**, alineado a la derecha.
2. Separa opciones con `|` (ej. `Entrega inmediata | Bajo pedido`).
3. **No** lo pone en el navbar del sitio (desktop ni móvil).
4. **No** pinta `shopBanner` genérico; los labels del switch bastan.
5. Solo muestra prep/cerrado/reopen si el host envía esos campos.
6. Lee `?salesMode=stock|madeToOrder` y llama `setCatalogFilters({ salesMode })`.

**Sin cambio de API** respecto al capability/query: es convención de posicionamiento + menos chrome duplicado.

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
| Celestine | `/t/celestine/coleccion?dualSalesMode=1&salesMode=madeToOrder` |
| Orion | `/t/orion/coleccion?dualSalesMode=1&salesMode=madeToOrder` |
| Voxa | `/t/voxa/catalogo?dualSalesMode=1&salesMode=madeToOrder` |

También acepta `salesModeSwitch=1`. Stock dual: `salesMode=stock`.

Nav hrefs en defaults:

| Template | stock | madeToOrder |
|----------|-------|-------------|
| Atelier | `/tienda?salesMode=stock` | `/tienda?salesMode=madeToOrder` |
| Celestine | `/coleccion?salesMode=stock` | `/coleccion?salesMode=madeToOrder` |
| Orion | `/coleccion?salesMode=stock` | `/coleccion?salesMode=madeToOrder` |
| Voxa | `/catalogo?salesMode=stock` | `/catalogo?salesMode=madeToOrder` |

---

## 5. Checklist verificación manual (SaaS post-sync)

- [ ] Org **un solo** canal → sin switch / avisos de modo / línea de modo en storefront
- [ ] Org **ambos** canales → `salesModeSwitch: "supported"`; switch en **fila del eyebrow del shop** (derecha, con `|`), **no** en navbar del sitio
- [ ] Sin caja/banner genérico `shopBanner` duplicando los labels
- [ ] Entrar por `?salesMode=madeToOrder` filtra/contexto MTO; stock análogo
- [ ] PDP MTO muestra prep solo si el host mandó `preparationPromiseLabel` (valor); prefijo sale del payload
- [ ] MTO cerrado: mensaje claro + CTA deshabilitado; reopen si hay `madeToOrderReopensAtLabel`
- [ ] Carrito dual-mode: línea “Compra bajo pedido” / “entrega inmediata”; warning si MTO no acepta pedidos
- [ ] Selector cantidad respeta `maxQuantity` **sin** texto “Máx. N”
- [ ] No depende de `catalogContext` en el template
- [ ] Host **no** inyecta tabs de modo en su propio header/chrome

---

## 6. División de responsabilidades

| WG | SaaS |
|----|------|
| Contrato tipado + UI templates | Bridge: capability + filters + PDP + cart fields |
| `ui.salesMode` copy + nav hrefs | Resolver qué canales tiene la org |
| Lab preview dual-mode | Paths reales / query al montar tienda |
| `dist/packages` export | `template:registry:sync` |

**Frase de cierre:** mostrar modo de catálogo solo cuando el negocio vende de las dos formas; nunca enseñar el máximo de unidades; en a pedido: plazo (valor host) + aviso si no se puede pedir.
