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

  it("imagen mobile sustituye solo el viewport móvil", () => {
    const hero = { image: img("desk"), mobileImage: img("mob") };
    expect(resolveHeroSlides(hero, "desktop").map((s) => s.url)).toEqual(["desk"]);
    expect(resolveHeroSlides(hero, "mobile").map((s) => s.url)).toEqual(["mob"]);
    expect(isHeroCarouselMode(hero)).toBe(false);
  });

  it("carrusel mobile puede ser el hero móvil aunque escritorio sea imagen", () => {
    const hero = { image: img("desk"), mobileCarouselImages: [img("m1"), img("m2")] };
    expect(resolveHeroSlides(hero, "desktop").map((s) => s.url)).toEqual(["desk"]);
    expect(resolveHeroSlides(hero, "mobile").map((s) => s.url)).toEqual(["m1", "m2"]);
    expect(isHeroCarouselMode(hero)).toBe(false);
  });

  it("imagen mobile fija el móvil aunque escritorio sea carrusel", () => {
    const hero = {
      image: img("desk"),
      carouselImages: [img("d1"), img("d2")],
      mobileImage: img("mob"),
    };
    expect(resolveHeroSlides(hero, "desktop").map((s) => s.url)).toEqual(["d1", "d2"]);
    expect(resolveHeroSlides(hero, "mobile").map((s) => s.url)).toEqual(["mob"]);
    expect(heroSlideSlotId(0, hero, "mobile")).toBe("hero.mobileImage");
    expect(heroSlideSlotId(0, hero, "desktop")).toBe("hero.carousel.0");
  });

  it("carrusel mobile tiene prioridad sobre imagen mobile", () => {
    const hero = {
      image: img("single"),
      carouselImages: [img("d1"), img("d2")],
      mobileImage: img("mob"),
      mobileCarouselImages: [img("m1")],
    };
    expect(resolveHeroSlides(hero, "desktop").map((s) => s.url)).toEqual(["d1", "d2"]);
    expect(resolveHeroSlides(hero, "mobile").map((s) => s.url)).toEqual(["m1"]);
    expect(isHeroCarouselMode(hero)).toBe(true);
  });

  it("carrusel sin slides mobile reutiliza el carrusel de escritorio", () => {
    const hero = {
      image: img("single"),
      carouselImages: [img("d1"), img("d2")],
      mobileCarouselImages: [],
    };
    expect(resolveHeroSlides(hero, "mobile").map((s) => s.url)).toEqual(["d1", "d2"]);
  });

  it("imageMobile legacy no activa el asset mobile nuevo", () => {
    const hero = { image: img("desk"), imageMobile: img("legacy") };
    expect(resolveHeroSlides(hero, "mobile").map((s) => s.url)).toEqual(["desk"]);
    expect(isHeroCarouselMode(hero)).toBe(false);
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

  it("mobile usa su slot y no el de escritorio", () => {
    const imageHero = { image: img("a"), mobileImage: img("m") };
    expect(heroSlideSlotId(0, imageHero, "mobile")).toBe("hero.mobileImage");
    expect(heroSlideSlotId(0, imageHero, "desktop")).toBe("hero.image");
    const carouselHero = {
      image: img("a"),
      carouselImages: [img("c0")],
      mobileCarouselImages: [img("m0"), img("m1")],
    };
    expect(heroSlideSlotId(1, carouselHero, "mobile")).toBe("hero.mobileCarousel.1");
    expect(heroSlideSlotId(0, carouselHero, "desktop")).toBe("hero.carousel.0");
  });
});
