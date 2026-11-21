/**
 * Reseñas de compradores en la ficha y en las tarjetas (Sprint 119). El host manda todo listo para pintar:
 * promedio, conteo, distribución y fechas ya formateadas. Solo compradores verificados.
 */

export interface ProductReviewReplyViewModel {
  body: string;
  /** Fecha ya formateada ("12 nov 2026"). */
  dateLabel: string;
}

export interface ProductReviewItemViewModel {
  id: string;
  /** 1–5. */
  rating: number;
  title?: string | null;
  body: string;
  /** "María G." */
  authorName: string;
  dateLabel: string;
  /** Siempre `true` hoy (solo compradores); se conserva para mostrar el sello. */
  verifiedPurchase: boolean;
  /** "Talla M / Negro". */
  variantLabel?: string | null;
  merchantReply?: ProductReviewReplyViewModel | null;
}

export interface ProductReviewsViewModel {
  /** Promedio con un decimal (4.6). */
  average: number;
  count: number;
  /** De 5 a 1 estrellas. */
  distribution: ReadonlyArray<{ stars: number; count: number }>;
  items: readonly ProductReviewItemViewModel[];
  /** Cursor para `loadMoreProductReviews`; `null` si no hay más. */
  nextCursor: string | null;
}

/** Estrellas en tarjetas de listado (sin cargar reseñas). */
export interface ProductCardRatingViewModel {
  average: number;
  count: number;
  /** Promedio ya formateado ("4,6"). */
  averageLabel: string;
}

/** Confianza junto al botón de compra. Textos del dueño de la tienda; nada inventado por el sistema. */
export interface ProductTrustViewModel {
  shippingNote?: string | null;
  returnsNote?: string | null;
  /** Medios de pago activos ("Tarjeta", "Transferencia", "QR"). */
  paymentMethodLabels?: readonly string[];
}

/** Textos de los bloques de venta, ya traducidos por el host (el template no los repite). */
export interface ProductDetailSalesCopy {
  reviewsTitle: string;
  /** "23 opiniones" / "1 opinión" ya resuelto según `reviews.count`. */
  reviewsCountLabel: string;
  /** "4,6 de 5". */
  averageLabel: string;
  noReviews: string;
  verifiedPurchase: string;
  merchantReplyTitle: string;
  loadMoreReviews: string;
  /** "{stars} estrellas" con `{stars}` a reemplazar. */
  starsAriaTemplate: string;
  /** "Quedan {count}" con `{count}` a reemplazar. */
  lowStockTemplate: string;
  buyNow: string;
  whatsAppConsult: string;
  sizeGuide: string;
  securePayment: string;
  paymentMethodsTitle: string;
}
