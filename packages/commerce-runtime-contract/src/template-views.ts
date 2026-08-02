import type { ComponentType, ReactNode } from "react";
import type { CommerceRuntimeActions } from "./actions";
import type { CartViewModel } from "./cart";
import type { CommerceTemplateCapabilities } from "./capabilities";
import type {
  ProductFilterViewModel,
  ProductSearchViewModel,
} from "./catalog";
import type {
  CheckoutViewModel,
  OrderConfirmationViewModel,
} from "./checkout";
import type { ProductDetailViewModel } from "./product";
import type {
  AccountDashboardProps,
  AccountLoginFormProps,
  AccountRegisterFormProps,
} from "./account";

export type {
  AccountCustomerViewModel,
  AccountLoginState,
  AccountLoginStatePatch,
  AccountRegisterState,
  AccountRegisterStatePatch,
  AccountAuthResult,
  AccountLoginFormProps,
  AccountRegisterFormProps,
  AccountDashboardProps,
} from "./account";

export interface ProductListingViewProps {
  data: ProductSearchViewModel;
  filters: ProductFilterViewModel;
  capabilities: CommerceTemplateCapabilities;
  actions: Pick<
    CommerceRuntimeActions,
    "setCatalogFilters" | "loadMoreProducts"
  >;
  loading?: boolean;
  loadingMore?: boolean;
  errorMessage?: string | null;
}

export interface ProductDetailViewProps {
  product: ProductDetailViewModel;
  capabilities: CommerceTemplateCapabilities;
  actions: Pick<
    CommerceRuntimeActions,
    "selectVariant" | "addToCart" | "openCartDrawer"
  >;
  loading?: boolean;
  errorMessage?: string | null;
}

export interface CartViewProps {
  cart: CartViewModel;
  actions: Pick<
    CommerceRuntimeActions,
    | "updateCartQuantity"
    | "removeCartLine"
    | "clearCart"
    | "navigateToCheckout"
    | "openCartDrawer"
  >;
  /** When omitted, templates may read capabilities from the commerce host context. */
  capabilities?: CommerceTemplateCapabilities;
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * Customer fields owned by the template UI; host stores values.
 * `phoneCountryCode` = ISO (ES, BO, …); template maps to dial (+34, +591)
 * when submitting `placeOrder` (full phone with prefix).
 */
export interface CheckoutCustomerState {
  fullName: string;
  email: string;
  phone: string;
  /** ISO country code for phone dial lookup, e.g. "ES", "BO". */
  phoneCountryCode: string;
}

/**
 * Host-owned checkout form state. Template never invents business defaults
 * beyond empty strings / nulls for controlled inputs.
 */
export interface CheckoutFormState {
  customer: CheckoutCustomerState;
  shippingMethodId: string | null;
  pickupBranchId: string | null;
  paymentMethodId: string | null;
  discountCodeEnabled: boolean;
  discountCode: string;
  fieldErrors?: Partial<{
    fullName: string;
    email: string;
    phone: string;
    shippingMethodId: string;
    pickupBranchId: string;
    paymentMethodId: string;
    discountCode: string;
  }>;
  submitError?: string | null;
  submitting?: boolean;
}

export type CheckoutFormStatePatch = {
  customer?: Partial<CheckoutCustomerState>;
  shippingMethodId?: string | null;
  pickupBranchId?: string | null;
  paymentMethodId?: string | null;
  discountCodeEnabled?: boolean;
  discountCode?: string;
  fieldErrors?: CheckoutFormState["fieldErrors"];
  submitError?: string | null;
  submitting?: boolean;
};

export type CheckoutRuntimeActions = Pick<
  CommerceRuntimeActions,
  "previewCheckout" | "placeOrder" | "uploadPaymentVoucher"
>;

export interface CheckoutCustomerFieldsProps {
  value: CheckoutCustomerState;
  errors?: CheckoutFormState["fieldErrors"];
  onChange: (patch: Partial<CheckoutCustomerState>) => void;
  disabled?: boolean;
}

export interface CheckoutShippingSelectorProps {
  checkout: CheckoutViewModel;
  shippingMethodId: string | null;
  pickupBranchId: string | null;
  capabilities: CommerceTemplateCapabilities;
  errors?: CheckoutFormState["fieldErrors"];
  onSelectShipping: (methodId: string) => void;
  onSelectPickupBranch: (branchId: string) => void;
  disabled?: boolean;
}

export interface CheckoutPaymentSelectorProps {
  checkout: CheckoutViewModel;
  paymentMethodId: string | null;
  capabilities: CommerceTemplateCapabilities;
  errors?: CheckoutFormState["fieldErrors"];
  onSelectPayment: (methodId: string) => void;
  onUploadVoucher?: (paymentId: string, file: File) => void | Promise<void>;
  disabled?: boolean;
}

export interface CheckoutDiscountCodeProps {
  enabled: boolean;
  code: string;
  error?: string | null;
  onToggle: (enabled: boolean) => void;
  onCodeChange: (code: string) => void;
  onApply?: () => void | Promise<void>;
  disabled?: boolean;
}

export interface CheckoutOrderSummaryProps {
  checkout: CheckoutViewModel;
}

export interface CheckoutSubmitActionsProps {
  label?: string;
  submitting?: boolean;
  error?: string | null;
  disabled?: boolean;
  onSubmit: () => void | Promise<void>;
}

/**
 * Full checkout page — host mounts this with VM + form state + actions.
 * No ReactNode slots; all UI lives in the template.
 */
export interface CheckoutPageProps {
  checkout: CheckoutViewModel;
  state: CheckoutFormState;
  capabilities: CommerceTemplateCapabilities;
  actions: CheckoutRuntimeActions;
  onStateChange: (patch: CheckoutFormStatePatch) => void;
  notices?: string | null;
}

/** @deprecated Prefer CheckoutPage with typed subcomponents. */
export interface CheckoutLayoutProps {
  customerForm: ReactNode;
  shippingSelector?: ReactNode;
  paymentSelector: ReactNode;
  orderSummary: ReactNode;
  notices?: ReactNode;
  actions: ReactNode;
}

export interface OrderConfirmationViewProps {
  order: OrderConfirmationViewModel;
}

export interface CommerceTemplateViews {
  ProductListing: ComponentType<ProductListingViewProps>;
  ProductDetail: ComponentType<ProductDetailViewProps>;
  CartPage: ComponentType<CartViewProps>;
  CartDrawer?: ComponentType<CartViewProps>;
  CheckoutPage?: ComponentType<CheckoutPageProps>;
  CheckoutLayout?: ComponentType<CheckoutLayoutProps>;
  CheckoutCustomerFields?: ComponentType<CheckoutCustomerFieldsProps>;
  CheckoutShippingSelector?: ComponentType<CheckoutShippingSelectorProps>;
  CheckoutPaymentSelector?: ComponentType<CheckoutPaymentSelectorProps>;
  CheckoutDiscountCode?: ComponentType<CheckoutDiscountCodeProps>;
  CheckoutOrderSummary?: ComponentType<CheckoutOrderSummaryProps>;
  CheckoutSubmitActions?: ComponentType<CheckoutSubmitActionsProps>;
  OrderConfirmation?: ComponentType<OrderConfirmationViewProps>;
  AccountLoginForm?: ComponentType<AccountLoginFormProps>;
  AccountRegisterForm?: ComponentType<AccountRegisterFormProps>;
  AccountDashboard?: ComponentType<AccountDashboardProps>;
}

/**
 * Stable page ids for TemplateApp (routes[] pages + platform cart/checkout/account).
 * Every @web-generator/{id} package must accept these via TemplateApp.
 */
export type TemplateAppPageId =
  | "home"
  | "shop"
  | "product"
  | "about"
  | "cart"
  | "checkout"
  | "orderConfirmation"
  | "accountLogin"
  | "accountRegister"
  | "accountDashboard";

/**
 * Canonical TemplateApp props — same surface for every template package.
 * Hosts import `TemplateApp` from `@web-generator/{id}/client` without knowing
 * internal names (AtelierApp / JewelryApp).
 */
export interface TemplateAppProps<TPayload = unknown, THost = unknown> {
  page: TemplateAppPageId;
  payload: TPayload;
  basePath: string;
  slug?: string;
  commerceHost?: THost | null;
  checkoutPage?: CheckoutPageProps | null;
  orderConfirmation?: OrderConfirmationViewProps | null;
  accountLogin?: AccountLoginFormProps | null;
  accountRegister?: AccountRegisterFormProps | null;
  accountDashboard?: AccountDashboardProps | null;
  /**
   * When set, rendered inside the template shell `<main>` instead of the
   * page switch (host-owned checkout/account chrome).
   */
  customMain?: ReactNode;
}

export function createEmptyCheckoutFormState(
  defaults?: Partial<CheckoutFormState>,
): CheckoutFormState {
  return {
    customer: {
      fullName: "",
      email: "",
      phone: "",
      phoneCountryCode: "ES",
      ...defaults?.customer,
    },
    shippingMethodId: defaults?.shippingMethodId ?? null,
    pickupBranchId: defaults?.pickupBranchId ?? null,
    paymentMethodId: defaults?.paymentMethodId ?? null,
    discountCodeEnabled: defaults?.discountCodeEnabled ?? false,
    discountCode: defaults?.discountCode ?? "",
    fieldErrors: defaults?.fieldErrors,
    submitError: defaults?.submitError ?? null,
    submitting: defaults?.submitting ?? false,
  };
}
