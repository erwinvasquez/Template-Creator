"use client";

import { useSiteContent } from "../../lib/site-content";
import { Hero } from "../Hero";
import { CollectionStrip } from "../CollectionStrip";
import { FeaturedProducts } from "../FeaturedProducts";
import { EditorialBanner } from "../EditorialBanner";
import { Newsletter } from "../Newsletter";

export function HomeView() {
  const { payload } = useSiteContent();
  const showNewsletter = payload.features?.newsletter !== false;

  return (
    <>
      <Hero />
      <CollectionStrip />
      <FeaturedProducts />
      <EditorialBanner />
      {showNewsletter && <Newsletter />}
    </>
  );
}
