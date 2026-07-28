# Web Generator

Laboratorio de templates parametrizables para IA Builder v2.

## Arranque

```bash
npm install
npm run template:validate -- fashion-atelier-v1
npm run dev
```

- Selector: http://localhost:3000
- Atelier (moda): http://localhost:3000/t/atelier
- Atelier alt: http://localhost:3000/t/atelier?payload=alt-brand
- Orion (joyería): http://localhost:3000/t/orion
- Orion alt: http://localhost:3000/t/orion?payload=alt-brand

## Export + host limpio

```bash
npm run template:export -- fashion-atelier-v1
npm install --prefix hosts/clean-host
npm run build --prefix hosts/clean-host
npm run start --prefix hosts/clean-host
# http://localhost:3010
```

## Arquitectura

```
/                         → Galería (renderer registry)
/t/atelier/...            → Lab mount (payload-driven)
templates/fashion-atelier-v1/  → Fuente del package
dist/packages/fashion-atelier-v1/ → Export inmutable
hosts/clean-host/         → Importa SOLO dist/
```

## Docs

- Auditoría de conversión: [`audit/TEMPLATE-CONVERSION-AUDIT.md`](audit/TEMPLATE-CONVERSION-AUDIT.md)
- Contrato de portabilidad / API / inmutabilidad: [`audit/PACKAGE-PORTABILITY-CONTRACT.md`](audit/PACKAGE-PORTABILITY-CONTRACT.md)
- Prueba operativa: [`templates/fashion-atelier-v1/PROOF.md`](templates/fashion-atelier-v1/PROOF.md)
