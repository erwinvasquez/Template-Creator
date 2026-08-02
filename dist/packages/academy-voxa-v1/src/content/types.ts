export type MediaRef = {
  mediaId?: string;
  url?: string;
  alt: string;
};

/** Generic CTA / footer path link (absolute path relative to mount). */
export type Link = {
  label: string;
  href: string;
};

/**
 * Navbar entry: plain path or shop filter (resolved to /programas?…).
 * Prefer `shopFilter` for category/collection entries so the SaaS can validate slugs.
 */
export type PathNavLink = {
  type: "path";
  label: string;
  href: string;
};

export type ShopFilterNavLink = {
  type: "shopFilter";
  label: string;
  categorySlug?: string;
  collectionSlug?: string;
};

export type NavLink = PathNavLink | ShopFilterNavLink;

export type Brand = {
  name: string;
  displayName?: string;
  tagline?: string;
  locale: string;
  currency: string;
  logo?: MediaRef;
};

export type Theme = {
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
    ink?: string;
  };
};

export type CatalogCategory = {
  id: string;
  slug: string;
  label: string;
};

export type CatalogCollection = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: MediaRef;
};

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  collectionId: string;
  /** Formato de entrega: modalidad del programa u formato del libro. */
  metals: string[];
  /** Duración / nivel del programa, o formato físico del libro. */
  sizes: string[];
  image: MediaRef;
  hoverImage?: MediaRef;
  badges?: Array<"new" | "limited">;
};

export type ProductBadgeKey =
  | "new"
  | "limited"
  | "limitedEdition"
  | "featured"
  | "sale"
  | "bestseller";

/** Paso de la metodología de entrenamiento (sección `method`). */
export type MethodStep = {
  id: string;
  title: string;
  body: string;
};

export type ContentPayload = {
  schemaVersion: "1.0.0";
  templateId: "academy-voxa-v1";
  templateVersion: string;
  brand: Brand;
  theme?: Theme;
  features?: {
    cart?: boolean;
    appointment?: boolean;
    account?: boolean;
    newsletter?: boolean;
    /** Mount-relative account root. Default `/cuenta`. SaaS may use `/account`. */
    accountBasePath?: string;
  };
  navigation: { primary: NavLink[] };
  seo: {
    titleTemplate: string;
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
      academia?: { title: string; description: string };
    };
  };
  media?: Array<{
    id: string;
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  }>;
  catalog: {
    categories: CatalogCategory[];
    collections: CatalogCollection[];
    products: CatalogProduct[];
  };
  sections: {
    hero: {
      headline: string;
      subheadline: string;
      image: MediaRef;
      ctaPrimary: Link;
      ctaSecondary?: Link;
    };
    /** Programas destacados: selecciona IDs de `catalog.products`. */
    programs: {
      eyebrow: string;
      title: string;
      productIds: string[];
    };
    /** Metodología de entrenamiento en 3–4 pasos. */
    method: {
      eyebrow: string;
      title: string;
      body?: string;
      steps: MethodStep[];
    };
    /** Resultados de la transformación: bullets + imagen de apoyo. */
    outcomes: {
      eyebrow: string;
      title: string;
      body: string;
      bullets: string[];
      image: MediaRef;
    };
    /** Franja editorial: libros destacados del catálogo. */
    books: {
      eyebrow: string;
      title: string;
      productIds: string[];
      cta?: Link;
    };
    shop: {
      eyebrow: string;
      title: string;
      description: string;
    };
    /** Página `about` de la academia (path visible `/academia`). */
    about: {
      intro: { eyebrow: string; title: string; body: string };
      bannerImage: MediaRef;
      blocks: Array<{ id: string; title: string; body: string }>;
      faculty: {
        eyebrow: string;
        title: string;
        items: Array<{ name: string; role: string; focus: string }>;
      };
      closing: { title: string; body: string; cta: Link };
    };
    footer: {
      blurb: string;
      columns: Array<{ title: string; links: Link[] }>;
      tagline?: string;
      copyrightName?: string;
    };
  };
  ui?: {
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
      outOfStock?: string;
      contact?: string;
      lowStock?: string;
      madeToOrderClosed?: string;
      badges?: {
        new?: string;
        /** Etiqueta de cupos/tirada limitada; alias de `limitedEdition`. */
        limited?: string;
        limitedEdition?: string;
        featured?: string;
        sale?: string;
        bestseller?: string;
      };
    };
    shop?: {
      empty?: string;
      clearFilter?: string;
    };
    notFound?: {
      title?: string;
      body?: string;
    };
    salesMode?: {
      stock?: {
        navLabel?: string;
        shopBanner?: string;
        cartLabel?: string;
      };
      madeToOrder?: {
        navLabel?: string;
        shopBanner?: string;
        preparationLabel?: string;
        closedMessage?: string;
        reopensPrefix?: string;
        cartLabel?: string;
        cartClosedWarning?: string;
      };
      nav?: Array<{
        salesMode: "stock" | "madeToOrder";
        label: string;
        href: string;
      }>;
    };
  };
};

/**
 * Contract page ids. Voxa's about page lives at `/academia` (design copy) but
 * the page id is `about`, as required by the platform routing contract.
 */
export type TemplatePage = "home" | "shop" | "product" | "about";

/** View model used by UI after resolving catalog refs */
export type ResolvedProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  categorySlug: string;
  categoryLabel: string;
  collectionSlug: string;
  collectionName: string;
  metals: string[];
  sizes: string[];
  imageUrl: string;
  imageAlt: string;
  hoverImageUrl?: string;
  isNew: boolean;
  isLimited: boolean;
};
