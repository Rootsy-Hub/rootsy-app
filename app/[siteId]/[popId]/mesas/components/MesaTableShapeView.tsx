"use client"

import type { MesaTableShape } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { MesaOpenDurationLabel } from "@/app/[siteId]/[popId]/mesas/components/MesaOpenDurationLabel"
import {
  mesaTableDimensions,
  mesaTableHighlightClass,
  mesaStatusClass,
} from "@/app/[siteId]/[popId]/mesas/mesasTableStyles"
import {
  mesasTableDurationClass,
  mesasTableLabelClass,
  mesasTableMetaClass,
} from "@/app/[siteId]/[popId]/mesas/mesasOperarStyles"
import { cn } from "@/lib/utils"

type Props = {
  label: string
  shape: MesaTableShape
  status: import("@/app/[siteId]/[popId]/mesas/mesasTypes").MesaTableStatus
  seats: number
  selected: boolean
  layoutSelected?: boolean
  /** Grados de la mesa en el plano; el contenido se contra-rota para quedar legible. */
  uprightRotation?: number
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
  layoutSelected = false,
  uprightRotation = 0,
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
        mesaStatusClass(status),
        mesaTableHighlightClass({ selected, layoutSelected }),
        isRound ? "rounded-full" : "rounded-xl",
      )}
      style={{ width, height, minWidth: width, minHeight: height }}
    >
      <div
        className="flex flex-col items-center justify-center"
        style={
          uprightRotation
            ? { transform: `rotate(${-uprightRotation}deg)` }
            : undefined
        }
      >
        <span className={cn("text-sm font-bold tabular-nums", mesasTableLabelClass)}>{label}</span>
        {!compact ? (
          showOpenDuration ? (
            <MesaOpenDurationLabel
              openedAt={openedAt}
              className={cn("mt-0.5 text-[10px]", mesasTableDurationClass)}
            />
          ) : (
            <span className={cn("mt-0.5 text-[10px] font-medium", mesasTableMetaClass)}>
              {seats} pax
            </span>
          )
        ) : null}
      </div>
    </div>
  )
}
