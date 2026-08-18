"use client"

import { dataWorkspaceListFiltersFieldClass } from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { listToolbarFilterTriggerActiveClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
} from "@/components/rootsy-form"
import {
  CURRENT_ACCOUNT_DIRECTIONS,
  type CurrentAccountDirection,
} from "@/lib/currentAccounts"
import { cn } from "@/lib/utils"
import { ArrowLeftRight } from "lucide-react"

export function CurrentAccountDirectionToolbarFilter({
  value,
  onChange,
  className,
}: {
  value: CurrentAccountDirection
  onChange: (value: CurrentAccountDirection) => void
  className?: string
}) {
  return (
    <RootsFormSelectField
      label="Cuenta"
      value={value}
      onValueChange={(next) => onChange(next as CurrentAccountDirection)}
      prefix={<ArrowLeftRight className="size-4" aria-hidden />}
      prefixVariant="inline"
      className={cn(dataWorkspaceListFiltersFieldClass(), className)}
      triggerClassName={listToolbarFilterTriggerActiveClass}
    >
      {CURRENT_ACCOUNT_DIRECTIONS.map((item) => (
        <RootsFormSelectItem key={item.value} value={item.value}>
          {item.label}
        </RootsFormSelectItem>
      ))}
    </RootsFormSelectField>
  )
}
