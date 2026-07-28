import { AtelierApp, loadPayload } from "@web-generator/fashion-atelier-v1";

/** Clean host mount: basePath "" so payload hrefs map to /tienda, /nosotros */
const BASE_PATH = "";

export default function HomePage() {
  const payload = loadPayload();
  return <AtelierApp page="home" payload={payload} basePath={BASE_PATH} />;
}
