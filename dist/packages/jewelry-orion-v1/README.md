# jewelry-orion-v1

Template package exportable para **IA Builder v2**.

## Contenido del package

| Archivo | Rol |
|---------|-----|
| `manifest.json` | Identidad del template, rutas, capabilities, media slots |
| `schema.json` | JSON Schema del Content Payload (contrato para la herramienta/IA) |
| `defaults.json` | Payload golden — contenido actual del diseño Orion |
| `README.md` | Esta guía |

## Preview en este repo

- Selector: [`/`](/)
- Template montado: [`/t/orion`](/t/orion)

## Cómo consume la herramienta este package

1. Registrar `templateId: jewelry-orion-v1` en el registry del Builder.
2. Cargar `manifest.json` + `schema.json` + `defaults.json`.
3. La UI / IA **solo** genera o edita un Content Payload validado contra `schema.json`.
4. El renderer monta el código del template + el payload del sitio.
5. **Nunca** regenerar HTML/CSS/React con la IA.

## Instancia de sitio (ejemplo)

```json
{
  "siteId": "site_demo",
  "templateId": "jewelry-orion-v1",
  "templateVersion": "1.0.0",
  "payload": { "...": "Content Payload (ver defaults.json como base)" }
}
```

## Identidad visual (fija, no editable por la IA)

- Tipografía: **Bodoni Moda** (`--font-bodoni`, encabezados) + **Jost** (`--font-jost`, cuerpo).
- Paleta: negro platino (`#141210`) + acento champán (`#B8956A`) sobre fondo cálido (`#FAFAF8`).
- Header sticky slim, marca alineada a la izquierda, links a la derecha, línea inferior fina al hacer scroll.
- Hero full-bleed con wordmark inferior-izquierda y un único CTA.
- Secciones propias: `signatures` (3 piezas insignia en mosaico cuadrado), `craft` (split 50/50), `materials` (4 paneles de material), `appointment` (banda ink de cita privada).

## Rutas internas del template

Los `href` del payload son **relativos al mount** del template (`/`, `/coleccion`, `/atelier`).
En este laboratorio el mount es `/t/orion`; el runtime antepone el base path.

## Reglas para la IA

- Emitir únicamente JSON válido según `schema.json`.
- Preferir overrides sobre `defaults.json` en lugar de reinventar todo el payload.
- No inventar secciones, rutas ni layout.
- Imágenes: `MediaRef` con `mediaId` (preferido) o `url` + `alt`.
- `sections.signatures.productIds` debe tener exactamente 3 IDs existentes en `catalog.products`.
- `sections.materials.items` debe tener exactamente 4 elementos.
- Productos/colecciones: referenciar IDs del `catalog`; las secciones solo seleccionan.

## Versión

- Template: `1.0.0`
- Schema: `1.0.0`
