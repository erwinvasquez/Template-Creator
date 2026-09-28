"use client";

import { Hero } from "../Hero";
import { DropZone } from "../DropZone";
import { TrendWall } from "../TrendWall";
import { ColorPulse } from "../ColorPulse";
import { SquadStrip } from "../SquadStrip";
import { FlashLane } from "../FlashLane";

export function HomeView() {
  return (
    <>
      <Hero />
      <DropZone />
      <TrendWall />
      <ColorPulse />
      <SquadStrip />
      <FlashLane />
    </>
  );
}
