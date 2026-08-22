"use client"

import type { MesaSalon, MesaTable } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { mesaStatusLabel } from "@/app/[siteId]/[popId]/mesas/mesasTableStyles"
import { cn } from "@/lib/utils"
import { Search, X } from "lucide-react"
import { useMemo, useState } from "react"

type Props = {
  tables: MesaTable[]
  salons?: MesaSalon[]
  selectedTableId?: string | null
  onSelect: (tableId: string) => void
  heading?: string
  compact?: boolean
  className?: string
}

function compareTableLabels(a: string, b: string): number {
  return a.localeCompare(b, "es", { numeric: true, sensitivity: "base" })
}

function TablePickerRow({
  table,
  selected,
  compact,
  onSelect,
}: {
  table: MesaTable
  selected: boolean
  compact: boolean
  onSelect: (tableId: string) => void
}) {
  return (
    <li>
      <button
        type="button"
        role="option"
        aria-selected={selected}
        onClick={() => onSelect(table.id)}
        className={cn(
          "flex w-full items-center gap-2.5 text-left text-sm transition-colors",
          compact ? "px-3 py-2" : "px-4 py-3",
          selected
            ? "bg-[color-mix(in_srgb,var(--rootsy-savia-400)_12%,transparent)]"
            : "hover:bg-[color-mix(in_srgb,var(--rootsy-sombra-700)_72%,transparent)]",
        )}
      >
        <span
          className={cn("size-2 shrink-0 rounded-full", statusDotClass(table.status))}
          aria-hidden
        />
        <span className="min-w-0 flex-1 truncate font-semibold text-[color-mix(in_srgb,var(--rootsy-bruma-50)_92%,white)]">
          Mesa {table.label}
        </span>
        <span className="shrink-0 text-xs text-[color-mix(in_srgb,var(--rootsy-sombra-300)_72%,transparent)]">
          {mesaStatusLabel(table.status)}
        </span>
      </button>
    </li>
  )
}

function statusDotClass(status: MesaTable["status"]): string {
  switch (status) {
    case "free":
      return "bg-[color-mix(in_srgb,var(--rootsy-savia-400)_92%,white)]"
    case "open":
      return "bg-[color-mix(in_srgb,var(--destructive)_88%,white)]"
    case "paying":
      return "bg-[#f59e0b]"
    case "reserved":
      return "bg-[#7c3aed]"
  }
}

export function MesasTablePickerList({
  tables,
  salons,
  selectedTableId = null,
  onSelect,
  heading = "Ir a mesa",
  compact = false,
  className,
}: Props) {
  const [query, setQuery] = useState("")

  const salonById = useMemo(
    () => new Map((salons ?? []).map((salon) => [salon.id, salon])),
    [salons],
  )

  const sortedTables = useMemo(
    () => [...tables].sort((a, b) => compareTableLabels(a.label, b.label)),
    [tables],
  )

  const filteredTables = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sortedTables
    return sortedTables.filter((table) => {
      const label = table.label.toLowerCase()
      const salonName = salonById.get(table.salonId)?.name.toLowerCase() ?? ""
      return (
        label.includes(q) ||
        `mesa ${label}`.includes(q) ||
        salonName.includes(q)
      )
    })
  }, [query, salonById, sortedTables])

  const groupedTables = useMemo(() => {
    if (!salons?.length) return null
    const groups = salons
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "es"))
      .map((salon) => ({
        salon,
        tables: filteredTables.filter((table) => table.salonId === salon.id),
      }))
      .filter((group) => group.tables.length > 0)
    const knownIds = new Set(salons.map((salon) => salon.id))
    const leftover = filteredTables.filter((table) => !knownIds.has(table.salonId))
    if (leftover.length > 0) {
      groups.push({
        salon: { id: "_otros", name: "Otros", sortOrder: Number.MAX_SAFE_INTEGER },
        tables: leftover,
      })
    }
    return groups
  }, [filteredTables, salons])

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div
        className={cn(
          "shrink-0 border-b border-[color-mix(in_srgb,var(--rootsy-sombra-500)_45%,transparent)]",
          compact ? "px-3 py-2.5" : "px-4 py-3",
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-[color-mix(in_srgb,var(--rootsy-sombra-300)_78%,transparent)]">
          {heading}
        </p>
        <label className="relative mt-2 flex items-center">
          <Search
            className="pointer-events-none absolute left-2.5 size-4 text-[color-mix(in_srgb,var(--rootsy-sombra-300)_65%,transparent)]"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Número o nombre…"
            className={cn(
              "h-9 w-full rounded-lg border pl-9 text-sm outline-none",
              query ? "pr-9" : "pr-3",
              "[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
              "[&::-webkit-search-results-button]:hidden [&::-moz-search-clear-button]:hidden",
              "border-[color-mix(in_srgb,var(--rootsy-sombra-500)_50%,transparent)]",
              "bg-[color-mix(in_srgb,var(--rootsy-sombra-800)_88%,black)]",
              "text-[color-mix(in_srgb,var(--rootsy-bruma-50)_92%,white)]",
              "placeholder:text-[color-mix(in_srgb,var(--rootsy-sombra-300)_55%,transparent)]",
              "focus-visible:border-[color-mix(in_srgb,var(--rootsy-savia-400)_55%,transparent)]",
              "focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-400)_28%,transparent)]",
            )}
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 inline-flex size-6 items-center justify-center rounded-md text-[color-mix(in_srgb,var(--rootsy-sombra-300)_72%,transparent)] hover:text-[color-mix(in_srgb,var(--rootsy-bruma-50)_88%,white)]"
              aria-label="Limpiar búsqueda"
            >
              <X className="size-3.5" strokeWidth={2.25} aria-hidden />
            </button>
          ) : null}
        </label>
      </div>

      <ul
        className={cn(
          "min-h-0 overflow-y-auto py-1",
          compact ? "max-h-56" : "flex-1",
        )}
        role="listbox"
        aria-label="Mesas del salón"
      >
        {filteredTables.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-[color-mix(in_srgb,var(--rootsy-sombra-300)_65%,transparent)]">
            No hay mesas que coincidan
          </li>
        ) : groupedTables ? (
          groupedTables.map((group) => (
            <li key={group.salon.id}>
              <p
                className={cn(
                  "sticky top-0 z-10 border-b border-[color-mix(in_srgb,var(--rootsy-sombra-500)_40%,transparent)]",
                  "bg-[color-mix(in_srgb,var(--rootsy-sombra-800)_94%,black)]",
                  "text-xs font-semibold uppercase tracking-wide",
                  "text-[color-mix(in_srgb,var(--rootsy-sombra-300)_78%,transparent)]",
                  compact ? "px-3 py-1.5" : "px-4 py-2",
                )}
              >
                {group.salon.name}
              </p>
              <ul>
                {group.tables.map((table) => (
                  <TablePickerRow
                    key={table.id}
                    table={table}
                    selected={table.id === selectedTableId}
                    compact={compact}
                    onSelect={onSelect}
                  />
                ))}
              </ul>
            </li>
          ))
        ) : (
          filteredTables.map((table) => (
            <TablePickerRow
              key={table.id}
              table={table}
              selected={table.id === selectedTableId}
              compact={compact}
              onSelect={onSelect}
            />
          ))
        )}
      </ul>
    </div>
  )
}
