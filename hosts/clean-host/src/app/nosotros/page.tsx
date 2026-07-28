import { AtelierApp, loadPayload } from "@web-generator/fashion-atelier-v1";

export default function AboutPage() {
  const payload = loadPayload();
  return <AtelierApp page="about" payload={payload} basePath="" />;
}
