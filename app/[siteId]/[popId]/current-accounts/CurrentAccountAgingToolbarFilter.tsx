"use client"

import { dataWorkspaceListFiltersFieldClass } from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { listToolbarFilterTriggerActiveClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
} from "@/components/rootsy-form"
import {
  CURRENT_ACCOUNT_AGING_FILTERS,
  type CurrentAccountAgingFilter,
} from "@/lib/currentAccounts"
import { cn } from "@/lib/utils"
import { CalendarClock } from "lucide-react"

export function CurrentAccountAgingToolbarFilter({
  value,
  onChange,
  className,
}: {
  value: CurrentAccountAgingFilter
  onChange: (value: CurrentAccountAgingFilter) => void
  className?: string
}) {
  return (
    <RootsFormSelectField
      label="Vencimiento"
      value={value}
      onValueChange={(next) => onChange(next as CurrentAccountAgingFilter)}
      prefix={<CalendarClock className="size-4" aria-hidden />}
      prefixVariant="inline"
      className={cn(dataWorkspaceListFiltersFieldClass(), className)}
      triggerClassName={
        value !== "all" ? listToolbarFilterTriggerActiveClass : undefined
      }
    >
      {CURRENT_ACCOUNT_AGING_FILTERS.map((item) => (
        <RootsFormSelectItem key={item.value} value={item.value}>
          {item.label}
        </RootsFormSelectItem>
      ))}
    </RootsFormSelectField>
  )
}
