"use client";

import { useEffect, useState, useTransition } from "react";
import { notFound } from "next/navigation";
import type { ProductDetailViewModel } from "@shopenlinea/commerce-runtime-contract";
import {
  useCommerceCapabilities,
  useRequiredCommerceHost,
} from "../../lib/commerce-host";
import { ProductDetailCommerceView } from "../commerce/ProductDetailCommerceView";

export function ProductView({ slug }: { slug: string }) {
  const host = useRequiredCommerceHost();
  const capabilities = useCommerceCapabilities();
  const [product, setProduct] = useState<ProductDetailViewModel | null>(null);
  const [missing, setMissing] = useState(false);
  const [tick, setTick] = useState(0);
  const [, startTransition] = useTransition();

  useEffect(() => host.subscribe(() => setTick((t) => t + 1)), [host]);

  useEffect(() => {
    let cancelled = false;
    void host.getDetail(slug).then((p) => {
      if (cancelled) return;
      startTransition(() => {
        if (!p) {
          setMissing(true);
          setProduct(null);
        } else {
          setProduct(p);
          setMissing(false);
        }
      });
    });
    return () => {
      cancelled = true;
    };
  }, [host, slug, tick]);

  if (missing) notFound();
  if (!product) {
    return (
      <p className="px-6 py-32 text-center text-muted md:px-8">Cargando…</p>
    );
  }

  return (
    <ProductDetailCommerceView
      product={product}
      capabilities={capabilities}
      actions={{
        selectVariant: host.actions.selectVariant,
        addToCart: host.actions.addToCart,
        openCartDrawer: host.actions.openCartDrawer,
      }}
    />
  );
}
