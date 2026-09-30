# Trattoria Nonna (`food-trattoria-v1`)

Template e-commerce plug & play para **restaurante italiano**: pasta fresca, antipasti, vinos y despensa.

- **Slug lab:** `/t/trattoria`
- **Categoría:** `ecommerce-food`
- **Shop:** `/menu` · nav «Menú»
- **About:** `/nosotros`
- **Sales mode:** ambos (switch en shop cuando el host declara `salesModeSwitch: supported`)
- **Identidad:** Playfair Display SC + Karla, terracota y dorado, cocina abierta

## Home

`hero` → `courses` → `kitchen` → `signatures` → `sommelier` → `pantry`

## Uso SaaS

```ts
import { TemplateApp, commerceViews, TEMPLATE_ID } from "@web-generator/food-trattoria-v1/client";
```

Validación: `npm run template:validate -- food-trattoria-v1`
