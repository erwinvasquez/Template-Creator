"use client";

import { useState } from "react";
import type { ResolvedProduct } from "../content/types";
import { useCart } from "../lib/cart-context";
import { useSiteContent } from "../lib/site-content";

export function AddToCartForm({ product }: { product: ResolvedProduct }) {
  const { payload } = useSiteContent();
  const { addItem } = useCart();
  const [size, setSize] = useState(product.sizes[0]);
  const [metal, setMetal] = useState(product.metals[0]);
  const addToCartLabel = payload.ui?.product?.addToCart ?? "Añadir al estuche";

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          Metal — {metal}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.metals.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMetal(m)}
              className={`cursor-pointer border px-4 py-2 text-sm transition-colors duration-200 ${
                metal === m
                  ? "border-primary bg-primary text-white"
                  : "border-border text-secondary hover:border-primary"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          Talla
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`min-w-12 cursor-pointer border px-3 py-2 text-sm transition-colors duration-200 ${
                size === s
                  ? "border-primary bg-primary text-white"
                  : "border-border text-secondary hover:border-primary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => addItem(product, size, metal)}
        className="w-full cursor-pointer bg-cta px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors duration-200 hover:bg-cta-hover md:w-auto md:min-w-[240px]"
      >
        {addToCartLabel}
      </button>
    </div>
  );
}
