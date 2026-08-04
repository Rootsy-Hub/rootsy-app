"use client"

import { dataWorkspaceListFiltersFieldClass } from "@/components/data-workspace/dataWorkspaceTablesLayout"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
} from "@/components/rootsy-form"
import {
  ARTICLE_ITEM_KINDS,
  ARTICLE_ITEM_KIND_STOCK_LABEL,
  type ArticleItemKind,
} from "@/lib/articleItemKind"
import { cn } from "@/lib/utils"
import { LayoutGrid } from "lucide-react"

export type ArticleItemKindFilterId = "all" | ArticleItemKind

const FILTER_ITEMS: { id: ArticleItemKindFilterId; label: string }[] = [
  { id: "all", label: "Todos" },
  ...ARTICLE_ITEM_KINDS.map((kind) => ({
    id: kind,
    label: ARTICLE_ITEM_KIND_STOCK_LABEL[kind],
  })),
]

const filterTriggerActiveClass = "!border-[#16704a] ring-2 ring-[#16704a]/20"

export function resolveArticleItemKindFilterId(
  kinds: readonly ArticleItemKind[],
): ArticleItemKindFilterId {
  if (kinds.length === 0 || kinds.length >= ARTICLE_ITEM_KINDS.length) {
    return "all"
  }
  if (kinds.length === 1) return kinds[0]
  return "all"
}

export function articleItemKindFilterToQuery(
  id: ArticleItemKindFilterId,
): ArticleItemKind[] {
  return id === "all" ? [] : [id]
}

export function ArticleItemKindToolbarFilter({
  value,
  onChange,
  className,
}: {
  value: ArticleItemKindFilterId
  onChange: (value: ArticleItemKindFilterId) => void
  className?: string
}) {
  return (
    <RootsFormSelectField
      label="Tipo"
      value={value}
      onValueChange={(next) => onChange(next as ArticleItemKindFilterId)}
      prefix={<LayoutGrid className="size-4" aria-hidden />}
      className={cn(dataWorkspaceListFiltersFieldClass(), className)}
      triggerClassName={value !== "all" ? filterTriggerActiveClass : undefined}
    >
      {FILTER_ITEMS.map((item) => (
        <RootsFormSelectItem key={item.id} value={item.id}>
          {item.label}
        </RootsFormSelectItem>
      ))}
    </RootsFormSelectField>
  )
}
