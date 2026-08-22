import type { ComandaStatus } from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import { cn } from "@/lib/utils"

/** Mundos de estado — comandas y, después, listado de pedidos. */
export type ComandaStatusWorldId = Exclude<ComandaStatus, "pending" | "voided">

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
      "bg-[var(--rootsy-cielo-100)]",
      "before:bg-[radial-gradient(ellipse_80%_90%_at_16%_-12%,var(--rootsy-cielo-200)_0%,transparent_70%)]",
    ),
    titleClass: "text-[var(--rootsy-cielo-800)]",
    iconClass: "text-[var(--rootsy-cielo-500)]",
    pillClass: cn(
      "border-[var(--rootsy-cielo-200)]",
      "bg-[color-mix(in_srgb,var(--rootsy-white)_55%,var(--rootsy-cielo-200))]",
      "text-[var(--rootsy-cielo-800)]",
    ),
  },
  preparing: {
    id: "preparing",
    climate: "Sol",
    headerClass: cn(
      "bg-[var(--rootsy-sol-100)]",
      "before:bg-[radial-gradient(ellipse_80%_90%_at_16%_-12%,var(--rootsy-sol-200)_0%,transparent_70%)]",
    ),
    titleClass: "text-[var(--rootsy-sol-800)]",
    iconClass: "text-[var(--rootsy-sol-500)]",
    pillClass: cn(
      "border-[var(--rootsy-sol-200)]",
      "bg-[color-mix(in_srgb,var(--rootsy-white)_50%,var(--rootsy-sol-200))]",
      "text-[var(--rootsy-sol-800)]",
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
  if (status === "pending" || status === "voided") return COMANDA_STATUS_WORLDS.sent
  return COMANDA_STATUS_WORLDS[status]
}
