import { layoutsOperarProductCardSelectedClass } from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"

/** Misma loseta que el catálogo — sin la grilla de 256px. */
const orderCardBaseClass = cn(
  "layouts-operar-product-card relative w-full overflow-hidden rounded-2xl text-left",
  "border border-[var(--layouts-operar-border-dark-card)] bg-[var(--rootsy-sombra-600)]",
  "px-3 py-3",
  "transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5",
)

export function mostradorOrderCardClass(options?: {
  selected?: boolean
  draggable?: boolean
}): string {
  return cn(
    orderCardBaseClass,
    options?.draggable === false
      ? "cursor-pointer"
      : "cursor-grab active:cursor-grabbing",
    options?.selected && layoutsOperarProductCardSelectedClass,
  )
}

export function mostradorOrderDragOverlayClass(): string {
  return cn(
    orderCardBaseClass,
    layoutsOperarProductCardSelectedClass,
    "w-[220px] cursor-grabbing",
  )
}

export function mostradorFulfillmentBadgeClass(): string {
  return cn(
    "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
    "bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_42%,transparent)]",
    "text-[var(--layouts-operar-product-card-desc)]",
    "ring-1 ring-[var(--layouts-operar-border-dark-hairline)]",
  )
}

export function mostradorPaymentBadgeClass(isPaid: boolean): string {
  if (isPaid) {
    return cn(
      "rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
      "bg-[color-mix(in_srgb,var(--rootsy-savia-400)_16%,transparent)]",
      "text-[var(--layouts-operar-product-card-price)]",
      "ring-1 ring-[color-mix(in_srgb,var(--rootsy-savia-400)_28%,transparent)]",
    )
  }

  return cn(
    "rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
    "bg-[color-mix(in_srgb,#f59e0b_14%,transparent)]",
    "text-[color-mix(in_srgb,#fde68a_88%,white)]",
    "ring-1 ring-[color-mix(in_srgb,#f59e0b_22%,transparent)]",
  )
}

export function mostradorBoardDropZoneClass(options: {
  isOver?: boolean
  canDrop?: boolean
  dragging?: boolean
}): string {
  return cn(
    "min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-3 transition-colors duration-200",
    options.isOver &&
      options.canDrop &&
      "bg-[color-mix(in_srgb,var(--rootsy-savia-400)_8%,transparent)] ring-1 ring-inset ring-[color-mix(in_srgb,var(--rootsy-savia-400)_22%,transparent)]",
    options.dragging && !options.canDrop && "opacity-60",
  )
}
