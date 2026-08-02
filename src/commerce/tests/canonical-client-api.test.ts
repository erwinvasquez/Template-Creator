import { describe, expect, it } from "vitest";
import * as atelier from "fashion-atelier-v1/client";
import * as orion from "jewelry-orion-v1/client";
import * as voxa from "academy-voxa-v1/client";
import * as celestine from "fashion-celestine-v1/client";

const REQUIRED = [
  "TemplateApp",
  "commerceViews",
  "TemplateCommerceProvider",
  "useRequiredCommerceHost",
  "useHostCart",
  "createPayloadCommerceBridge",
  "resolveNavHref",
  "accountPath",
  "withBasePath",
  "TEMPLATE_ID",
  "TEMPLATE_SLUG",
  "DEFAULT_BASE_PATH",
] as const;

describe("Phase 0 canonical client API", () => {
  it.each([
    ["fashion-atelier-v1", atelier],
    ["jewelry-orion-v1", orion],
    ["academy-voxa-v1", voxa],
    ["fashion-celestine-v1", celestine],
  ] as const)("%s exports TemplateApp without internal name", (_id, client) => {
    for (const key of REQUIRED) {
      expect(client[key as keyof typeof client], key).toBeDefined();
    }
    expect(client.commerceViews.ProductListing).toBeTypeOf("function");
    expect(client.commerceViews.ProductDetail).toBeTypeOf("function");
    expect(client.commerceViews.CartPage).toBeTypeOf("function");
    expect(client.commerceViews.CheckoutPage).toBeTypeOf("function");
  });

  it("TemplateApp is the plug-and-play renderer alias", () => {
    expect(atelier.TemplateApp).toBe(atelier.AtelierApp);
    expect(orion.TemplateApp).toBe(orion.JewelryApp);
    expect(voxa.TemplateApp).toBe(voxa.VoxaApp);
    expect(celestine.TemplateApp).toBe(celestine.CelestineApp);
  });
});
