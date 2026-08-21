import type { ComandaStatus } from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import { cn } from "@/lib/utils"

/** Mundos de estado — comandas y, después, listado de pedidos. */
export type ComandaStatusWorldId = Exclude<ComandaStatus, "pending">

export const COMANDA_STATUS_WORLDS: Record<
  ComandaStatusWorldId,
  {
    id: ComandaStatusWorldId
    climate: string
    headerClass: string
    titleClass: string
    iconClass: string
    pillClass: string
  }
> = {
  sent: {
    id: "sent",
    climate: "Cielo",
    headerClass: cn(
      "bg-[var(--nature-sky-100,#e0f2fe)]",
      "before:bg-[radial-gradient(ellipse_80%_90%_at_16%_-12%,var(--nature-sky-200,#bae6fd)_0%,transparent_70%)]",
    ),
    titleClass: "text-[var(--nature-sky-700,#0369a1)]",
    iconClass: "text-[var(--nature-sky-500,#0ea5e9)]",
    pillClass: cn(
      "border-[var(--nature-sky-200,#bae6fd)]",
      "bg-[color-mix(in_srgb,var(--rootsy-white)_55%,var(--nature-sky-200,#bae6fd))]",
      "text-[var(--nature-sky-700,#0369a1)]",
    ),
  },
  preparing: {
    id: "preparing",
    climate: "Otoño",
    headerClass: cn(
      "bg-[var(--nature-autumn-100,#fef3c7)]",
      "before:bg-[radial-gradient(ellipse_80%_90%_at_16%_-12%,var(--nature-autumn-200,#fde68a)_0%,transparent_70%)]",
    ),
    titleClass: "text-[var(--nature-autumn-800,#92400e)]",
    iconClass: "text-[var(--nature-autumn-600,#d97706)]",
    pillClass: cn(
      "border-[var(--nature-autumn-200,#fde68a)]",
      "bg-[color-mix(in_srgb,var(--rootsy-white)_50%,var(--nature-autumn-200,#fde68a))]",
      "text-[var(--nature-autumn-800,#92400e)]",
    ),
  },
  ready: {
    id: "ready",
    climate: "Savia clara",
    headerClass: cn(
      "bg-[var(--rootsy-savia-50)]",
      "before:bg-[radial-gradient(ellipse_80%_90%_at_16%_-12%,var(--rootsy-savia-100)_0%,transparent_70%)]",
    ),
    titleClass: "text-[var(--rootsy-savia-800)]",
    iconClass: "text-[var(--rootsy-savia-600)]",
    pillClass: cn(
      "border-[color-mix(in_srgb,var(--rootsy-savia-600)_22%,var(--rootsy-savia-100))]",
      "bg-[color-mix(in_srgb,var(--rootsy-white)_55%,var(--rootsy-savia-100))]",
      "text-[var(--rootsy-savia-800)]",
    ),
  },
  delivered: {
    id: "delivered",
    climate: "Savia",
    headerClass: cn(
      "bg-[color-mix(in_srgb,var(--rootsy-savia-400)_22%,var(--rootsy-savia-50))]",
      "before:bg-[radial-gradient(ellipse_80%_90%_at_16%_-12%,var(--rootsy-savia-200)_0%,transparent_68%)]",
    ),
    titleClass: "text-[var(--rootsy-savia-950)]",
    iconClass: "text-[var(--rootsy-savia-700)]",
    pillClass: cn(
      "border-[color-mix(in_srgb,var(--rootsy-savia-700)_28%,var(--rootsy-savia-200))]",
      "bg-[color-mix(in_srgb,var(--rootsy-savia-200)_70%,white)]",
      "text-[var(--rootsy-savia-900)]",
    ),
  },
}

export function comandaStatusWorld(
  status: ComandaStatus,
): (typeof COMANDA_STATUS_WORLDS)[ComandaStatusWorldId] {
  if (status === "pending") return COMANDA_STATUS_WORLDS.sent
  return COMANDA_STATUS_WORLDS[status]
}
