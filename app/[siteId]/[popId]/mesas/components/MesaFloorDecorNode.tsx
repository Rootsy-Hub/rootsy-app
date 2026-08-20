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
import {
  mesasFloorDecorFillClass,
  mesasFloorDecorInkClass,
  mesasFloorDecorLabelClass,
  mesasFloorDecorLabelOnlyClass,
  mesasFloorDecorShellClass,
  mesasFloorDecorStrokeClass,
  mesasFloorDecorWallClass,
  mesasFloorDecorZoneClass,
} from "@/app/[siteId]/[popId]/mesas/mesasFloorDecorStyles"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { mesaDecorHighlightClass } from "@/app/[siteId]/[popId]/mesas/mesasTableStyles"
import { cn } from "@/lib/utils"
import {
  Bath,
  ChefHat,
  ChevronsUp,
  CreditCard,
  DoorOpen,
  Leaf,
  TreePine,
  Wine,
  type LucideIcon,
} from "lucide-react"

/** Superficie interior del plano — sombra-700. */
export const MESAS_FLOOR_PLAN_BG = MESAS_FLOOR_PLAN_SURFACE_BG

const decorAriaLabel: Record<MesaFloorDecorKind, string> = {
  wall_h: "Pared divisoria",
  wall_v: "Pared divisoria",
  pillar: "Columna",
  entrance: "Puerta / acceso",
  window: "Ventana",
  bar: "Barra",
  register: "Caja",
  restroom: "Baños",
  kitchen: "Cocina",
  stairs: "Escalera",
  plant: "Planta",
  planter: "Macetero",
  label: "Etiqueta",
  zone: "Zona",
}

function uprightStyle(rotation: number): CSSProperties | undefined {
  return rotation ? { transform: `rotate(${-rotation}deg)` } : undefined
}

function WhisperMark({
  icon: Icon,
  label,
  rotation = 0,
  compact = false,
}: {
  icon?: LucideIcon
  label?: string
  rotation?: number
  compact?: boolean
}) {
  const text = label?.trim()
  return (
    <div
      className="flex max-w-full flex-col items-center justify-center gap-0.5 px-1"
      style={uprightStyle(rotation)}
    >
      {Icon ? (
        <Icon
          className={cn(mesasFloorDecorInkClass, compact ? "size-3" : "size-3.5")}
          strokeWidth={1.5}
        />
      ) : null}
      {text ? <span className={mesasFloorDecorLabelClass}>{text}</span> : null}
    </div>
  )
}

function WallBlock({
  decor,
  selected = false,
}: {
  decor: MesaFloorDecor
  selected?: boolean
}) {
  return (
    <div
      className={cn(mesasFloorDecorWallClass, selected && mesaDecorHighlightClass(true))}
      aria-hidden
    />
  )
}

function PillarBlock({ selected = false }: { selected?: boolean }) {
  return (
    <div
      className={cn(
        "size-full rounded-sm",
        mesasFloorDecorStrokeClass,
        mesasFloorDecorFillClass,
        selected && mesaDecorHighlightClass(true),
      )}
      aria-hidden
    />
  )
}

function WindowBlock({
  decor,
  selected = false,
}: {
  decor: MesaFloorDecor
  selected?: boolean
}) {
  const vertical = decor.height > decor.width
  return (
    <div
      className={cn(
        mesasFloorDecorShellClass,
        "rounded-sm",
        selected && mesaDecorHighlightClass(true),
      )}
      aria-hidden
    >
      {vertical ? (
        <div className="absolute inset-y-1 left-1/2 w-px -translate-x-1/2 bg-[color-mix(in_srgb,var(--rootsy-sombra-300)_22%,transparent)]" />
      ) : (
        <div className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-[color-mix(in_srgb,var(--rootsy-sombra-300)_22%,transparent)]" />
      )}
    </div>
  )
}

function AmenityBlock({
  decor,
  icon,
  fallback,
  rotation = 0,
  selected = false,
  roundedClass = "rounded-md",
}: {
  decor: MesaFloorDecor
  icon: LucideIcon
  fallback: string
  rotation?: number
  selected?: boolean
  roundedClass?: string
}) {
  return (
    <div
      className={cn(
        mesasFloorDecorShellClass,
        "flex items-center justify-center",
        roundedClass,
        selected && mesaDecorHighlightClass(true),
      )}
      aria-hidden
    >
      <WhisperMark
        icon={icon}
        label={decor.label?.trim() || fallback}
        rotation={rotation}
        compact={Math.min(decor.width, decor.height) < 40}
      />
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
          "flex size-full items-center justify-center",
          large ? "rounded-md" : "rounded-full",
          mesasFloorDecorStrokeClass,
          "border bg-[color-mix(in_srgb,var(--rootsy-savia-500)_6%,transparent)]",
          selected && mesaDecorHighlightClass(true),
        )}
      >
        {large ? (
          <TreePine className={cn("size-[46%]", mesasFloorDecorInkClass)} strokeWidth={1.4} />
        ) : (
          <Leaf className={cn("size-[42%]", mesasFloorDecorInkClass)} strokeWidth={1.5} />
        )}
      </div>
    </div>
  )
}

function StairsBlock({
  decor,
  rotation = 0,
  selected = false,
}: {
  decor: MesaFloorDecor
  rotation?: number
  selected?: boolean
}) {
  const steps = 4
  return (
    <div
      className={cn(
        mesasFloorDecorShellClass,
        "flex items-center justify-center rounded-md",
        selected && mesaDecorHighlightClass(true),
      )}
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-1.5 flex flex-col justify-between">
        {Array.from({ length: steps }, (_, index) => (
          <div
            key={index}
            className="h-px bg-[color-mix(in_srgb,var(--rootsy-sombra-300)_18%,transparent)]"
          />
        ))}
      </div>
      <WhisperMark
        icon={ChevronsUp}
        label={decor.label?.trim() || "Escalera"}
        rotation={rotation}
        compact
      />
    </div>
  )
}

function LabelBlock({
  decor,
  rotation = 0,
  selected = false,
}: {
  decor: MesaFloorDecor
  rotation?: number
  selected?: boolean
}) {
  return (
    <div
      className={cn(
        "flex size-full items-center justify-center",
        selected && mesaDecorHighlightClass(true),
      )}
      aria-hidden
    >
      <span className={mesasFloorDecorLabelOnlyClass} style={uprightStyle(rotation)}>
        {decor.label?.trim() || "Etiqueta"}
      </span>
    </div>
  )
}

function ZoneBlock({
  decor,
  rotation = 0,
  selected = false,
}: {
  decor: MesaFloorDecor
  rotation?: number
  selected?: boolean
}) {
  const text = decor.label?.trim()
  return (
    <div
      className={cn(mesasFloorDecorZoneClass, selected && mesaDecorHighlightClass(true))}
      aria-hidden
    >
      {text ? (
        <span
          className={cn(mesasFloorDecorLabelClass, "absolute left-2 top-1.5 text-left")}
          style={uprightStyle(rotation)}
        >
          {text}
        </span>
      ) : null}
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
  if (decor.kind === "pillar") {
    return <PillarBlock selected={selected} />
  }
  if (decor.kind === "window") {
    return <WindowBlock decor={decor} selected={selected} />
  }
  if (decor.kind === "plant" || decor.kind === "planter") {
    return <PlantBlock decor={decor} selected={selected} />
  }
  if (decor.kind === "stairs") {
    return (
      <StairsBlock decor={decor} rotation={uprightRotation} selected={selected} />
    )
  }
  if (decor.kind === "label") {
    return <LabelBlock decor={decor} rotation={uprightRotation} selected={selected} />
  }
  if (decor.kind === "zone") {
    return <ZoneBlock decor={decor} rotation={uprightRotation} selected={selected} />
  }

  const amenity: Record<
    Extract<
      MesaFloorDecorKind,
      "entrance" | "bar" | "register" | "restroom" | "kitchen"
    >,
    { icon: LucideIcon; fallback: string; roundedClass?: string }
  > = {
    entrance: { icon: DoorOpen, fallback: "Acceso", roundedClass: "rounded-sm" },
    bar: { icon: Wine, fallback: "Barra", roundedClass: "rounded-md" },
    register: { icon: CreditCard, fallback: "Caja" },
    restroom: { icon: Bath, fallback: "Baños" },
    kitchen: { icon: ChefHat, fallback: "Cocina" },
  }

  const spec = amenity[decor.kind as keyof typeof amenity]
  if (!spec) return null

  return (
    <AmenityBlock
      decor={decor}
      icon={spec.icon}
      fallback={spec.fallback}
      rotation={uprightRotation}
      selected={selected}
      roundedClass={spec.roundedClass}
    />
  )
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
          backgroundColor: "var(--rootsy-sombra-800)",
          minHeight: PREVIEW_CANVAS_H,
        }}
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
  const label = decor.label?.trim() || decorAriaLabel[decor.kind]
  const rotation = decor.rotation ?? 0
  const isZone = decor.kind === "zone"

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: decor.id,
      disabled: !layoutEditMode,
    })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "absolute outline-none focus:outline-none focus-visible:outline-none",
        layoutEditMode ? "touch-none" : "pointer-events-none",
      )}
      style={{
        left: decor.x,
        top: decor.y,
        width: decor.width,
        height: decor.height,
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 40 : layoutSelected ? 35 : isZone ? 0 : 1,
      }}
      aria-label={label}
      title={layoutEditMode ? label : undefined}
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
