"use client"

import { MesaTableShapeView } from "@/app/[siteId]/[popId]/mesas/components/MesaTableShapeView"
import { formatMesaOpenDuration } from "@/app/[siteId]/[popId]/mesas/components/MesaOpenDurationLabel"
import type { MesaTable } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { mesaStatusLabel } from "@/app/[siteId]/[popId]/mesas/mesasTableStyles"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"

type Props = {
  table: MesaTable
  selected: boolean
  layoutEditMode: boolean
  openedAt?: string | null
  onSelect: (tableId: string) => void
}

export function MesaTableNode({
  table,
  selected,
  layoutEditMode,
  openedAt = null,
  onSelect,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: table.id,
      disabled: !layoutEditMode,
    })

  const style = {
    left: table.x,
    top: table.y,
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : selected ? 20 : 1,
  }

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      className={cn(
        "absolute touch-none",
        layoutEditMode ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        isDragging && "opacity-90",
      )}
      aria-label={
        openedAt
          ? `Mesa ${table.label}, ${mesaStatusLabel(table.status)}, abierta ${formatMesaOpenDuration(openedAt)}`
          : `Mesa ${table.label}, ${mesaStatusLabel(table.status)}`
      }
      onClick={(e) => {
        e.stopPropagation()
        if (!layoutEditMode) onSelect(table.id)
      }}
      {...(layoutEditMode ? { ...listeners, ...attributes } : { "aria-pressed": selected })}
    >
      <MesaTableShapeView
        label={table.label}
        shape={table.shape}
        status={table.status}
        seats={table.seats}
        selected={selected}
        openedAt={openedAt}
      />
    </button>
  )
}
