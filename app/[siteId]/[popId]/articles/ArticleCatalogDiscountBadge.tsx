"use client"

import { RootsNaturePill } from "@/components/rootsy-pill"
import {
  formatArticleDiscountBadge,
  type ArticleDiscountMode,
} from "@/lib/articleDiscount"

/** @deprecated Usar RootsNaturePill variant="canopySolid". */
export const articleCatalogDiscountPillClass =
  "inline-flex w-fit max-w-full items-center rounded-full border border-[color:var(--nature-canopy-800)] bg-[color:var(--nature-canopy-700)] px-2.5 py-0.5 text-[11px] font-semibold leading-none tabular-nums text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)]"

export function ArticleCatalogDiscountBadge({
  mode,
  value,
  className,
  title = "Descuento de catálogo",
}: {
  mode: ArticleDiscountMode
  value: number
  className?: string
  title?: string
}) {
  return (
    <RootsNaturePill
      variant="canopySolid"
      className={className}
      title={title}
    >
      {formatArticleDiscountBadge(mode, value)}
    </RootsNaturePill>
  )
}
