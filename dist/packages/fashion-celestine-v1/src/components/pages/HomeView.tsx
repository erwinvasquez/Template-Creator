"use client";

import { Hero } from "../Hero";
import { OccasionsStrip } from "../OccasionsStrip";
import { CraftBand } from "../CraftBand";
import { SignatureLooks } from "../SignatureLooks";
import { AtelierNote } from "../AtelierNote";
import { AccessoriesLane } from "../AccessoriesLane";

export function HomeView() {
  return (
    <>
      <Hero />
      <OccasionsStrip />
      <CraftBand />
      <SignatureLooks />
      <AtelierNote />
      <AccessoriesLane />
    </>
  );
}
