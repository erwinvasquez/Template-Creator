export type CommerceErrorCode =
  | "STOCK_INSUFFICIENT"
  | "VARIANT_UNAVAILABLE"
  | "CART_LIMIT"
  | "MADE_TO_ORDER_CLOSED"
  | "VALIDATION"
  | "UNKNOWN";

export interface CommerceActionResult {
  ok: boolean;
  errorCode?: CommerceErrorCode | string | null;
  errorMessage?: string | null;
}
