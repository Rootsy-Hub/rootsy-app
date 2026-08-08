"use client"

import type { CSSProperties } from "react"
import type {
  MesaFloorDecor,
  MesaFloorDecorKind,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { mesaDecorHighlightClass } from "@/app/[siteId]/[popId]/mesas/mesasTableStyles"
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

function WallBlock({
  decor,
  selected = false,
}: {
  decor: MesaFloorDecor
  selected?: boolean
}) {
  const isVertical = decor.kind === "wall_v"
  return (
    <div
      className={cn(
        "relative size-full rounded-sm",
        "border border-zinc-600/50 bg-linear-to-br from-zinc-700/90 via-zinc-800/95 to-zinc-900/95",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_8px_rgba(0,0,0,0.35)]",
        selected && mesaDecorHighlightClass(true),
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

function PlantBlock({
  decor,
  selected = false,
}: {
  decor: MesaFloorDecor
  selected?: boolean
}) {
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
          selected && mesaDecorHighlightClass(true),
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

function PillarBlock({ selected = false }: { selected?: boolean }) {
  return (
    <div
      className={cn(
        "size-full rounded-md border border-zinc-500/40",
        "bg-linear-to-br from-zinc-600/80 to-zinc-800/90",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_3px_10px_rgba(0,0,0,0.3)]",
        selected && mesaDecorHighlightClass(true),
      )}
      aria-hidden
    />
  )
}

function BarBlock({
  decor,
  uprightRotation = 0,
  selected = false,
}: {
  decor: MesaFloorDecor
  uprightRotation?: number
  selected?: boolean
}) {
  return (
    <div
      className={cn(
        "size-full rounded-xl border border-amber-900/45",
        selected && mesaDecorHighlightClass(true),
      )}
      aria-hidden
    >
      <div className="flex size-full flex-col items-center justify-center overflow-hidden rounded-[inherit] bg-linear-to-b from-amber-950/70 via-amber-900/55 to-amber-950/80 px-2">
        <div
          className="flex flex-col items-center"
          style={
            uprightRotation
              ? { transform: `rotate(${-uprightRotation}deg)` }
              : undefined
          }
        >
          <Wine className="mb-1 size-5 text-amber-200/70" strokeWidth={1.5} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100/75">
            {decor.label ?? "Barra"}
          </span>
        </div>
      </div>
    </div>
  )
}

function EntranceBlock({
  decor,
  uprightRotation = 0,
  selected = false,
}: {
  decor: MesaFloorDecor
  uprightRotation?: number
  selected?: boolean
}) {
  return (
    <div
      className={cn(
        "flex size-full items-center justify-center rounded-lg",
        "border border-dashed border-sky-400/35 bg-sky-950/25",
        selected && mesaDecorHighlightClass(true),
      )}
      aria-hidden
    >
      <div
        className="flex flex-col items-center gap-1 text-sky-300/65"
        style={
          uprightRotation
            ? { transform: `rotate(${-uprightRotation}deg)` }
            : undefined
        }
      >
        <DoorOpen className="size-5" strokeWidth={1.5} />
        <span className="text-[9px] font-semibold uppercase tracking-wider">
          {decor.label ?? "Ingreso"}
        </span>
      </div>
    </div>
  )
}

function DecorContent({
  decor,
  uprightRotation = 0,
  selected = false,
}: {
  decor: MesaFloorDecor
  uprightRotation?: number
  selected?: boolean
}) {
  if (decor.kind === "wall_h" || decor.kind === "wall_v") {
    return <WallBlock decor={decor} selected={selected} />
  }
  if (decor.kind === "plant" || decor.kind === "planter") {
    return <PlantBlock decor={decor} selected={selected} />
  }
  if (decor.kind === "pillar") {
    return <PillarBlock selected={selected} />
  }
  if (decor.kind === "bar") {
    return (
      <BarBlock decor={decor} uprightRotation={uprightRotation} selected={selected} />
    )
  }
  if (decor.kind === "entrance") {
    return (
      <EntranceBlock
        decor={decor}
        uprightRotation={uprightRotation}
        selected={selected}
      />
    )
  }
  return null
}

const PREVIEW_CANVAS_W = 200
const PREVIEW_CANVAS_H = 168
const PREVIEW_PAD = 28

export function MesaFloorDecorPreview({
  kind,
  label,
  width,
  height,
  kindLabel,
}: {
  kind: MesaFloorDecorKind
  label: string
  width: number
  height: number
  kindLabel: string
}) {
  const safeW = Math.max(4, width)
  const safeH = Math.max(4, height)
  const scale = Math.min(
    1,
    (PREVIEW_CANVAS_W - PREVIEW_PAD) / safeW,
    (PREVIEW_CANVAS_H - PREVIEW_PAD) / safeH,
  )

  const decor: MesaFloorDecor = {
    id: "preview",
    salonId: "",
    kind,
    x: 0,
    y: 0,
    width: safeW,
    height: safeH,
    rotation: 0,
    label: label.trim() || undefined,
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Vista previa
      </p>
      <div
        className="relative flex items-center justify-center overflow-hidden rounded-xl border border-border/70"
        style={{
          backgroundColor: MESAS_FLOOR_PLAN_BG,
          minHeight: PREVIEW_CANVAS_H,
        }}
        aria-hidden
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          style={{
            width: safeW,
            height: safeH,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <DecorContent decor={decor} />
        </div>
      </div>
      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        {kindLabel}
        <span className="mx-1.5 text-border">·</span>
        {safeW}×{safeH} px
      </p>
    </div>
  )
}

type Props = {
  decor: MesaFloorDecor
  layoutEditMode: boolean
  layoutSelected: boolean
  onSelectLayout: (decorId: string) => void
}

export function MesaFloorDecorNode({
  decor,
  layoutEditMode,
  layoutSelected,
  onSelectLayout,
}: Props) {
  const label = decor.label ?? decorAriaLabel[decor.kind]
  const rotation = decor.rotation ?? 0

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: decor.id,
      disabled: !layoutEditMode,
    })

  return (
    <div
      ref={setNodeRef}
      className="absolute touch-none outline-none focus:outline-none focus-visible:outline-none"
      style={{
        left: decor.x,
        top: decor.y,
        width: decor.width,
        height: decor.height,
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 40 : layoutSelected ? 35 : 0,
      }}
      aria-label={label}
      title={label}
      {...(layoutEditMode ? { ...listeners, ...attributes } : { role: "img" })}
      onClick={
        layoutEditMode
          ? (e) => {
              e.stopPropagation()
              onSelectLayout(decor.id)
            }
          : undefined
      }
    >
      <div
        style={{
          width: decor.width,
          height: decor.height,
          transform: rotation ? `rotate(${rotation}deg)` : undefined,
          transformOrigin: "center center",
        }}
        className={cn(
          "relative size-full",
          layoutEditMode && "cursor-grab active:cursor-grabbing",
          isDragging && "opacity-90",
        )}
      >
        <DecorContent
          decor={decor}
          uprightRotation={rotation}
          selected={layoutSelected}
        />
      </div>
    </div>
  )
}

export const floorPlanSurfaceStyle: CSSProperties = {
  backgroundColor: MESAS_FLOOR_PLAN_BG,
}
