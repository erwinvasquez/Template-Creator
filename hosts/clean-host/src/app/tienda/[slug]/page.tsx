import {
  AtelierApp,
  loadPayload,
  resolveProducts,
} from "@web-generator/fashion-atelier-v1";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return resolveProducts(loadPayload()).map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const payload = loadPayload();
  return (
    <AtelierApp page="product" payload={payload} basePath="" slug={slug} />
  );
}
