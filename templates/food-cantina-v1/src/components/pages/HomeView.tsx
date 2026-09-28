"use client";

import { Hero } from "../Hero";
import { TacoLanes } from "../TacoLanes";
import { SalsaBar } from "../SalsaBar";
import { MercadoStrip } from "../MercadoStrip";
import { FiestaBand } from "../FiestaBand";
import { MerchLane } from "../MerchLane";

export function HomeView() {
  return (
    <>
      <Hero />
      <TacoLanes />
      <SalsaBar />
      <MercadoStrip />
      <FiestaBand />
      <MerchLane />
    </>
  );
}
