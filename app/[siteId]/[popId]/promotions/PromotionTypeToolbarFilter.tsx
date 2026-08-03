"use client"

import {
  lightToolbarControlClass,
  lightToolbarDropdownContentClass,
  lightToolbarDropdownItemClass,
  lightToolbarDropdownLabelClass,
  lightToolbarFocusClass,
  lightToolbarPanelClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspaceToolbarFieldLabel } from "@/components/data-workspace/DataWorkspaceToolbarFieldLabel"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PROMOTION_TYPE_LABEL, type PromotionType } from "@/lib/promotionTypes"
import { cn } from "@/lib/utils"
import { Check, ChevronDown, Tags } from "lucide-react"
import { useId, useMemo } from "react"

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
}: {
  value: PromotionTypeFilterId
  onChange: (value: PromotionTypeFilterId) => void
  className?: string
}) {
  const labelId = useId()
  const triggerId = useId()

  const displayLabel = useMemo(
    () => FILTER_ITEMS.find((item) => item.id === value)?.label ?? "Todos",
    [value],
  )

  return (
    <div className={cn(lightToolbarPanelClass, className)}>
      <DataWorkspaceToolbarFieldLabel id={labelId} label="Tipo" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            id={triggerId}
            type="button"
            variant="outline"
            className={cn(
              lightToolbarControlClass,
              "justify-between gap-2 px-3 font-normal shadow-xs",
              lightToolbarFocusClass,
              value !== "all" && "border-primary/35 bg-primary/10",
            )}
            aria-haspopup="menu"
            aria-labelledby={labelId}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
              <Tags
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate text-left text-sm text-foreground">
                {displayLabel}
              </span>
            </span>
            <ChevronDown
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={6}
          className={lightToolbarDropdownContentClass}
        >
          <DropdownMenuLabel className={lightToolbarDropdownLabelClass}>
            Tipo de promoción
          </DropdownMenuLabel>
          {FILTER_ITEMS.map((item) => {
            const selected = value === item.id
            return (
              <DropdownMenuItem
                key={item.id}
                className={lightToolbarDropdownItemClass}
                onClick={() => onChange(item.id)}
              >
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {selected ? (
                  <Check className="size-4 shrink-0 text-primary" aria-hidden />
                ) : null}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
