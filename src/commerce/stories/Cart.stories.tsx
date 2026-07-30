import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { CartViewModel } from "@shopenlinea/commerce-runtime-contract";
import { CommerceCartDrawer } from "fashion-atelier-v1/client";
import { createMockCommerceBridge } from "../mock/createMockCommerceBridge";
import defaults from "../../../templates/fashion-atelier-v1/defaults.json";
import { SiteContentProvider } from "../../../templates/fashion-atelier-v1/src/lib/site-content";

function CartStory({
  fixture,
}: {
  fixture: "cart-empty" | "cart-promotion";
}) {
  const bridge = createMockCommerceBridge(fixture);
  const [cart, setCart] = useState<CartViewModel | null>(null);

  useEffect(() => {
    void bridge.getCart().then(setCart);
    return bridge.subscribe(() => {
      void bridge.getCart().then(setCart);
    });
  }, [bridge]);

  if (!cart) return <p className="p-8">Loading…</p>;

  return (
    <SiteContentProvider payload={defaults as never} basePath="/t/atelier">
      <div className="atelier-root relative min-h-screen bg-background text-primary">
        <CommerceCartDrawer
          cart={cart}
          isOpen
          onClose={() => undefined}
          actions={{
            updateCartQuantity: bridge.actions.updateCartQuantity,
            removeCartLine: bridge.actions.removeCartLine,
            clearCart: bridge.actions.clearCart,
            navigateToCheckout: bridge.actions.navigateToCheckout,
            openCartDrawer: bridge.actions.openCartDrawer,
          }}
        />
      </div>
    </SiteContentProvider>
  );
}

const meta: Meta<typeof CartStory> = {
  title: "Commerce/Cart",
  component: CartStory,
};

export default meta;
type Story = StoryObj<typeof CartStory>;

export const Empty: Story = { args: { fixture: "cart-empty" } };
export const WithPromotion: Story = { args: { fixture: "cart-promotion" } };
