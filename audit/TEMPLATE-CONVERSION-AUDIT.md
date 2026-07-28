# TEMPLATE CONVERSION AUDIT

**Proyecto:** Atelier (fashion e-commerce Next.js)  
**Template ID propuesto:** `fashion-atelier-v1`  
**Fecha:** 2026-07-28  
**Alcance:** Convertir el proyecto actual en un Template parametrizable vía Content Payload para IA Builder v2  
**Restricción:** Sin implementación. Sin rediseño. Sin cambios de layout.

---

## 0. Resumen ejecutivo

El proyecto **Atelier** es un sitio Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + TypeScript, visualmente listo para producción, pero **monolítico en contenido**: marca, copy, imágenes, navegación, SEO, colecciones y catálogo están embebidos en componentes y en `src/lib/products.ts`.

**Diagnóstico:** el layout, las secciones, las animaciones y la mayoría de componentes de presentación **pueden permanecer intactos**. La conversión a template requiere:

1. Extraer un **Content Payload** (contrato JSON único).
2. Introducir una capa mínima de **lectura de contenido** (context / loader).
3. Reemplazar literales hardcodeados por lecturas del payload.
4. Sustituir el mock de catálogo por datos inyectados.

**La IA Builder v2 no debe generar HTML/CSS/React.** Solo debe producir (o completar) un Content Payload validado contra el schema de este template.

```
Template Next.js (código fijo)
        ↓
Content Payload (JSON)
        ↓
SiteContentProvider / getSiteContent()
        ↓
Componentes existentes (props/context)
        ↓
Website final
```

**Estado actual vs objetivo**

| Capa | Estado actual | Objetivo |
|------|---------------|----------|
| Layout / rutas | Fijo y correcto | Permanecer fijo |
| Estilos / tipografía / motion | Fijos en CSS + next/font | Permanecer fijos (theme tokens opcionales) |
| Copy / marca / SEO | Hardcodeado | Payload |
| Imágenes editoriales | URLs Unsplash hardcodeadas | Payload → Media refs |
| Catálogo | Mock en `products.ts` | Payload → `catalog` |
| Componentes UI | Mezclan UI + datos | UI fija + datos externos |

---

## 1. Arquitectura del proyecto

### 1.1 Estructura relevante

```
src/
  app/
    layout.tsx              # Shell global: fonts, metadata, Header/Footer/Cart
    page.tsx                # Home: composición de secciones
    globals.css             # Design tokens, glass, keyframes, reduced-motion
    tienda/page.tsx         # Catálogo
    tienda/[slug]/page.tsx  # PDP
    nosotros/page.tsx       # About
    not-found.tsx           # 404
  components/
    Header.tsx              # Nav + brand + cart trigger
    Footer.tsx              # Brand + link columns
    Hero.tsx                # Hero full-bleed
    CollectionStrip.tsx     # Grid de colecciones
    FeaturedProducts.tsx    # Grid destacados
    EditorialBanner.tsx     # Lookbook
    Newsletter.tsx          # Captura email (UI only)
    ProductCard.tsx         # Card catálogo/PDP related
    ShopCatalog.tsx         # Filtros + listado
    AddToCartForm.tsx       # Variantes + add
    CartDrawer.tsx          # Drawer carrito
    Reveal.tsx              # IntersectionObserver fade-up
  lib/
    products.ts             # TIPOS + MOCK collections/products + helpers
    cart-context.tsx        # Estado carrito cliente
next.config.ts              # remotePatterns Unsplash
design-system/atelier/      # Design system persistido (referencia, no runtime)
```

### 1.2 Rol de cada pieza en la generación del sitio

| Elemento | Participación | ¿Parametrizable? |
|----------|---------------|------------------|
| **App Router** (`/`, `/tienda`, `/tienda/[slug]`, `/nosotros`) | Define el grafo de páginas del template | **No** (fijo por template). Opcional: flags `pages.enabled` si un tenant no quiere alguna ruta |
| **`layout.tsx`** | Inyecta fonts, SEO base, shell Header/Footer/Cart | SEO y `lang` → payload; shell estructural → fijo |
| **`globals.css`** | Tokens de color, glass, animaciones | Tokens → `theme` opcional; animaciones/utilidades → **fijos** |
| **`next/font` (Cormorant, Montserrat)** | Identidad tipográfica del template | **Fijos** en v1. Theme fonts solo si se abre extensión futura |
| **Secciones home** | Orquestación en `page.tsx` | Orden de secciones → **fijo**; contenido → payload |
| **`products.ts`** | Fuente única actual de catálogo | Debe dejar de ser fuente de verdad; tipos sí, mock no |
| **`cart-context.tsx`** | Runtime UX | **Fijo** (lógica). Labels UI del drawer → payload `ui.cart` |
| **`Reveal.tsx`** | Motion system | **Fijo** |
| **lucide-react icons** | Iconografía UI (Menu, Cart, etc.) | **Fija** (no configurable en v1) |
| **`next/image` + remotePatterns** | Optimización de imágenes | Hosts de media del SaaS deben whitelistearse |
| **`design-system/atelier/`** | Documentación de diseño | Referencia humana; no runtime |

### 1.3 Grafo de páginas y secciones

```
/ (Home)
  ├─ Hero
  ├─ CollectionStrip
  ├─ FeaturedProducts  ← depende de catalog.products (featured)
  ├─ EditorialBanner
  └─ Newsletter

/tienda
  └─ ShopCatalog ← depende de catalog.products + catalog.categories

/tienda/[slug]
  ├─ PDP (product fields)
  ├─ AddToCartForm
  └─ Related products ← misma categoría

/nosotros
  ├─ Intro
  ├─ Image banner
  ├─ Blocks (sostenibilidad)
  ├─ Locations (ateliers)
  └─ Closing CTA
```

Shell global (todas las páginas): `Header` + `Footer` + `CartDrawer`.

---

## 2. Inventario completo de contenido hardcodeado

Convención de prioridad:

- **P0** — Bloquea multi-tenant / multi-marca  
- **P1** — Necesario para un sitio completo usable  
- **P2** — Nice-to-have / i18n de microcopy UI  

### 2.1 Brand & identidad

| Valor | Ubicación | Propósito | Parametrización |
|-------|-----------|-----------|-----------------|
| `"ATELIER"` | `Header.tsx`, `Hero.tsx`, `Footer.tsx` | Nombre de marca visible | `brand.name` / `brand.displayName` |
| `"Atelier"` (SEO/copyright) | `layout.tsx`, `Footer.tsx`, `nosotros` | Marca en metadata y legales | `brand.name` |
| `lang="es"` | `layout.tsx` | Idioma HTML | `brand.locale` |
| Currency `EUR` + `es-ES` | `products.ts` → `formatPrice` | Formato de precios | `brand.currency`, `brand.locale` |

### 2.2 Theme (tokens CSS)

| Valor | Ubicación | Propósito | Parametrización |
|-------|-----------|-----------|-----------------|
| `--color-primary` `#1c1917` | `globals.css` | Color primario | `theme.colors.primary` (opcional; default template) |
| `--color-secondary` `#44403c` | idem | Secundario | `theme.colors.secondary` |
| `--color-cta` `#ca8a04` | idem | CTA / acento | `theme.colors.cta` |
| `--color-cta-hover` `#a16207` | idem | Hover CTA | `theme.colors.ctaHover` |
| `--color-background` `#fafaf9` | idem | Fondo | `theme.colors.background` |
| `--color-surface` `#f5f5f4` | idem | Superficie | `theme.colors.surface` |
| `--color-text` / muted / border | idem | Tipografía y bordes | `theme.colors.*` |

**Recomendación v1:** theme opcional con merge sobre defaults del template. No exponer tipografías en v1.

### 2.3 Navigation

| Valor | Ubicación | Propósito | Parametrización |
|-------|-----------|-----------|-----------------|
| `navLinks` array | `Header.tsx` | Menú desktop/móvil | `navigation.primary[]` |
| Link “Nosotros” duplicado | `Header.tsx` | Link derecho desktop | Incluir en `navigation.primary` o `navigation.secondary` |
| Query params `?categoria=` | Header/Footer/Hero | Filtros de catálogo | Mantener rutas fijas; labels y `href` desde payload |
| Categorías hardcodeadas | `ShopCatalog.tsx` | Filtros UI | `catalog.categories[]` |

### 2.4 Hero

| Valor | Ubicación | Propósito | Parametrización |
|-------|-----------|-----------|-----------------|
| Imagen Unsplash | `Hero.tsx` | Background full-bleed | `sections.hero.image` (MediaRef) |
| Alt text | `Hero.tsx` | Accesibilidad | `sections.hero.image.alt` |
| Brand headline `ATELIER` | `Hero.tsx` | Hero brand signal | `sections.hero.headline` (puede = brand.name) |
| Subheadline | `Hero.tsx` | Supporting sentence | `sections.hero.subheadline` |
| CTA primary label/href | `Hero.tsx` | Conversión | `sections.hero.ctaPrimary` |
| CTA secondary label/href | `Hero.tsx` | Secundario | `sections.hero.ctaSecondary` |

### 2.5 Collections (home strip)

| Valor | Ubicación | Propósito | Parametrización |
|-------|-----------|-----------|-----------------|
| Eyebrow `"Colecciones"` | `CollectionStrip.tsx` | Label sección | `sections.collections.eyebrow` |
| Título sección | `CollectionStrip.tsx` | Headline | `sections.collections.title` |
| Label `"Explorar"` | `CollectionStrip.tsx` | CTA por card | `sections.collections.itemCtaLabel` |
| `collections[]` mock | `products.ts` | Datos de cards | `catalog.collections[]` + selección `sections.collections.items[]` |
| Imágenes colección | `products.ts` | Visuales | MediaRef por colección |

### 2.6 Featured products

| Valor | Ubicación | Propósito | Parametrización |
|-------|-----------|-----------|-----------------|
| Eyebrow `"Selección"` | `FeaturedProducts.tsx` | Label | `sections.featured.eyebrow` |
| Título | `FeaturedProducts.tsx` | Headline | `sections.featured.title` |
| Link `"Ver todo"` | `FeaturedProducts.tsx` | CTA | `sections.featured.viewAll` |
| Productos `featured: true` | `products.ts` + `getFeaturedProducts()` | Grid | `sections.featured.productIds[]` (explícito, no solo flag) |

### 2.7 Editorial / Lookbook

| Valor | Ubicación | Propósito | Parametrización |
|-------|-----------|-----------|-----------------|
| Imagen + alt | `EditorialBanner.tsx` | Fondo | `sections.editorial.image` |
| Eyebrow `"Lookbook"` | idem | Label | `sections.editorial.eyebrow` |
| Title / body | idem | Copy | `sections.editorial.title`, `.body` |
| CTA | idem | Navegación | `sections.editorial.cta` |

### 2.8 Newsletter

| Valor | Ubicación | Propósito | Parametrización |
|-------|-----------|-----------|-----------------|
| Eyebrow, title, subtitle | `Newsletter.tsx` | Copy | `sections.newsletter.*` |
| Placeholder email | idem | Form UX | `sections.newsletter.placeholder` |
| Label botón / success | idem | Form UX | `sections.newsletter.submitLabel`, `.successMessage` |
| Submit handler | idem | Solo `preventDefault` | Endpoint/action → `sections.newsletter.action` (P2; v1 puede quedar UI-only) |

### 2.9 About (`/nosotros`)

| Valor | Ubicación | Propósito | Parametrización |
|-------|-----------|-----------|-----------------|
| Metadata title/desc | `nosotros/page.tsx` | SEO página | `pages.about.seo` o `seo.pages.about` |
| Eyebrow, H1, intro | idem | Intro | `sections.about.intro.*` |
| Imagen banner + alt | idem | Visual | `sections.about.bannerImage` |
| Blocks 2 columnas | idem | Contenido | `sections.about.blocks[]` |
| Locations eyebrow/title | idem | Presencia | `sections.about.locations.*` |
| Stores Madrid/BCN/Lisboa | idem | Direcciones | `sections.about.locations.items[]` |
| Closing CTA | idem | Conversión | `sections.about.closing.*` |
| Anchor ids `#sostenibilidad`, `#ateliers` | idem | Deep links footer | Fijos en template o `block.id` |

### 2.10 Shop (`/tienda`)

| Valor | Ubicación | Propósito | Parametrización |
|-------|-----------|-----------|-----------------|
| Header page title/desc | `tienda/page.tsx` | Intro catálogo | `sections.shop.intro.*` |
| Labels filtros | `ShopCatalog.tsx` | Categorías | `catalog.categories[]` |
| Empty / count copy | `ShopCatalog.tsx` | Microcopy | `ui.shop.*` (P2) |
| Badges `"Nuevo"` / `"Destacado"` | `ProductCard.tsx`, PDP | Labels | `ui.product.badges` (P2) |

### 2.11 Product Detail Page

| Valor | Ubicación | Propósito | Parametrización |
|-------|-----------|-----------|-----------------|
| Product fields | `products.ts` | PDP | `catalog.products[]` |
| Shipping `"2–4 días…"` | `[slug]/page.tsx` | Info logística | `ui.product.shippingNote` o por producto |
| Related title | `[slug]/page.tsx` | Cross-sell | `ui.product.relatedTitle` |
| Labels Categoría/Colección/Envío | idem | Specs | `ui.product.specLabels` (P2) |
| Add to cart label | `AddToCartForm.tsx` | CTA | `ui.product.addToCartLabel` |

### 2.12 Footer

| Valor | Ubicación | Propósito | Parametrización |
|-------|-----------|-----------|-----------------|
| Brand name + blurb | `Footer.tsx` | Identidad | `brand` + `sections.footer.blurb` |
| Columnas de links | `Footer.tsx` | Navegación | `sections.footer.columns[]` |
| Copyright + tagline | `Footer.tsx` | Legales | `sections.footer.copyrightSuffix`, `.tagline` |

### 2.13 Cart drawer

| Valor | Ubicación | Propósito | Parametrización |
|-------|-----------|-----------|-----------------|
| `"Tu selección"`, empty state, checkout CTA | `CartDrawer.tsx` | UI strings | `ui.cart.*` (P1/P2) |
| Lógica carrito | `cart-context.tsx` | Runtime | **Fija** |

### 2.14 SEO & 404

| Valor | Ubicación | Propósito | Parametrización |
|-------|-----------|-----------|-----------------|
| `metadata` default/OG | `layout.tsx` | SEO global | `seo.default` |
| Title template `%s · Atelier` | `layout.tsx` | Brand en titles | `seo.titleTemplate` |
| Page SEO about/shop/product | pages | SEO por ruta | `seo.pages.*` + product fields |
| 404 copy | `not-found.tsx` | Fallback | `ui.notFound.*` (P2) |

### 2.15 Catálogo mock (crítico)

| Valor | Ubicación | Propósito | Parametrización |
|-------|-----------|-----------|-----------------|
| 12 productos | `products.ts` | Demo | `catalog.products[]` |
| 3 colecciones | `products.ts` | Demo | `catalog.collections[]` |
| `ProductCategory` union fija | `products.ts` | Tipado | Relajar a `string` o enums del payload |
| Helpers `getProductBySlug`, etc. | `products.ts` | Acceso | Permanecen como helpers sobre payload |

### 2.16 Lo que NO debe parametrizarse (permanece igual)

- Estructura de archivos y rutas del App Router  
- Clases Tailwind de layout/spacing/typography scale  
- Keyframes y utilidades `.reveal`, `.glass`, ken-burns  
- Componente `Reveal`  
- Lógica de `CartProvider` / drawer open-close / quantities  
- Iconos Lucide (set fijo)  
- Aspect ratios (`aspect-[3/4]`, hero `100svh`)  
- Composición de secciones en Home (orden fijo)  
- Comportamiento header glass dark/light según scroll + pathname  

---

## 3. Auditoría sección por sección

### 3.1 Header (shell)

| Campo | Reqado | Opcional |
|-------|----------|----------|
| `brand.displayName` | Sí | |
| `navigation.primary[]` `{ label, href }` | Sí | |
| Cart enabled | | `features.cart` (default true) |

**Imágenes:** ninguna (salvo futuro logo SVG/PNG → `brand.logo`, P2).  
**Acciones:** navegación, abrir carrito.  
**Dependencias:** `CartContext` (runtime).  
**Relación catálogo:** hrefs pueden apuntar a filtros (`?categoria=`).

### 3.2 Hero

| Campo | Reqado | Opcional |
|-------|----------|----------|
| `headline` | Sí | |
| `subheadline` | Sí | |
| `image` MediaRef | Sí | |
| `ctaPrimary` | Sí | |
| `ctaSecondary` | | Sí |

**Imágenes:** 1 full-bleed (recomendada ≥ 2400px ancho).  
**Acciones:** 1–2 CTAs.  
**Dependencias:** ninguna de catálogo.  
**Notas:** el brand test del diseño exige que `headline` sea señal de marca fuerte.

### 3.3 Collections (`CollectionStrip`)

| Campo | Reqado | Opcional |
|-------|----------|----------|
| `eyebrow`, `title` | Sí | |
| `items` (idealmente 3) | Sí | 2–4 con degradación de grid |
| Por item: `collectionId` o datos inline + `image` | Sí | |
| `itemCtaLabel` | | default `"Explorar"` |

**Relación catálogo:** cada item referencia `catalog.collections[id|slug]`.  
**Dependencia:** filtros de `/tienda?coleccion=` deben coincidir con `collection.slug`.  
**Riesgo:** layout está en `md:grid-cols-3` → payload debería validar `items.length === 3` en v1 (o documentar override visual).

### 3.4 Featured Products

| Campo | Reqado | Opcional |
|-------|----------|----------|
| `eyebrow`, `title` | Sí | |
| `productIds[]` | Sí | |
| `viewAll` link | | default `/tienda` |

**Relación catálogo:** resolve IDs → `Product`.  
**Dependencias:** `ProductCard`.  
**Nota:** hoy se usa flag `featured`; el payload debe preferir **lista explícita** para control del builder.

### 3.5 Editorial

| Campo | Reqado | Opcional |
|-------|----------|----------|
| `image` | Sí | |
| `eyebrow`, `title`, `body` | Sí | |
| `cta` | | Sí |

**Sin dependencia de catálogo.**

### 3.6 Newsletter

| Campo | Reqado | Opcional |
|-------|----------|----------|
| `eyebrow`, `title`, `subtitle` | Sí | |
| `placeholder`, `submitLabel`, `successMessage` | | defaults |

**Acción:** formulario (endpoint opcional P2).  
**Sin catálogo.**

### 3.7 Shop

| Campo | Reqado | Opcional |
|-------|----------|----------|
| Intro copy | Sí | |
| `catalog.products` | Sí (mín. 1) | |
| `catalog.categories` | Sí | |

**Dependencias:** productos + colecciones para filtros query.  
**Empty states:** UI fija + microcopy parametrizable.

### 3.8 Product Detail

| Campo | Requerido por producto | Opcional |
|-------|------------------------|----------|
| `id`, `slug`, `name`, `description`, `price` | Sí | |
| `image` | Sí | `hoverImage`, gallery[] |
| `category`, `collection` | Sí | |
| `colors[]`, `sizes[]` | Sí (≥1) | |
| `new`, `featured` | | flags |

**Related products:** derivados por `category` (lógica fija del template).  
**Acciones:** add to cart.

### 3.9 About

| Campo | Reqado | Opcional |
|-------|----------|----------|
| Intro (eyebrow, title, body) | Sí | |
| `bannerImage` | Sí | |
| `blocks[]` (2 en diseño actual) | Sí | 1–N |
| `locations.items[]` | | puede ser `[]` → ocultar sección |
| Closing CTA | | Sí |

**Deep links:** footer apunta a `#sostenibilidad` / `#ateliers` → los `block.id` / section ids deben estabilizarse en el contrato.

### 3.10 Footer

| Campo | Reqado | Opcional |
|-------|----------|----------|
| `blurb` | Sí | |
| `columns[]` | Sí | |
| `tagline` | | Sí |

**Dependencias:** navegación / anchors about.

### 3.11 Cart (UI)

Datos de producto en runtime; strings UI desde `ui.cart`.  
Checkout button hoy no navega a flujo real → fuera de alcance template visual.

### 3.12 Mapa de dependencias entre secciones

```
brand.name ──────────────► Header, Hero, Footer, SEO, copyright
navigation ──────────────► Header, Footer (parcial)
catalog.collections ─────► CollectionStrip, Shop filters, PDP meta
catalog.products ────────► Featured, Shop, PDP, Cart, Related
sections.featured.ids ───► subset de catalog.products
sections.collections ────► subset + images override posibles
footer.columns.href ─────► rutas fijas del template (+ anchors about)
theme.colors ────────────► CSS variables globales (opcional)
media[] ─────────────────► resolución de todas las MediaRef
```

---

## 4. Content Payload — contrato técnico recomendado

### 4.1 Principios del contrato

1. **Un JSON por sitio generado.**  
2. **Referencias, no blobs:** imágenes vía `mediaId` o URL resuelta.  
3. **Catálogo canónico** en `catalog`; las secciones solo **seleccionan**.  
4. **Defaults del template:** el renderer hace merge `templateDefaults ⊕ payload`.  
5. **Versionado:** `templateId` + `templateVersion` + `schemaVersion`.  
6. **IA genera solo este JSON** (o deltas), nunca código.

### 4.2 Tipos base

```ts
/** Identificador de media en la library del SaaS */
type MediaRef = {
  mediaId?: string;       // preferido (resolve en CDN)
  url?: string;           // permitido si ya resuelto
  alt: string;
};

type Link = {
  label: string;
  href: string;           // rutas internas del template o externas
};

type Money = {
  amount: number;         // major units
  currency?: string;      // override brand.currency
};
```

### 4.3 Schema raíz

```ts
type ContentPayload = {
  schemaVersion: "1.0.0";
  templateId: "fashion-atelier-v1";
  templateVersion: "1.0.0";

  brand: Brand;
  theme?: Theme;                 // opcional; merge con defaults
  features?: Features;

  navigation: Navigation;
  seo: Seo;

  media?: MediaAsset[];          // opcional si urls ya resueltas

  catalog: Catalog;

  sections: {
    hero: HeroSection;
    collections: CollectionsSection;
    featured: FeaturedSection;
    editorial: EditorialSection;
    newsletter: NewsletterSection;
    shop: ShopSection;
    about: AboutSection;
    footer: FooterSection;
  };

  ui?: UiCopy;                   // microcopy global
};
```

### 4.4 Brand

```ts
type Brand = {
  name: string;                  // "Atelier"
  displayName?: string;          // "ATELIER" (hero/header tracking)
  tagline?: string;
  locale: string;                // "es-ES"
  currency: string;              // "EUR"
  logo?: MediaRef;               // P2
};
```

### 4.5 Theme

```ts
type Theme = {
  colors?: {
    primary?: string;
    secondary?: string;
    cta?: string;
    ctaHover?: string;
    background?: string;
    surface?: string;
    text?: string;
    muted?: string;
    border?: string;
  };
  // fonts: NO en v1 — Cormorant/Montserrat fijos del template
};
```

### 4.6 Features & Navigation

```ts
type Features = {
  cart?: boolean;                // default true
  newsletter?: boolean;          // default true
};

type Navigation = {
  primary: Link[];               // orden = orden visual
};
```

### 4.7 SEO

```ts
type Seo = {
  titleTemplate: string;         // "%s · Atelier"
  default: {
    title: string;
    description: string;
    openGraph?: {
      title?: string;
      description?: string;
      image?: MediaRef;
    };
  };
  pages?: {
    shop?: { title: string; description: string };
    about?: { title: string; description: string };
  };
};
```

### 4.8 Media

```ts
type MediaAsset = {
  id: string;
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  focalPoint?: { x: number; y: number }; // 0–1, futuro object-position
};
```

### 4.9 Catalog

```ts
type Catalog = {
  categories: Array<{
    id: string;
    slug: string;                // "mujer" | "hombre" | "accesorios" | custom
    label: string;
  }>;
  collections: Array<{
    id: string;
    slug: string;
    name: string;
    description: string;
    image: MediaRef;
  }>;
  products: Array<{
    id: string;
    slug: string;
    name: string;
    description: string;
    price: number;
    categoryId: string;          // ref categories.id
    collectionId: string;        // ref collections.id
    colors: string[];
    sizes: string[];
    image: MediaRef;
    hoverImage?: MediaRef;
    badges?: Array<"new" | "featured">;
  }>;
};
```

### 4.10 Sections

```ts
type HeroSection = {
  headline: string;
  subheadline: string;
  image: MediaRef;
  ctaPrimary: Link;
  ctaSecondary?: Link;
};

type CollectionsSection = {
  eyebrow: string;
  title: string;
  itemCtaLabel?: string;
  /** Exactamente 3 IDs recomendados para fashion-atelier-v1 */
  collectionIds: string[];
  /** Override de imagen por colección en home (opcional) */
  imageOverrides?: Record<string, MediaRef>;
};

type FeaturedSection = {
  eyebrow: string;
  title: string;
  viewAll?: Link;
  productIds: string[];          // 4–8 ideal
};

type EditorialSection = {
  eyebrow: string;
  title: string;
  body: string;
  image: MediaRef;
  cta?: Link;
};

type NewsletterSection = {
  eyebrow: string;
  title: string;
  subtitle: string;
  placeholder?: string;
  submitLabel?: string;
  successMessage?: string;
  action?: { method: "POST"; endpoint: string }; // P2
};

type ShopSection = {
  eyebrow: string;
  title: string;
  description: string;
};

type AboutSection = {
  intro: {
    eyebrow: string;
    title: string;
    body: string;
  };
  bannerImage: MediaRef;
  blocks: Array<{
    id: string;                  // "sostenibilidad" para anchors
    title: string;
    body: string;
  }>;
  locations: {
    eyebrow: string;
    title: string;
    items: Array<{
      city: string;
      address: string;
      hours: string;
    }>;
  };
  closing: {
    title: string;
    body: string;
    cta: Link;
  };
};

type FooterSection = {
  blurb: string;
  columns: Array<{
    title: string;
    links: Link[];
  }>;
  tagline?: string;
  copyrightName?: string;        // default brand.name
};
```

### 4.11 UI microcopy

```ts
type UiCopy = {
  cart?: {
    title?: string;
    empty?: string;
    exploreCta?: string;
    checkout?: string;
    shippingHint?: string;
  };
  product?: {
    addToCart?: string;
    relatedTitle?: string;
    shippingNote?: string;
    badges?: { new?: string; featured?: string };
  };
  shop?: {
    empty?: string;
    countOne?: string;
    countMany?: string;
    clearFilter?: string;
  };
  notFound?: {
    title?: string;
    body?: string;
    cta?: Link;
  };
};
```

### 4.12 Ejemplo mínimo válido (shape, no datos reales de producción)

```json
{
  "schemaVersion": "1.0.0",
  "templateId": "fashion-atelier-v1",
  "templateVersion": "1.0.0",
  "brand": {
    "name": "Atelier",
    "displayName": "ATELIER",
    "locale": "es-ES",
    "currency": "EUR"
  },
  "navigation": {
    "primary": [
      { "label": "Tienda", "href": "/tienda" },
      { "label": "Mujer", "href": "/tienda?categoria=mujer" },
      { "label": "Hombre", "href": "/tienda?categoria=hombre" },
      { "label": "Nosotros", "href": "/nosotros" }
    ]
  },
  "seo": {
    "titleTemplate": "%s · Atelier",
    "default": {
      "title": "Atelier — Moda contemporánea",
      "description": "…"
    }
  },
  "catalog": {
    "categories": [],
    "collections": [],
    "products": []
  },
  "sections": {
    "hero": {},
    "collections": { "collectionIds": [] },
    "featured": { "productIds": [] },
    "editorial": {},
    "newsletter": {},
    "shop": {},
    "about": {},
    "footer": {}
  }
}
```

### 4.13 Reglas de validación (para el Builder / CI)

| Regla | Severidad |
|-------|-----------|
| `templateId === fashion-atelier-v1` | Error |
| `sections.collections.collectionIds.length === 3` | Error (v1) |
| Todos los IDs referenciados existen en `catalog` | Error |
| `sections.featured.productIds` ⊆ `catalog.products` | Error |
| Cada MediaRef tiene `url` o `mediaId` resoluble + `alt` | Error |
| `products[].slug` únicos | Error |
| `href` internos solo a rutas del template | Warning |
| Theme colors formato `#RRGGBB` | Error si presentes |

### 4.14 Defaults del template

El contenido actual hardcodeado de Atelier debe vivir como **`defaults.content.json`** del template (no en JSX). Así:

- Preview sin payload → sitio idéntico al actual.  
- IA / usuario solo sobreescriben campos necesarios.  
- Diff claro entre default y tenant.

---

## 5. Refactorizaciones necesarias (mínimas)

### 5.1 Principio

**No nuevos componentes visuales.** Solo:

1. Contrato + defaults  
2. Loader/provider  
3. Props/context en componentes existentes  
4. Eliminar mock como fuente de verdad  

### 5.2 Archivos a introducir (mínimo)

| Artefacto | Rol |
|-----------|-----|
| `content/schema.ts` (o JSON Schema) | Contrato TypeScript |
| `content/defaults.json` | Payload Atelier actual |
| `lib/content.ts` | `getSiteContent()`, resolvers, `formatPrice(brand)` |
| `lib/content-context.tsx` | Provider para Client Components |
| `lib/resolve-media.ts` | `mediaId` → URL |

### 5.3 Componentes: de hardcode → props/context

| Componente | Cambio mínimo |
|------------|---------------|
| `Hero` | Props desde `sections.hero` |
| `CollectionStrip` | Props + collections resueltas |
| `FeaturedProducts` | Ya recibe `products`; añadir copy props |
| `EditorialBanner` | Props |
| `Newsletter` | Props |
| `Header` | Context: brand + navigation |
| `Footer` | Context: brand + footer section |
| `ShopCatalog` | Context: catalog + shop ui |
| `ProductCard` | Sin cambio estructural; Product type desde schema |
| `AddToCartForm` | Label desde ui |
| `CartDrawer` | Labels desde ui |
| `page.tsx` (home) | Lee content, pasa props |
| `tienda/*`, `nosotros` | Leen content |
| `layout.tsx` | Metadata dinámica desde content; theme CSS vars |

### 5.4 Qué desacoplar

| Acoplamiento actual | Acción |
|---------------------|--------|
| `CollectionStrip` importa `collections` de `products.ts` | Dejar de importar mock; recibir props |
| `ShopCatalog` importa `products` global | Recibir products/categories |
| `getFeaturedProducts()` por flag | Resolver por `featured.productIds` |
| `formatPrice` moneda fija | Leer `brand.locale/currency` |
| `ProductCategory` union cerrada | Abrir a slugs del payload |
| Metadata estática en layout | `generateMetadata` desde content |

### 5.5 Qué eliminar / relegar

| Archivo | Destino |
|---------|---------|
| Arrays mock en `products.ts` | Mover a `defaults.json`; dejar solo types + pure helpers |
| URLs Unsplash en JSX | Solo en defaults/media |

### 5.6 Puntos de extensión (sin implementar ahora)

- `features.*` para ocultar newsletter/cart  
- `brand.logo`  
- `theme.fonts` (rompería identidad; no v1)  
- Multi-idioma (`payload.i18n`)  
- Gallery en PDP  
- Checkout real  

### 5.7 Context vs props

| Estrategia | Usar para |
|------------|-----------|
| **Props** | Secciones de página (Hero, Editorial, etc.) — árbol corto |
| **React Context (`SiteContent`)** | Header, Footer, CartDrawer, ShopCatalog (client, shell) |
| **Server `getSiteContent()`** | Pages RSC, `generateMetadata`, `generateStaticParams` |

Evitar prop-drilling profundo del JSON completo a cada hoja.

---

## 6. Assets

### 6.1 Clasificación

| Asset | Origen actual | Destino |
|-------|---------------|---------|
| Imágenes Unsplash (hero, editorial, about, collections, products) | URLs hardcodeadas | **Payload / Media library** |
| Iconos Lucide | npm | **Template fijo** |
| Fuentes Cormorant / Montserrat | `next/font` | **Template fijo** |
| CSS glass / keyframes | `globals.css` | **Template fijo** |
| Favicon / `public/*` | defaults Next | Template o `brand.favicon` (P2) |
| Videos | ninguno | N/A |
| SVG custom | ninguno | N/A |

### 6.2 Media resolution

Flujo recomendado:

```
MediaRef.mediaId → SaaS Media API → absolute URL
MediaRef.url     → passthrough (ya resuelto)
```

`next.config.ts` debe permitir hostnames del CDN del SaaS (no solo `images.unsplash.com`).

### 6.3 Focal point (futuro)

Hero usa `object-[center_20%]`. Si el media picker del SaaS expone focal point, mapear a `object-position` sin cambiar layout.

---

## 7. Riesgos técnicos

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| **Importaciones directas del mock** en varios componentes | Payload ignorado accidentalmente | Helpers únicos; ESLint ban import de defaults en components |
| **`generateStaticParams` acoplado a mock** | Build sin productos tenant | Generar desde payload inyectado en build |
| **Categorías hardcodeadas vs payload** | Filtros rotos | Categories desde catalog |
| **Grid de colecciones asume 3** | Layout roto con N≠3 | Validación schema; o CSS adaptativo documentado |
| **Theme CSS variables vs Tailwind classes** | Tokens no aplicados | Inyectar vars en `:root` desde layout; componentes ya usan tokens semánticos |
| **Client/Server boundary** | Context no disponible en RSC | `getSiteContent` en server + Provider en client shell |
| **remotePatterns insuficientes** | Imágenes rotas en prod | Config dinámica o wildcard controlado del CDN |
| **Duplicación Header nav vs Footer columns** | Inconsistencia | Builder genera ambos desde misma fuente o hereda links |
| **Anchors footer → about** | Links muertos si cambian ids | `blocks[].id` contractual |
| **Multi-template futuro** | Contratos divergentes | `templateId` + schema versionado por template |
| **IA inventando rutas/secciones** | Rotura UX | JSON Schema estricto + reject additional sections |
| **Carrito sin backend** | Expectativa de compra | Documentar como UI demo; features.checkout fuera de v1 |
| **i18n** | Copy mezclado ES | `brand.locale` + un payload por locale (no parcial) |

### 7.1 Escalabilidad multi-template

Este audit define el **primer** template. Para N templates:

- Cada template tiene su propio `schema` + `defaults` + código.  
- El Builder elige `templateId` y valida contra ese schema.  
- **No** unificar todos los templates en un único mega-JSON.  
- Shared: `MediaRef`, `Link`, `Brand` base.

---

## 8. Estrategia de desacoplamiento

```
Fase conceptual (sin tocar diseño):

[JSX con literales] 
    → [JSX + props] 
    → [JSX + props + defaults.json] 
    → [JSX + SiteContentProvider + payload externo]
```

Regla de oro: **cada PR de conversión debe dejar el sitio visualmente idéntico** con `defaults.json` = contenido actual.

Inyección del payload en runtime/build (decisión SaaS, fuera de este audit):

| Modo | Uso |
|------|-----|
| Build-time file `content.json` | Sites estáticos por tenant |
| Env `CONTENT_URL` fetch ISR | Actualización sin redeploy completo |
| Edge config / CMS | Preview en Builder |

El template solo necesita: **una función `getSiteContent(): ContentPayload`**.

---

## 9. Roadmap técnico priorizado

### Fase 0 — Congelar (0.5 día)

- Tag/commit del estado visual actual como golden reference.  
- Exportar mentalmente (o checklist) screenshots home/tienda/pdp/nosotros.

### Fase 1 — Contrato + defaults (1–2 días)

- Escribir TypeScript types / JSON Schema del §4.  
- Extraer `defaults.content.json` con **exactamente** el copy/imágenes actuales.  
- Documentar reglas de validación.  
- **Sin cambiar componentes aún.**

### Fase 2 — Content layer (1 día)

- `getSiteContent()` lee defaults.  
- `SiteContentProvider` en layout.  
- `formatPrice` lee brand.  
- Theme opcional → CSS variables en layout.

### Fase 3 — Deshardcodear shell + home (2 días)

- Header, Footer, Hero, CollectionStrip, Featured, Editorial, Newsletter.  
- Home `page.tsx` orquesta con content.  
- Verificación visual = golden.

### Fase 4 — Catálogo data-driven (2 días)

- Eliminar arrays mock de `products.ts`.  
- Shop + PDP + related + cart images desde catalog.  
- Categories dinámicas.  
- `generateStaticParams` desde content.

### Fase 5 — About + SEO + UI strings (1 día)

- About page.  
- `generateMetadata` global y por página.  
- Microcopy cart/product/404.

### Fase 6 — Integración SaaS (lado plataforma; fuera del template puro)

- Endpoint/media resolve.  
- Whitelist CDN.  
- Validación schema en Builder.  
- Preview: payload draft → template render.  
- Publicación: persist payload + deploy/bind.

### Fase 7 — Hardening

- Tests de schema (fixtures válidos/inválidos).  
- Test de merge defaults ⊕ override.  
- Checklist IA: “solo JSON, no código”.

**Estimación total template (Fases 1–5):** ~7–9 días ingeniero familiarizado con el repo.  
**Riesgo de regresión visual:** bajo si cada fase usa defaults = contenido actual.

---

## 10. Respuestas directas a las preguntas de auditoría

| Pregunta | Respuesta |
|----------|-----------|
| ¿Qué está hardcodeado? | Marca, nav, SEO, todo el copy de secciones, Unsplash URLs, footer, UI strings, mock de 12 productos y 3 colecciones, moneda, locale, categorías de filtro |
| ¿Qué debe ser parámetro? | Todo lo anterior vía Content Payload; theme colors opcional |
| ¿Qué componentes consumen datos externos? | Todos los listados en §5.3; `Reveal` y lógica de cart no |
| ¿Cómo estructurar el payload? | §4 — un JSON versionado por `templateId` |
| ¿Contratos por sección? | §3 + §4.10 |
| ¿Dependencias entre secciones? | §3.12 (brand, catalog, media, anchors) |
| ¿Qué permanece igual? | Rutas, layout visual, CSS motion/glass, fonts, iconos, orden de secciones, cart logic, aspect ratios |
| ¿Refactor mínimo? | Content layer + props/context + defaults; sin nuevos componentes UI |

---

## 11. Entregable — guía oficial

Este documento es la **guía oficial** para convertir Atelier en el primer template compatible con IA Builder v2:

1. **No regenerar UI con IA.**  
2. **Parametrizar vía Content Payload.**  
3. **Mantener defaults = calidad visual actual.**  
4. **Validar IDs y media antes de render.**  
5. **Versionar `fashion-atelier-v1`.**

### Próximo artefacto recomendado (fuera de este audit)

- `audit/content-payload.schema.json` (JSON Schema draft)  
- `audit/defaults.content.json` (payload espejo del sitio actual)  

Ambos se pueden generar en una siguiente investigación / fase de implementación sin tocar el diseño.

---

## Apéndice A — Matriz archivo → acción

| Archivo | Acción |
|---------|--------|
| `src/app/layout.tsx` | Metadata + theme vars + Provider |
| `src/app/page.tsx` | Wire sections desde content |
| `src/app/tienda/page.tsx` | Intro + catalog |
| `src/app/tienda/[slug]/page.tsx` | Product resolve desde catalog |
| `src/app/nosotros/page.tsx` | About section data |
| `src/app/not-found.tsx` | ui.notFound |
| `src/app/globals.css` | Permanecer; vars sobreescribibles |
| `src/components/Header.tsx` | brand + nav |
| `src/components/Footer.tsx` | brand + footer |
| `src/components/Hero.tsx` | props |
| `src/components/CollectionStrip.tsx` | props |
| `src/components/FeaturedProducts.tsx` | props copy + products |
| `src/components/EditorialBanner.tsx` | props |
| `src/components/Newsletter.tsx` | props |
| `src/components/ShopCatalog.tsx` | catalog via props/context |
| `src/components/ProductCard.tsx` | type only |
| `src/components/AddToCartForm.tsx` | ui labels |
| `src/components/CartDrawer.tsx` | ui labels |
| `src/components/Reveal.tsx` | **sin cambios** |
| `src/lib/products.ts` | types + helpers; quitar mock |
| `src/lib/cart-context.tsx` | **sin cambios lógicos** |
| `next.config.ts` | remotePatterns CDN |
| `design-system/atelier/*` | referencia; no runtime |

## Apéndice B — Checklist de aceptación del template

- [ ] Sitio con solo `defaults.json` es visualmente indistinguible del actual  
- [ ] Ningún string de marca/copy editorial permanece hardcodeado en JSX  
- [ ] Catálogo 100% desde payload  
- [ ] Schema valida payloads buenos y rechaza malos  
- [ ] Media resuelve desde library del SaaS  
- [ ] `templateId` + versions presentes  
- [ ] Documentado: la IA solo emite JSON  

---

*Fin del TEMPLATE CONVERSION AUDIT — Investigación 1*
