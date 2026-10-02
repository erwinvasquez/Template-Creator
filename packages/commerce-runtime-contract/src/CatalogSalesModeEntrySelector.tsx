import type { CatalogSalesModeEntryOption } from "./catalogSalesModeEntry";
import {
  catalogEntryCardClassName,
  catalogEntryCardDescriptionClassName,
  catalogEntryCardTitleClassName,
  catalogEntryGridClassName,
  catalogEntryHeadingClassName,
  catalogEntrySectionClassName,
} from "./catalogSalesModeEntry";

type Props = Readonly<{
  heading: string;
  options: CatalogSalesModeEntryOption[];
}>;

/**
 * Elección visual previa al grid cuando hay dos catálogos y sin `salesMode` en URL.
 * Navega con `<a href>` — mismo destino que el switch superior existente.
 */
export function CatalogSalesModeEntrySelector({ heading, options }: Props) {
  return (
    <section
      className={catalogEntrySectionClassName}
      aria-labelledby="catalog-sales-mode-entry-heading"
    >
      <h2 id="catalog-sales-mode-entry-heading" className={catalogEntryHeadingClassName}>
        {heading}
      </h2>
      <div className={catalogEntryGridClassName} role="list">
        {options.map((option) => (
          <a
            key={option.salesMode}
            role="listitem"
            href={option.href}
            className={catalogEntryCardClassName}
            data-catalog-entry-mode={option.salesMode}
          >
            <span className={catalogEntryCardTitleClassName}>{option.label}</span>
            {option.description ? (
              <span className={catalogEntryCardDescriptionClassName}>
                {option.description}
              </span>
            ) : null}
          </a>
        ))}
      </div>
    </section>
  );
}
