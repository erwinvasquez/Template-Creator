"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { ContentPayload, MediaFocalPoint, MediaRef } from "../content/types";
import { resolveMediaUrl } from "../content/resolve";

export type HeroCarouselFields = {
  image: MediaRef;
  carouselImages?: MediaRef[];
  carouselIntervalMs?: number;
  /** @deprecated Sprint 85 — ignored at runtime */
  imageSecondary?: MediaRef;
  imageMobile?: MediaRef;
  imageMobileSecondary?: MediaRef;
};

export type HeroMediaViewport = "desktop" | "mobile";

export const DEFAULT_HERO_CAROUSEL_INTERVAL_MS = 4000;
/** Duración del slide horizontal (entrante desde la derecha). */
export const HERO_CAROUSEL_SLIDE_MS = 700;

const DEFAULT_FOCAL: MediaFocalPoint = { x: 0.5, y: 0.5 };

export function resolveMediaFocalPoint(
  ref: MediaRef,
  viewport: HeroMediaViewport,
): MediaFocalPoint {
  if (viewport === "mobile") {
    return ref.focalPointMobile ?? ref.focalPoint ?? DEFAULT_FOCAL;
  }
  return ref.focalPoint ?? DEFAULT_FOCAL;
}

export function mediaRefObjectPosition(
  ref: MediaRef,
  viewport: HeroMediaViewport,
): string {
  const { x, y } = resolveMediaFocalPoint(ref, viewport);
  return `${x * 100}% ${y * 100}%`;
}

export function isHeroCarouselMode(hero: HeroCarouselFields): boolean {
  return (hero.carouselImages?.length ?? 0) >= 1;
}

export function resolveHeroSlides(hero: HeroCarouselFields): MediaRef[] {
  if (hero.carouselImages && hero.carouselImages.length >= 1) {
    return hero.carouselImages;
  }
  if (hero.image) {
    return [hero.image];
  }
  return [];
}

export function heroSlideSlotId(
  slideIndex: number,
  hero: HeroCarouselFields,
): string {
  if (isHeroCarouselMode(hero)) {
    return `hero.carousel.${slideIndex}`;
  }
  return "hero.image";
}

function stripEntranceAnimations(className: string): string {
  return className
    .split(/\s+/)
    .filter((token) => token && !token.startsWith("animate-"))
    .join(" ");
}

function stripFixedObjectPosition(className: string): string {
  return className
    .split(/\s+/)
    .filter(
      (token) =>
        token &&
        token !== "object-center" &&
        token !== "object-top" &&
        !token.startsWith("object-["),
    )
    .join(" ");
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return reduced;
}

function useIsMobileViewport(): boolean {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return mobile;
}

type HeroCarouselMediaProps = {
  hero: HeroCarouselFields;
  media: ContentPayload["media"];
  className?: string;
  sizes: string;
};

export function HeroCarouselMedia({
  hero,
  media,
  className = "object-cover",
  sizes,
}: HeroCarouselMediaProps) {
  const slides = useMemo(() => resolveHeroSlides(hero), [hero]);
  const isMobile = useIsMobileViewport();
  const viewport: HeroMediaViewport = isMobile ? "mobile" : "desktop";
  const reducedMotion = usePrefersReducedMotion();
  const intervalMs = hero.carouselIntervalMs ?? DEFAULT_HERO_CAROUSEL_INTERVAL_MS;
  const carouselActive = slides.length > 1 && !reducedMotion;
  const [activeIndex, setActiveIndex] = useState(0);

  const slideSignature = slides
    .map((s) => resolveMediaUrl(s, media))
    .join("|");

  useEffect(() => {
    setActiveIndex(0);
  }, [slideSignature]);

  useEffect(() => {
    if (!carouselActive) {
      return;
    }
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [carouselActive, intervalMs, slides.length]);

  const imageClassName = stripFixedObjectPosition(
    slides.length === 1 ? className : stripEntranceAnimations(className),
  );

  if (slides.length === 0) {
    return (
      <div className="absolute inset-0 z-0" data-wb-slot="hero.carousel" />
    );
  }

  const slideWidthPercent = 100 / slides.length;
  const trackOffsetPercent = activeIndex * slideWidthPercent;

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden"
      data-wb-slot="hero.carousel"
    >
      <div
        className="flex h-full ease-in-out"
        style={{
          width: `${slides.length * 100}%`,
          transform: `translateX(-${trackOffsetPercent}%)`,
          transition: carouselActive
            ? `transform ${HERO_CAROUSEL_SLIDE_MS}ms ease-in-out`
            : undefined,
        }}
      >
        {slides.map((slide, index) => (
          <div
            key={`${index}-${resolveMediaUrl(slide, media)}`}
            className="relative h-full shrink-0"
            style={{ width: `${slideWidthPercent}%` }}
          >
            <Image
              src={resolveMediaUrl(slide, media)}
              alt={slide.alt}
              fill
              priority={index === 0}
              data-wb-slot={heroSlideSlotId(index, hero)}
              sizes={sizes}
              className={imageClassName}
              style={{ objectPosition: mediaRefObjectPosition(slide, viewport) }}
              aria-hidden={carouselActive && index !== activeIndex}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
