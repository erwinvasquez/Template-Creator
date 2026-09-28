"use client";

import { Hero } from "../Hero";
import { ViennoiserieGrid } from "../ViennoiserieGrid";
import { SeasonalBand } from "../SeasonalBand";
import { CelebrationCakes } from "../CelebrationCakes";
import { PatisserieNote } from "../PatisserieNote";
import { GiftBoxLane } from "../GiftBoxLane";

export function HomeView() {
  return (
    <>
      <Hero />
      <ViennoiserieGrid />
      <SeasonalBand />
      <CelebrationCakes />
      <PatisserieNote />
      <GiftBoxLane />
    </>
  );
}
