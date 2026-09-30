# fashion-lumen-v1

Template e-commerce plug & play de **moda femenina editorial minimal** (quiet luxury daytime).

## Identidad

| Campo | Valor |
|-------|-------|
| `templateId` | `fashion-lumen-v1` |
| `TEMPLATE_SLUG` | `lumen` |
| Categoría | `ecommerce-fashion` |
| Industry tags | `fashion`, `apparel`, `minimal`, `editorial` |
| Shop path | `/tienda` |
| PDP | `/tienda/[slug]` |
| About | `/nosotros` |
| Tipografías | Playfair Display + Inter |
| Paleta | Carbón `#18181B` + blush `#BE185D` + crema `#FAFAFA` |
| Sales mode | Ambos (`salesModeSwitch: supported`) |

## Secciones home

`hero` → `wardrobe` → `arrivals` → `fabricNote` → `editorial` → `footer`

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
