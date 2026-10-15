"use client";

import { useCallback, useRef } from "react";
import type { ProductDetailViewModel } from "./product";
import {
  preferredGalleryIndexForVariant,
  resolveMainGalleryItem,
} from "./productDetailGalleryVariantSync";

/** Recursos de imagen principal preparados por sesión de PDP. */
export const PRODUCT_HERO_WARM_LIMIT = 3;

export type ProductHeroWarmRequest = {
  /** URL de origen de la galería. Identifica el recurso, no el candidato optimizado. */
  key: string;
  src: string;
  srcSet?: string;
  sizes?: string;
};

export type ProductHeroWarmLoader = (
  request: ProductHeroWarmRequest,
  done: () => void,
) => void;

export type ProductHeroImagePropsReader = (props: {
  alt: string;
  src: string;
  fill: true;
  sizes: string;
}) => {
  props: {
    src: string;
    srcSet?: string;
    sizes?: string;
  };
};

type ProductHeroProduct = Pick<
  ProductDetailViewModel,
  "gallery" | "variants" | "name"
>;

export function productHeroSourceUrlForVariant(
  product: ProductHeroProduct,
  variantId: string | undefined,
): string | null {
  if (!variantId) return null;
  const variant = product.variants.find((item) => item.id === variantId);
  const index = preferredGalleryIndexForVariant(product, variantId);
  return resolveMainGalleryItem(product, index, variant)?.url ?? null;
}

export function productHeroWarmRequestForVariant(input: {
  product: ProductHeroProduct;
  variantId: string | undefined;
  activeImageUrl: string | null | undefined;
  sizes: string;
  getImageProps: ProductHeroImagePropsReader;
}): ProductHeroWarmRequest | null {
  const sourceUrl = productHeroSourceUrlForVariant(input.product, input.variantId);
  if (!sourceUrl || sourceUrl === input.activeImageUrl) return null;
  const { props } = input.getImageProps({
    alt: "",
    src: sourceUrl,
    fill: true,
    sizes: input.sizes,
  });
  if (!props.src && !props.srcSet) return null;
  return {
    key: sourceUrl,
    src: props.src,
    srcSet: props.srcSet,
    sizes: props.sizes ?? input.sizes,
  };
}

/**
 * Una descarga anticipada a la vez y como máximo tres recursos distintos.
 * Si llega otra intención mientras hay una descarga, se conserva solo la última.
 */
export function createProductHeroWarmSession(load: ProductHeroWarmLoader) {
  const started = new Set<string>();
  let inflight: string | null = null;
  let queued: ProductHeroWarmRequest | null = null;

  const pump = () => {
    if (inflight || !queued) return;
    const next = queued;
    queued = null;
    begin(next);
  };

  const begin = (request: ProductHeroWarmRequest) => {
    if (!request.key || started.has(request.key)) return;
    if (started.size >= PRODUCT_HERO_WARM_LIMIT) return;
    started.add(request.key);
    inflight = request.key;
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      if (inflight === request.key) inflight = null;
      pump();
    };
    try {
      load(request, finish);
    } catch {
      finish();
    }
  };

  return {
    warm(request: ProductHeroWarmRequest | null | undefined) {
      if (!request?.key) return;
      if (started.has(request.key) || inflight === request.key) return;
      if (queued?.key === request.key) return;
      if (inflight) {
        if (started.size >= PRODUCT_HERO_WARM_LIMIT) return;
        queued = request;
        return;
      }
      begin(request);
    },
    startedCount() {
      return started.size;
    },
  };
}

export type ProductHeroWarmSession = ReturnType<typeof createProductHeroWarmSession>;

export function preloadOptimizedHeroImage(
  request: ProductHeroWarmRequest,
  done: () => void,
): void {
  if (typeof window === "undefined") {
    done();
    return;
  }
  const img = new window.Image();
  img.decoding = "async";
  img.fetchPriority = "low";
  if (request.sizes) img.sizes = request.sizes;
  if (request.srcSet) img.srcset = request.srcSet;
  const finish = () => {
    img.onload = null;
    img.onerror = null;
    done();
  };
  img.onload = () => {
    const decoded = img.decode?.();
    if (decoded && typeof decoded.then === "function") {
      decoded.then(finish, finish);
      return;
    }
    finish();
  };
  img.onerror = finish;
  // `src` va después de `srcset`: si se asigna antes, Safari descarga el
  // candidato de respaldo (el ancho mayor) además del que elige el viewport.
  img.src = request.src;
}

export function productHeroIntentHandlers(onIntent: () => void): {
  onPointerEnter: () => void;
  onFocus: () => void;
  onPointerDown: () => void;
} {
  return {
    onPointerEnter: onIntent,
    onFocus: onIntent,
    onPointerDown: onIntent,
  };
}

export function useProductHeroVariantIntent(input: {
  product: Pick<ProductDetailViewModel, "id" | "gallery" | "variants" | "name">;
  activeImageUrl: string | null | undefined;
  sizes: string;
  getImageProps: ProductHeroImagePropsReader;
  load?: ProductHeroWarmLoader;
}): (variantId: string | undefined) => void {
  const sessionRef = useRef<ProductHeroWarmSession | null>(null);
  const productIdRef = useRef(input.product.id);
  if (!sessionRef.current || productIdRef.current !== input.product.id) {
    productIdRef.current = input.product.id;
    sessionRef.current = createProductHeroWarmSession(
      input.load ?? preloadOptimizedHeroImage,
    );
  }
  const inputRef = useRef(input);
  inputRef.current = input;

  return useCallback((variantId: string | undefined) => {
    const current = inputRef.current;
    try {
      const request = productHeroWarmRequestForVariant({
        product: current.product,
        variantId,
        activeImageUrl: current.activeImageUrl,
        sizes: current.sizes,
        getImageProps: current.getImageProps,
      });
      if (request) sessionRef.current?.warm(request);
    } catch {
      // La selección de variante no depende de esta descarga.
    }
  }, []);
}
