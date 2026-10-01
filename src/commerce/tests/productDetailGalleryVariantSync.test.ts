import { describe, expect, it } from "vitest";
import {
  explicitVariantIdsForGalleryItem,
  preferredGalleryIndexForVariant,
  resolveVariantIdForGallerySelection,
  type ProductDetailViewModel,
  type VariantOptionLike,
} from "@shopenlinea/commerce-runtime-contract";

const RED_PEARL = "v-red-pearl";
const BLUE_SILK = "v-blue-silk";

const pickerVariants: VariantOptionLike[] = [
  {
    id: RED_PEARL,
    optionValues: [
      { option: "Color", value: "Rojo" },
      { option: "Material", value: "Perla" },
    ],
  },
  {
    id: BLUE_SILK,
    optionValues: [
      { option: "Color", value: "Celeste" },
      { option: "Material", value: "Seda" },
    ],
  },
];

function sf01Product(): ProductDetailViewModel {
  return {
    id: "p-sf01",
    slug: "sf01",
    href: "/tienda/sf01",
    name: "SF-01",
    gallery: [
      { id: "g-red", url: "https://cdn.example/red.jpg", variantId: RED_PEARL },
      { id: "g-blue", url: "https://cdn.example/blue.jpg", variantId: BLUE_SILK },
      { id: "g-lifestyle", url: "https://cdn.example/lifestyle.jpg" },
    ],
    variants: [
      {
        id: RED_PEARL,
        label: "Rojo / Perla",
        options: [
          { name: "Color", value: "Rojo" },
          { name: "Material", value: "Perla" },
        ],
        displayPrice: "10 €",
        available: true,
        maxQuantity: 5,
        imageUrl: "https://cdn.example/red.jpg",
      },
      {
        id: BLUE_SILK,
        label: "Celeste / Seda",
        options: [
          { name: "Color", value: "Celeste" },
          { name: "Material", value: "Seda" },
        ],
        displayPrice: "12 €",
        available: true,
        maxQuantity: 5,
        imageUrl: "https://cdn.example/blue.jpg",
      },
    ],
    currency: "EUR",
    selectedVariantId: RED_PEARL,
    canAddToCart: true,
    optionDefinitions: [
      { name: "Color", values: ["Rojo", "Celeste"] },
      { name: "Material", values: ["Perla", "Seda"] },
    ],
  };
}

describe("productDetailGalleryVariantSync (SF-01)", () => {
  const dimensions = ["Color", "Material"];
  const maxAddQtyMap = { [RED_PEARL]: 5, [BLUE_SILK]: 5 };

  it("starts on rojo + perla and switches to celeste + seda when blue gallery is chosen", () => {
    const product = sf01Product();
    const blueItem = product.gallery[1]!;
    const nextId = resolveVariantIdForGallerySelection(
      blueItem,
      product,
      pickerVariants,
      dimensions,
      maxAddQtyMap,
      RED_PEARL,
    );
    expect(nextId).toBe(BLUE_SILK);
  });

  it("general gallery image does not resolve a variant", () => {
    const product = sf01Product();
    const general = product.gallery[2]!;
    expect(
      resolveVariantIdForGallerySelection(
        general,
        product,
        pickerVariants,
        dimensions,
        maxAddQtyMap,
        RED_PEARL,
      ),
    ).toBeNull();
  });

  it("shared image keeps compatible selections when picking among variants with same url", () => {
    const product: ProductDetailViewModel = {
      ...sf01Product(),
      gallery: [
        {
          id: "g-shared",
          url: "https://cdn.example/shared.jpg",
          variantIds: [RED_PEARL, BLUE_SILK],
        },
      ],
      variants: sf01Product().variants.map((v) => ({
        ...v,
        imageUrl: "https://cdn.example/shared.jpg",
      })),
    };
    const item = product.gallery[0]!;
    const resolved = resolveVariantIdForGallerySelection(
      item,
      product,
      pickerVariants,
      dimensions,
      maxAddQtyMap,
      RED_PEARL,
    );
    expect(resolved).toBe(RED_PEARL);
  });

  it("derives associations from variant.imageUrl when variantId is absent on gallery item", () => {
    const item = { id: "g1", url: "https://cdn.example/red.jpg" };
    const ids = explicitVariantIdsForGalleryItem(item, sf01Product().variants);
    expect(ids).toEqual([RED_PEARL]);
  });

  it("syncs gallery index when variant changes from options", () => {
    const product = sf01Product();
    expect(preferredGalleryIndexForVariant(product, BLUE_SILK)).toBe(1);
    expect(preferredGalleryIndexForVariant(product, RED_PEARL)).toBe(0);
  });
});
