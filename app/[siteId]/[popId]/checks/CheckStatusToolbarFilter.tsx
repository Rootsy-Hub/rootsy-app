"use client"

import { dataWorkspaceListFiltersFieldClass } from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { listToolbarFilterTriggerActiveClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
} from "@/components/rootsy-form"
import { CHECK_STATUSES, type CheckStatus } from "@/lib/checkDocuments"
import { cn } from "@/lib/utils"
import { CircleDot } from "lucide-react"

export type CheckStatusFilterId = "all" | CheckStatus

export function resolveCheckStatusFilterId(
  status: CheckStatus | "",
): CheckStatusFilterId {
  return status === "" ? "all" : status
}

export function checkStatusFilterToQuery(
  id: CheckStatusFilterId,
): CheckStatus | "" {
  return id === "all" ? "" : id
}

export function CheckStatusToolbarFilter({
  value,
  onChange,
  className,
}: {
  value: CheckStatusFilterId
  onChange: (value: CheckStatusFilterId) => void
  className?: string
}) {
  return (
    <RootsFormSelectField
      label="Estado"
      value={value}
      onValueChange={(next) => onChange(next as CheckStatusFilterId)}
      prefix={<CircleDot className="size-4" aria-hidden />}
      prefixVariant="inline"
      className={cn(dataWorkspaceListFiltersFieldClass(), className)}
      triggerClassName={
        value !== "all" ? listToolbarFilterTriggerActiveClass : undefined
      }
    >
      <RootsFormSelectItem value="all">Todos</RootsFormSelectItem>
      {CHECK_STATUSES.map((item) => (
        <RootsFormSelectItem key={item.value} value={item.value}>
          {item.label}
        </RootsFormSelectItem>
      ))}
    </RootsFormSelectField>
  )
}
