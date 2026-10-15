export const MONEY_EPSILON = 0.005;

export function hasMeaningfulMoneyAmount(amount: number | null | undefined): boolean {
  return typeof amount === "number" && Number.isFinite(amount) && amount > MONEY_EPSILON;
}
