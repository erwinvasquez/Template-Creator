import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DEFAULT_PREVIEW_CAPABILITIES } from "@shopenlinea/commerce-runtime-contract";
import { ProductListingView } from "fashion-atelier-v1/client";
import { createMockCommerceBridge } from "../mock/createMockCommerceBridge";
import defaults from "../../../templates/fashion-atelier-v1/defaults.json";
import { SiteContentProvider } from "../../../templates/fashion-atelier-v1/src/lib/site-content";

describe("ProductListingView", () => {
  it("renders products for catalog-default", async () => {
    const bridge = createMockCommerceBridge("catalog-default");
    const { data, filters } = await bridge.getProductListing({});

    render(
      <SiteContentProvider payload={defaults as never} basePath="/t/atelier">
        <ProductListingView
          data={data}
          filters={filters}
          capabilities={DEFAULT_PREVIEW_CAPABILITIES}
          actions={{
            setCatalogFilters: bridge.actions.setCatalogFilters,
            loadMoreProducts: bridge.actions.loadMoreProducts,
          }}
        />
      </SiteContentProvider>,
    );

    expect(screen.getByText(/piezas/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cargar más/i })).toBeInTheDocument();
  });

  it("renders empty state for catalog-empty", async () => {
    const bridge = createMockCommerceBridge("catalog-empty");
    const { data, filters } = await bridge.getProductListing({});

    render(
      <SiteContentProvider payload={defaults as never} basePath="/t/atelier">
        <ProductListingView
          data={data}
          filters={filters}
          capabilities={DEFAULT_PREVIEW_CAPABILITIES}
          actions={{
            setCatalogFilters: bridge.actions.setCatalogFilters,
            loadMoreProducts: bridge.actions.loadMoreProducts,
          }}
        />
      </SiteContentProvider>,
    );

    expect(screen.getByText(/no hay piezas/i)).toBeInTheDocument();
  });
});
