# Pâtisserie Lune (`food-patisserie-v1`)

Template e-commerce plug & play para **pastelería francesa**: viennoiserie, tartas de estación y celebraciones a pedido.

- **Slug lab:** `/t/patisserie`
- **Categoría:** `ecommerce-food`
- **Shop:** `/boutique` · nav «Boutique»
- **About:** `/atelier`
- **Sales mode:** pedidos a medida (sin switch; plazos vía host)
- **Identidad:** Rubik + Nunito Sans, crema y ámbar, atelier artesanal

## Home

`hero` → `viennoiserie` → `seasonal` → `celebration` → `atelierNote` → `giftBox`

## Uso SaaS

```ts
import { TemplateApp, commerceViews, TEMPLATE_ID } from "@web-generator/food-patisserie-v1/client";
```

Validación: `npm run template:validate -- food-patisserie-v1`
