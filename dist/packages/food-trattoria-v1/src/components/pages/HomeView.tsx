"use client";

import { Hero } from "../Hero";
import { CoursesStrip } from "../CoursesStrip";
import { KitchenBand } from "../KitchenBand";
import { SignatureDishes } from "../SignatureDishes";
import { SommelierNote } from "../SommelierNote";
import { PantryLane } from "../PantryLane";

export function HomeView() {
  return (
    <>
      <Hero />
      <CoursesStrip />
      <KitchenBand />
      <SignatureDishes />
      <SommelierNote />
      <PantryLane />
    </>
  );
}
