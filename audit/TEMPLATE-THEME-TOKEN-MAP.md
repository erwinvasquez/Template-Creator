# Template Theme Token Map — WG ↔ SaaS

**Fecha:** 2026-08-05
**Estado:** Implementado en los 5 templates ecommerce (ago 2026)
**Templates:** `fashion-atelier-v1`, `fashion-celestine-v1`, `jewelry-orion-v1`, `academy-voxa-v1`, `fashion-lumen-v1`

---

## 1. Problema (producción)

El SaaS inyecta en runtime solo:

```ts
payload.theme.colors.{ primary, secondary, background }
```

Los templates mapean **10 tokens** vía `themeStyle()` → CSS vars `--color-*`, pero los componentes usan clases Tailwind que mezclan tokens **brand** y **template-fixed** sin criterio uniforme.

| Síntoma | Causa raíz |
|---------|------------|
| CTAs (`bg-cta`) no siguen marca | `cta` / `ctaHover` no los inyecta el SaaS; quedan en default del template (#CA8A04 dorado) |
| Eyebrows de sección en dorado fijo | `text-cta` en marketing sections |
| Footer cambia con `primary` de marca | `Footer.tsx` usa `var(--color-primary)` como fondo estructural |

---

## 2. ¿Existe norma hoy?

| Fuente | Qué dice | Gap |
|--------|----------|-----|
| `builder.manifest.themeEditable` | Solo `primary`, `secondary`, `background`, `fonts` | No documenta qué superficies consumen cada token |
| `builder.manifest.themeDefaults` | 10 colores (incl. `cta`, `surface`, `text`…) | `cta` editable en defaults pero **no** en `themeEditable` → inconsistencia |
| `PROOF.md` (todos) | Una línea: `themeEditable \| primary/secondary/background/fonts` | Sin tabla de asignación por componente |
| `PACKAGE-PORTABILITY-CONTRACT.md` | Menciona `themeDefaults` + `themeEditable` | Sin guía de tokens |
| `audit/TEMPLATE-CONVERSION-AUDIT.md` §2.2 | Lista tokens CSS y `theme.colors.*` opcionales | No distingue brand vs template-fixed vs contexto |
| `template-validate.mjs` | Exige objeto `themeEditable` | No valida uso correcto de clases |

**Conclusión:** no hay guía de asignación por superficie. Cada template copió patrones del lab con `text-cta` / `bg-cta` como acento decorativo y de conversión indistintamente.

---

## 3. Modelo de tres tiers

### Tier A — Brand (merchant / SaaS)

Inyectados por org, wizard o editor visual. **Únicos editables** (`themeEditable`).

| Token | CSS var | Uso permitido |
|-------|---------|---------------|
| `primary` | `--color-primary` | Botones de conversión, chips activos, bordes focus, acentos de marca en hover |
| `secondary` | `--color-secondary` | Eyebrows de sección, labels secundarios, hover de links, variantes de botón outline |
| `background` | `--color-background` | Fondo de página, texto sobre footer ink |

### Tier B — Template-fixed (NO `themeEditable`)

Definidos en `themeDefaults.colors` + `:root` / `@theme` del CSS del package. El SaaS **no** los sobrescribe en Fase actual.

| Token | CSS var | Uso |
|-------|---------|-----|
| `ink` | `--color-ink` | Footer, bandas oscuras estructurales |
| `text` | `--color-text` | Cuerpo, títulos H1–H3 en superficie clara |
| `muted` | `--color-muted` | Meta, placeholders, captions |
| `border` | `--color-border` | Divisores, inputs |
| `surface` | `--color-surface` | Cards, hover de nav, fondos elevados |
| `cta` / `ctaHover` | `--color-cta*` | **Deprecado para UI nueva.** Mantener en `themeStyle` como alias de `primary` / `secondary` hasta Fase D SaaS |

### Tier C — Contexto (no son tokens de tema)

| Contexto | Clases | Notas |
|----------|--------|-------|
| Hero sobre imagen | `text-white`, `from-primary/55` | Overlay usa `primary` con alpha; texto siempre blanco |
| Nav transparente | `text-white` / `glass-dark` | Independiente de marca en scroll |
| Checkout host-owned | `hostCheckoutSkin` | Solo pintura; sin lógica. Eyebrows checkout → `text-secondary` |

---

## 4. Reglas de asignación por superficie

| Superficie | Antes (anti-patrón) | Después | Tier |
|------------|---------------------|---------|------|
| Footer background | `var(--color-primary)` / `bg-primary` | `bg-ink` | B |
| Footer text | `var(--color-background)` | `text-background` | A (background como contraste) |
| Hero CTA primario | `bg-cta` | `bg-primary hover:bg-primary/90` | A |
| PDP / Cart checkout CTA | `bg-cta` | `bg-primary hover:bg-primary/90` | A |
| Section eyebrow (uppercase 11px) | `text-cta` | `text-secondary` | A |
| Section title H2 | `text-primary` o `text-ink` | Sin cambio (diseño) | A / B |
| Product card hover title | `group-hover:text-cta` | `group-hover:text-primary` | A |
| Cart badge | `bg-cta` | `bg-primary` | A |
| Nav mobile link hover | `hover:text-cta` | `hover:text-primary` | A |
| Account form submit | `bg-primary` | Sin cambio | A |
| Account form eyebrow | `text-cta` | `text-secondary` | A |
| Inline link accent | `text-cta` | `text-primary` | A |
| Decorative rule (editorial) | `bg-cta/70` | `bg-secondary/40` | A |
| Error / promo line cart | `text-cta` | `text-primary` | A |

**Prohibido:** `var(--color-primary)` en inline styles para superficies estructurales (footer, bandas). Usar clase `bg-ink` o utilidad Tailwind.

---

## 5. `themeStyle()` — contrato runtime

```ts
export function themeStyle(payload: ContentPayload): Record<string, string> {
  const c = payload.theme?.colors ?? {};
  const primary = c.primary ?? "<template-default-primary>";
  const secondary = c.secondary ?? "<template-default-secondary>";
  return {
    "--color-primary": primary,
    "--color-secondary": secondary,
    "--color-background": c.background ?? "<template-default-background>",
    // Tier B — template defaults (no leer del payload SaaS en Fase actual)
    "--color-surface": c.surface ?? "<default>",
    "--color-text": c.text ?? "<default>",
    "--color-muted": c.muted ?? "<default>",
    "--color-border": c.border ?? "<default>",
    "--color-ink": "<template-fixed-ink>", // NUNCA desde payload SaaS
    // Alias retrocompatible (hasta Fase D)
    "--color-cta": c.cta ?? primary,
    "--color-cta-hover": c.ctaHover ?? secondary,
  };
}
```

---

## 6. Manifest (`builder.manifest.json`)

```json
"themeDefaults": {
  "colors": {
    "primary": "#1C1917",
    "secondary": "#44403C",
    "background": "#FAFAF9",
    "ink": "#1C1917",
    "cta": "#CA8A04",
    "ctaHover": "#A16207",
    "surface": "#F5F5F4",
    "text": "#0C0A09",
    "muted": "#57534E",
    "border": "#E7E5E4"
  }
},
"themeEditable": {
  "primary": true,
  "secondary": true,
  "background": true,
  "fonts": false
}
```

- `ink` en `themeDefaults` documenta el footer del diseño; **no** añadir a `themeEditable`.
- `cta` / `ctaHover` permanecen en defaults por compatibilidad de schema; marcados deprecated en PROOF.

---

## 7. Contrato SaaS — Fase D (propuesta)

**Opción recomendada (menor churn en templates):** al mapear `org.theme → payload.theme`, el SaaS deriva:

```ts
colors.cta = colors.cta ?? colors.primary;
colors.ctaHover = colors.ctaHover ?? darken(colors.primary, 0.12);
```

**Opción alternativa (ya aplicada en WG):** templates dejan de usar `bg-cta` / `text-cta` en superficies de marca; solo `primary` / `secondary`. El alias `cta` en `themeStyle` queda para CSS legacy y third-party.

Pedido explícito al SaaS:

1. Seguir inyectando `primary`, `secondary`, `background`.
2. Fase D: derivar `cta` + `ctaHover` desde `primary` si el merchant no define acento separado.
3. No exponer `ink`, `text`, `muted`, `border`, `surface` en editor hasta que exista diseño de “tema avanzado”.

---

## 8. Inventario por template (resumen grep)

Conteo de usos `text-cta` + `bg-cta` en `src/` (ago 2026):

| Template | `text-cta` | `bg-cta` | Footer | `ink` en CSS | `themeStyle` ink |
|----------|------------|----------|--------|--------------|------------------|
| fashion-atelier-v1 | ~35 | ~12 | `var(--color-primary)` ❌ | ❌ | ❌ |
| fashion-celestine-v1 | ~40 | ~15 | `var(--color-primary)` ❌ | ✅ | ❌ |
| jewelry-orion-v1 | ~35 | ~10 | `bg-primary` ❌ | ✅ | ✅ |
| academy-voxa-v1 | ~45 | ~18 | `voxa-band-ink` ✅ | ✅ | ✅ |
| fashion-lumen-v1 | ~38 | ~14 | `var(--color-primary)` ❌ | ❌ | ❌ |

**Referencia correcta parcial:** Voxa footer (`voxa-band-ink` → `--color-ink`). Orion tiene `ink` en themeStyle pero footer aún usa `bg-primary`.

---

## 9. Tabla inventario — fashion-atelier-v1 (detalle)

| Componente | Clase actual | Token | ¿Brand o fixed? | Clase objetivo |
|------------|--------------|-------|-----------------|----------------|
| `Footer` | `var(--color-primary)` | primary | **fixed** (estructural) | `bg-ink text-background` |
| `Hero` CTA | `bg-cta` | cta | brand | `bg-primary hover:bg-primary/90` |
| `CollectionStrip` eyebrow | `text-cta` | cta | brand accent | `text-secondary` |
| `FeaturedProducts` eyebrow | `text-cta` | cta | brand accent | `text-secondary` |
| `EditorialBanner` eyebrow | `text-cta` | cta | brand accent | `text-secondary` |
| `EditorialBanner` rule | `bg-cta/70` | cta | decorativo | `bg-secondary/40` |
| `Newsletter` eyebrow | `text-cta` | cta | brand accent | `text-secondary` |
| `ShopView` eyebrow | `text-cta` | cta | brand accent | `text-secondary` |
| `AboutView` eyebrows | `text-cta` | cta | brand accent | `text-secondary` |
| `AboutView` CTA | `bg-cta` | cta | brand | `bg-primary hover:bg-primary/90` |
| `ProductDetailCommerceView` labels | `text-cta` | cta | brand accent | `text-secondary` |
| `ProductDetailCommerceView` addToCart | `bg-cta` | cta | brand | `bg-primary hover:bg-primary/90` |
| `CartPageView` / `CommerceCartDrawer` CTA | `bg-cta` | cta | brand | `bg-primary hover:bg-primary/90` |
| `CartPageView` links | `text-cta` | cta | brand | `text-primary` |
| `Header` cart badge | `bg-cta` | cta | brand | `bg-primary` |
| `Header` mobile nav hover | `hover:text-cta` | cta | brand | `hover:text-primary` |
| `ProductCard` / `CommerceProductCard` hover | `group-hover:text-cta` | cta | brand | `group-hover:text-primary` |
| `ShopCatalog` clear filter | `hover:text-cta` | cta | brand | `hover:text-primary` |
| `CheckoutLayout` headings | `text-cta` | cta | decorativo | `text-secondary` |
| `Account*` eyebrows | `text-cta` | cta | brand accent | `text-secondary` |
| `Account*` register link | `text-cta` | cta | brand | `text-primary` |
| `OrderConfirmationView` eyebrow | `text-cta` | cta | brand accent | `text-secondary` |

---

## 10. Rollout plan

| Fase | Template | Acciones |
|------|----------|----------|
| **1** | `fashion-atelier-v1` | ✅ Token map + componentes + `ink` en CSS + PROOF |
| **2** | `fashion-celestine-v1`, `fashion-lumen-v1` | ✅ Mismo diff; `ink` en CSS + `themeStyle` |
| **3** | `jewelry-orion-v1` | ✅ Footer `bg-ink`; eyebrows/CTAs alineados |
| **4** | `academy-voxa-v1` | ✅ Footer `voxa-band-ink` OK; `text-cta`/`bg-cta` migrados |
| **5** | Validación CI | ✅ `template-validate.mjs` + `scripts/lib/theme-token-contract.mjs` |
| **6** | Header icons (Fase F) | ✅ Cart + account: `text-secondary hover:text-primary` en nav claro; badge `bg-primary` |

### Header — iconos carrito / cuenta (Fase F)

| Contexto | Nav links | Cart + account icons | Badge contador |
|----------|-----------|----------------------|----------------|
| Nav claro (scrolled / no home) | `text-secondary hover:text-primary` | **igual** | `bg-primary` |
| Nav transparente (home hero) | `text-white/80 hover:text-white` | `text-white hover:bg-white/10` | `bg-primary` |

Ver `audit/PHASE-F-MANIFEST-AUDIT.md`.

---

## 11. Checklist validate + export

```bash
npm run template:validate -- fashion-atelier-v1
npm run validate:template-package -- fashion-atelier-v1
npm run template:export -- fashion-atelier-v1
```

| Check | Esperado |
|-------|----------|
| `template:validate` | PASS (content contract, hero, category-scroll, hostCheckoutSkin) |
| `validate:template-package` | exports canónicos intactos |
| `hostCheckoutSkin` | Sin cambios de estructura/API |
| `commerceViews` | Sin cambios |
| Lab `/t/atelier?payload=alt-brand` | CTAs y eyebrows siguen `primary`/`secondary` de fixture |
| Footer | Color fijo aunque `primary` del fixture sea distinto |

---

## 12. Verificación visual (lab)

1. `/t/atelier` — defaults: footer oscuro fijo, CTA hero = primary stone.
2. `/t/atelier?payload=alt-brand` — brand LUMEN: primary cambia en botones; footer **no** cambia.
3. `/t/atelier/tienda` — chip activo `bg-primary`; eyebrow `text-secondary`.
4. PDP add-to-cart — `bg-primary`.
5. Carrito — checkout button `bg-primary`.
