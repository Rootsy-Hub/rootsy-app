"use client"

import type { MesaTable } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import {
  mesasFloorFloatingBtnClass,
  mesasFloorFloatingBtnIdleClass,
} from "@/app/[siteId]/[popId]/mesas/mesasOperarStyles"
import { mesaStatusLabel } from "@/app/[siteId]/[popId]/mesas/mesasTableStyles"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { LocateFixed, Search } from "lucide-react"
import { useMemo, useState } from "react"

type Props = {
  tables: MesaTable[]
  onGoTo: (tableId: string) => void
}

function compareTableLabels(a: string, b: string): number {
  return a.localeCompare(b, "es", { numeric: true, sensitivity: "base" })
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

export function MesasFloorGoToTable({ tables, onGoTo }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const sortedTables = useMemo(
    () => [...tables].sort((a, b) => compareTableLabels(a.label, b.label)),
    [tables],
  )

  const filteredTables = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sortedTables
    return sortedTables.filter((table) => {
      const label = table.label.toLowerCase()
      return label.includes(q) || `mesa ${label}`.includes(q)
    })
  }, [query, sortedTables])

  const pickTable = (tableId: string) => {
    onGoTo(tableId)
    setOpen(false)
    setQuery("")
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery("")
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                mesasFloorFloatingBtnClass,
                mesasFloorFloatingBtnIdleClass,
                "shadow-[0_8px_24px_-10px_color-mix(in_srgb,var(--rootsy-sombra-950)_65%,transparent)]",
                "backdrop-blur-sm transition-colors",
                "hover:text-[color-mix(in_srgb,var(--rootsy-bruma-50)_88%,white)]",
                open &&
                  "bg-[color-mix(in_srgb,var(--rootsy-savia-400)_18%,var(--rootsy-sombra-800))] text-[color-mix(in_srgb,var(--rootsy-savia-200)_92%,white)]",
              )}
              aria-label="Ir a una mesa"
            >
              <LocateFixed className="size-4" strokeWidth={2.25} aria-hidden />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent variant="dark" side="right" sideOffset={8}>
          Ir a mesa
        </TooltipContent>
      </Tooltip>

      <PopoverContent
        side="top"
        align="start"
        sideOffset={10}
        className={cn(
          "w-[min(18rem,calc(100vw-2rem))] border p-0 shadow-xl",
          "border-[color-mix(in_srgb,var(--rootsy-sombra-500)_55%,transparent)]",
          "bg-[color-mix(in_srgb,var(--rootsy-sombra-900)_96%,black)]",
          "text-[color-mix(in_srgb,var(--rootsy-bruma-50)_92%,white)]",
        )}
      >
        <div className="border-b border-[color-mix(in_srgb,var(--rootsy-sombra-500)_45%,transparent)] px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[color-mix(in_srgb,var(--rootsy-sombra-300)_78%,transparent)]">
            Ir a mesa
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
              autoFocus
              className={cn(
                "h-9 w-full rounded-lg border pl-9 pr-3 text-sm outline-none",
                "border-[color-mix(in_srgb,var(--rootsy-sombra-500)_50%,transparent)]",
                "bg-[color-mix(in_srgb,var(--rootsy-sombra-800)_88%,black)]",
                "text-[color-mix(in_srgb,var(--rootsy-bruma-50)_92%,white)]",
                "placeholder:text-[color-mix(in_srgb,var(--rootsy-sombra-300)_55%,transparent)]",
                "focus-visible:border-[color-mix(in_srgb,var(--rootsy-savia-400)_55%,transparent)]",
                "focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-400)_28%,transparent)]",
              )}
            />
          </label>
        </div>

        <ul
          className="max-h-56 overflow-y-auto py-1"
          role="listbox"
          aria-label="Mesas del salón"
        >
          {filteredTables.length === 0 ? (
            <li className="px-3 py-4 text-center text-sm text-[color-mix(in_srgb,var(--rootsy-sombra-300)_65%,transparent)]">
              No hay mesas que coincidan
            </li>
          ) : (
            filteredTables.map((table) => (
              <li key={table.id}>
                <button
                  type="button"
                  role="option"
                  onClick={() => pickTable(table.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors",
                    "hover:bg-[color-mix(in_srgb,var(--rootsy-sombra-700)_72%,transparent)]",
                  )}
                >
                  <span
                    className={cn("size-2 shrink-0 rounded-full", statusDotClass(table.status))}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate font-semibold">
                    Mesa {table.label}
                  </span>
                  <span className="shrink-0 text-xs text-[color-mix(in_srgb,var(--rootsy-sombra-300)_72%,transparent)]">
                    {mesaStatusLabel(table.status)}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
