"use client"

import {
  ARTICLE_ITEM_KINDS,
  ARTICLE_ITEM_KIND_SELECTOR_HINT,
  ARTICLE_ITEM_KIND_STOCK_LABEL,
  type ArticleItemKind,
} from "@/lib/articleItemKind"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type Props = {
  idPrefix: string
  value: ArticleItemKind
  onChange: (kind: ArticleItemKind) => void
}

export function ArticleItemKindSelector({ idPrefix, value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <Label id={`${idPrefix}-kind-label`}>Tipo de artículo</Label>
      <div
        className="grid gap-2 sm:grid-cols-3"
        role="radiogroup"
        aria-labelledby={`${idPrefix}-kind-label`}
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
                "rounded-lg border px-3 py-2.5 text-left transition-colors",
                selected
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-border/60 bg-background text-muted-foreground hover:border-border hover:bg-muted/30 hover:text-foreground",
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
