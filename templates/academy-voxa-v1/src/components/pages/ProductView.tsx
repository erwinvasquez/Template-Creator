"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { notFound, useSearchParams } from "next/navigation";
import type { ProductDetailViewModel } from "@shopenlinea/commerce-runtime-contract";
import {
  localSelectedVariantIdFromProduct,
  mergeProductWithSelectedVariant,
  nextLocalSelectedVariantId,
  readPdpVariantIdFromSearch,
} from "@shopenlinea/commerce-runtime-contract";
import {
  useCommerceCapabilities,
  useRequiredCommerceHost,
} from "../../lib/commerce-host";
import { useSiteContent } from "../../lib/site-content";
import { requireUi } from "../../lib/ui";
import { ProductDetailCommerceView } from "../commerce/ProductDetailCommerceView";

export function ProductView({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const variantFromUrl = useMemo(
    () => readPdpVariantIdFromSearch(searchParams),
    [searchParams],
  );
  const host = useRequiredCommerceHost();
  const capabilities = useCommerceCapabilities();
  const { payload } = useSiteContent();
  const loadingLabel = requireUi(payload).listing.loading;
  const initialDetail = host.getDetailSnapshot?.(slug) ?? null;
  const [product, setProduct] = useState<ProductDetailViewModel | null>(
    initialDetail,
  );
  const [localSelectedVariantId, setLocalSelectedVariantId] = useState<
    string | null
  >(
    variantFromUrl ??
      (initialDetail ? localSelectedVariantIdFromProduct(initialDetail) : null),
  );
  const [missing, setMissing] = useState(false);
  const [trackedSlug, setTrackedSlug] = useState(slug);
  if (trackedSlug !== slug) {
    const nextDetail = host.getDetailSnapshot?.(slug) ?? null;
    setTrackedSlug(slug);
    setProduct(nextDetail);
    setLocalSelectedVariantId(
      variantFromUrl ??
        (nextDetail ? localSelectedVariantIdFromProduct(nextDetail) : null),
    );
    setMissing(false);
  }
  const [tick, setTick] = useState(0);
  const [, startTransition] = useTransition();

  const productForView =
    product != null
      ? mergeProductWithSelectedVariant(product, localSelectedVariantId)
      : null;

  useEffect(() => {
    if (variantFromUrl) {
      host.actions.selectVariant(variantFromUrl);
    }
  }, [host, slug, variantFromUrl]);

  useEffect(() => host.subscribe(() => setTick((t) => t + 1)), [host]);

  useEffect(() => {
    let cancelled = false;
    void host.getDetail(slug).then((p) => {
      if (cancelled) return;
      startTransition(() => {
        if (!p) {
          setMissing(true);
          setProduct(null);
          setLocalSelectedVariantId(null);
        } else {
          setProduct(p);
          setLocalSelectedVariantId(localSelectedVariantIdFromProduct(p));
          setMissing(false);
        }
      });
    });
    return () => {
      cancelled = true;
    };
  }, [host, slug, tick]);

  if (missing) notFound();
  if (!productForView || productForView.slug !== slug) {
    return (
      <p className="px-6 py-32 text-center text-muted md:px-8">{loadingLabel}</p>
    );
  }

  return (
    <ProductDetailCommerceView
      product={productForView}
      capabilities={capabilities}
      actions={{
        selectVariant: (variantId) => {
          setLocalSelectedVariantId((current) =>
            nextLocalSelectedVariantId(current, variantId),
          );
          host.actions.selectVariant(variantId);
        },
        addToCart: host.actions.addToCart,
        openCartDrawer: host.actions.openCartDrawer,
        confirmAddToCartSuccess: host.actions.confirmAddToCartSuccess,
      }}
    />
  );
}
