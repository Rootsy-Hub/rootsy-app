"use client"

import { dataWorkspaceListFiltersFieldClass } from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { listToolbarFilterTriggerActiveClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
} from "@/components/rootsy-form"
import {
  CHECK_DIRECTIONS,
  type CheckDirection,
} from "@/lib/checkDocuments"
import { cn } from "@/lib/utils"
import { ArrowLeftRight } from "lucide-react"

export type CheckDirectionFilterId = "all" | CheckDirection

export function resolveCheckDirectionFilterId(
  direction: CheckDirection | "",
): CheckDirectionFilterId {
  return direction === "" ? "all" : direction
}

export function checkDirectionFilterToQuery(
  id: CheckDirectionFilterId,
): CheckDirection | "" {
  return id === "all" ? "" : id
}

export function CheckDirectionToolbarFilter({
  value,
  onChange,
  className,
}: {
  value: CheckDirectionFilterId
  onChange: (value: CheckDirectionFilterId) => void
  className?: string
}) {
  return (
    <RootsFormSelectField
      label="Dirección"
      value={value}
      onValueChange={(next) => onChange(next as CheckDirectionFilterId)}
      prefix={<ArrowLeftRight className="size-4" aria-hidden />}
      prefixVariant="inline"
      className={cn(dataWorkspaceListFiltersFieldClass(), className)}
      triggerClassName={
        value !== "all" ? listToolbarFilterTriggerActiveClass : undefined
      }
    >
      <RootsFormSelectItem value="all">Todos</RootsFormSelectItem>
      {CHECK_DIRECTIONS.map((item) => (
        <RootsFormSelectItem key={item.value} value={item.value}>
          {item.label}
        </RootsFormSelectItem>
      ))}
    </RootsFormSelectField>
  )
}
