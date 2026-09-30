"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  TemplateApp,
  DEFAULT_BASE_PATH,
  accountPath,
  createPayloadCommerceBridge,
  type TemplateAppPage,
  type ContentPayload,
} from "food-patisserie-v1/client";
import {
  createEmptyAccountLoginState,
  createEmptyAccountRegisterState,
  type AccountLoginState,
  type AccountLoginStatePatch,
  type AccountRegisterState,
  type AccountRegisterStatePatch,
} from "@shopenlinea/commerce-runtime-contract";
import { CheckoutSkinLabPreview } from "@/commerce/CheckoutSkinLabPreview";
import { useLabCommerceHost } from "@/commerce/lab-host";
import { hostCheckoutSkin } from "food-patisserie-v1/client";

export function PatisserieLabShell({
  page,
  payload,
  slug,
  commerce,
}: {
  page: TemplateAppPage;
  payload: ContentPayload;
  slug?: string;
  commerce?: string | null;
}) {
  const searchParams = useSearchParams();
  const dualSalesMode =
    searchParams.get("salesModeSwitch") === "1" ||
    searchParams.get("dualSalesMode") === "1";
  const salesModeParam = searchParams.get("salesMode");
  const salesMode =
    salesModeParam === "stock" || salesModeParam === "madeToOrder"
      ? salesModeParam
      : undefined;

  const mockHost = useLabCommerceHost(commerce ?? null);
  const payloadHost = useMemo(
    () =>
      createPayloadCommerceBridge(
        payload,
        dualSalesMode
          ? {
              dualSalesMode: true,
              ...(salesMode ? { salesMode } : {}),
            }
          : {},
      ),
    [payload, dualSalesMode, salesMode],
  );
  const host = mockHost ?? payloadHost;
  const [, setTick] = useState(0);

  const [loginState, setLoginState] = useState<AccountLoginState>(() =>
    createEmptyAccountLoginState(),
  );
  const [registerState, setRegisterState] = useState<AccountRegisterState>(() =>
    createEmptyAccountRegisterState(),
  );
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => host.subscribe(() => setTick((t) => t + 1)), [host]);

  const accountRoot = payload.features?.accountBasePath ?? "/cuenta";
  const accountHref = (segment?: string) =>
    accountPath(DEFAULT_BASE_PATH, accountRoot, segment);

  const accountLogin =
    page === "accountLogin"
      ? {
          state: loginState,
          onStateChange: (patch: AccountLoginStatePatch) => {
            setLoginState((prev) => ({
              ...prev,
              ...patch,
              fieldErrors:
                patch.fieldErrors !== undefined
                  ? patch.fieldErrors
                  : prev.fieldErrors,
            }));
          },
          onSubmit: async () => {
            const fieldErrors: NonNullable<AccountLoginState["fieldErrors"]> =
              {};
            if (!loginState.email.trim()) fieldErrors.email = "Indica tu correo";
            if (!loginState.password) fieldErrors.password = "Indica tu contraseña";
            if (Object.keys(fieldErrors).length) {
              setLoginState((prev) => ({
                ...prev,
                fieldErrors,
                submitError: null,
              }));
              return;
            }
            setLoginState((prev) => ({
              ...prev,
              submitting: true,
              submitError: null,
            }));
            await new Promise((r) => setTimeout(r, 400));
            setLoginState((prev) => ({ ...prev, submitting: false }));
            if (typeof window !== "undefined") {
              window.location.href = accountHref();
            }
          },
          onGoogleSignIn: async () => {
            if (typeof window !== "undefined") {
              window.location.href = accountHref();
            }
          },
          registerHref: `${accountRoot.replace(/\/$/, "")}/registro`,
          notices: "Preview mock — auth lo resuelve el host en producción.",
        }
      : null;

  const accountRegister =
    page === "accountRegister"
      ? {
          state: registerState,
          onStateChange: (patch: AccountRegisterStatePatch) => {
            setRegisterState((prev) => ({
              ...prev,
              ...patch,
              fieldErrors:
                patch.fieldErrors !== undefined
                  ? patch.fieldErrors
                  : prev.fieldErrors,
            }));
          },
          onSubmit: async () => {
            const fieldErrors: NonNullable<
              AccountRegisterState["fieldErrors"]
            > = {};
            if (!registerState.fullName.trim()) {
              fieldErrors.fullName = "Indica tu nombre";
            }
            if (!registerState.email.trim()) {
              fieldErrors.email = "Indica tu correo";
            }
            if (registerState.password.length < 6) {
              fieldErrors.password = "Mínimo 6 caracteres";
            }
            if (registerState.password !== registerState.confirmPassword) {
              fieldErrors.confirmPassword = "Las contraseñas no coinciden";
            }
            if (Object.keys(fieldErrors).length) {
              setRegisterState((prev) => ({
                ...prev,
                fieldErrors,
                submitError: null,
              }));
              return;
            }
            setRegisterState((prev) => ({
              ...prev,
              submitting: true,
              submitError: null,
            }));
            await new Promise((r) => setTimeout(r, 400));
            setRegisterState((prev) => ({ ...prev, submitting: false }));
            if (typeof window !== "undefined") {
              window.location.href = accountHref();
            }
          },
          onGoogleSignIn: async () => {
            if (typeof window !== "undefined") {
              window.location.href = accountHref();
            }
          },
          loginHref: `${accountRoot.replace(/\/$/, "")}/login`,
          notices: "Preview mock — registro lo resuelve el host en producción.",
        }
      : null;

  const accountDashboard =
    page === "accountDashboard"
      ? {
          customer: {
            id: "preview-user",
            email: "cliente@patisserie.preview",
            displayName: "Cliente Patisserie",
            phone: "+34 600 000 000",
          },
          ordersHref: null,
          signingOut,
          onSignOut: async () => {
            setSigningOut(true);
            await new Promise((r) => setTimeout(r, 300));
            setSigningOut(false);
            if (typeof window !== "undefined") {
              window.location.href = accountHref("login");
            }
          },
          notices: "Preview mock — sesión simulada.",
        }
      : null;

  return (
    <TemplateApp
      page={page}
      payload={payload}
      basePath={DEFAULT_BASE_PATH}
      slug={slug}
      commerceHost={host}
      customMain={
        page === "checkout" ? (
          <CheckoutSkinLabPreview skin={hostCheckoutSkin} />
        ) : undefined
      }
      accountLogin={accountLogin}
      accountRegister={accountRegister}
      accountDashboard={accountDashboard}
    />
  );
}
