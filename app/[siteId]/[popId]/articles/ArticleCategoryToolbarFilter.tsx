"use client"

import { dataWorkspaceListFiltersFieldClass } from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { listToolbarFilterTriggerActiveClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
} from "@/components/rootsy-form"
import { cn } from "@/lib/utils"
import { FolderTree } from "lucide-react"
import { useMemo } from "react"

const ALL_VALUE = "all"

export type ArticleCategoryToolbarOption = {
  id: string
  name: string
}

export function ArticleCategoryToolbarFilter({
  value,
  onChange,
  categories,
  loading = false,
  fallbackLabel,
  className,
}: {
  value: string
  onChange: (categoryId: string) => void
  categories: ArticleCategoryToolbarOption[]
  loading?: boolean
  fallbackLabel?: string
  className?: string
}) {
  const selectedId = value.trim()
  const options = useMemo(() => {
    if (selectedId && !categories.some((category) => category.id === selectedId)) {
      return [
        { id: selectedId, name: fallbackLabel?.trim() || "Categoría seleccionada" },
        ...categories,
      ]
    }
    return categories
  }, [categories, fallbackLabel, selectedId])

  return (
    <RootsFormSelectField
      label="Categoría"
      value={selectedId || ALL_VALUE}
      onValueChange={(next) => onChange(next === ALL_VALUE ? "" : next)}
      prefix={<FolderTree className="size-4" aria-hidden />}
      prefixVariant="inline"
      className={cn(dataWorkspaceListFiltersFieldClass(), className)}
      triggerClassName={
        selectedId ? listToolbarFilterTriggerActiveClass : undefined
      }
      disabled={loading && options.length === 0}
      placeholder={loading ? "Cargando…" : "Todas"}
      valueLabel={loading && options.length === 0 ? "Cargando…" : undefined}
    >
      <RootsFormSelectItem value={ALL_VALUE}>Todas</RootsFormSelectItem>
      {options.map((item) => (
        <RootsFormSelectItem key={item.id} value={item.id}>
          {item.name || "—"}
        </RootsFormSelectItem>
      ))}
    </RootsFormSelectField>
  )
}
