import { describe, expect, it } from "vitest";
import defaults from "../../../templates/fashion-atelier-v1/defaults.json";
import {
  DEFAULT_HOME_SECTION_ORDER,
  resolveHomeSectionOrder,
  shouldRenderHomeSection,
} from "../../../templates/fashion-atelier-v1/src/lib/home-section-registry";
import type { ContentPayload } from "../../../templates/fashion-atelier-v1/src/content/types";

const basePayload = defaults as ContentPayload;

describe("resolveHomeSectionOrder — Sprint P", () => {
  it("sin layout usa DEFAULT_HOME_SECTION_ORDER", () => {
    expect(resolveHomeSectionOrder(basePayload)).toEqual([
      ...DEFAULT_HOME_SECTION_ORDER,
    ]);
  });

  it("respeta sectionOrder custom del payload", () => {
    const payload: ContentPayload = {
      ...basePayload,
      layout: {
        pages: {
          home: {
            sectionOrder: [
              "hero",
              "editorial",
              "featured",
              "collections",
              "newsletter",
            ],
          },
        },
      },
    };
    expect(resolveHomeSectionOrder(payload)).toEqual([
      "hero",
      "editorial",
      "featured",
      "collections",
      "newsletter",
    ]);
  });

  it("fuerza hero en índice 0 si sectionOrder lo viola", () => {
    const payload: ContentPayload = {
      ...basePayload,
      layout: {
        pages: {
          home: {
            sectionOrder: ["featured", "hero", "collections"],
          },
        },
      },
    };
    expect(resolveHomeSectionOrder(payload)[0]).toBe("hero");
  });

  it("excluye footer del orden HomeView", () => {
    const payload: ContentPayload = {
      ...basePayload,
      layout: {
        pages: {
          home: {
            sectionOrder: ["hero", "footer", "featured"],
          },
        },
      },
    };
    expect(resolveHomeSectionOrder(payload)).not.toContain("footer");
  });
});

describe("shouldRenderHomeSection", () => {
  it("oculta newsletter cuando features.newsletter es false", () => {
    const payload: ContentPayload = {
      ...basePayload,
      features: { ...basePayload.features, newsletter: false },
    };
    expect(shouldRenderHomeSection("newsletter", payload)).toBe(false);
  });
});
