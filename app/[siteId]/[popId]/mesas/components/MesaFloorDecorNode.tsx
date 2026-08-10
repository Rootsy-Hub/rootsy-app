"use client"

import type { CSSProperties } from "react"
import type {
  MesaFloorDecor,
  MesaFloorDecorKind,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import {
  MESAS_FLOOR_PLAN_SURFACE_BG,
  mesasFloorGridPatternStyle,
} from "@/app/[siteId]/[popId]/mesas/mesasOperarStyles"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { mesaDecorHighlightClass } from "@/app/[siteId]/[popId]/mesas/mesasTableStyles"
import { cn } from "@/lib/utils"
import { DoorOpen, Leaf, TreePine, Wine } from "lucide-react"

/** Superficie interior del plano — sombra-700. */
export const MESAS_FLOOR_PLAN_BG = MESAS_FLOOR_PLAN_SURFACE_BG

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
        "border border-[color-mix(in_srgb,var(--rootsy-sombra-border)_55%,transparent)]",
        "bg-linear-to-br from-[color-mix(in_srgb,var(--rootsy-sombra-500)_88%,transparent)] via-[color-mix(in_srgb,var(--rootsy-sombra-600)_95%,transparent)] to-[color-mix(in_srgb,var(--rootsy-sombra-700)_95%,transparent)]",
        "shadow-[inset_0_1px_0_color-mix(in_srgb,var(--rootsy-bruma-50)_8%,transparent),0_2px_8px_color-mix(in_srgb,var(--rootsy-sombra-950)_35%,transparent)]",
        selected && mesaDecorHighlightClass(true),
      )}
      aria-hidden
    >
      {isVertical ? (
        <div className="absolute inset-y-2 left-1/2 w-px -translate-x-1/2 bg-[color-mix(in_srgb,var(--rootsy-sombra-300)_12%,transparent)]" />
      ) : (
        <div className="absolute inset-x-2 top-1/2 h-px -translate-y-1/2 bg-[color-mix(in_srgb,var(--rootsy-sombra-300)_12%,transparent)]" />
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
            ? "rounded-2xl border-[color-mix(in_srgb,var(--rootsy-savia-600)_35%,transparent)] bg-linear-to-b from-[color-mix(in_srgb,var(--rootsy-savia-900)_50%,transparent)] to-[color-mix(in_srgb,var(--rootsy-savia-950)_70%,transparent)]"
            : "rounded-full border-[color-mix(in_srgb,var(--rootsy-savia-500)_30%,transparent)] bg-linear-to-b from-[color-mix(in_srgb,var(--rootsy-savia-800)_55%,transparent)] to-[color-mix(in_srgb,var(--rootsy-savia-950)_80%,transparent)]",
          "shadow-[inset_0_1px_0_color-mix(in_srgb,var(--rootsy-savia-200)_12%,transparent),0_4px_12px_color-mix(in_srgb,var(--rootsy-sombra-950)_25%,transparent)]",
          selected && mesaDecorHighlightClass(true),
        )}
      >
        {large ? (
          <TreePine className="size-[55%] text-[color-mix(in_srgb,var(--rootsy-savia-400)_85%,transparent)]" strokeWidth={1.5} />
        ) : (
          <Leaf className="size-[50%] text-[color-mix(in_srgb,var(--rootsy-savia-300)_90%,transparent)]" strokeWidth={1.75} />
        )}
      </div>
    </div>
  )
}

function PillarBlock({ selected = false }: { selected?: boolean }) {
  return (
    <div
      className={cn(
        "size-full rounded-md border border-[color-mix(in_srgb,var(--rootsy-sombra-border)_40%,transparent)]",
        "bg-linear-to-br from-[color-mix(in_srgb,var(--rootsy-sombra-500)_80%,transparent)] to-[color-mix(in_srgb,var(--rootsy-sombra-700)_90%,transparent)]",
        "shadow-[inset_0_1px_0_color-mix(in_srgb,var(--rootsy-bruma-50)_10%,transparent),0_3px_10px_color-mix(in_srgb,var(--rootsy-sombra-950)_30%,transparent)]",
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
        "size-full rounded-xl border border-[color-mix(in_srgb,var(--rootsy-savia-700)_45%,transparent)]",
        selected && mesaDecorHighlightClass(true),
      )}
      aria-hidden
    >
      <div className="flex size-full flex-col items-center justify-center overflow-hidden rounded-[inherit] bg-linear-to-b from-[color-mix(in_srgb,var(--rootsy-savia-950)_70%,transparent)] via-[color-mix(in_srgb,var(--rootsy-savia-900)_55%,transparent)] to-[color-mix(in_srgb,var(--rootsy-savia-950)_80%,transparent)] px-2">
        <div
          className="flex flex-col items-center"
          style={
            uprightRotation
              ? { transform: `rotate(${-uprightRotation}deg)` }
              : undefined
          }
        >
          <Wine className="mb-1 size-5 text-[color-mix(in_srgb,var(--rootsy-savia-200)_70%,transparent)]" strokeWidth={1.5} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[color-mix(in_srgb,var(--rootsy-savia-100)_75%,transparent)]">
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
        "border border-dashed border-[color-mix(in_srgb,var(--rootsy-savia-teal)_35%,transparent)] bg-[color-mix(in_srgb,var(--rootsy-savia-950)_25%,transparent)]",
        selected && mesaDecorHighlightClass(true),
      )}
      aria-hidden
    >
      <div
        className="flex flex-col items-center gap-1 text-[color-mix(in_srgb,var(--rootsy-savia-teal)_65%,transparent)]"
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
      <p className="font-canopy text-xs font-medium uppercase tracking-wider text-[var(--rootsy-bruma-500)]">
        Vista previa
      </p>
      <div
        className="relative flex items-center justify-center overflow-hidden rounded-xl border border-[var(--rootsy-bruma-200)]"
        style={{
          backgroundColor: MESAS_FLOOR_PLAN_SURFACE_BG,
          minHeight: PREVIEW_CANVAS_H,
        }}
        aria-hidden
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={mesasFloorGridPatternStyle}
          aria-hidden
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
      <p className="text-center font-canopy text-xs leading-relaxed text-[var(--rootsy-bruma-500)]">
        {kindLabel}
        <span className="mx-1.5 text-[var(--rootsy-bruma-300)]">·</span>
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
  backgroundColor: MESAS_FLOOR_PLAN_SURFACE_BG,
}
