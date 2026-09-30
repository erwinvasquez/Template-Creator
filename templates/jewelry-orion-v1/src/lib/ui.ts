import type { ContentPayload } from "../content/types";

export function requireUi(payload: ContentPayload) {
  return payload.ui;
}
