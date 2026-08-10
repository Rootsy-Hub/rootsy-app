import { cn } from "@/lib/utils"

const orderCardBaseClass = cn(
  "w-full cursor-grab rounded-xl border px-3 py-3 text-left transition-[border-color,background-color,box-shadow,transform] duration-200",
  "active:cursor-grabbing",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_14px_rgba(0,0,0,0.28)]",
)

export function mostradorOrderCardClass(options?: { selected?: boolean }): string {
  if (options?.selected) {
    return cn(
      orderCardBaseClass,
      "scale-[1.01] z-10",
      "border-[color-mix(in_srgb,var(--rootsy-savia-400)_90%,transparent)]",
      "bg-[color-mix(in_srgb,var(--rootsy-savia-600)_38%,var(--rootsy-sombra-800))]",
      "shadow-[inset_0_1px_0_color-mix(in_srgb,var(--rootsy-savia-300)_22%,transparent),0_0_0_1px_color-mix(in_srgb,var(--rootsy-savia-500)_28%,transparent),0_8px_24px_color-mix(in_srgb,var(--rootsy-savia-600)_28%,transparent)]",
    )
  }

  return cn(
    orderCardBaseClass,
    "border-[color-mix(in_srgb,var(--rootsy-sombra-300)_32%,transparent)]",
    "bg-[color-mix(in_srgb,var(--rootsy-sombra-600)_82%,var(--rootsy-sombra-700))]",
    "hover:border-[color-mix(in_srgb,var(--rootsy-sombra-300)_48%,transparent)]",
    "hover:bg-[color-mix(in_srgb,var(--rootsy-sombra-600)_92%,var(--rootsy-sombra-700))]",
  )
}

export function mostradorOrderDragOverlayClass(): string {
  return cn(
    "w-[220px] rounded-xl border px-3 py-3 shadow-xl",
    "border-[color-mix(in_srgb,var(--rootsy-savia-400)_55%,transparent)]",
    "bg-[color-mix(in_srgb,var(--rootsy-sombra-700)_95%,var(--rootsy-sombra-800))]",
    "shadow-[0_16px_40px_color-mix(in_srgb,var(--rootsy-sombra-950)_55%,transparent)]",
  )
}

export function mostradorFulfillmentBadgeClass(): string {
  return cn(
    "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
    "bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_50%,transparent)]",
    "text-[color-mix(in_srgb,var(--rootsy-bruma-100)_82%,white)]",
    "ring-1 ring-[color-mix(in_srgb,var(--rootsy-sombra-border)_40%,transparent)]",
  )
}

export function mostradorPaymentBadgeClass(isPaid: boolean): string {
  if (isPaid) {
    return cn(
      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
      "bg-[color-mix(in_srgb,var(--rootsy-savia-400)_18%,transparent)]",
      "text-[color-mix(in_srgb,var(--rootsy-savia-300)_92%,white)]",
      "ring-1 ring-[color-mix(in_srgb,var(--rootsy-savia-400)_28%,transparent)]",
    )
  }

  return cn(
    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
    "bg-[color-mix(in_srgb,var(--rootsy-savia-600)_14%,transparent)]",
    "text-[color-mix(in_srgb,var(--rootsy-savia-200)_88%,#fcd34d)]",
    "ring-1 ring-[color-mix(in_srgb,var(--rootsy-savia-500)_22%,transparent)]",
  )
}

export function mostradorBoardDropZoneClass(options: {
  isOver?: boolean
  canDrop?: boolean
  dragging?: boolean
}): string {
  return cn(
    "min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-2 transition-colors duration-200",
    options.isOver &&
      options.canDrop &&
      "bg-[color-mix(in_srgb,var(--rootsy-savia-400)_10%,transparent)] ring-1 ring-inset ring-[color-mix(in_srgb,var(--rootsy-savia-400)_28%,transparent)]",
    options.dragging && !options.canDrop && "opacity-60",
  )
}
