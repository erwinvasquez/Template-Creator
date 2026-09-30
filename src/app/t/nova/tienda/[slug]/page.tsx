import type { Metadata } from "next";
import {
  getProductBySlug,
  loadPayload,
  resolveProducts,
} from "fashion-nova-v1";
import { NovaLabShell } from "../../NovaLabShell";
import { CATALOG_PRODUCTS } from "@/commerce/fixtures/seed";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ payload?: string; commerce?: string }>;

export async function generateStaticParams() {
  const payload = loadPayload();
  const fromPayload = resolveProducts(payload).map((p) => ({ slug: p.slug }));
  const fromMock = CATALOG_PRODUCTS.map((p) => ({ slug: p.slug }));
  const oos = { slug: "producto-agotado" };
  const map = new Map<string, { slug: string }>();
  [...fromPayload, ...fromMock, oos].forEach((p) => map.set(p.slug, p));
  return [...map.values()];
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  const product = getProductBySlug(payload, slug);
  if (product) {
    return { title: product.name, description: product.description };
  }
  const mock = CATALOG_PRODUCTS.find((p) => p.slug === slug);
  return { title: mock?.name ?? "Producto" };
}

export default async function AtelierProductPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  const commerce =
    sp.commerce ??
    (slug === "producto-agotado" ? "product-out-of-stock" : undefined);
  return (
    <NovaLabShell
      page="product"
      payload={payload}
      slug={slug}
      commerce={commerce}
    />
  );
}
