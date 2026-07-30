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
