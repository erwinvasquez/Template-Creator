import { AtelierApp, loadPayload } from "@web-generator/fashion-atelier-v1";

export default function ShopPage() {
  const payload = loadPayload();
  return <AtelierApp page="shop" payload={payload} basePath="" />;
}
