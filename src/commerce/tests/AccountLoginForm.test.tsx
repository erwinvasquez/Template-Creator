import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createEmptyAccountLoginState } from "@shopenlinea/commerce-runtime-contract";
import { AccountLoginForm } from "fashion-atelier-v1/client";
import defaults from "../../../templates/fashion-atelier-v1/defaults.json";
import { SiteContentProvider } from "../../../templates/fashion-atelier-v1/src/lib/site-content";

describe("AccountLoginForm", () => {
  it("renders Atelier login fields", () => {
    render(
      <SiteContentProvider payload={defaults as never} basePath="/t/atelier">
        <AccountLoginForm
          state={createEmptyAccountLoginState()}
          onStateChange={vi.fn()}
          onSubmit={vi.fn()}
          onGoogleSignIn={vi.fn()}
        />
      </SiteContentProvider>,
    );

    expect(screen.getByRole("heading", { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continuar con google/i })).toBeInTheDocument();
  });
});
