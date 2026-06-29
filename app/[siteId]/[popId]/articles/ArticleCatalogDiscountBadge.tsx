"use client"

import {
  formatArticleDiscountBadge,
  type ArticleDiscountMode,
} from "@/lib/articleDiscount"
import { cn } from "@/lib/utils"

/** Pill verde monocromático: fondo oscuro + texto claro (contraste AA). */
export const articleCatalogDiscountPillClass =
  "inline-flex w-fit max-w-full items-center rounded-full border border-emerald-800 bg-emerald-700 px-2 py-0.5 text-[10px] font-semibold leading-none tabular-nums text-emerald-50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)] dark:border-emerald-400 dark:bg-emerald-600 dark:text-emerald-50"

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
    <span className={cn(articleCatalogDiscountPillClass, className)} title={title}>
      {formatArticleDiscountBadge(mode, value)}
    </span>
  )
}
