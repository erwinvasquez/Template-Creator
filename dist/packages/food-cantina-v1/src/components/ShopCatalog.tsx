"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useSiteContent } from "../lib/site-content";
import { requireUi } from "../lib/ui";
import { resolveProducts, withBasePath } from "../content/resolve";
import { ProductCard } from "./ProductCard";

export function ShopCatalog() {
  const { payload, basePath } = useSiteContent();
  const ui = requireUi(payload);
  const listing = ui.listing;
  const shop = ui.shop;
  const searchParams = useSearchParams();
  const categoria = searchParams.get("categoria") ?? "todos";
  const coleccion = searchParams.get("coleccion");

  const categories = useMemo(
    () => [
      { value: "todos", label: listing.allCategories },
      ...payload.catalog.categories.map((c) => ({
        value: c.slug,
        label: c.label,
      })),
    ],
    [payload.catalog.categories, listing.allCategories],
  );

  const collectionName = useMemo(() => {
    if (!coleccion) return null;
    return (
      payload.catalog.collections.find((c) => c.slug === coleccion)?.name ??
      coleccion
    );
  }, [coleccion, payload.catalog.collections]);

  const products = useMemo(() => resolveProducts(payload), [payload]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const byCat = categoria === "todos" || p.categorySlug === categoria;
      const byCol = !coleccion || p.collectionSlug === coleccion;
      return byCat && byCol;
    });
  }, [products, categoria, coleccion]);

  return (
    <div className="cantina-listing">
      <div className="category-scroll -mx-6 mb-10 flex gap-1 overflow-x-auto bg-primary px-6 py-3 md:-mx-8 md:px-8">
        {categories.map((cat) => {
          const href =
            cat.value === "todos"
              ? coleccion
                ? withBasePath(basePath, `/tienda?coleccion=${coleccion}`)
                : withBasePath(basePath, "/tienda")
              : coleccion
                ? withBasePath(
                    basePath,
                    `/tienda?categoria=${cat.value}&coleccion=${coleccion}`,
                  )
                : withBasePath(basePath, `/tienda?categoria=${cat.value}`);
          const active = categoria === cat.value;
          return (
            <Link
              key={cat.value}
              href={href}
              className={`shrink-0 cursor-pointer px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors ${
                active
                  ? "bg-secondary text-background"
                  : "text-background/80 hover:bg-background/10 hover:text-background"
              }`}
            >
              {cat.label}
            </Link>
          );
        })}
      </div>

      {coleccion && (
        <p className="mb-8 text-sm font-bold uppercase text-muted">
          {listing.collectionPrefix}{" "}
          <span className="text-primary">{collectionName}</span>
          {" · "}
          <Link
            href={
              categoria === "todos"
                ? withBasePath(basePath, "/tienda")
                : withBasePath(basePath, `/tienda?categoria=${categoria}`)
            }
            className="cursor-pointer underline underline-offset-2 hover:text-primary"
          >
            {shop.clearFilter}
          </Link>
        </p>
      )}

      <p className="mb-8 text-sm font-bold uppercase tracking-wider text-secondary">
        {filtered.length}{" "}
        {filtered.length === 1 ? listing.pieceSingular : listing.piecePlural}
      </p>

      {filtered.length === 0 ? (
        <p className="py-20 text-center font-bold uppercase text-muted">{shop.empty}</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:gap-8 lg:grid-cols-2">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
