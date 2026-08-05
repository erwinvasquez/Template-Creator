"use client";

import Link from "next/link";
import type { AccountLoginFormProps } from "@shopenlinea/commerce-runtime-contract";
import { useSiteContent } from "../../lib/site-content";
import { requireUi } from "../../lib/ui";
import { accountPath, withBasePath } from "../../content/resolve";

const fieldClass =
  "w-full border border-border bg-background px-4 py-3 text-sm text-primary outline-none transition-colors focus:border-primary disabled:opacity-50";
const labelClass =
  "mb-2 block text-[11px] font-medium uppercase tracking-[0.14em] text-secondary";

export function AccountLoginForm({
  state,
  onStateChange,
  onSubmit,
  onGoogleSignIn,
  registerHref,
  notices,
}: AccountLoginFormProps) {
  const { payload, basePath } = useSiteContent();
  const account = requireUi(payload).account;
  const disabled = Boolean(state.submitting);
  const registerPath = registerHref
    ? withBasePath(basePath, registerHref)
    : accountPath(basePath, payload.features?.accountBasePath, "registro");

  return (
    <div className="pb-24 pt-28 md:pt-32">
      <div className="mx-auto max-w-md px-6 md:px-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-cta">
          {account.eyebrow}
        </p>
        <h1 className="mt-3 font-serif text-4xl tracking-wide">
          {account.loginTitle}
        </h1>
        {notices ? <p className="mt-4 text-sm text-muted">{notices}</p> : null}

        <form
          className="mt-10 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit();
          }}
        >
          <div>
            <label className={labelClass} htmlFor="account-login-email">
              {account.emailLabel}
            </label>
            <input
              id="account-login-email"
              type="email"
              autoComplete="email"
              disabled={disabled}
              value={state.email}
              onChange={(e) =>
                onStateChange({
                  email: e.target.value,
                  fieldErrors: { ...state.fieldErrors, email: undefined },
                })
              }
              className={fieldClass}
            />
            {state.fieldErrors?.email ? (
              <p className="mt-1.5 text-xs text-red-700">{state.fieldErrors.email}</p>
            ) : null}
          </div>

          <div>
            <label className={labelClass} htmlFor="account-login-password">
              {account.passwordLabel}
            </label>
            <input
              id="account-login-password"
              type="password"
              autoComplete="current-password"
              disabled={disabled}
              value={state.password}
              onChange={(e) =>
                onStateChange({
                  password: e.target.value,
                  fieldErrors: { ...state.fieldErrors, password: undefined },
                })
              }
              className={fieldClass}
            />
            {state.fieldErrors?.password ? (
              <p className="mt-1.5 text-xs text-red-700">
                {state.fieldErrors.password}
              </p>
            ) : null}
          </div>

          {state.submitError ? (
            <p className="text-sm text-red-700" role="alert">
              {state.submitError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={disabled}
            className="w-full cursor-pointer bg-primary px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {state.submitting ? account.loginSubmitting : account.loginSubmit}
          </button>
        </form>

        {onGoogleSignIn ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => void onGoogleSignIn()}
            className="mt-4 w-full cursor-pointer border border-primary px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary transition-colors hover:bg-primary hover:text-background disabled:opacity-40"
          >
            {account.googleSignIn}
          </button>
        ) : null}

        <p className="mt-8 text-center text-sm text-muted">
          {account.noAccountPrompt}{" "}
          <Link
            href={registerPath}
            className="cursor-pointer font-medium text-cta transition-colors hover:text-cta-hover"
          >
            {account.goToRegister}
          </Link>
        </p>
      </div>
    </div>
  );
}
