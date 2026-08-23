"use client"

import {
  layoutsOperarToolboxBandClass,
  layoutsOperarToolboxBarGridClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { LayoutsOperarToolboxFloor } from "@/components/layouts-module/LayoutsOperarToolboxFloor"
import { cn } from "@/lib/utils"
import { Banknote, Percent, Receipt, User } from "lucide-react"

const SLOTS = [
  { id: "cliente", Icon: User },
  { id: "comprobante", Icon: Receipt },
  { id: "pago", Icon: Banknote },
  { id: "descuento", Icon: Percent },
] as const

const ghostStyle = {
  background: "var(--rootsy-sombra-700)",
}

const slotClass = cn(
  "layouts-operar-earth-slot",
  "pointer-events-none flex h-full w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left sm:gap-3 sm:px-3",
  "min-h-[var(--layouts-operar-toolbox-slot-min-h)] sm:min-h-[var(--layouts-operar-toolbox-slot-min-h-sm)]",
)

export function SaleOperationToolboxSkeleton() {
  return (
    <LayoutsOperarToolboxFloor>
      <div
        role="status"
        aria-busy="true"
        aria-label="Cargando configuración de la operación"
        className={cn(layoutsOperarToolboxBandClass, layoutsOperarToolboxBarGridClass)}
      >
        {SLOTS.map(({ id, Icon }) => (
          <div key={id} className={slotClass}>
            <span className="layouts-operar-earth-slot-icon flex size-10 shrink-0 items-center justify-center rounded-lg">
              <Icon className="size-5 opacity-40" aria-hidden />
            </span>
            <span className="min-w-0 flex-1 space-y-1.5">
              <span
                className="block h-2.5 w-14 animate-pulse rounded-sm"
                style={ghostStyle}
              />
              <span
                className="block h-3.5 w-24 animate-pulse rounded-sm"
                style={ghostStyle}
              />
            </span>
          </div>
        ))}
        <span className="sr-only">Cargando toolbox…</span>
      </div>
    </LayoutsOperarToolboxFloor>
  )
}
