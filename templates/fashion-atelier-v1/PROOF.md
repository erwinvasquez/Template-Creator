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
