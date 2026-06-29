"use client"

import type { CSSProperties } from "react"
import type {
  MesaFloorDecor,
  MesaFloorDecorKind,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import { DoorOpen, Leaf, TreePine, Wine } from "lucide-react"

/** Un poco más oscuro que el panel lateral genérico (#20262e). */
export const MESAS_FLOOR_PLAN_BG = "#181c22"

const decorAriaLabel: Record<MesaFloorDecorKind, string> = {
  wall_h: "Pared divisoria",
  wall_v: "Pared divisoria",
  plant: "Planta decorativa",
  planter: "Macetero",
  pillar: "Columna",
  bar: "Barra",
  entrance: "Ingreso",
}

function WallBlock({ decor }: { decor: MesaFloorDecor }) {
  const isVertical = decor.kind === "wall_v"
  return (
    <div
      className={cn(
        "relative size-full rounded-sm",
        "border border-zinc-600/50 bg-linear-to-br from-zinc-700/90 via-zinc-800/95 to-zinc-900/95",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_8px_rgba(0,0,0,0.35)]",
      )}
      aria-hidden
    >
      {isVertical ? (
        <div className="absolute inset-y-2 left-1/2 w-px -translate-x-1/2 bg-white/10" />
      ) : (
        <div className="absolute inset-x-2 top-1/2 h-px -translate-y-1/2 bg-white/10" />
      )}
    </div>
  )
}

function PlantBlock({ decor }: { decor: MesaFloorDecor }) {
  const large = decor.kind === "planter"
  return (
    <div className="flex size-full items-center justify-center" aria-hidden>
      <div
        className={cn(
          "flex size-full items-center justify-center border",
          large
            ? "rounded-2xl border-emerald-600/35 bg-linear-to-b from-emerald-900/50 to-emerald-950/70"
            : "rounded-full border-emerald-500/30 bg-linear-to-b from-emerald-800/55 to-emerald-950/80",
          "shadow-[inset_0_1px_0_rgba(167,243,208,0.12),0_4px_12px_rgba(0,0,0,0.25)]",
        )}
      >
        {large ? (
          <TreePine className="size-[55%] text-emerald-400/85" strokeWidth={1.5} />
        ) : (
          <Leaf className="size-[50%] text-emerald-300/90" strokeWidth={1.75} />
        )}
      </div>
    </div>
  )
}

function PillarBlock() {
  return (
    <div
      className={cn(
        "size-full rounded-md border border-zinc-500/40",
        "bg-linear-to-br from-zinc-600/80 to-zinc-800/90",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_3px_10px_rgba(0,0,0,0.3)]",
      )}
      aria-hidden
    />
  )
}

function BarBlock({ decor }: { decor: MesaFloorDecor }) {
  return (
    <div
      className="size-full overflow-hidden rounded-xl border border-amber-900/45"
      aria-hidden
    >
      <div className="flex size-full flex-col items-center justify-center bg-linear-to-b from-amber-950/70 via-amber-900/55 to-amber-950/80 px-2">
        <Wine className="mb-1 size-5 text-amber-200/70" strokeWidth={1.5} />
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100/75">
          {decor.label ?? "Barra"}
        </span>
      </div>
    </div>
  )
}

function EntranceBlock({ decor }: { decor: MesaFloorDecor }) {
  return (
    <div
      className={cn(
        "flex size-full items-center justify-center rounded-lg",
        "border border-dashed border-sky-400/35 bg-sky-950/25",
      )}
      aria-hidden
    >
      <div className="flex flex-col items-center gap-1 text-sky-300/65">
        <DoorOpen className="size-5" strokeWidth={1.5} />
        <span className="text-[9px] font-semibold uppercase tracking-wider">
          {decor.label ?? "Ingreso"}
        </span>
      </div>
    </div>
  )
}

function DecorContent({ decor }: { decor: MesaFloorDecor }) {
  if (decor.kind === "wall_h" || decor.kind === "wall_v") {
    return <WallBlock decor={decor} />
  }
  if (decor.kind === "plant" || decor.kind === "planter") {
    return <PlantBlock decor={decor} />
  }
  if (decor.kind === "pillar") {
    return <PillarBlock />
  }
  if (decor.kind === "bar") {
    return <BarBlock decor={decor} />
  }
  if (decor.kind === "entrance") {
    return <EntranceBlock decor={decor} />
  }
  return null
}

type Props = {
  decor: MesaFloorDecor
  layoutEditMode: boolean
}

export function MesaFloorDecorNode({ decor, layoutEditMode }: Props) {
  const label = decor.label ?? decorAriaLabel[decor.kind]

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: decor.id,
      disabled: !layoutEditMode,
    })

  const style: CSSProperties = {
    left: decor.x,
    top: decor.y,
    width: decor.width,
    height: decor.height,
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 40 : 0,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "absolute touch-none",
        layoutEditMode && "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-90",
      )}
      aria-label={label}
      title={label}
      {...(layoutEditMode ? { ...listeners, ...attributes } : { role: "img" })}
    >
      <DecorContent decor={decor} />
    </div>
  )
}

export const floorPlanSurfaceStyle: CSSProperties = {
  backgroundColor: MESAS_FLOOR_PLAN_BG,
}
