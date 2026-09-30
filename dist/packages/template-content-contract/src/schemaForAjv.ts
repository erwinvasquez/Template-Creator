/** Inline ui.* for Ajv — external $ref in schema.json is not resolved at runtime. */
export function inlineUiSchema(
  templateSchema: Record<string, unknown>,
  uiSchema: Record<string, unknown>,
): Record<string, unknown> {
  const out = structuredClone(templateSchema);
  const props = out.properties as Record<string, unknown> | undefined;
  if (props) {
    out.properties = { ...props, ui: uiSchema };
  }
  return out;
}
