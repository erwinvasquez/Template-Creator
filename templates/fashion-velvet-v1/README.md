# fashion-velvet-v1

Template plug & play de **moda femenina nocturna de lujo**: vestidos de gala, cóctel y lencería confeccionados a medida.

## Identidad

- **Marca demo:** Velvet Maison
- **Tipografía:** Cormorant + Montserrat
- **Color:** stone `#1C1917` con acento oro `#CA8A04` sobre fondo `#FAFAF9`
- **Shop path:** `/coleccion` · **About:** `/la-maison`
- **Lab:** `/t/velvet`
- **Sales mode:** solo confección a medida (`salesModeSwitch: unsupported`)

## Home (secciones propias)

1. Hero centrado con acentos oro
2. SoireesMarquee (marquee horizontal de colecciones)
3. GoldCraftBand (timeline de alta costura)
4. NocturneGrid (grid asimétrico de looks)
5. SalonNote (split editorial + CTA)
6. VelvetEditLane (carril horizontal de lencería)

## API canónica

```ts
import {
  TemplateApp,
  commerceViews,
  TemplateCommerceProvider,
  createPayloadCommerceBridge,
  TEMPLATE_ID,
  TEMPLATE_SLUG,
} from "fashion-velvet-v1/client";
```

## Validar

```bash
npm run template:validate -- fashion-velvet-v1
npm run validate:template-package -- fashion-velvet-v1
```

## Preview

- `/t/velvet`
- `/t/velvet/coleccion`
- `/t/velvet/coleccion/vestido-midnight-velvet`
- Fixture: `/t/velvet?payload=alt-brand`
