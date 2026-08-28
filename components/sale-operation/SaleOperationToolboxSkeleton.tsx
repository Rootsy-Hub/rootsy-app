"use client"

import {
  layoutsOperarToolboxBandClass,
  layoutsOperarToolboxBarGrid3Class,
} from "@/app/library/layouts/layoutsOperarStyles"
import { LayoutsOperarToolboxFloor } from "@/components/layouts-module/LayoutsOperarToolboxFloor"
import { cn } from "@/lib/utils"
import { Banknote, Receipt, User } from "lucide-react"

const SLOTS = [
  { id: "cliente", Icon: User },
  { id: "comprobante", Icon: Receipt },
  { id: "pago", Icon: Banknote },
] as const

function ghostStyle(embedded: boolean) {
  return {
    background: embedded ? "var(--rootsy-sombra-700)" : "var(--rootsy-bruma-200)",
  }
}

const slotClass = cn(
  "layouts-operar-earth-slot",
  "pointer-events-none flex h-full w-full min-w-0 items-center gap-3 rounded-none px-4 py-0 text-left",
)

type Props = {
  embedded?: boolean
  className?: string
}

export function SaleOperationToolboxSkeleton({
  embedded = false,
  className,
}: Props) {
  const band = (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando configuración de la operación"
      className={cn(
        layoutsOperarToolboxBandClass,
        layoutsOperarToolboxBarGrid3Class,
        embedded && "h-full divide-[var(--rootsy-sombra-800)]",
        className,
      )}
    >
      {SLOTS.map(({ id, Icon }) => (
        <div key={id} className={slotClass}>
          <span className="layouts-operar-earth-slot-icon flex size-9 shrink-0 items-center justify-center">
            <Icon className="size-5 opacity-40" aria-hidden />
          </span>
          <span className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
            <span
              className="h-2 w-14 max-w-full animate-pulse rounded-sm"
              style={ghostStyle(embedded)}
            />
            <span
              className="h-3.5 w-[7.5rem] max-w-full animate-pulse rounded-sm"
              style={ghostStyle(embedded)}
            />
          </span>
        </div>
      ))}
      <span className="sr-only">Cargando toolbox…</span>
    </div>
  )

  if (embedded) return band

  return <LayoutsOperarToolboxFloor className={className}>{band}</LayoutsOperarToolboxFloor>
}
