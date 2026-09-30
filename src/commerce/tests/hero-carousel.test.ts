import { describe, expect, it } from "vitest";
import {
  resolveHeroSlides,
  heroSlideSlotId,
  isHeroCarouselMode,
} from "../../../templates/fashion-atelier-v1/src/lib/hero-carousel";
import type { MediaRef } from "../../../templates/fashion-atelier-v1/src/content/types";

const img = (url: string): MediaRef => ({ url, alt: url });

describe("resolveHeroSlides — Sprint 85", () => {
  it("modo single: solo hero.image", () => {
    const hero = { image: img("a"), carouselImages: [] };
    expect(resolveHeroSlides(hero).map((s) => s.url)).toEqual(["a"]);
    expect(isHeroCarouselMode(hero)).toBe(false);
  });

  it("modo carrusel: ignora hero.image como slide", () => {
    const hero = {
      image: img("single"),
      carouselImages: [img("c1"), img("c2")],
    };
    expect(resolveHeroSlides(hero).map((s) => s.url)).toEqual(["c1", "c2"]);
    expect(isHeroCarouselMode(hero)).toBe(true);
  });

  it("sin image ni carousel → []", () => {
    expect(resolveHeroSlides({ image: undefined as unknown as MediaRef })).toEqual(
      [],
    );
    expect(resolveHeroSlides({ image: img("a"), carouselImages: undefined })).toEqual([
      { url: "a", alt: "a" },
    ]);
  });

  it("carousel con un item usa solo la lista", () => {
    const hero = { image: img("x"), carouselImages: [img("only")] };
    expect(resolveHeroSlides(hero)).toHaveLength(1);
    expect(resolveHeroSlides(hero)[0].url).toBe("only");
  });
});

describe("heroSlideSlotId", () => {
  it("single → hero.image", () => {
    expect(heroSlideSlotId(0, { image: img("a") })).toBe("hero.image");
  });

  it("carrusel → hero.carousel.N", () => {
    const hero = { image: img("a"), carouselImages: [img("c0"), img("c1")] };
    expect(heroSlideSlotId(0, hero)).toBe("hero.carousel.0");
    expect(heroSlideSlotId(1, hero)).toBe("hero.carousel.1");
  });
});
