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
  sm: { w: 76, h: 52 },
  md: { w: 96, h: 68 },
  lg: { w: 120, h: 84 },
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

export function mesaStatusClass(status: MesaTableStatus, selected: boolean): string {
  const base =
    "border-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_12px_rgba(0,0,0,0.35)] transition-[border-color,box-shadow,transform] duration-200"

  const statusMap: Record<MesaTableStatus, string> = {
    free: "border-emerald-500/45 bg-[#1a221c] hover:border-emerald-400/70",
    open: "border-amber-400/65 bg-[#2a2218] shadow-[0_0_20px_rgba(251,191,36,0.12)]",
    paying: "border-sky-400/60 bg-[#182028] shadow-[0_0_18px_rgba(56,189,248,0.1)]",
    reserved: "border-violet-400/55 bg-[#221a28] shadow-[0_0_16px_rgba(167,139,250,0.1)]",
  }

  return cn(
    base,
    statusMap[status],
    selected &&
      "ring-2 ring-white/90 ring-offset-2 ring-offset-[#141a18] scale-[1.03] z-10",
  )
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
  if (shape.kind === "round") return `Redonda ${shape.size.toUpperCase()}`
  if (shape.kind === "square") return `Cuadrada ${shape.size.toUpperCase()}`
  return `Rectangular ${shape.size.toUpperCase()}`
}
