import type {
  MesaTableShape,
  MesaTableStatus,
  RectTableSize,
  RoundTableSize,
  SquareTableSize,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { cn } from "@/lib/utils"

const ROUND: Record<RoundTableSize, number> = {
  s: 52,
  m: 68,
  l: 84,
  xl: 100,
}

const SQUARE: Record<SquareTableSize, number> = {
  s: 52,
  m: 68,
  l: 84,
}

const RECT: Record<RectTableSize, { w: number; h: number }> = {
  s: { w: 76, h: 52 },
  m: { w: 96, h: 68 },
  l: { w: 120, h: 84 },
  xl: { w: 148, h: 96 },
}

export function mesaTableDimensions(shape: MesaTableShape): {
  width: number
  height: number
} {
  if (shape.kind === "round") {
    const d = ROUND[shape.size]
    return { width: d, height: d }
  }
  if (shape.kind === "square") {
    const d = SQUARE[shape.size]
    return { width: d, height: d }
  }
  return { width: RECT[shape.size].w, height: RECT[shape.size].h }
}

/** Selección que sigue el border-radius del elemento (pseudo-elemento, sin borde blanco). */
export function mesaItemSelectionClass(options?: { active?: boolean }): string {
  return cn(
    "relative",
    "before:pointer-events-none before:absolute before:rounded-[inherit] before:content-['']",
    "before:-inset-[3px] before:border-2",
    "before:border-[color-mix(in_srgb,var(--rootsy-savia-400)_55%,transparent)]",
    "transition-[transform] duration-200",
    options?.active && "z-10",
  )
}

export function mesaTableHighlightClass(options: {
  selected?: boolean
  layoutSelected?: boolean
}): string {
  if (options.layoutSelected) {
    return mesaItemSelectionClass()
  }
  if (options.selected) {
    return "z-10 outline outline-4 outline-offset-0"
  }
  return ""
}

export function mesaDecorHighlightClass(layoutSelected: boolean): string {
  if (!layoutSelected) return ""
  return mesaItemSelectionClass()
}

export function mesaStatusClass(status: MesaTableStatus): string {
  const base = cn(
    "border shadow-none",
    "transition-[border-color,background-color] duration-200 ease-out",
  )

  const statusMap: Record<MesaTableStatus, string> = {
    free: cn(
      "border-[color-mix(in_srgb,var(--rootsy-savia-400)_70%,transparent)]",
      "outline-[color-mix(in_srgb,var(--rootsy-savia-400)_70%,transparent)]",
      "bg-[color-mix(in_srgb,var(--rootsy-savia-600)_48%,var(--rootsy-sombra-800))]",
    ),
    open: cn(
      "border-[color-mix(in_srgb,var(--destructive)_78%,transparent)]",
      "outline-[color-mix(in_srgb,var(--destructive)_78%,transparent)]",
      "bg-[color-mix(in_srgb,var(--destructive)_46%,var(--rootsy-sombra-800))]",
    ),
    paying: cn(
      "border-[color-mix(in_srgb,#f59e0b_78%,transparent)]",
      "outline-[color-mix(in_srgb,#f59e0b_78%,transparent)]",
      "bg-[color-mix(in_srgb,#d97706_46%,var(--rootsy-sombra-800))]",
    ),
    reserved: cn(
      "border-[color-mix(in_srgb,#7c3aed_74%,transparent)]",
      "outline-[color-mix(in_srgb,#7c3aed_74%,transparent)]",
      "bg-[color-mix(in_srgb,#6d28d9_46%,var(--rootsy-sombra-800))]",
    ),
  }

  return cn(base, statusMap[status])
}

export function mesaSeatsLabel(seats: number): string {
  return seats === 1 ? "1 persona" : `${seats} personas`
}

export function mesaStatusLabel(status: MesaTableStatus): string {
  switch (status) {
    case "free":
      return "Libre"
    case "open":
      return "Abierta"
    case "paying":
      return "Cobrando"
    case "reserved":
      return "Reservada"
  }
}

export function mesaShapeLabel(shape: MesaTableShape): string {
  if (shape.kind === "round") return `Redonda ${mesaSizeDisplayLabel(shape.size)}`
  if (shape.kind === "square") return `Cuadrada ${mesaSizeDisplayLabel(shape.size)}`
  return `Rectangular ${mesaSizeDisplayLabel(shape.size)}`
}

export function mesaSizeDisplayLabel(size: string): string {
  const labels: Record<string, string> = {
    s: "S",
    sm: "S",
    m: "M",
    md: "M",
    l: "L",
    lg: "L",
    xl: "XL",
  }
  return labels[size] ?? size.toUpperCase()
}

export function mesaShapeSizeOptions(
  kind: MesaTableShape["kind"],
): readonly string[] {
  if (kind === "square") return ["s", "m", "l"]
  return ["s", "m", "l", "xl"]
}
