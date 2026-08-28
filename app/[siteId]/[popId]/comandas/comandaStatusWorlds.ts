import type { ComandaStatus } from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import type { RootsNaturePillVariant } from "@/components/rootsy-pill/rootsyNaturePillStyles"

/** Mundos de estado — receta tint del handbook: 50 / 200 / 700. */
export type ComandaStatusWorldId = Exclude<ComandaStatus, "pending" | "voided">

export const COMANDA_STATUS_WORLDS: Record<
  ComandaStatusWorldId,
  {
    id: ComandaStatusWorldId
    climate: string
    headerClass: string
    railClass: string
    titleClass: string
    iconClass: string
    bodyClass: string
    dropOverClass: string
    pillVariant: RootsNaturePillVariant
  }
> = {
  sent: {
    id: "sent",
    climate: "Cielo",
    headerClass: "bg-[var(--rootsy-cielo-50)]",
    railClass: "before:bg-[var(--rootsy-cielo-500)]",
    titleClass: "text-[var(--rootsy-cielo-700)]",
    iconClass: "text-[var(--rootsy-cielo-700)]",
    bodyClass: "",
    dropOverClass:
      "bg-[linear-gradient(180deg,var(--rootsy-cielo-50)_0%,var(--rootsy-cielo-200)_100%)]",
    pillVariant: "info",
  },
  preparing: {
    id: "preparing",
    climate: "Sol",
    headerClass: "bg-[var(--rootsy-sol-50)]",
    railClass: "before:bg-[var(--rootsy-sol-500)]",
    titleClass: "text-[var(--rootsy-sol-700)]",
    iconClass: "text-[var(--rootsy-sol-700)]",
    bodyClass: "",
    dropOverClass:
      "bg-[linear-gradient(180deg,var(--rootsy-sol-50)_0%,var(--rootsy-sol-200)_100%)]",
    pillVariant: "warning",
  },
  ready: {
    id: "ready",
    climate: "Savia",
    headerClass: "bg-[var(--rootsy-savia-50)]",
    railClass: "before:bg-[var(--rootsy-savia-500)]",
    titleClass: "text-[var(--rootsy-savia-700)]",
    iconClass: "text-[var(--rootsy-savia-700)]",
    bodyClass: "",
    dropOverClass:
      "bg-[linear-gradient(180deg,var(--rootsy-savia-50)_0%,var(--rootsy-savia-200)_100%)]",
    pillVariant: "savia",
  },
  delivered: {
    id: "delivered",
    climate: "Bruma",
    headerClass: "bg-[var(--rootsy-bruma-50)]",
    railClass: "before:bg-[var(--rootsy-bruma-300)]",
    titleClass: "text-[var(--rootsy-bruma-700)]",
    iconClass: "text-[var(--rootsy-bruma-500)]",
    bodyClass: "bg-[color-mix(in_srgb,var(--rootsy-bruma-100)_40%,transparent)]",
    dropOverClass:
      "bg-[linear-gradient(180deg,var(--rootsy-bruma-50)_0%,var(--rootsy-bruma-200)_100%)]",
    pillVariant: "brumaMuted",
  },
}

export function comandaStatusWorld(
  status: ComandaStatus,
): (typeof COMANDA_STATUS_WORLDS)[ComandaStatusWorldId] {
  if (status === "pending" || status === "voided") return COMANDA_STATUS_WORLDS.sent
  return COMANDA_STATUS_WORLDS[status]
}

export function comandaStatusPillVariant(
  status: ComandaStatus,
  count: number,
): RootsNaturePillVariant {
  if (count === 0) return "brumaMuted"
  return comandaStatusWorld(status).pillVariant
}
