import React, { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DEFAULT_PREVIEW_CAPABILITIES } from "@shopenlinea/commerce-runtime-contract";
import { ProductListingView } from "fashion-atelier-v1/client";
import { createMockCommerceBridge } from "../mock/createMockCommerceBridge";
import type { CommerceFixtureId } from "../fixtures/ids";
import { COMMERCE_FIXTURE_IDS } from "../fixtures/ids";
import defaults from "../../../templates/fashion-atelier-v1/defaults.json";
import { SiteContentProvider } from "../../../templates/fashion-atelier-v1/src/lib/site-content";

function ListingStory({ fixture }: { fixture: CommerceFixtureId }) {
  const bridge = createMockCommerceBridge(fixture);
  return (
    <SiteContentProvider payload={defaults as never} basePath="/t/atelier">
      <ListingInner bridge={bridge} />
    </SiteContentProvider>
  );
}

function ListingInner({
  bridge,
}: {
  bridge: ReturnType<typeof createMockCommerceBridge>;
}) {
  const [state, setState] = useState<{
    data: Awaited<ReturnType<typeof bridge.getProductListing>>["data"];
    filters: Awaited<ReturnType<typeof bridge.getProductListing>>["filters"];
  } | null>(null);

  useEffect(() => {
    void bridge.getProductListing({}).then(setState);
    return bridge.subscribe(() => {
      void bridge.getProductListing({}).then(setState);
    });
  }, [bridge]);

  if (!state) return <p className="p-8">Loading…</p>;

  return (
    <div className="atelier-root bg-background p-8 text-primary">
      <ProductListingView
        data={state.data}
        filters={state.filters}
        capabilities={DEFAULT_PREVIEW_CAPABILITIES}
        actions={{
          setCatalogFilters: bridge.actions.setCatalogFilters,
          loadMoreProducts: bridge.actions.loadMoreProducts,
        }}
      />
    </div>
  );
}

const meta: Meta<typeof ListingStory> = {
  title: "Commerce/ProductListing",
  component: ListingStory,
  argTypes: {
    fixture: {
      control: "select",
      options: COMMERCE_FIXTURE_IDS.filter((id) => id.startsWith("catalog")),
    },
  },
};

export default meta;
type Story = StoryObj<typeof ListingStory>;

export const CatalogDefault: Story = { args: { fixture: "catalog-default" } };
export const CatalogEmpty: Story = { args: { fixture: "catalog-empty" } };
export const CatalogSearchEmpty: Story = {
  args: { fixture: "catalog-search-empty" },
};
