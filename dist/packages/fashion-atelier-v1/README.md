# fashion-atelier-v1

Template package exportable para **IA Builder v2**.

## Contenido del package

| Archivo | Rol |
|---------|-----|
| `manifest.json` | Identidad del template, rutas, capabilities, media slots |
| `schema.json` | JSON Schema del Content Payload (contrato para la herramienta/IA) |
| `defaults.json` | Payload golden — contenido actual del diseño Atelier |
| `README.md` | Esta guía |

## Preview en este repo

- Selector: [`/`](/)
- Template montado: [`/t/atelier`](/t/atelier)

## Cómo consume la herramienta este package

1. Registrar `templateId: fashion-atelier-v1` en el registry del Builder.
2. Cargar `manifest.json` + `schema.json` + `defaults.json`.
3. La UI / IA **solo** genera o edita un Content Payload validado contra `schema.json`.
4. El renderer monta el código del template + el payload del sitio.
5. **Nunca** regenerar HTML/CSS/React con la IA.

## Instancia de sitio (ejemplo)

```json
{
  "siteId": "site_demo",
  "templateId": "fashion-atelier-v1",
  "templateVersion": "1.0.0",
  "payload": { "...": "Content Payload (ver defaults.json como base)" }
}
```

## Rutas internas del template

Los `href` del payload son **relativos al mount** del template (`/`, `/tienda`, `/nosotros`).  
En este laboratorio el mount es `/t/atelier`; el runtime antepone el base path.

## Reglas para la IA

- Emitir únicamente JSON válido según `schema.json`.
- Preferir overrides sobre `defaults.json` en lugar de reinventar todo el payload.
- No inventar secciones, rutas ni layout.
- Imágenes: `MediaRef` con `mediaId` (preferido) o `url` + `alt`.
- Productos/colecciones: referenciar IDs del `catalog`; las secciones solo seleccionan.

## Versión

- Template: `1.0.0`
- Schema: `1.0.0`
