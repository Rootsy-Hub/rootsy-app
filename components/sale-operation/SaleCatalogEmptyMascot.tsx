"use client"

import {
  RootsyEmptyState,
  ROOTSY_EMPTY_STATE_COPY,
} from "@/components/rootsy-empty-state"
import { cn } from "@/lib/utils"

export function getSaleCatalogEmptyMascotCopy(hasSearch: boolean) {
  const copy = hasSearch
    ? ROOTSY_EMPTY_STATE_COPY.catalog.search
    : ROOTSY_EMPTY_STATE_COPY.catalog.idle
  return {
    line1: copy.title,
    line2: copy.description,
  }
}

type Props = {
  hasSearch?: boolean
  line1?: string
  line2?: string
  className?: string
}

export function SaleCatalogEmptyMascot({
  hasSearch = false,
  line1,
  line2,
  className,
}: Props) {
  const copy = getSaleCatalogEmptyMascotCopy(hasSearch)
  const resolvedLine1 = line1 ?? copy.line1
  const resolvedLine2 = line2 ?? copy.line2

  return (
    <RootsyEmptyState
      slot="catalog"
      world="sombra"
      title={resolvedLine1}
      description={resolvedLine2}
      className={cn("h-full", className)}
    />
  )
}
