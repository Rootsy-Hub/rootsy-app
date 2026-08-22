"use client"

import type { MesaTable } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { MesasTablePickerList } from "@/app/[siteId]/[popId]/mesas/components/MesasTablePickerList"
import {
  mesasFloorFloatingBtnClass,
  mesasFloorFloatingBtnIdleClass,
} from "@/app/[siteId]/[popId]/mesas/mesasOperarStyles"
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
import { LocateFixed } from "lucide-react"
import { useState } from "react"

type Props = {
  tables: MesaTable[]
  onGoTo: (tableId: string) => void
}

export function MesasFloorGoToTable({ tables, onGoTo }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
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
        <MesasTablePickerList
          compact
          tables={tables}
          onSelect={(tableId) => {
            onGoTo(tableId)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
