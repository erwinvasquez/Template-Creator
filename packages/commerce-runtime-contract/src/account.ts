/**
 * Account / customer auth UI contracts.
 * Template paints forms; host owns the auth provider and session sync.
 */

export interface AccountCustomerViewModel {
  id: string;
  email: string;
  displayName?: string | null;
  phone?: string | null;
}

export interface AccountLoginState {
  email: string;
  password: string;
  fieldErrors?: Partial<{ email: string; password: string }>;
  submitError?: string | null;
  submitting?: boolean;
}

export type AccountLoginStatePatch = {
  email?: string;
  password?: string;
  fieldErrors?: AccountLoginState["fieldErrors"];
  submitError?: string | null;
  submitting?: boolean;
};

export interface AccountRegisterState {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  fieldErrors?: Partial<{
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }>;
  submitError?: string | null;
  submitting?: boolean;
}

export type AccountRegisterStatePatch = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  fieldErrors?: AccountRegisterState["fieldErrors"];
  submitError?: string | null;
  submitting?: boolean;
};

export interface AccountAuthResult {
  ok: boolean;
  errorMessage?: string | null;
  /** Host may redirect after success. */
  redirectHref?: string | null;
}

export interface AccountLoginFormProps {
  state: AccountLoginState;
  onStateChange: (patch: AccountLoginStatePatch) => void;
  onSubmit: () => void | Promise<void>;
  onGoogleSignIn?: () => void | Promise<void>;
  registerHref?: string | null;
  notices?: string | null;
}

export interface AccountRegisterFormProps {
  state: AccountRegisterState;
  onStateChange: (patch: AccountRegisterStatePatch) => void;
  onSubmit: () => void | Promise<void>;
  onGoogleSignIn?: () => void | Promise<void>;
  loginHref?: string | null;
  notices?: string | null;
}

export interface AccountDashboardProps {
  customer: AccountCustomerViewModel;
  ordersHref?: string | null;
  onSignOut: () => void | Promise<void>;
  signingOut?: boolean;
  notices?: string | null;
}

export function createEmptyAccountLoginState(
  defaults?: Partial<AccountLoginState>,
): AccountLoginState {
  return {
    email: defaults?.email ?? "",
    password: defaults?.password ?? "",
    fieldErrors: defaults?.fieldErrors,
    submitError: defaults?.submitError ?? null,
    submitting: defaults?.submitting ?? false,
  };
}

export function createEmptyAccountRegisterState(
  defaults?: Partial<AccountRegisterState>,
): AccountRegisterState {
  return {
    fullName: defaults?.fullName ?? "",
    email: defaults?.email ?? "",
    password: defaults?.password ?? "",
    confirmPassword: defaults?.confirmPassword ?? "",
    fieldErrors: defaults?.fieldErrors,
    submitError: defaults?.submitError ?? null,
    submitting: defaults?.submitting ?? false,
  };
}
