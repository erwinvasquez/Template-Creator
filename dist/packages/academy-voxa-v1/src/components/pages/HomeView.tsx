"use client";

import { Hero } from "../Hero";
import { ProgramsStrip } from "../ProgramsStrip";
import { MethodBand } from "../MethodBand";
import { OutcomesBand } from "../OutcomesBand";
import { BooksBand } from "../BooksBand";

export function HomeView() {
  return (
    <>
      <Hero />
      <ProgramsStrip />
      <MethodBand />
      <OutcomesBand />
      <BooksBand />
    </>
  );
}
