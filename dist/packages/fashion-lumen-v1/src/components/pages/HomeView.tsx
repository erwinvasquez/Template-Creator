"use client";

import { Hero } from "../Hero";
import { DisciplinesStrip } from "../DisciplinesStrip";
import { GearSpotlight } from "../GearSpotlight";
import { PerformanceBand } from "../PerformanceBand";
import { CommunityStrip } from "../CommunityStrip";

export function HomeView() {
  return (
    <>
      <Hero />
      <DisciplinesStrip />
      <GearSpotlight />
      <PerformanceBand />
      <CommunityStrip />
    </>
  );
}
