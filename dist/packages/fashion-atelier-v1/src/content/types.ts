export type MediaRef = {
  mediaId?: string;
  url?: string;
  alt: string;
};

export type Link = {
  label: string;
  href: string;
};

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
  colors: string[];
  sizes: string[];
  image: MediaRef;
  hoverImage?: MediaRef;
  badges?: Array<"new" | "featured">;
};

export type ContentPayload = {
  schemaVersion: "1.0.0";
  templateId: "fashion-atelier-v1";
  templateVersion: string;
  brand: Brand;
  theme?: Theme;
  features?: { cart?: boolean; newsletter?: boolean };
  navigation: { primary: Link[] };
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
      about?: { title: string; description: string };
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
    collections: {
      eyebrow: string;
      title: string;
      itemCtaLabel?: string;
      collectionIds: string[];
    };
    featured: {
      eyebrow: string;
      title: string;
      viewAll?: Link;
      productIds: string[];
    };
    editorial: {
      eyebrow: string;
      title: string;
      body: string;
      image: MediaRef;
      cta?: Link;
    };
    newsletter: {
      eyebrow: string;
      title: string;
      subtitle: string;
      placeholder?: string;
      submitLabel?: string;
      successMessage?: string;
    };
    shop: {
      eyebrow: string;
      title: string;
      description: string;
    };
    about: {
      intro: { eyebrow: string; title: string; body: string };
      bannerImage: MediaRef;
      blocks: Array<{ id: string; title: string; body: string }>;
      locations: {
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
      badges?: { new?: string; featured?: string };
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
  colors: string[];
  sizes: string[];
  imageUrl: string;
  imageAlt: string;
  hoverImageUrl?: string;
  isNew: boolean;
  isFeatured: boolean;
};
