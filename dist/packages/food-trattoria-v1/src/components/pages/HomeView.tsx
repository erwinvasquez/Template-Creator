"use client";

import { useSiteContent } from "../../lib/site-content";
import { renderHomeSections } from "../../lib/home-section-registry";

export function HomeView() {
  const { payload } = useSiteContent();
  return <>{renderHomeSections(payload)}</>;
}
