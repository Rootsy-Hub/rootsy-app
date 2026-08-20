"use client"

import { MesaFloorDecorNode } from "@/app/[siteId]/[popId]/mesas/components/MesaFloorDecorNode"
import { MesasFloorGoToTable } from "@/app/[siteId]/[popId]/mesas/components/MesasFloorGoToTable"
import { MesaSessionConnectors } from "@/app/[siteId]/[popId]/mesas/components/MesaSessionConnectors"
import { MesaTableNode } from "@/app/[siteId]/[popId]/mesas/components/MesaTableNode"
import type { MesaFloorDecor, MesaTable } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { mesaTableDimensions } from "@/app/[siteId]/[popId]/mesas/mesasTableStyles"
import {
  MESAS_FLOOR_PLAN_CANVAS_BG,
  mesasFloorEditRingClass,
  mesasFloorEditRingDelayClass,
  mesasFloorEmptyTextClass,
  mesasFloorFloatingBtnActiveClass,
  mesasFloorFloatingBtnClass,
  mesasFloorFloatingBtnIdleClass,
  mesasFloorGridPatternStyle,
} from "@/app/[siteId]/[popId]/mesas/mesasOperarStyles"
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Minus, Pencil, Plus, RotateCw } from "lucide-react"
import { useCallback, useRef, useState } from "react"

/** Fondo del canvas del plano — sombra-800, alineado con catálogo operar. */
const floorPlanCanvasStyle = { backgroundColor: MESAS_FLOOR_PLAN_CANVAS_BG }

const CANVAS_WIDTH = 720
const CANVAS_HEIGHT = 520
const ZOOM_MIN = 0.6
const ZOOM_MAX = 1.8
const ZOOM_STEP = 0.15
const ZOOM_DEFAULT = 1

const floatingBtnClass = mesasFloorFloatingBtnClass

const floatingBtnIdleClass = cn(
  mesasFloorFloatingBtnIdleClass,
  "shadow-[0_8px_24px_-10px_color-mix(in_srgb,var(--rootsy-sombra-950)_65%,transparent)]",
  "backdrop-blur-sm transition-colors",
  "hover:text-[color-mix(in_srgb,var(--rootsy-bruma-50)_88%,white)]",
  "disabled:cursor-not-allowed disabled:opacity-40",
)

type Props = {
  tables: MesaTable[]
  decors: MesaFloorDecor[]
  selectedTableIds: Set<string>
  layoutEditMode: boolean
  layoutSelection: { kind: "table" | "decor"; id: string } | null
  canEditLayout?: boolean
  onToggleLayoutEdit: () => void
  onSelectTable: (tableId: string) => void
  onSelectLayoutItem: (kind: "table" | "decor", id: string) => void
  onRotateLayoutItem: () => void
  onMoveTable: (tableId: string, dx: number, dy: number) => void
  onMoveDecor: (decorId: string, dx: number, dy: number) => void
  tableOpenedAt: Record<string, string>
}

export function MesasFloorPlan({
  tables,
  decors,
  selectedTableIds,
  layoutEditMode,
  layoutSelection,
  canEditLayout = false,
  onToggleLayoutEdit,
  onSelectTable,
  onSelectLayoutItem,
  onRotateLayoutItem,
  onMoveTable,
  onMoveDecor,
  tableOpenedAt,
}: Props) {
  const [zoom, setZoom] = useState(ZOOM_DEFAULT)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollToTable = useCallback(
    (tableId: string) => {
      const container = scrollContainerRef.current
      const table = tables.find((item) => item.id === tableId)
      if (!container || !table) return

      const { width, height } = mesaTableDimensions(table.shape)
      const centerX = (table.x + width / 2) * zoom
      const centerY = (table.y + height / 2) * zoom
      const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth)
      const maxScrollTop = Math.max(0, container.scrollHeight - container.clientHeight)

      container.scrollTo({
        left: Math.min(maxScrollLeft, Math.max(0, centerX - container.clientWidth / 2)),
        top: Math.min(maxScrollTop, Math.max(0, centerY - container.clientHeight / 2)),
        behavior: "smooth",
      })
    },
    [tables, zoom],
  )

  const handleGoToTable = useCallback(
    (tableId: string) => {
      if (layoutEditMode) {
        onSelectLayoutItem("table", tableId)
      } else {
        onSelectTable(tableId)
      }
      scrollToTable(tableId)
    },
    [layoutEditMode, onSelectLayoutItem, onSelectTable, scrollToTable],
  )

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

  const handleTableSelect = useCallback(
    (id: string) => onSelectTable(id),
    [onSelectTable],
  )

  const handleTableLayoutSelect = useCallback(
    (id: string) => onSelectLayoutItem("table", id),
    [onSelectLayoutItem],
  )

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col">
      <div className="absolute top-3 right-3 z-30 flex flex-col items-center gap-2 overflow-visible">
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
          {canEditLayout ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onRotateLayoutItem}
                  disabled={!layoutEditMode || !layoutSelection}
                  className={cn(floatingBtnClass, floatingBtnIdleClass)}
                  aria-label="Rotar elemento seleccionado 45°"
                >
                  <RotateCw className="size-4" strokeWidth={2.25} aria-hidden />
                </button>
              </TooltipTrigger>
              <TooltipContent variant="dark" side="left" sideOffset={8}>
                {layoutSelection
                  ? "Rotar 45°"
                  : "Seleccioná una mesa o elemento"}
              </TooltipContent>
            </Tooltip>
          ) : null}
          <div className="relative flex size-10 shrink-0 items-center justify-center overflow-visible">
          {layoutEditMode ? (
            <>
              <span
                className={cn("mesa-floor-edit-ring absolute inset-0 rounded-full", mesasFloorEditRingClass)}
                aria-hidden
              />
              <span
                className={cn(
                  "mesa-floor-edit-ring absolute inset-0 rounded-full [animation-delay:700ms]",
                  mesasFloorEditRingDelayClass,
                )}
                aria-hidden
              />
            </>
          ) : null}
          {canEditLayout ? (
            <button
              type="button"
              onClick={onToggleLayoutEdit}
              className={cn(
                floatingBtnClass,
                layoutEditMode
                  ? cn(mesasFloorFloatingBtnActiveClass, "text-[var(--rootsy-savia-900)]")
                  : floatingBtnIdleClass,
              )}
              aria-label={
                layoutEditMode ? "Listo — salir de edición del plano" : "Editar plano"
              }
              aria-pressed={layoutEditMode}
            >
              <Pencil className="size-4" strokeWidth={2} aria-hidden />
            </button>
          ) : null}
        </div>
      </div>

      <div className="absolute bottom-3 left-3 z-30 overflow-visible">
        <MesasFloorGoToTable tables={tables} onGoTo={handleGoToTable} />
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div
          ref={scrollContainerRef}
          className="game-scroll relative h-full min-h-0 flex-1 overflow-auto"
          style={floorPlanCanvasStyle}
          role="presentation"
          aria-label="Plano del salón"
        >
          {layoutEditMode ? (
            <div
              className="pointer-events-none absolute inset-0 z-0 opacity-25"
              style={mesasFloorGridPatternStyle}
              aria-hidden
            />
          ) : null}
          <div
            className="relative z-[1] min-h-full min-w-full"
            style={{
              minHeight: "100%",
              minWidth: "100%",
            }}
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
                  width: CANVAS_WIDTH,
                  height: CANVAS_HEIGHT,
                  minWidth: CANVAS_WIDTH,
                  minHeight: CANVAS_HEIGHT,
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                }}
              >
            {[...decors]
              .sort((a, b) => Number(a.kind !== "zone") - Number(b.kind !== "zone"))
              .map((decor) => (
              <MesaFloorDecorNode
                key={decor.id}
                decor={decor}
                layoutEditMode={layoutEditMode}
                layoutSelected={
                  layoutSelection?.kind === "decor" &&
                  layoutSelection.id === decor.id
                }
                onSelectLayout={(id) => onSelectLayoutItem("decor", id)}
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
                layoutSelected={
                  layoutSelection?.kind === "table" &&
                  layoutSelection.id === table.id
                }
                layoutEditMode={layoutEditMode}
                openedAt={tableOpenedAt[table.id] ?? null}
                onSelect={handleTableSelect}
                onSelectLayout={handleTableLayoutSelect}
              />
            ))}

            {tables.length === 0 ? (
              <div className={cn("pointer-events-none absolute inset-0 flex items-center justify-center text-sm", mesasFloorEmptyTextClass)}>
                No hay mesas en este salón
              </div>
            ) : null}
              </div>
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  )
}
