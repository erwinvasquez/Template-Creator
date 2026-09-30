# WG ↔ SaaS — Contrato de contenido Fase 1 (CERRADO)

El editor visual y `contentPayload.slots` cubren **solo** `sections.*`. `brand` y `navigation` en sus paneles. `ui.*` no es editable por el tenant en fase 1 (no es bug). `catalog` es commerce runtime.

## Namespaces

| Namespace | Slots SaaS | `data-wb-slot` | Validación |
|-----------|------------|----------------|------------|
| `sections.*` | Sí + `generationHint` | Sí | 100% leaves → slot |
| `ui.*` | No (excepto `ui.product.*` Fase B) | No | 100% leaves en `defaults.json` |
| `brand.*` / `navigation.*` | `editorSurface: none` o panel Nav | No | Excluido de D |
| `catalog.*` | No (solo `catalogBindings`) | No | Excluido |

## Algoritmo por template

1. Payload en `defaults.json` (sin copy marketing en JSX).
2. Recorrer **solo** `sections.*` → slots + `builder.manifest` + `data-wb-slot`.
3. Completar `ui.*` (`schema` strict + `defaults` no vacíos).
4. Footer: sección `footer` en page `home`.
5. Lists: un slot `list` + `data-wb-slot` en contenedor.
6. `npm run template:validate -- {id}` (incluye A–D).
7. `PROOF.md` autogenerado.

## Fase B — `ui.product.*` (PDP microcopy, Sprint N)

- Slots SaaS **solo** bajo `ui.product.*` en page `product` del `builder.manifest`.
- **Sin** `data-wb-slot` en PDP; **sin** slot `shippingNote`; toggles visibilidad vía `sections.product.presentation` (merge SaaS, sin slot WG).
- WG validador: allowlist `fieldPath` `ui.product.*`; SaaS `validateTemplateContentContract` Check A alineado.
- `manifest.capabilities.productDetailPresentation.supportedFields` declara bloques VM togglables.

## Prohibido

- Slot con `fieldPath` bajo `ui.*` salvo `ui.product.*`, `brand.*`, `navigation.*`
- `data-wb-slot` en nodos `ui.*`
- `?? "copy de marca"` en componentes
- Strings con acentos o copy de marketing en JSX (heurística CI)

## Artefactos WG

| Artefacto | Rol |
|-----------|-----|
| `packages/template-content-contract/uiCopy.schema.json` | Schema strict `ui.*` |
| `packages/template-content-contract/uiCopy.defaults.seed.json` | Seed neutro |
| `scripts/template-validate-content.mjs` | Validación A–D |
| `scripts/sync-builder-slots.mjs` | Slots desde `defaults sections.*` |
| `scripts/merge-ui-defaults.mjs` | Completar `ui.*` en defaults |
| `scripts/generate-template-proof.mjs` | PROOF autogen |

## Repo paths

`templates/{id}/` en WG ≡ `packages/{id}/` en SaaS (mismo JSON).

## Export a SaaS

```bash
npm run export:saas
```

Genera:

| Destino WG | Copiar a SaaS |
|------------|---------------|
| `dist/packages/template-content-contract/` | `packages/template-content-contract/` |
| `dist/packages/{templateId}/` | `packages/{templateId}/` |

El `$ref` `../../packages/template-content-contract/uiCopy.schema.json` en `schema.json` resuelve en `dist/packages/` cuando ambos están exportados. SaaS valida `defaults.ui` con Ajv contra `uiCopy.schema.json` completo (no lista de paths).
