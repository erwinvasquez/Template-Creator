export const catalogPlpShopHeaderClassName = "mb-8 md:mb-10";

export const catalogPlpShopTitleClassName =
  "font-serif text-4xl tracking-wide text-primary md:text-5xl";

export const catalogPlpShopDescriptionClassName =
  "mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base";

type CatalogPlpShopHeaderProps = Readonly<{
  eyebrow: string;
  title: string;
  description: string;
}>;

/** PLP: título y descripción visibles; eyebrow solo para editor (sr-only). */
export function CatalogPlpShopHeader({
  eyebrow,
  title,
  description,
}: CatalogPlpShopHeaderProps) {
  return (
    <header className={catalogPlpShopHeaderClassName} data-commerce-plp-shop-header>
      <p data-wb-slot="shop.eyebrow" className="sr-only" aria-hidden="true">
        {eyebrow}
      </p>
      <h1 data-wb-slot="shop.title" className={catalogPlpShopTitleClassName}>
        {title}
      </h1>
      <p data-wb-slot="shop.description" className={catalogPlpShopDescriptionClassName}>
        {description}
      </p>
    </header>
  );
}
