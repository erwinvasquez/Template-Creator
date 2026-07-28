"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useSiteContent } from "../lib/site-content";
import { resolveProducts, withBasePath } from "../content/resolve";
import { ProductCard } from "./ProductCard";

export function ShopCatalog() {
  const { payload, basePath } = useSiteContent();
  const searchParams = useSearchParams();
  const categoria = searchParams.get("categoria") ?? "todos";
  const coleccion = searchParams.get("coleccion");

  const categories = useMemo(
    () => [
      { value: "todos", label: "Todo" },
      ...payload.catalog.categories.map((c) => ({
        value: c.slug,
        label: c.label,
      })),
    ],
    [payload.catalog.categories],
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

  const emptyLabel = payload.ui?.shop?.empty ?? "No hay piezas con estos filtros.";
  const clearFilterLabel = payload.ui?.shop?.clearFilter ?? "Quitar filtro";

  return (
    <div>
      <div className="mb-10 flex flex-wrap gap-2 border-b border-border pb-6">
        {categories.map((cat) => {
          const href =
            cat.value === "todos"
              ? coleccion
                ? withBasePath(basePath, `/coleccion?coleccion=${coleccion}`)
                : withBasePath(basePath, "/coleccion")
              : coleccion
                ? withBasePath(
                    basePath,
                    `/coleccion?categoria=${cat.value}&coleccion=${coleccion}`,
                  )
                : withBasePath(basePath, `/coleccion?categoria=${cat.value}`);
          const active = categoria === cat.value;
          return (
            <Link
              key={cat.value}
              href={href}
              className={`cursor-pointer px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors duration-200 ${
                active
                  ? "bg-primary text-white"
                  : "text-secondary hover:bg-surface hover:text-primary"
              }`}
            >
              {cat.label}
            </Link>
          );
        })}
      </div>

      {coleccion && (
        <p className="mb-8 text-sm text-muted">
          Colección:{" "}
          <span className="font-medium text-primary">{collectionName}</span>
          {" · "}
          <Link
            href={
              categoria === "todos"
                ? withBasePath(basePath, "/coleccion")
                : withBasePath(basePath, `/coleccion?categoria=${categoria}`)
            }
            className="cursor-pointer underline underline-offset-2 transition-colors duration-200 hover:text-cta"
          >
            {clearFilterLabel}
          </Link>
        </p>
      )}

      <p className="mb-8 text-sm text-muted">
        {filtered.length} {filtered.length === 1 ? "pieza" : "piezas"}
      </p>

      {filtered.length === 0 ? (
        <p className="py-20 text-center text-muted">{emptyLabel}</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 md:gap-x-6">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
