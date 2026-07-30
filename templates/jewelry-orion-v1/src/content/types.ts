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
 * Navbar entry: plain path or shop filter (resolved to /coleccion?…).
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
  metals: string[];
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

export type MaterialItem = {
  id: string;
  name: string;
  description: string;
  image: MediaRef;
};

export type ContentPayload = {
  schemaVersion: "1.0.0";
  templateId: "jewelry-orion-v1";
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
      atelier?: { title: string; description: string };
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
    };
    signatures: {
      eyebrow: string;
      title: string;
      productIds: string[];
    };
    craft: {
      eyebrow: string;
      title: string;
      body: string;
      image: MediaRef;
      cta?: Link;
    };
    materials: {
      eyebrow: string;
      title: string;
      items: MaterialItem[];
    };
    appointment: {
      eyebrow: string;
      title: string;
      body: string;
      cta: Link;
    };
    shop: {
      eyebrow: string;
      title: string;
      description: string;
    };
    atelier: {
      intro: { eyebrow: string; title: string; body: string };
      bannerImage: MediaRef;
      blocks: Array<{ id: string; title: string; body: string }>;
      maisons: {
        eyebrow: string;
        title: string;
        items: Array<{ city: string; address: string; hours: string }>;
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
        /** Orion legacy badge label; kept alongside `limitedEdition`. */
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
  };
};

/**
 * Contract page ids. Orion's about page lives at `/atelier` (design copy) but the
 * page id is `about`, as required by the platform routing contract.
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
