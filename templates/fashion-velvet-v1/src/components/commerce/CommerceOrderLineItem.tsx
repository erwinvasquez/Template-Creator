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
}>;

export function CommerceOrderLineItem({
  imageUrl,
  title,
  variantLabel,
  quantity,
  lineDisplayPrice,
  compareAtDisplay,
  promotionLabel,
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
