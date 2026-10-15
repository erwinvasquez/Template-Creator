"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { ContentPayload, MediaFocalPoint, MediaRef } from "../content/types";
import { resolveMediaUrl } from "../content/resolve";

export type HeroCarouselFields = {
  image: MediaRef;
  carouselImages?: MediaRef[];
  carouselIntervalMs?: number;
  /** Asset de Hero Image Mobile. No sustituye el crop móvil de `image`. */
  mobileImage?: MediaRef;
  /** Slides de Hero Carrusel Mobile. No se mezclan con `carouselImages`. */
  mobileCarouselImages?: MediaRef[];
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
const MOBILE_MEDIA_QUERY = "(max-width: 767px)";
const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";
const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

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

export function isUsableHeroMedia(ref: MediaRef | undefined): ref is MediaRef {
  if (!ref || typeof ref !== "object") return false;
  const url = typeof ref.url === "string" ? ref.url.trim() : "";
  const mediaId = typeof ref.mediaId === "string" ? ref.mediaId.trim() : "";
  return url.length > 0 || mediaId.length > 0;
}

export function usableHeroSlides(refs: readonly MediaRef[] | undefined): MediaRef[] {
  return (refs ?? []).filter(isUsableHeroMedia);
}

/** El modo lo define solo el carrusel de escritorio. Un asset mobile no cambia el tipo. */
export function isHeroCarouselMode(hero: HeroCarouselFields): boolean {
  return usableHeroSlides(hero.carouselImages).length >= 1;
}

export function resolveHeroSlides(
  hero: HeroCarouselFields,
  viewport: HeroMediaViewport = "desktop",
): MediaRef[] {
  if (isHeroCarouselMode(hero)) {
    if (viewport === "mobile") {
      const mobileSlides = usableHeroSlides(hero.mobileCarouselImages);
      if (mobileSlides.length >= 1) return mobileSlides;
    }
    return usableHeroSlides(hero.carouselImages);
  }

  if (viewport === "mobile" && isUsableHeroMedia(hero.mobileImage)) {
    return [hero.mobileImage];
  }
  if (isUsableHeroMedia(hero.image)) return [hero.image];
  return [];
}

export function heroSlideSlotId(
  slideIndex: number,
  hero: HeroCarouselFields,
  viewport: HeroMediaViewport = "desktop",
): string {
  if (isHeroCarouselMode(hero)) {
    if (
      viewport === "mobile" &&
      usableHeroSlides(hero.mobileCarouselImages).length >= 1
    ) {
      return `hero.mobileCarousel.${slideIndex}`;
    }
    return `hero.carousel.${slideIndex}`;
  }
  if (viewport === "mobile" && isUsableHeroMedia(hero.mobileImage)) {
    return "hero.mobileImage";
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

function objectPositionClass(className: string): string {
  return `${className} [object-position:var(--hero-object-desktop)] max-md:[object-position:var(--hero-object-mobile)]`;
}

function objectPositionStyle(
  desktop: MediaRef,
  mobile: MediaRef,
): CSSProperties {
  return {
    ["--hero-object-desktop" as string]: mediaRefObjectPosition(desktop, "desktop"),
    ["--hero-object-mobile" as string]: mediaRefObjectPosition(mobile, "mobile"),
  };
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

function slideUrl(slide: MediaRef, media: ContentPayload["media"]): string {
  return resolveMediaUrl(slide, media);
}

type HeroCarouselTrackProps = {
  slides: MediaRef[];
  mobileSlides?: MediaRef[];
  hero: HeroCarouselFields;
  media: ContentPayload["media"];
  className: string;
  sizes: string;
  viewport: HeroMediaViewport | "paired";
  containerSlot: string;
};

function HeroCarouselTrack({
  slides,
  mobileSlides,
  hero,
  media,
  className,
  sizes,
  viewport,
  containerSlot,
}: HeroCarouselTrackProps) {
  const reducedMotion = usePrefersReducedMotion();
  const intervalMs = hero.carouselIntervalMs ?? DEFAULT_HERO_CAROUSEL_INTERVAL_MS;
  const carouselActive = slides.length > 1 && !reducedMotion;
  const [activeIndex, setActiveIndex] = useState(0);

  const slideSignature = slides
    .map((slide, index) => {
      const mobile = mobileSlides?.[index];
      return `${slideUrl(slide, media)}|${mobile ? slideUrl(mobile, media) : ""}`;
    })
    .join("||");

  useEffect(() => {
    setActiveIndex(0);
  }, [slideSignature]);

  useEffect(() => {
    if (!carouselActive) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [carouselActive, intervalMs, slides.length]);

  const imageClassName = stripFixedObjectPosition(
    slides.length === 1 ? className : stripEntranceAnimations(className),
  );

  if (slides.length === 0) {
    return <div className="absolute inset-0 z-0" data-wb-slot={containerSlot} />;
  }

  const slideWidthPercent = 100 / slides.length;
  const trackOffsetPercent = activeIndex * slideWidthPercent;

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden"
      data-wb-slot={containerSlot}
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
        {slides.map((slide, index) => {
          const mobileSlide = mobileSlides?.[index];
          const desktopSlot = heroSlideSlotId(index, hero, "desktop");
          const mobileSlot = heroSlideSlotId(index, hero, "mobile");
          const positionStyle = objectPositionStyle(slide, mobileSlide ?? slide);
          return (
            <div
              key={`${index}-${slideUrl(slide, media)}`}
              className="relative h-full shrink-0"
              style={{ width: `${slideWidthPercent}%` }}
            >
              <HeroSlideVisual
                slide={slide}
                mobileSlide={viewport === "paired" ? mobileSlide : undefined}
                lockedViewport={viewport === "paired" ? undefined : viewport}
                media={media}
                className={objectPositionClass(imageClassName)}
                style={positionStyle}
                sizes={sizes}
                desktopSlot={desktopSlot}
                mobileSlot={mobileSlot}
                priority={index === 0}
                hidden={carouselActive && index !== activeIndex}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HeroSlideVisual({
  slide,
  mobileSlide,
  lockedViewport,
  media,
  className,
  style,
  sizes,
  desktopSlot,
  mobileSlot,
  priority,
  hidden,
}: {
  slide: MediaRef;
  mobileSlide?: MediaRef;
  lockedViewport?: HeroMediaViewport;
  media: ContentPayload["media"];
  className: string;
  style: CSSProperties;
  sizes: string;
  desktopSlot: string;
  mobileSlot: string;
  priority: boolean;
  hidden: boolean;
}) {
  const desktopUrl = slideUrl(slide, media);
  const mobileUrl = mobileSlide ? slideUrl(mobileSlide, media) : "";
  const distinctMobile = Boolean(mobileSlide && mobileUrl && mobileUrl !== desktopUrl);

  if (!distinctMobile && !lockedViewport) {
    return (
      <Image
        src={desktopUrl}
        alt={slide.alt}
        fill
        priority={priority}
        data-wb-slot={desktopSlot}
        sizes={sizes}
        className={className}
        style={style}
        aria-hidden={hidden}
      />
    );
  }

  if (lockedViewport === "desktop") {
    return (
      <picture className="absolute inset-0 block h-full w-full" data-wb-slot={desktopSlot}>
        <source media={DESKTOP_MEDIA_QUERY} srcSet={desktopUrl} />
        <img
          src={TRANSPARENT_PIXEL}
          alt={slide.alt}
          className={`h-full w-full ${className}`}
          style={style}
          aria-hidden={hidden}
        />
      </picture>
    );
  }

  if (lockedViewport === "mobile") {
    return (
      <picture className="absolute inset-0 block h-full w-full" data-wb-slot={mobileSlot}>
        <source media={MOBILE_MEDIA_QUERY} srcSet={desktopUrl} />
        <img
          src={TRANSPARENT_PIXEL}
          alt={slide.alt}
          className={`h-full w-full ${className}`}
          style={style}
          aria-hidden={hidden}
        />
      </picture>
    );
  }

  return (
    <picture className="absolute inset-0 block h-full w-full" data-wb-slot={mobileSlot}>
      <source media={MOBILE_MEDIA_QUERY} srcSet={mobileUrl} />
      <img
        src={desktopUrl}
        alt={slide.alt}
        data-wb-slot={desktopSlot}
        sizes={sizes}
        className={`h-full w-full ${className}`}
        style={style}
        aria-hidden={hidden}
      />
    </picture>
  );
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
  const desktopSlides = useMemo(() => resolveHeroSlides(hero, "desktop"), [hero]);
  const mobileSlides = useMemo(() => resolveHeroSlides(hero, "mobile"), [hero]);
  const desktopSignature = desktopSlides.map((slide) => slideUrl(slide, media)).join("|");
  const mobileSignature = mobileSlides.map((slide) => slideUrl(slide, media)).join("|");
  const sameArt = desktopSignature === mobileSignature;
  const pairable =
    !sameArt &&
    desktopSlides.length > 0 &&
    desktopSlides.length === mobileSlides.length;

  if (sameArt || desktopSlides.length === 0) {
    return (
      <HeroCarouselTrack
        slides={desktopSlides}
        hero={hero}
        media={media}
        className={className}
        sizes={sizes}
        viewport="paired"
        containerSlot="hero.carousel"
      />
    );
  }

  if (pairable) {
    return (
      <HeroCarouselTrack
        slides={desktopSlides}
        mobileSlides={mobileSlides}
        hero={hero}
        media={media}
        className={className}
        sizes={sizes}
        viewport="paired"
        containerSlot="hero.carousel"
      />
    );
  }

  return (
    <>
      <div className="absolute inset-0 z-0 hidden md:block">
        <HeroCarouselTrack
          slides={desktopSlides}
          hero={hero}
          media={media}
          className={className}
          sizes={sizes}
          viewport="desktop"
          containerSlot="hero.carousel"
        />
      </div>
      <div className="absolute inset-0 z-0 md:hidden">
        <HeroCarouselTrack
          slides={mobileSlides}
          hero={hero}
          media={media}
          className={className}
          sizes={sizes}
          viewport="mobile"
          containerSlot="hero.mobileCarousel"
        />
      </div>
    </>
  );
}
