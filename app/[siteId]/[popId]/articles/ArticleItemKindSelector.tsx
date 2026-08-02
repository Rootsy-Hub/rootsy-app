"use client"

import { articleFormFieldStackClass } from "@/app/[siteId]/[popId]/articles/articleConstants"
import { CheckoutSectionLabel } from "@/components/checkout/CheckoutFormFields"
import {
  ARTICLE_ITEM_KINDS,
  ARTICLE_ITEM_KIND_SELECTOR_HINT,
  ARTICLE_ITEM_KIND_STOCK_LABEL,
  type ArticleItemKind,
} from "@/lib/articleItemKind"
import { cn } from "@/lib/utils"

type Props = {
  idPrefix: string
  value: ArticleItemKind
  onChange: (kind: ArticleItemKind) => void
  readOnly?: boolean
}

export function ArticleItemKindSelector({
  idPrefix,
  value,
  onChange,
  readOnly = false,
}: Props) {
  if (readOnly) {
    return (
      <div className={articleFormFieldStackClass}>
        <CheckoutSectionLabel>Tipo de artículo</CheckoutSectionLabel>
        <div className="rounded-xl border border-border/60 bg-muted/15 px-3.5 py-2.5">
          <p className="text-sm font-medium text-foreground">
            {ARTICLE_ITEM_KIND_STOCK_LABEL[value]}
          </p>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
            {ARTICLE_ITEM_KIND_SELECTOR_HINT[value]}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={articleFormFieldStackClass}>
      <CheckoutSectionLabel>Tipo de artículo</CheckoutSectionLabel>
      <div
        className="grid gap-2 sm:grid-cols-3"
        role="radiogroup"
        aria-label="Tipo de artículo"
      >
        {ARTICLE_ITEM_KINDS.map((kind) => {
          const selected = value === kind
          return (
            <button
              key={kind}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(kind)}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-left transition-colors",
                selected
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-border/60 bg-muted/10 text-muted-foreground hover:border-border hover:bg-muted/25 hover:text-foreground",
              )}
            >
              <span className="block text-sm font-medium">
                {ARTICLE_ITEM_KIND_STOCK_LABEL[kind]}
              </span>
              <span className="mt-0.5 block text-[11px] leading-snug opacity-80">
                {ARTICLE_ITEM_KIND_SELECTOR_HINT[kind]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
