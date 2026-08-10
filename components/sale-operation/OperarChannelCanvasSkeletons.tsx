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
  "rounded-xl border px-3 py-3",
  "border-[color-mix(in_srgb,var(--rootsy-sombra-300)_10%,transparent)]",
  "bg-[color-mix(in_srgb,var(--rootsy-sombra-700)_12%,var(--rootsy-sombra-800))]",
)

const operarCanvasSkeletonShapeClass = cn(
  operarCanvasSkeletonPulseClass,
  "border border-[color-mix(in_srgb,var(--rootsy-sombra-300)_8%,transparent)]",
  "bg-[color-mix(in_srgb,var(--rootsy-sombra-700)_10%,var(--rootsy-sombra-800))]",
)

const MESA_TABLE_SKELETONS = [
  { left: "8%", top: "14%", width: 68, height: 68, round: true },
  { left: "34%", top: "10%", width: 96, height: 68, round: false },
  { left: "62%", top: "18%", width: 84, height: 84, round: true },
  { left: "18%", top: "46%", width: 76, height: 52, round: false },
  { left: "48%", top: "42%", width: 68, height: 68, round: true },
  { left: "72%", top: "50%", width: 120, height: 84, round: false },
  { left: "12%", top: "72%", width: 52, height: 52, round: true },
  { left: "40%", top: "68%", width: 96, height: 68, round: false },
  { left: "66%", top: "74%", width: 68, height: 68, round: true },
] as const

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

export function MesasFloorPlanSkeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando plano"
      className={cn("relative min-h-0 flex-1 overflow-hidden", className)}
      style={{ backgroundColor: MESAS_FLOOR_PLAN_CANVAS_BG }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={mesasFloorGridPatternStyle}
        aria-hidden
      />
      {MESA_TABLE_SKELETONS.map((table, index) => (
        <div
          key={index}
          aria-hidden
          className={cn(
            operarCanvasSkeletonShapeClass,
            table.round ? "rounded-full" : "rounded-xl",
          )}
          style={{
            left: table.left,
            top: table.top,
            width: table.width,
            height: table.height,
          }}
        />
      ))}
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
