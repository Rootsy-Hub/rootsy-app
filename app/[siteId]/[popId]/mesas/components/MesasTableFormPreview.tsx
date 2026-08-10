"use client"

import { MesaTableShapeView } from "@/app/[siteId]/[popId]/mesas/components/MesaTableShapeView"
import type { MesaTableShape } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { MESAS_FLOOR_PLAN_SURFACE_BG } from "@/app/[siteId]/[popId]/mesas/mesasOperarStyles"
import {
  mesaShapeLabel,
  mesaTableDimensions,
} from "@/app/[siteId]/[popId]/mesas/mesasTableStyles"

export function MesasTableFormPreview({
  label,
  shape,
  seats,
}: {
  label: string
  shape: MesaTableShape
  seats: number
}) {
  const { width, height } = mesaTableDimensions(shape)
  const displayLabel = label.trim() || "—"

  return (
    <div className="flex flex-col gap-2">
      <p className="font-canopy text-xs font-medium uppercase tracking-wider text-[var(--rootsy-bruma-500)]">
        Vista previa
      </p>
      <div
        className="relative flex min-h-[168px] items-center justify-center overflow-hidden rounded-xl border border-[var(--rootsy-bruma-200)]"
        style={{ backgroundColor: MESAS_FLOOR_PLAN_SURFACE_BG }}
        aria-hidden
      >
        <MesaTableShapeView
          label={displayLabel}
          shape={shape}
          status="free"
          seats={Math.max(1, seats)}
          selected={false}
        />
      </div>
      <p className="text-center font-canopy text-xs leading-relaxed text-[var(--rootsy-bruma-500)]">
        {mesaShapeLabel(shape)}
        <span className="mx-1.5 text-[var(--rootsy-bruma-300)]">·</span>
        {width}×{height} px
      </p>
    </div>
  )
}
