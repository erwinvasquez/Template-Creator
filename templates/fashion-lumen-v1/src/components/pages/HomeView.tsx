"use client";

import { Hero } from "../Hero";
import { WardrobeStrip } from "../WardrobeStrip";
import { ArrivalsGrid } from "../ArrivalsGrid";
import { FabricNote } from "../FabricNote";
import { EditorialBand } from "../EditorialBand";

export function HomeView() {
  return (
    <>
      <Hero />
      <WardrobeStrip />
      <ArrivalsGrid />
      <FabricNote />
      <EditorialBand />
    </>
  );
}
