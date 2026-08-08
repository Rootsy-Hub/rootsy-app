"use client"

import { dataWorkspaceListFiltersFieldClass } from "@/components/data-workspace/dataWorkspaceTablesLayout"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
} from "@/components/rootsy-form"
import { lightToolbarPanelClass, listToolbarFilterTriggerActiveClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import { PROMOTION_TYPE_LABEL, type PromotionType } from "@/lib/promotionTypes"
import { cn } from "@/lib/utils"
import { Tags } from "lucide-react"

export type PromotionTypeFilterId = "all" | PromotionType

const FILTER_ITEMS: { id: PromotionTypeFilterId; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "combo", label: PROMOTION_TYPE_LABEL.combo },
  { id: "quantity_deal", label: PROMOTION_TYPE_LABEL.quantity_deal },
]

export function resolvePromotionTypeFilterId(
  type: PromotionType | "",
): PromotionTypeFilterId {
  return type === "" ? "all" : type
}

export function promotionTypeFilterToQuery(
  id: PromotionTypeFilterId,
): PromotionType | "" {
  return id === "all" ? "" : id
}

export function PromotionTypeToolbarFilter({
  value,
  onChange,
  className,
  variant = "layout",
}: {
  value: PromotionTypeFilterId
  onChange: (value: PromotionTypeFilterId) => void
  className?: string
  variant?: "panel" | "layout"
}) {
  return (
    <RootsFormSelectField
      label="Tipo"
      value={value}
      onValueChange={(next) => onChange(next as PromotionTypeFilterId)}
      prefix={<Tags className="size-4" aria-hidden />}
      prefixVariant="inline"
      className={cn(
        variant === "layout"
          ? dataWorkspaceListFiltersFieldClass()
          : lightToolbarPanelClass,
        className,
      )}
      triggerClassName={value !== "all" ? listToolbarFilterTriggerActiveClass : undefined}
    >
      {FILTER_ITEMS.map((item) => (
        <RootsFormSelectItem key={item.id} value={item.id}>
          {item.label}
        </RootsFormSelectItem>
      ))}
    </RootsFormSelectField>
  )
}
