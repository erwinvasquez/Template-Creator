# fashion-celestine-v1

Template plug & play de **vestidos de ocasión**: fiesta, novias, quinceañeras, comunión y accesorios artesanales.

## Identidad

- **Marca demo:** Celestine
- **Tipografía:** Cormorant + Jost
- **Color:** rosewood `#9C4F5F` sobre perla `#F8F4F5` (sin oro Atelier ni champagne Orion)
- **Shop path:** `/vestidos` · **About:** `/casa`
- **Lab:** `/t/celestine`

## Home (secciones propias)

1. Hero full-bleed  
2. OccasionsStrip  
3. CraftBand (diseño → confección → prueba)  
4. SignatureLooks  
5. AtelierNote (atención personalizada)  
6. AccessoriesLane  

## API canónica

```ts
import {
  TemplateApp,
  commerceViews,
  TemplateCommerceProvider,
  createPayloadCommerceBridge,
  TEMPLATE_ID,
  TEMPLATE_SLUG,
} from "fashion-celestine-v1/client";
```

## Catalog bindings

`manifest.constraints` usa claves canónicas: `catalogRefs` (signature + accessories + occasions), `commerceFeaturedProductsPath` → `sections.signature.productIds`, `commerceFeaturedCollectionsPath` → `sections.occasions.collectionIds`. Así el SaaS rehidrata catálogo sin conocer `occasionIdsPath` ad hoc.

## Validar

```bash
npm run template:validate -- fashion-celestine-v1
npm run validate:template-package -- fashion-celestine-v1
```

## Preview

- `/t/celestine`
- `/t/celestine/vestidos`
- `/t/celestine/vestidos/vestido-novia-lilia`
- Fixture: `/t/celestine?payload=alt-brand`
