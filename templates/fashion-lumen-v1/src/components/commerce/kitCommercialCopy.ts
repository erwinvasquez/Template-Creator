export type KitCommercialCopy = {
  includes: string;
  kitPrice: string;
  separate: string;
  savings: string;
  choose: string;
  choosePrompt: string;
  outOfStock: string;
};

/** Copy de la plantilla según el locale ya publicado en el contenido. */
export function kitCommercialCopy(locale: string | null | undefined): KitCommercialCopy {
  if ((locale ?? "").toLowerCase().startsWith("en")) {
    return {
      includes: "Includes",
      kitPrice: "Kit price",
      separate: "Bought separately",
      savings: "You save",
      choose: "Choose a variant",
      choosePrompt: "Choose variant",
      outOfStock: "Sold out",
    };
  }
  return {
    includes: "Incluye",
    kitPrice: "Precio del kit",
    separate: "Comprados por separado",
    savings: "Ahorrás",
    choose: "Elige una variante",
    choosePrompt: "Elegir variante",
    outOfStock: "Agotado",
  };
}
