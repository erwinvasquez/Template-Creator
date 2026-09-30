/** Sprint N — shared manifest + schema fragments for certified templates. */

export const TEMPLATE_IDS = [
  "fashion-atelier-v1",
  "fashion-lumen-v1",
  "fashion-nova-v1",
  "fashion-velvet-v1",
  "fashion-celestine-v1",
  "jewelry-orion-v1",
  "academy-voxa-v1",
];

export const PRODUCT_DETAIL_PRESENTATION_FIELDS = [
  "shortDescription",
  "description",
  "categoryLabels",
  "collectionLabels",
  "highlights",
  "bulletPoints",
  "brandLabel",
  "specifications",
  "badges",
  "stockMessage",
  "preparationPromise",
  "relatedProducts",
];

export const PRODUCT_UI_CONTENT_SLOT_IDS = [
  "product.addToCart",
  "product.addingToCart",
  "product.outOfStock",
  "product.contact",
  "product.lowStock",
  "product.relatedTitle",
  "product.madeToOrderClosed",
  "product.buyMadeToOrderCta",
  "product.stockUpsellModalTitle",
  "product.stockInsufficientImmediate",
  "product.stockInsufficientMadeToOrderHint",
  "product.priceBookLabel",
  "product.priceProgramLabel",
  "product.badge.new",
  "product.badge.featured",
  "product.badge.sale",
  "product.badge.bestseller",
  "product.badge.limitedEdition",
];

const PDP_MICROCOPY_HINT = "Microcopy PDP; tono del template.";

export function productUiSlotDefinitions() {
  const stringSlots = [
    ["product.addToCart", "ui.product.addToCart", "Añadir al carrito"],
    ["product.addingToCart", "ui.product.addingToCart", "Añadiendo al carrito"],
    ["product.outOfStock", "ui.product.outOfStock", "Agotado"],
    ["product.contact", "ui.product.contact", "Contactar"],
    ["product.lowStock", "ui.product.lowStock", "Pocas unidades"],
    ["product.relatedTitle", "ui.product.relatedTitle", "Título relacionados"],
    [
      "product.madeToOrderClosed",
      "ui.product.madeToOrderClosed",
      "Pedidos cerrados",
    ],
    [
      "product.buyMadeToOrderCta",
      "ui.product.buyMadeToOrderCta",
      "CTA comprar bajo pedido",
    ],
    [
      "product.stockUpsellModalTitle",
      "ui.product.stockUpsellModalTitle",
      "Título modal upsell stock→MTO",
    ],
    [
      "product.stockInsufficientImmediate",
      "ui.product.stockInsufficientImmediate",
      "Stock inmediato insuficiente",
    ],
    [
      "product.stockInsufficientMadeToOrderHint",
      "ui.product.stockInsufficientMadeToOrderHint",
      "Hint upsell MTO",
    ],
    ["product.priceBookLabel", "ui.product.priceBookLabel", "Precio libro"],
    [
      "product.priceProgramLabel",
      "ui.product.priceProgramLabel",
      "Precio programa",
    ],
  ];

  const badgeSlots = [
    ["product.badge.new", "ui.product.badges.new", "Badge nuevo"],
    ["product.badge.featured", "ui.product.badges.featured", "Badge destacado"],
    ["product.badge.sale", "ui.product.badges.sale", "Badge oferta"],
    [
      "product.badge.bestseller",
      "ui.product.badges.bestseller",
      "Badge bestseller",
    ],
    [
      "product.badge.limitedEdition",
      "ui.product.badges.limitedEdition",
      "Badge edición limitada",
    ],
  ];

  return [
    ...stringSlots.map(([id, fieldPath, label]) => ({
      id,
      fieldPath,
      kind: "string",
      label,
      generationHint: PDP_MICROCOPY_HINT,
      required: true,
      localeScope: "both",
    })),
    ...badgeSlots.map(([id, fieldPath, label]) => ({
      id,
      fieldPath,
      kind: "string",
      label,
      generationHint: PDP_MICROCOPY_HINT,
      required: true,
      localeScope: "both",
    })),
  ];
}

export const PRODUCT_DETAIL_PRESENTATION_SCHEMA_DEF = {
  ProductDetailPresentation: {
    type: "object",
    additionalProperties: false,
    properties: Object.fromEntries(
      PRODUCT_DETAIL_PRESENTATION_FIELDS.map((f) => [f, { type: "boolean" }]),
    ),
  },
};

export const SECTIONS_PRODUCT_SCHEMA_PROPERTY = {
  product: {
    type: "object",
    additionalProperties: false,
    properties: {
      presentation: {
        $ref: "#/$defs/ProductDetailPresentation",
      },
    },
  },
};
