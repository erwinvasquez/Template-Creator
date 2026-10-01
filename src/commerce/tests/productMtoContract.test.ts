import { describe, expect, it } from "vitest";
import type { MadeToOrderUpsellViewModel } from "@shopenlinea/commerce-runtime-contract";

type RequiredPreparationPromiseLabel = MadeToOrderUpsellViewModel extends {
  preparationPromiseLabel: string;
  productHref: string;
}
  ? true
  : never;

const _contractParity: RequiredPreparationPromiseLabel = true;

describe("MadeToOrderUpsellViewModel (MTO contract parity)", () => {
  it("exige preparationPromiseLabel obligatorio para el host SaaS", () => {
    expect(_contractParity).toBe(true);
    const upsell: MadeToOrderUpsellViewModel = {
      preparationPromiseLabel: "3–5 días",
      productHref: "/tienda/demo?salesMode=madeToOrder",
    };
    expect(upsell.preparationPromiseLabel).toBe("3–5 días");
  });
});
