"use client";

import { Fragment, type ReactNode } from "react";
import type { ContentPayload } from "../content/types";
import { AccessoriesLane } from "../components/AccessoriesLane";
import { AtelierNote } from "../components/AtelierNote";
import { CraftBand } from "../components/CraftBand";
import { Hero } from "../components/Hero";
import { OccasionsStrip } from "../components/OccasionsStrip";
import { SignatureLooks } from "../components/SignatureLooks";

export const DEFAULT_HOME_SECTION_ORDER = [
    "hero",
    "occasions",
    "craft",
    "signature",
    "note",
    "accessories"
  ] as const;

export type HomeSectionId = (typeof DEFAULT_HOME_SECTION_ORDER)[number];

const HOME_SECTION_REGISTRY: Record<
  HomeSectionId,
  () => ReactNode
> = {
  hero: () => <Hero />,
  occasions: () => <OccasionsStrip />,
  craft: () => <CraftBand />,
  signature: () => <SignatureLooks />,
  note: () => <AtelierNote />,
  accessories: () => <AccessoriesLane />,
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
  return true;
}

export function renderHomeSections(payload: ContentPayload): ReactNode[] {
  return resolveHomeSectionOrder(payload)
    .filter((id) => shouldRenderHomeSection(id, payload))
    .map((id) => (
      <Fragment key={id}>{HOME_SECTION_REGISTRY[id]()}</Fragment>
    ));
}
