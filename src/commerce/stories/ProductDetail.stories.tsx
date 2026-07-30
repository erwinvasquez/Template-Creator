import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DEFAULT_PREVIEW_CAPABILITIES } from "@shopenlinea/commerce-runtime-contract";
import { ProductDetailCommerceView } from "fashion-atelier-v1/client";
import { createMockCommerceBridge } from "../mock/createMockCommerceBridge";
import defaults from "../../../templates/fashion-atelier-v1/defaults.json";
import { SiteContentProvider } from "../../../templates/fashion-atelier-v1/src/lib/site-content";

function PdpStory({
  fixture,
  slug,
}: {
  fixture: "product-simple" | "product-variants" | "product-out-of-stock";
  slug: string;
}) {
  const bridge = createMockCommerceBridge(fixture);
  const [product, setProduct] = useState<
    Awaited<ReturnType<typeof bridge.getProductDetail>>
  >(null);

  useEffect(() => {
    void bridge.getProductDetail(slug).then(setProduct);
    return bridge.subscribe(() => {
      void bridge.getProductDetail(slug).then(setProduct);
    });
  }, [bridge, slug]);

  if (!product) return <p className="p-8">Loading…</p>;

  return (
    <SiteContentProvider payload={defaults as never} basePath="/t/atelier">
      <div className="atelier-root bg-background text-primary">
        <ProductDetailCommerceView
          product={product}
          capabilities={DEFAULT_PREVIEW_CAPABILITIES}
          actions={{
            selectVariant: bridge.actions.selectVariant,
            addToCart: bridge.actions.addToCart,
            openCartDrawer: bridge.actions.openCartDrawer,
          }}
        />
      </div>
    </SiteContentProvider>
  );
}

const meta: Meta<typeof PdpStory> = {
  title: "Commerce/ProductDetail",
  component: PdpStory,
};

export default meta;
type Story = StoryObj<typeof PdpStory>;

export const Simple: Story = {
  args: { fixture: "product-simple", slug: "camisa-oxford-marfil" },
};

export const Variants: Story = {
  args: { fixture: "product-variants", slug: "abrigo-cashmere-stone" },
};

export const OutOfStock: Story = {
  args: { fixture: "product-out-of-stock", slug: "producto-agotado" },
};
