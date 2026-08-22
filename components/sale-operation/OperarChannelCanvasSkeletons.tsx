"use client"

import {
  MESAS_FLOOR_PLAN_CANVAS_BG,
  mesasFloorGridPatternStyle,
} from "@/app/[siteId]/[popId]/mesas/mesasOperarStyles"
import { mostradorBoardColumnBodyBg } from "@/app/[siteId]/[popId]/mostrador/mostradorOperarStyles"
import { OperarCanvasToolbarColumnHeaderRow } from "@/components/sale-operation/OperarCanvasToolbar"
import { operarCanvasToolbarShellClass } from "@/components/sale-operation/operarCanvasToolbarStyles"
import { cn } from "@/lib/utils"

/** Skeleton canvas oscuro — bajo contraste sobre sombra-800. */
const operarCanvasSkeletonPulseClass = "animate-pulse"

const operarCanvasSkeletonBlockClass = cn(
  operarCanvasSkeletonPulseClass,
  "bg-[color-mix(in_srgb,var(--rootsy-sombra-600)_14%,var(--rootsy-sombra-800))]",
)

const operarCanvasSkeletonShellClass = cn(
  "layouts-operar-product-card rounded-2xl border px-3 py-3",
  "border-[var(--layouts-operar-border-dark-card)]",
  "bg-[var(--rootsy-sombra-600)]",
)

const operarCanvasSkeletonShapeClass = cn(
  operarCanvasSkeletonPulseClass,
  "border border-[color-mix(in_srgb,var(--rootsy-sombra-300)_8%,transparent)]",
  "bg-[color-mix(in_srgb,var(--rootsy-sombra-700)_10%,var(--rootsy-sombra-800))]",
)

const MESA_TABLE_SKELETONS = [
  { x: 58, y: 73, width: 68, height: 68, round: true },
  { x: 245, y: 52, width: 96, height: 68, round: false },
  { x: 446, y: 94, width: 84, height: 84, round: true },
  { x: 130, y: 239, width: 76, height: 52, round: false },
  { x: 346, y: 218, width: 68, height: 68, round: true },
  { x: 518, y: 260, width: 120, height: 84, round: false },
  { x: 86, y: 374, width: 52, height: 52, round: true },
  { x: 288, y: 354, width: 96, height: 68, round: false },
  { x: 475, y: 385, width: 68, height: 68, round: true },
] as const

/** Mismas dimensiones que MesasFloorPlan — canvas lógico del plano. */
const MESAS_FLOOR_PLAN_CANVAS_WIDTH = 720
const MESAS_FLOOR_PLAN_CANVAS_HEIGHT = 520

const BOARD_COLUMN_CARD_COUNTS = [2, 1, 2] as const

function OperarCanvasToolbarHeaderSkeleton() {
  return (
    <div className={cn(operarCanvasToolbarShellClass, "min-w-0 flex-1 justify-start gap-2")}>
      <div className={cn("size-3.5 shrink-0 rounded-sm", operarCanvasSkeletonBlockClass)} aria-hidden />
      <div className={cn("h-3.5 w-[4.5rem] max-w-[45%] rounded-sm", operarCanvasSkeletonBlockClass)} aria-hidden />
      <div className={cn("ml-auto size-5 shrink-0 rounded-full", operarCanvasSkeletonBlockClass)} aria-hidden />
    </div>
  )
}

function MostradorOrderCardSkeleton() {
  return (
    <article aria-hidden className={operarCanvasSkeletonShellClass}>
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-2">
          <div className={cn("h-3.5 w-14 rounded-sm", operarCanvasSkeletonBlockClass)} />
          <div className={cn("h-3 w-20 rounded-sm", operarCanvasSkeletonBlockClass)} />
        </div>
        <div className="space-y-1.5">
          <div className={cn("h-4 w-16 rounded-full", operarCanvasSkeletonBlockClass)} />
          <div className={cn("h-4 w-14 rounded-full", operarCanvasSkeletonBlockClass)} />
        </div>
      </div>
      <div className={cn("mt-3 h-3 w-[72%] rounded-sm", operarCanvasSkeletonBlockClass)} />
      <div className={cn("mt-2 h-3 w-24 rounded-sm", operarCanvasSkeletonBlockClass)} />
    </article>
  )
}

const MESAS_LIST_SKELETON_GROUPS = [
  { rows: 4 },
  { rows: 3 },
] as const

function MesasTablePickerRowSkeleton() {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3" aria-hidden>
      <div className={cn("size-2 shrink-0 rounded-full", operarCanvasSkeletonBlockClass)} />
      <div className={cn("h-3.5 w-24 rounded-sm", operarCanvasSkeletonBlockClass)} />
      <div className={cn("ml-auto h-3 w-14 rounded-sm", operarCanvasSkeletonBlockClass)} />
    </div>
  )
}

/** Lista de mesas mobile — no usa el plano. */
export function MesasTablePickerListSkeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando mesas"
      className={cn("flex min-h-0 flex-1 flex-col", className)}
    >
      <div className="shrink-0 border-b border-[color-mix(in_srgb,var(--rootsy-sombra-500)_45%,transparent)] px-4 py-3">
        <div className={cn("h-3 w-14 rounded-sm", operarCanvasSkeletonBlockClass)} aria-hidden />
        <div
          className={cn("mt-2 h-9 w-full rounded-lg", operarCanvasSkeletonBlockClass)}
          aria-hidden
        />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden py-1">
        {MESAS_LIST_SKELETON_GROUPS.map((group, groupIndex) => (
          <div key={groupIndex}>
            <div
              className={cn(
                "h-8 border-b border-[color-mix(in_srgb,var(--rootsy-sombra-500)_40%,transparent)] px-4",
                "flex items-center",
              )}
            >
              <div className={cn("h-3 w-20 rounded-sm", operarCanvasSkeletonBlockClass)} aria-hidden />
            </div>
            {Array.from({ length: group.rows }, (_, rowIndex) => (
              <MesasTablePickerRowSkeleton key={rowIndex} />
            ))}
          </div>
        ))}
      </div>
      <span className="sr-only">Cargando mesas…</span>
    </div>
  )
}

export function MesasFloorPlanSkeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando plano"
      className={cn(
        "relative h-full min-h-0 w-full flex-1 overflow-hidden",
        className,
      )}
      style={{ backgroundColor: MESAS_FLOOR_PLAN_CANVAS_BG }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={mesasFloorGridPatternStyle}
        aria-hidden
      />

      <div
        className="absolute top-3 right-3 z-30 flex flex-col items-center gap-2"
        aria-hidden
      >
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className={cn("size-10 rounded-full", operarCanvasSkeletonShapeClass)}
          />
        ))}
      </div>

      <div
        className="absolute left-0 top-0"
        style={{
          width: MESAS_FLOOR_PLAN_CANVAS_WIDTH,
          height: MESAS_FLOOR_PLAN_CANVAS_HEIGHT,
        }}
      >
        {MESA_TABLE_SKELETONS.map((table, index) => (
          <div
            key={index}
            aria-hidden
            className={cn(
              "absolute",
              operarCanvasSkeletonShapeClass,
              table.round ? "rounded-full" : "rounded-xl",
            )}
            style={{
              left: table.x,
              top: table.y,
              width: table.width,
              height: table.height,
            }}
          />
        ))}
      </div>

      <span className="sr-only">Cargando plano…</span>
    </div>
  )
}

export function MostradorBoardSkeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando pedidos"
      className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", className)}
    >
      <OperarCanvasToolbarColumnHeaderRow>
        {BOARD_COLUMN_CARD_COUNTS.map((_, index) => (
          <OperarCanvasToolbarHeaderSkeleton key={index} />
        ))}
      </OperarCanvasToolbarColumnHeaderRow>

      <div
        className={cn(
          "grid min-h-0 flex-1 grid-cols-3 overflow-hidden",
          "divide-x divide-[var(--layouts-operar-border-dark-hairline)]",
        )}
      >
        {BOARD_COLUMN_CARD_COUNTS.map((cardCount, columnIndex) => (
          <div
            key={columnIndex}
            className="min-h-0 overflow-hidden p-2"
            style={{ backgroundColor: mostradorBoardColumnBodyBg }}
          >
            <div className="flex flex-col gap-2">
              {Array.from({ length: cardCount }, (_, cardIndex) => (
                <MostradorOrderCardSkeleton key={cardIndex} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <span className="sr-only">Cargando pedidos…</span>
    </div>
  )
}
