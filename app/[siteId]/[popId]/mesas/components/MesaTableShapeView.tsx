"use client"

import type { MesaTableShape } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { MesaOpenDurationLabel } from "@/app/[siteId]/[popId]/mesas/components/MesaOpenDurationLabel"
import {
  mesaTableDimensions,
  mesaStatusClass,
} from "@/app/[siteId]/[popId]/mesas/mesasTableStyles"
import { cn } from "@/lib/utils"

type Props = {
  label: string
  shape: MesaTableShape
  status: import("@/app/[siteId]/[popId]/mesas/mesasTypes").MesaTableStatus
  seats: number
  selected: boolean
  compact?: boolean
  /** ISO de apertura de sesión — muestra duración en mesas abiertas/cobrando. */
  openedAt?: string | null
}

export function MesaTableShapeView({
  label,
  shape,
  status,
  seats,
  selected,
  compact = false,
  openedAt = null,
}: Props) {
  const { width, height } = mesaTableDimensions(shape)
  const isRound = shape.kind === "round"
  const showOpenDuration =
    (status === "open" || status === "paying") && openedAt != null

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center",
        mesaStatusClass(status, selected),
        isRound ? "rounded-full" : "rounded-xl",
      )}
      style={{ width, height, minWidth: width, minHeight: height }}
    >
      <span className="text-sm font-bold tabular-nums text-white">{label}</span>
      {!compact ? (
        showOpenDuration ? (
          <MesaOpenDurationLabel
            openedAt={openedAt}
            className="mt-0.5 text-[10px] text-amber-200/90"
          />
        ) : (
          <span className="mt-0.5 text-[10px] font-medium text-white/55">
            {seats} pax
          </span>
        )
      ) : null}
    </div>
  )
}
