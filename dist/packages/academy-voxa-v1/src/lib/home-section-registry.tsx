"use client";

import { Fragment, type ReactNode } from "react";
import type { ContentPayload } from "../content/types";
import { BooksBand } from "../components/BooksBand";
import { Hero } from "../components/Hero";
import { MethodBand } from "../components/MethodBand";
import { OutcomesBand } from "../components/OutcomesBand";
import { ProgramsStrip } from "../components/ProgramsStrip";

export const DEFAULT_HOME_SECTION_ORDER = [
    "hero",
    "programs",
    "method",
    "outcomes",
    "books"
  ] as const;

export type HomeSectionId = (typeof DEFAULT_HOME_SECTION_ORDER)[number];

const HOME_SECTION_REGISTRY: Record<
  HomeSectionId,
  () => ReactNode
> = {
  hero: () => <Hero />,
  programs: () => <ProgramsStrip />,
  method: () => <MethodBand />,
  outcomes: () => <OutcomesBand />,
  books: () => <BooksBand />,
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
