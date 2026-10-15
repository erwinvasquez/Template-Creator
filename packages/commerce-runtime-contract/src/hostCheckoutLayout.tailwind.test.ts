import { describe, expect, it } from "vitest";

import { hostCheckoutLayoutGridClassName } from "./hostCheckoutLayout";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const tailwindCheckout = require("./hostCheckoutLayout.tailwind.cjs") as {
  safelist: string[];
};

describe("hostCheckoutLayout tailwind contract", () => {
  it("safelist incluye grid desktop minmax", () => {
    expect(tailwindCheckout.safelist).toContain(
      "lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]",
    );
    expect(tailwindCheckout.safelist).toContain("grid-cols-1");
  });

  it("grid className TS coincide con safelist desktop", () => {
    expect(hostCheckoutLayoutGridClassName).toContain(
      "lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]",
    );
  });
});
