"use client";

import { Hero } from "../Hero";
import { SoireesMarquee } from "../SoireesMarquee";
import { GoldCraftBand } from "../GoldCraftBand";
import { NocturneGrid } from "../NocturneGrid";
import { SalonNote } from "../SalonNote";
import { VelvetEditLane } from "../VelvetEditLane";

export function HomeView() {
  return (
    <>
      <Hero />
      <SoireesMarquee />
      <GoldCraftBand />
      <NocturneGrid />
      <SalonNote />
      <VelvetEditLane />
    </>
  );
}
