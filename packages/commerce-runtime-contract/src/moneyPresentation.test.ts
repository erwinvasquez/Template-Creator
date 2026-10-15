import { describe, expect, it } from "vitest";

import { hasMeaningfulMoneyAmount } from "./moneyPresentation";

describe("hasMeaningfulMoneyAmount", () => {
  it("aplica el mismo epsilon contractual a todas las superficies", () => {
    expect(hasMeaningfulMoneyAmount(undefined)).toBe(false);
    expect(hasMeaningfulMoneyAmount(0)).toBe(false);
    expect(hasMeaningfulMoneyAmount(0.005)).toBe(false);
    expect(hasMeaningfulMoneyAmount(0.0051)).toBe(true);
    expect(hasMeaningfulMoneyAmount(0.008)).toBe(true);
  });
});
