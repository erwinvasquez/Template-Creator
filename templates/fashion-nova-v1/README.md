# fashion-nova-v1

Template plug & play de **moda femenina bold contemporary/street**: drops urbanos, sets coordinados y accesorios con actitud.

## Identidad

- **Marca demo:** Nova
- **Tipografía:** Syne + Manrope
- **Color:** hot pink `#EC4899` + cyan `#06B6D4` sobre blush `#FDF2F8`
- **Shop path:** `/tienda` · **About:** `/nosotros` · **Nav shop:** Tienda
- **Sales mode:** solo stock (`salesModeSwitch: "unsupported"`)
- **Lab:** `/t/nova`

## Home (secciones propias)

1. Hero split (tipografía bold + imagen)  
2. DropZone (bento asimétrico de colecciones)  
3. TrendWall (zigzag de pasos Nova DNA)  
4. ColorPulse (grid destacado de productos trending)  
5. SquadStrip (split pink / copy comunidad)  
6. FlashLane (rail horizontal de accesorios)  

## Catálogo demo

- **Categorías:** street, sets, deportivo, accesorios  
- **Colecciones:** neon-drop, power-set, after-hours  
- **9 productos** con bindings en `colorPulse`, `flashLane` y `dropZone`

## API canónica

```ts
import {
  TemplateApp,
  commerceViews,
  TemplateCommerceProvider,
  createPayloadCommerceBridge,
  TEMPLATE_ID,
  TEMPLATE_SLUG,
} from "fashion-nova-v1/client";
```

## Catalog bindings

`manifest.constraints` usa claves canónicas: `catalogRefs` (colorPulse + flashLane + dropZone), `commerceFeaturedProductsPath` → `sections.colorPulse.productIds`, `commerceFeaturedCollectionsPath` → `sections.dropZone.collectionIds`.

## Validar

```bash
npm run template:validate -- fashion-nova-v1
npm run validate:template-package -- fashion-nova-v1
```

## Preview

- `/t/nova`
- `/t/nova/tienda`
- `/t/nova/tienda/neon-crop-hoodie`
- Fixture: `/t/nova?payload=alt-brand`
