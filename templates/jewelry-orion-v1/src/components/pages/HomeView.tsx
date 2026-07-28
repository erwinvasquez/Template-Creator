"use client";

import { Hero } from "../Hero";
import { Signatures } from "../Signatures";
import { CraftBand } from "../CraftBand";
import { MaterialsRow } from "../MaterialsRow";
import { AppointmentBand } from "../AppointmentBand";

export function HomeView() {
  return (
    <>
      <Hero />
      <Signatures />
      <CraftBand />
      <MaterialsRow />
      <AppointmentBand />
    </>
  );
}
