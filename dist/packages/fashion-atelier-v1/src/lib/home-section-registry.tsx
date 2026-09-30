"use client";

import { Fragment, type ReactNode } from "react";
import type { ContentPayload } from "../content/types";
import { CollectionStrip } from "../components/CollectionStrip";
import { EditorialBanner } from "../components/EditorialBanner";
import { FeaturedProducts } from "../components/FeaturedProducts";
import { Hero } from "../components/Hero";
import { Newsletter } from "../components/Newsletter";

export const DEFAULT_HOME_SECTION_ORDER = [
    "hero",
    "collections",
    "featured",
    "editorial",
    "newsletter"
  ] as const;

export type HomeSectionId = (typeof DEFAULT_HOME_SECTION_ORDER)[number];

const HOME_SECTION_REGISTRY: Record<
  HomeSectionId,
  () => ReactNode
> = {
  hero: () => <Hero />,
  collections: () => <CollectionStrip />,
  featured: () => <FeaturedProducts />,
  editorial: () => <EditorialBanner />,
  newsletter: () => <Newsletter />,
};

const REGISTRY_IDS = Object.keys(
  HOME_SECTION_REGISTRY,
) as HomeSectionId[];

/** Footer lives in renderer — never mount from HomeView. */
const EXCLUDED_HOME_SECTIONS = new Set<string>(["footer"]);

export function resolveHomeSectionOrder(payload: ContentPayload): HomeSectionId[] {
  const custom = payload.layout?.pages?.home?.sectionOrder;
  const base = (custom?.length ? custom : [...DEFAULT_HOME_SECTION_ORDER]).filter(
    (id): id is HomeSectionId =>
      REGISTRY_IDS.includes(id as HomeSectionId) &&
      !EXCLUDED_HOME_SECTIONS.has(id),
  );
  const deduped = [...new Set(base)];
  if (deduped[0] !== "hero") {
    return ["hero", ...deduped.filter((id) => id !== "hero")];
  }
  return deduped;
}

export function shouldRenderHomeSection(
  sectionId: HomeSectionId,
  payload: ContentPayload,
): boolean {
  if (sectionId === "newsletter" && payload.features?.newsletter === false) {
    return false;
  }
  return true;
}

export function renderHomeSections(payload: ContentPayload): ReactNode[] {
  return resolveHomeSectionOrder(payload)
    .filter((id) => shouldRenderHomeSection(id, payload))
    .map((id) => (
      <Fragment key={id}>{HOME_SECTION_REGISTRY[id]()}</Fragment>
    ));
}
