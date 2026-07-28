import type { Metadata } from "next";
import {
  AtelierApp,
  DEFAULT_BASE_PATH,
  getProductBySlug,
  loadPayload,
  resolveProducts,
} from "fashion-atelier-v1";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ payload?: string }>;

export async function generateStaticParams() {
  const payload = loadPayload();
  return resolveProducts(payload).map((p) => ({ slug: p.slug }));
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
  if (!product) return { title: "Producto" };
  return {
    title: product.name,
    description: product.description,
  };
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
  return (
    <AtelierApp
      page="product"
      payload={payload}
      basePath={DEFAULT_BASE_PATH}
      slug={slug}
    />
  );
}
