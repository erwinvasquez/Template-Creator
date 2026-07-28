# Proof of acceptance — jewelry-orion-v1

Documento formal ampliado (patrón general): [`audit/PACKAGE-PORTABILITY-CONTRACT.md`](../../audit/PACKAGE-PORTABILITY-CONTRACT.md).

## Commands

```bash
# 1–2. Validate + export immutable package
npm run template:validate -- jewelry-orion-v1
npm run template:export -- jewelry-orion-v1

# 3. Lab preview from defaults.json
npm run dev
# open http://localhost:3000/t/orion

# 4. Alternate payload (design intact, content changes)
# open http://localhost:3000/t/orion?payload=alt-brand

# 5–7. Clean host imports ONLY dist/
npm install --prefix hosts/clean-host
npm run build --prefix hosts/clean-host
npm run start --prefix hosts/clean-host
```

## Checklist

| Step | Evidence |
|------|----------|
| No hardcoded Orion content in JSX | Runtime under `templates/jewelry-orion-v1/src`; content from payload |
| Render from defaults.json | `/t/orion` loads `loadPayload()` |
| Alt payload | `/t/orion?payload=alt-brand` → brand AURELIA |
| Design intact | Same sections/components; only copy/media change |
| Export | `dist/packages/jewelry-orion-v1` + `BUILD_INFO.json` + `IMMUTABLE` |
| Different from fashion-atelier-v1 | Distinct schema sections (`signatures`, `craft`, `materials`, `appointment`, `atelier`), distinct fonts (Bodoni Moda/Jost), distinct palette (champagne platinum), distinct header/hero/footer layout |
| Same template | `JewelryApp` + `loadPayload()` from the package |
