import type { CatalogSessionViewModel, ProductSearchViewModel } from "./catalog";

/**
 * La grilla pinta la sesión solo cuando su clave es la de la consulta actual.
 * Si no coincide, el host sigue pidiendo el listado.
 */
export function warmStorefrontCatalogGrid(input: Readonly<{
  session?: Pick<CatalogSessionViewModel, "products" | "nextCursor" | "queryKey"> | null;
  listingKey?: string | null;
}>): Readonly<{ ready: boolean; data: ProductSearchViewModel | null }> {
  const session = input.session;
  const listingKey = input.listingKey ?? "";
  if (!session?.queryKey || !listingKey || session.queryKey !== listingKey) {
    return { ready: false, data: null };
  }
  return {
    ready: true,
    data: {
      products: session.products,
      nextCursor: session.nextCursor,
      query: {},
      sortOptions: [],
    },
  };
}
