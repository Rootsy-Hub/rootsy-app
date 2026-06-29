"use client"

import {
  floorPlanSurfaceStyle,
  MESAS_FLOOR_PLAN_BG,
  MesaFloorDecorNode,
} from "@/app/[siteId]/[popId]/mesas/components/MesaFloorDecorNode"
import { MesaSessionConnectors } from "@/app/[siteId]/[popId]/mesas/components/MesaSessionConnectors"
import { MesaTableNode } from "@/app/[siteId]/[popId]/mesas/components/MesaTableNode"
import type { MesaFloorDecor, MesaTable } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { cn } from "@/lib/utils"
import { Minus, Pencil, Plus } from "lucide-react"
import { useCallback, useState } from "react"

/** Fondo del canvas del plano (más oscuro que la barra superior y tabs). */
const floorPlanCanvasStyle = { backgroundColor: MESAS_FLOOR_PLAN_BG }

const CANVAS_WIDTH = 720
const CANVAS_HEIGHT = 520
const ZOOM_MIN = 0.6
const ZOOM_MAX = 1.8
const ZOOM_STEP = 0.15
const ZOOM_DEFAULT = 1

const floatingBtnClass =
  "flex size-10 items-center justify-center rounded-full border shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#181c22]"

const floatingBtnIdleClass =
  "border-white/15 bg-[#252b34]/95 text-white/80 backdrop-blur-sm hover:border-white/25 hover:bg-[#2a323c] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"

type Props = {
  tables: MesaTable[]
  decors: MesaFloorDecor[]
  selectedTableIds: Set<string>
  layoutEditMode: boolean
  onToggleLayoutEdit: () => void
  onSelectTable: (tableId: string) => void
  onMoveTable: (tableId: string, dx: number, dy: number) => void
  onMoveDecor: (decorId: string, dx: number, dy: number) => void
  tableOpenedAt: Record<string, string>
}

export function MesasFloorPlan({
  tables,
  decors,
  selectedTableIds,
  layoutEditMode,
  onToggleLayoutEdit,
  onSelectTable,
  onMoveTable,
  onMoveDecor,
  tableOpenedAt,
}: Props) {
  const [zoom, setZoom] = useState(ZOOM_DEFAULT)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(ZOOM_MIN, Math.round((z - ZOOM_STEP) * 100) / 100))
  }, [])

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(ZOOM_MAX, Math.round((z + ZOOM_STEP) * 100) / 100))
  }, [])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event
    if (!delta.x && !delta.y) return
    const id = String(active.id)
    const dx = delta.x / zoom
    const dy = delta.y / zoom
    if (decors.some((d) => d.id === id)) {
      onMoveDecor(id, dx, dy)
    } else {
      onMoveTable(id, dx, dy)
    }
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="absolute top-3 right-3 z-30 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={zoomIn}
          disabled={zoom >= ZOOM_MAX}
          className={cn(floatingBtnClass, floatingBtnIdleClass)}
          aria-label="Acercar plano"
        >
          <Plus className="size-4" strokeWidth={2.5} aria-hidden />
        </button>
        <button
          type="button"
          onClick={zoomOut}
          disabled={zoom <= ZOOM_MIN}
          className={cn(floatingBtnClass, floatingBtnIdleClass)}
          aria-label="Alejar plano"
        >
          <Minus className="size-4" strokeWidth={2.5} aria-hidden />
        </button>
        <button
          type="button"
          onClick={onToggleLayoutEdit}
          className={cn(
            floatingBtnClass,
            layoutEditMode
              ? "border-emerald-400/50 bg-emerald-500 text-emerald-950 shadow-emerald-500/25"
              : floatingBtnIdleClass,
          )}
          aria-label={
            layoutEditMode ? "Listo — salir de edición del plano" : "Editar plano"
          }
          aria-pressed={layoutEditMode}
        >
          <Pencil className="size-4" strokeWidth={2} aria-hidden />
        </button>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div
          className="game-scroll relative min-h-0 flex-1 overflow-auto"
          style={floorPlanCanvasStyle}
          role="presentation"
          aria-label="Plano del salón"
        >
          <div
            style={{
              width: CANVAS_WIDTH * zoom,
              height: CANVAS_HEIGHT * zoom,
            }}
          >
            <div
              className="relative"
              style={{
                ...floorPlanSurfaceStyle,
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                minWidth: CANVAS_WIDTH,
                minHeight: CANVAS_HEIGHT,
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
              }}
            >
            {decors.map((decor) => (
              <MesaFloorDecorNode
                key={decor.id}
                decor={decor}
                layoutEditMode={layoutEditMode}
              />
            ))}

            <MesaSessionConnectors
              tables={tables}
              selectedTableIds={selectedTableIds}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
            />

            {tables.map((table) => (
              <MesaTableNode
                key={table.id}
                table={table}
                selected={selectedTableIds.has(table.id)}
                layoutEditMode={layoutEditMode}
                openedAt={tableOpenedAt[table.id] ?? null}
                onSelect={(id) => onSelectTable(id)}
              />
            ))}

            {tables.length === 0 ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-white/40">
                No hay mesas en este salón
              </div>
            ) : null}
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  )
}
