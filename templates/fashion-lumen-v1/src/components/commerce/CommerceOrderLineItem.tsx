"use client";

import Image from "next/image";
import {
  commerceLineItemBodyClassName,
  commerceLineItemCompareAtClassName,
  commerceLineItemFinalPriceClassName,
  commerceLineItemHeaderRowClassName,
  commerceLineItemImageBorderClassName,
  commerceLineItemImageShellClassName,
  commerceLineItemPriceColumnClassName,
  commerceLineItemPromotionClassName,
  commerceLineItemQuantityClassName,
  commerceLineItemRowClassName,
  commerceLineItemTitleClassName,
  commerceLineItemVariantClassName,
} from "@shopenlinea/commerce-runtime-contract";

export type CommerceOrderLineItemProps = Readonly<{
  imageUrl?: string | null;
  title: string;
  variantLabel?: string | null;
  quantity: number;
  lineDisplayPrice: string;
  compareAtDisplay?: string | null;
  promotionLabel?: string | null;
  kitIncludes?: ReadonlyArray<{ label: string; quantity: number }> | null;
  kitIncludesLabel?: string | null;
}>;

export function CommerceOrderLineItem({
  imageUrl,
  title,
  variantLabel,
  quantity,
  lineDisplayPrice,
  compareAtDisplay,
  promotionLabel,
  kitIncludes,
  kitIncludesLabel,
}: CommerceOrderLineItemProps) {
  return (
    <li className={commerceLineItemRowClassName}>
      <div
        className={`${commerceLineItemImageShellClassName} ${commerceLineItemImageBorderClassName}`}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="72px"
          />
        ) : null}
      </div>
      <div className={commerceLineItemBodyClassName}>
        <div className={commerceLineItemHeaderRowClassName}>
          <div className="min-w-0 flex-1">
            <p className={commerceLineItemTitleClassName}>{title}</p>
            {variantLabel ? (
              <p className={commerceLineItemVariantClassName}>{variantLabel}</p>
            ) : null}
            {promotionLabel ? (
              <p className={commerceLineItemPromotionClassName}>{promotionLabel}</p>
            ) : null}
            <p className={commerceLineItemQuantityClassName}>× {quantity}</p>
            {kitIncludes && kitIncludes.length > 0 && kitIncludesLabel ? (
              <div className="mt-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                  {kitIncludesLabel}
                </p>
                <ul className="mt-2 space-y-2">
                  {kitIncludes.map((include) => {
                    const [name, ...rest] = include.label.split(" — ");
                    const detail = rest.join(" — ");
                    return (
                      <li key={`${include.label}-${include.quantity}`}>
                        <span className="block text-primary">{name}</span>
                        <span className="block text-muted">
                          {detail
                            ? `${detail} × ${include.quantity}`
                            : `× ${include.quantity}`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>
          <div className={commerceLineItemPriceColumnClassName}>
            {compareAtDisplay ? (
              <p className={commerceLineItemCompareAtClassName}>{compareAtDisplay}</p>
            ) : null}
            <p className={commerceLineItemFinalPriceClassName}>{lineDisplayPrice}</p>
          </div>
        </div>
      </div>
    </li>
  );
}
