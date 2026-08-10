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
    options?.active && "scale-[1.01] z-10",
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
    return mesaItemSelectionClass({ active: true })
  }
  return ""
}

export function mesaDecorHighlightClass(layoutSelected: boolean): string {
  if (!layoutSelected) return ""
  return mesaItemSelectionClass()
}

export function mesaStatusClass(status: MesaTableStatus): string {
  const base =
    "border-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_12px_rgba(0,0,0,0.35)] transition-[border-color,background-color,box-shadow,transform] duration-200"

  const statusMap: Record<MesaTableStatus, string> = {
    free: cn(
      "border-[color-mix(in_srgb,var(--rootsy-sombra-300)_38%,transparent)]",
      "bg-[color-mix(in_srgb,var(--rootsy-sombra-600)_90%,var(--rootsy-sombra-700))]",
      "hover:border-[color-mix(in_srgb,var(--rootsy-sombra-300)_52%,transparent)]",
    ),
    open: cn(
      "border-[color-mix(in_srgb,var(--rootsy-savia-400)_90%,transparent)]",
      "bg-[color-mix(in_srgb,var(--rootsy-savia-600)_55%,var(--rootsy-sombra-800))]",
      "shadow-[inset_0_1px_0_color-mix(in_srgb,var(--rootsy-savia-300)_28%,transparent),0_0_0_1px_color-mix(in_srgb,var(--rootsy-savia-500)_32%,transparent),0_8px_26px_color-mix(in_srgb,var(--rootsy-savia-600)_32%,transparent)]",
    ),
    paying: cn(
      "border-[color-mix(in_srgb,var(--rootsy-savia-teal)_78%,transparent)]",
      "bg-[color-mix(in_srgb,var(--rootsy-savia-teal)_42%,var(--rootsy-sombra-800))]",
      "shadow-[inset_0_1px_0_color-mix(in_srgb,var(--rootsy-savia-teal)_24%,transparent),0_8px_24px_color-mix(in_srgb,var(--rootsy-savia-teal)_26%,transparent)]",
    ),
    reserved: cn(
      "border-[color-mix(in_srgb,var(--rootsy-bruma-400)_55%,transparent)]",
      "bg-[color-mix(in_srgb,var(--rootsy-sombra-600)_88%,var(--rootsy-bruma-900))]",
      "shadow-[0_0_16px_color-mix(in_srgb,var(--rootsy-bruma-400)_10%,transparent)]",
    ),
  }

  return cn(base, statusMap[status])
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
