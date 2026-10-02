import type { ProductDetailPresentation } from "../lib/pdp-presentation";
export type MediaFocalPoint = {
  x: number;
  y: number;
};

export type MediaRef = {
  mediaId?: string;
  url?: string;
  alt: string;
  focalPoint?: MediaFocalPoint;
  focalPointMobile?: MediaFocalPoint;
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

export type HomePageLayout = {
  sectionOrder?: string[];
};

export type Layout = {
  pages?: {
    home?: HomePageLayout;
  };
};

export type ContentPayload = {
  schemaVersion: "1.0.0";
  templateId: "fashion-velvet-v1";
  templateVersion: string;
  brand: Brand;
  theme?: Theme;
  features?: {
    cart?: boolean;
    newsletter?: boolean;
    account?: boolean;
    /** Mount-relative account root. Default `/cuenta`. SaaS may use `/account`. */
    accountBasePath?: string;
  };
  layout?: Layout;
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
      carouselImages?: MediaRef[];
      carouselIntervalMs?: number;
      /** @deprecated Sprint 85 — ignored at runtime */
      imageSecondary?: MediaRef;
      imageMobile?: MediaRef;
      imageMobileSecondary?: MediaRef;
      ctaPrimary: Link;
      ctaSecondary?: Link;
    };
    /** Ocasiones: franja visual ligada a colecciones del catálogo. */
    soirees: {
      eyebrow: string;
      title: string;
      collectionIds: string[];
    };
    /** Promesa de atelier: diseño → confección → prueba. */
    goldCraft: {
      eyebrow: string;
      title: string;
      body?: string;
      steps: Array<{ id: string; title: string; body: string }>;
    };
    /** Looks firma: vestidos destacados. */
    nocturne: {
      eyebrow: string;
      title: string;
      productIds: string[];
      viewAll?: Link;
    };
    /** Nota de atención personalizada (sin newsletter genérico). */
    salon: {
      eyebrow: string;
      title: string;
      body: string;
      cta: Link;
    };
    /** Carril de accesorios artesanales (mayor y menor). */
    velvetEdit: {
      eyebrow: string;
      title: string;
      body: string;
      productIds: string[];
      cta?: Link;
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
    product?: {
      presentation?: ProductDetailPresentation;
    };
  };
  ui: TemplateUi;
};

export type TemplateUi = {
  chrome: {
    openCart: string;
    openCartWithCount: string;
    myAccount: string;
    openMenu: string;
    closeMenu: string;
    mainNavAria: string;
    mobileNavAria: string;
    salesModeAria: string;
  };
  account: {
    eyebrow: string;
    loginTitle: string;
    registerTitle: string;
    dashboardTitle: string;
    emailLabel: string;
    nameLabel: string;
    phoneLabel: string;
    passwordLabel: string;
    loginSubmit: string;
    loginSubmitting: string;
    registerSubmit: string;
    registerSubmitting: string;
    logout: string;
    goToRegister: string;
    goToLogin: string;
    noAccountPrompt: string;
    hasAccountPrompt: string;
    googleSignIn: string;
  };
  listing: {
    searchLabel: string;
    searchPlaceholder: string;
    allCategories: string;
    loading: string;
    loadMore: string;
    loadingMore: string;
    noSearchResults: string;
    pieceSingular: string;
    piecePlural: string;
    collectionPrefix: string;
    clearFilter: string;
  };
  checkout: {
    pageTitle: string;
    customerSection: string;
    shippingSection: string;
    paymentSection: string;
    summarySection: string;
    fullNameRequired: string;
    emailRequired: string;
    shippingMethodRequired: string;
    pickupBranchRequired: string;
    paymentMethodRequired: string;
    phoneNumberLabel: string;
    discountCodeLabel: string;
    shippingLineLabel: string;
    subtotalLabel: string;
    totalLabel: string;
    emptyCartLabel: string;
    removeLineLabel: string;
    quantityLabel: string;
    phoneCountryAria: string;
    discountApply: string;
    taxLabel: string;
    hasDiscountCodeLabel: string;
    discountLineLabel: string;
  };
  errors: {
    addToCartFailed: string;
    orderConfirmFailed: string;
    catalogLoadFailed: string;
  };
  cart: {
    title: string;
    empty: string;
    exploreCta: string;
    checkout: string;
    shippingHint: string;
  };
  product: {
    addToCart: string;
    relatedTitle: string;
    shippingNote: string;
    outOfStock: string;
    contact: string;
    lowStock: string;
    madeToOrderClosed: string;
    addingToCart: string;
    priceBookLabel: string;
    priceProgramLabel: string;
    stockUpsellModalTitle: string;
    stockInsufficientImmediate: string;
    stockInsufficientMadeToOrderHint: string;
    stockExhaustedImmediateTitle: string;
    stockExhaustedMadeToOrderAvailable: string;
    buyMadeToOrderCta: string;
    badges: {
      new: string;
      featured: string;
      sale: string;
      bestseller: string;
      limitedEdition: string;
    };
  };
  shop: {
    empty: string;
    clearFilter: string;
  };
  notFound: {
    title: string;
    body: string;
  };
  salesMode: {
    stock: {
      navLabel: string;
      shopBanner: string;
      cartLabel: string;
    };
    madeToOrder: {
      navLabel: string;
      shopBanner: string;
      preparationLabel: string;
      closedMessage: string;
      reopensPrefix: string;
      cartLabel: string;
      cartClosedWarning: string;
    };
    nav: Array<{
      salesMode: "stock" | "madeToOrder";
      label: string;
      href: string;
    }>;
    entryPrompt?: string;
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
