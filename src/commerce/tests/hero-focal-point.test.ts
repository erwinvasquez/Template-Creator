import { describe, expect, it } from "vitest";
import {
  mediaRefObjectPosition,
  resolveMediaFocalPoint,
} from "../../../templates/fashion-atelier-v1/src/lib/hero-carousel";
import type { MediaRef } from "../../../templates/fashion-atelier-v1/src/content/types";

const ref = (partial: Partial<MediaRef> & { alt: string }): MediaRef => partial;

describe("resolveMediaFocalPoint — Sprint 86", () => {
  it("desktop sin focal → centro", () => {
    expect(resolveMediaFocalPoint(ref({ alt: "a" }), "desktop")).toEqual({
      x: 0.5,
      y: 0.5,
    });
  });

  it("desktop usa focalPoint", () => {
    expect(
      resolveMediaFocalPoint(
        ref({ alt: "a", focalPoint: { x: 0.25, y: 0.5 } }),
        "desktop",
      ),
    ).toEqual({ x: 0.25, y: 0.5 });
  });

  it("móvil: focalPointMobile ?? focalPoint ?? centro", () => {
    expect(
      resolveMediaFocalPoint(
        ref({
          alt: "a",
          focalPoint: { x: 0.25, y: 0.5 },
          focalPointMobile: { x: 0.8, y: 0.2 },
        }),
        "mobile",
      ),
    ).toEqual({ x: 0.8, y: 0.2 });

    expect(
      resolveMediaFocalPoint(
        ref({ alt: "a", focalPoint: { x: 0.25, y: 0.5 } }),
        "mobile",
      ),
    ).toEqual({ x: 0.25, y: 0.5 });
  });
});

describe("mediaRefObjectPosition", () => {
  it("formatea porcentajes CSS", () => {
    expect(
      mediaRefObjectPosition(
        ref({ alt: "a", focalPoint: { x: 0.25, y: 0.5 } }),
        "desktop",
      ),
    ).toBe("25% 50%");
  });
});
