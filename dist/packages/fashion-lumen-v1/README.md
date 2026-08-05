# fashion-lumen-v1

Template e-commerce plug & play de **ropa deportiva CrossFit** para hombre y mujer: ropa, zapatos y accesorios.

## Identidad

| Campo | Valor |
|-------|-------|
| `templateId` | `fashion-lumen-v1` |
| `TEMPLATE_SLUG` | `lumen` |
| Categoría | `ecommerce-fashion` |
| Industry tags | `fashion`, `apparel`, `sports` |
| Shop path | `/tienda` |
| PDP | `/tienda/[slug]` |
| About | `/nosotros` |
| Tipografías | Barlow Condensed + Barlow |
| Paleta | Carbón `#0F0F0F` + naranja eléctrico `#FF4D00` |
| Sales mode | Ambos (`salesModeSwitch: supported`) |

## Secciones home

`hero` → `disciplines` → `gearSpotlight` → `performance` → `community` → `footer`

## Consumo SaaS

```ts
import {
  TemplateApp,
  commerceViews,
  hostCheckoutSkin,
  TEMPLATE_ID,
} from "@web-generator/fashion-lumen-v1/client";
import builder from "@web-generator/fashion-lumen-v1/builder.manifest.json";
```

## Lab preview

- Mount: [`/t/lumen`](/t/lumen)
- Fixture alterno: `/t/lumen?payload=alt-brand`
- Dual sales mode: `/t/lumen/tienda?dualSalesMode=1`

## Validación y export

```bash
npm run template:validate -- fashion-lumen-v1
npm run template:export -- fashion-lumen-v1
```

Salida: `dist/packages/fashion-lumen-v1/`
