export type PaymentMethodKind =
  | "transfer"
  | "qr"
  | "cash"
  | "cashOnDelivery"
  | "stripe"
  | "externalLink";

export interface PaymentMethodViewModel {
  id: string;
  kind: PaymentMethodKind;
  label: string;
  instructions?: string | null;
  bankDetails?: string | null;
  requiresVoucher?: boolean;
  externalUrl?: string | null;
}
