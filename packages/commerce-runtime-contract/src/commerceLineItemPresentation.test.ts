import { describe, expect, it } from "vitest";

import {
  commerceLineItemFinalPriceClassName,
  commerceLineItemImageShellClassName,
  commerceLineItemTitleClassName,
} from "./commerceLineItemPresentation";

describe("commerceLineItemPresentation", () => {
  it("precio final usa clase compartida con checkout", () => {
    expect(commerceLineItemFinalPriceClassName).toContain("font-medium");
  });

  it("imagen ~64–72px y título clamp 2 líneas", () => {
    expect(commerceLineItemImageShellClassName).toContain("h-[4.5rem]");
    expect(commerceLineItemImageShellClassName).toContain("w-16");
    expect(commerceLineItemTitleClassName).toContain("line-clamp-2");
  });
});
