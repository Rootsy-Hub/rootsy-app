"use client"

import { MesaTableShapeView } from "@/app/[siteId]/[popId]/mesas/components/MesaTableShapeView"
import { formatMesaOpenDuration } from "@/app/[siteId]/[popId]/mesas/components/MesaOpenDurationLabel"
import { formatMesaReservationCountdown } from "@/app/[siteId]/[popId]/mesas/components/MesaReservationCountdownLabel"
import { useMesaOpenDurationTick } from "@/app/[siteId]/[popId]/mesas/components/useMesaOpenDurationTick"
import type { MesasReservationSettings } from "@/app/[siteId]/[popId]/mesas/mesasReservationLogic"
import type { MesaTable } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { mesaStatusLabel } from "@/app/[siteId]/[popId]/mesas/mesasTableStyles"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import { memo } from "react"

type Props = {
  table: MesaTable
  selected: boolean
  layoutSelected: boolean
  layoutEditMode: boolean
  openedAt?: string | null
  reservationArrivalAt?: string | null
  reservationSettings?: MesasReservationSettings | null
  onSelect: (tableId: string) => void
  onSelectLayout: (tableId: string) => void
}

export const MesaTableNode = memo(function MesaTableNode({
  table,
  selected,
  layoutSelected,
  layoutEditMode,
  openedAt = null,
  reservationArrivalAt = null,
  reservationSettings = null,
  onSelect,
  onSelectLayout,
}: Props) {
  useMesaOpenDurationTick()
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: table.id,
      disabled: !layoutEditMode,
    })

  const rotation = table.rotation ?? 0

  return (
    <div
      ref={setNodeRef}
      className="absolute touch-none"
      style={{
        left: table.x,
        top: table.y,
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 50 : layoutSelected ? 45 : selected ? 20 : 1,
      }}
    >
      <button
        type="button"
        style={{
          transform: rotation ? `rotate(${rotation}deg)` : undefined,
          transformOrigin: "center center",
        }}
        className={cn(
          "relative block outline-none focus:outline-none focus-visible:outline-none",
          layoutEditMode ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
          isDragging && "opacity-90",
        )}
        aria-label={(() => {
          const status = mesaStatusLabel(table.status)
          if (openedAt) {
            return `Mesa ${table.label}, ${status}, abierta ${formatMesaOpenDuration(openedAt)}`
          }
          if (table.status === "reserved" && reservationArrivalAt && reservationSettings) {
            const countdown = formatMesaReservationCountdown(
              reservationArrivalAt,
              reservationSettings,
            )
            return countdown
              ? `Mesa ${table.label}, ${status}, ${countdown}`
              : `Mesa ${table.label}, ${status}`
          }
          return `Mesa ${table.label}, ${status}`
        })()}
        onClick={(e) => {
          e.stopPropagation()
          if (layoutEditMode) {
            onSelectLayout(table.id)
            return
          }
          onSelect(table.id)
        }}
        {...(layoutEditMode ? { ...listeners, ...attributes } : { "aria-pressed": selected })}
      >
        <MesaTableShapeView
          label={table.label}
          shape={table.shape}
          status={table.status}
          seats={table.seats}
          selected={!layoutEditMode && selected}
          layoutSelected={layoutEditMode && layoutSelected}
          uprightRotation={rotation}
          openedAt={openedAt}
          reservationArrivalAt={reservationArrivalAt}
          reservationSettings={reservationSettings}
        />
      </button>
    </div>
  )
})
