"use client"

import { dataWorkspaceListFiltersFieldClass } from "@/components/data-workspace/dataWorkspaceTablesLayout"
import {
  RootsFormSegmentField,
  type RootsFormSegmentOption,
} from "@/components/rootsy-form"
import { cn } from "@/lib/utils"

export type CurrentAccountPartyView = "open" | "ledger"

const VIEW_OPTIONS: RootsFormSegmentOption[] = [
  { value: "open", label: "Abiertos" },
  { value: "ledger", label: "Extracto" },
]

export function CurrentAccountViewToolbarFilter({
  value,
  onChange,
  className,
}: {
  value: CurrentAccountPartyView
  onChange: (value: CurrentAccountPartyView) => void
  className?: string
}) {
  return (
    <RootsFormSegmentField
      label="Vista"
      value={value}
      onValueChange={(next) => onChange(next as CurrentAccountPartyView)}
      options={VIEW_OPTIONS}
      layout="inline"
      className={cn(dataWorkspaceListFiltersFieldClass(), className)}
    />
  )
}
