# Checkout V2 — host + skin del template

**Regla:** el checkout es **100% SaaS** (lógica, APIs, textos i18n). El template solo aporta **pintura** vía `hostCheckoutSkin`.

## Flujo

```
checkout/page.tsx (V2)
  → renderV2TemplatePageShell (header/footer template)
      → V2HostCheckoutPageContent
          → CheckoutPageContent (SaaS) + skin del template activo
```

## Contrato de skin

Package: `@shopenlinea/commerce-runtime-contract` → `HostCheckoutSkin`

Cada template exporta desde `client.ts`:

```typescript
export { hostCheckoutSkin } from "./checkout/hostCheckoutSkin";
```

Contenido mínimo:

| Pieza | Rol |
|-------|-----|
| `inputClassName` / `selectClassName` | Clases de inputs |
| `labelClassName` | Labels de grupo (legacy / envío) |
| `fieldLabelClassName` | Labels de campo (nombre, email, cupón) |
| `mutedTextClassName` / `sectionGapClassName` | Texto secundario y espaciado de sección |
| `phoneRowClassName` + `PhoneRow` | Fila país + teléfono |
| `Layout` | Grid/columnas del checkout (sin lógica) |
| `Field`, `RadioOption`, `PaymentCard` | Campos y selectores |
| `LineItem`, `SummaryLine` | Líneas y totales del resumen |
| `OrderSummary` | Composición del aside resumen (layout template; datos/host i18n) |
| `CountrySelect`, `CheckboxRow` | Teléfono y cupón |
| `Notice`, `ErrorText` | Avisos y errores |
| `PrimaryButton` | Botón submit estilizado |
| `SecondaryLink` | Link secundario (carrito vacío) |

**Prohibido en template:** `CheckoutPage`, llamadas a APIs, copy editable (`ui.checkout` para checkout).

Los títulos de sección los pasa el host en `Layout.labels` (i18n SaaS).

## Archivos clave

| Rol | Ruta |
|-----|------|
| Motor checkout | `app/(orgWebsite)/site/[orgSlug]/checkout/CheckoutPageContent.tsx` |
| Wrapper V2 | `app/(orgWebsite)/site/[orgSlug]/checkout/V2HostCheckoutPageContent.tsx` |
| Skin por template | `packages/{id}/src/checkout/hostCheckoutSkin.ts` |
| Layout pintura | `packages/{id}/src/components/commerce/CheckoutLayout.tsx` |

## Fuera de alcance

- Catálogo, carrito, account, content contract / slots de secciones — sin cambios en checkout skin salvo `hostCheckoutSkin`.
- `commerceViews.CheckoutPage` — eliminado; no reintroducir.

## Validación CI

`npm run template:validate -- {templateId}` falla si `checkoutLayout: true` y falta cualquier key de `HostCheckoutSkin`, primitiva en `CheckoutPrimitives.tsx`, `satisfies HostCheckoutSkin`, o `checkoutPage !== false`. Ver `scripts/lib/host-checkout-skin-contract.mjs`.
