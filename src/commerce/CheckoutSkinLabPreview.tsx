"use client";

import { useState } from "react";

import type { HostCheckoutSkin } from "@shopenlinea/commerce-runtime-contract";

/** Labels mock — en SaaS vienen de i18n del host, no del template. */
const MOCK_LABELS = {
  pageTitle: "Checkout",
  customerSection: "Datos del cliente",
  shippingSection: "Envío",
  paymentSection: "Pago",
  summarySection: "Resumen del pedido",
};

const MOCK_COUNTRY_OPTIONS = [
  { value: "BO", label: "🇧🇴 +591", title: "Bolivia" },
  { value: "ES", label: "🇪🇸 +34", title: "España" },
  { value: "US", label: "🇺🇸 +1", title: "Estados Unidos" },
] as const;

/** Líneas mock — en SaaS vienen del preview del carrito (CheckoutPageContent). */
const MOCK_LINES = [
  {
    id: "line-1",
    productName: "Abrigo lana estructurado",
    variantLabel: "Talla M · Gris perla",
    quantity: 1,
    priceDisplay: "420,00 €",
    compareAtPriceDisplay: "480,00 €",
    imageUrl:
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=96&q=80",
  },
  {
    id: "line-2",
    productName: "Pantalón sastre",
    variantLabel: "Talla 38 · Negro",
    quantity: 1,
    priceDisplay: "185,00 €",
    imageUrl:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=96&q=80",
  },
] as const;

/**
 * Visual preview of template checkout skin — all primitives from hostCheckoutSkin.
 * No APIs, no cart — local UI state only for discount toggle/input.
 */
export function CheckoutSkinLabPreview({ skin }: { skin: HostCheckoutSkin }) {
  const {
    Layout,
    PrimaryButton,
    OrderSummary,
    Field,
    RadioOption,
    PaymentCard,
    SummaryLine,
    LineItem,
    CountrySelect,
    CheckboxRow,
    PhoneRow,
    inputClassName,
    sectionGapClassName,
    mutedTextClassName,
  } = skin;

  const [wantsDiscountCode, setWantsDiscountCode] = useState(true);
  const [discountCodeInput, setDiscountCodeInput] = useState("VERANO15");
  const [phoneCountry, setPhoneCountry] = useState("ES");
  const [shippingMethod, setShippingMethod] = useState("pickup");
  const [paymentMethod, setPaymentMethod] = useState("qr");

  const sectionGap = sectionGapClassName ?? "space-y-5";

  const customerForm = (
    <div className={sectionGap}>
      <Field label="Nombre completo" htmlFor="checkout-lab-name">
        <input
          id="checkout-lab-name"
          type="text"
          readOnly
          className={inputClassName}
          value="María García"
          aria-readonly="true"
        />
      </Field>
      <Field label="Correo electrónico" htmlFor="checkout-lab-email">
        <input
          id="checkout-lab-email"
          type="email"
          readOnly
          className={inputClassName}
          value="cliente@ejemplo.com"
          aria-readonly="true"
        />
      </Field>
      <Field label="Teléfono">
        <PhoneRow>
          <CountrySelect
            value={phoneCountry}
            onChange={setPhoneCountry}
            options={MOCK_COUNTRY_OPTIONS}
            aria-label="País del teléfono"
          />
          <input
            type="tel"
            readOnly
            className={`${inputClassName} min-w-0 w-full`}
            value="600 123 456"
            aria-readonly="true"
          />
        </PhoneRow>
      </Field>
    </div>
  );

  const shippingSelector = (
    <div className="space-y-3">
      <RadioOption
        name="checkout-lab-shipping"
        value="pickup"
        checked={shippingMethod === "pickup"}
        label="Recogida en tienda"
        description="Gratis · Centro"
        onChange={() => setShippingMethod("pickup")}
      />
      <RadioOption
        name="checkout-lab-shipping"
        value="delivery"
        checked={shippingMethod === "delivery"}
        label="Envío a domicilio"
        description="4,50 €"
        onChange={() => setShippingMethod("delivery")}
      />
    </div>
  );

  const paymentSelector = (
    <div className="grid gap-3 sm:grid-cols-2">
      <PaymentCard
        name="checkout-lab-payment"
        value="qr"
        checked={paymentMethod === "qr"}
        title="QR (comprobante)"
        onChange={() => setPaymentMethod("qr")}
      />
      <PaymentCard
        name="checkout-lab-payment"
        value="cash"
        checked={paymentMethod === "cash"}
        title="Contra entrega"
        onChange={() => setPaymentMethod("cash")}
      />
    </div>
  );

  const orderSummary = (
    <OrderSummary
      discountSection={
        <>
          <CheckboxRow
            checked={wantsDiscountCode}
            onCheckedChange={(on) => {
              setWantsDiscountCode(on);
              if (!on) setDiscountCodeInput("");
            }}
          >
            Tengo un código de descuento
          </CheckboxRow>
          {wantsDiscountCode ? (
            <Field label="Código de descuento" htmlFor="checkout-discount-code-lab">
              <input
                id="checkout-discount-code-lab"
                type="text"
                className={inputClassName}
                value={discountCodeInput}
                onChange={(e) => setDiscountCodeInput(e.target.value)}
                placeholder="Introduce tu código"
                autoComplete="off"
              />
            </Field>
          ) : null}
        </>
      }
      lineItemsSection={MOCK_LINES.map((line) => (
        <LineItem
          key={line.id}
          imageUrl={line.imageUrl}
          title={line.productName}
          variantLabel={line.variantLabel}
          quantity={line.quantity}
          priceDisplay={line.priceDisplay}
          compareAtPriceDisplay={line.compareAtPriceDisplay}
        />
      ))}
      promotionsSection={
        <>
          <p className="text-sm font-medium text-primary">Promociones aplicadas</p>
          <ul className={`space-y-1 list-none pl-0 ${mutedTextClassName}`}>
            <li className="grid grid-cols-[auto_1fr] items-start gap-2 min-w-0">
              <span className="shrink-0 text-cta">✓</span>
              <span className="min-w-0 break-words">15% en temporada · VERANO15</span>
            </li>
          </ul>
          <p className="text-xs text-cta">Cupón VERANO15 aplicado</p>
        </>
      }
      fulfillmentNotice="Entrega estimada · 3–5 días laborables"
      totalsSection={
        <>
          <SummaryLine label="Subtotal" value="605,00 €" />
          <SummaryLine label="Descuento" value="-60,00 €" />
          <SummaryLine label="Envío" value="Gratis" />
          <SummaryLine label="Total" value="545,00 €" emphasis />
        </>
      }
      statusSection={null}
    />
  );

  const actions = (
    <PrimaryButton type="button" disabled>
      Confirmar pedido
    </PrimaryButton>
  );

  return (
    <Layout
      labels={MOCK_LABELS}
      customerForm={customerForm}
      shippingSelector={shippingSelector}
      paymentSelector={paymentSelector}
      orderSummary={orderSummary}
      notices={
        <p className={mutedTextClassName}>
          Preview WG — primitivas de{" "}
          <code className="text-xs">hostCheckoutSkin</code>. Lógica en SaaS{" "}
          <code className="text-xs">CheckoutPageContent</code>.
        </p>
      }
      actions={actions}
    />
  );
}
