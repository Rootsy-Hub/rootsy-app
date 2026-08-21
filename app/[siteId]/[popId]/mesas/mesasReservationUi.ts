import type { MesaReservation, MesaTable } from "@/app/[siteId]/[popId]/mesas/mesasTypes"

function tableLabel(tables: MesaTable[], tableId: string): string {
  return tables.find((t) => t.id === tableId)?.label ?? "—"
}

export function reservationTableMeta(
  tables: MesaTable[],
  tableIdOrIds: string | string[] | null,
): string {
  const ids = Array.isArray(tableIdOrIds)
    ? tableIdOrIds
    : tableIdOrIds
      ? [tableIdOrIds]
      : []
  if (ids.length === 0) return "Sin mesa asignada"
  const labels = ids.map((id) => tableLabel(tables, id))
  if (labels.length === 1) return `Mesa ${labels[0]}`
  return `Mesas ${labels.join(" + ")}`
}

export function reservationStatusBadgeClass(
  status: MesaReservation["status"],
): string {
  switch (status) {
    case "pending":
      return "bg-[color-mix(in_srgb,#fef3c7_72%,white)] text-[#92400e] ring-[color-mix(in_srgb,#f59e0b_35%,transparent)]"
    case "confirmed":
      return "bg-[color-mix(in_srgb,#ede9fe_72%,white)] text-[#5b21b6] ring-[color-mix(in_srgb,#7c3aed_35%,transparent)]"
    case "seated":
      return "bg-[color-mix(in_srgb,var(--rootsy-savia-400)_12%,var(--rootsy-bruma-100))] text-[var(--rootsy-savia-800)] ring-[color-mix(in_srgb,var(--rootsy-savia-500)_28%,transparent)]"
    case "completed":
      return "bg-[color-mix(in_srgb,var(--rootsy-bruma-200)_70%,white)] text-[var(--rootsy-bruma-700)] ring-[color-mix(in_srgb,var(--rootsy-bruma-400)_35%,transparent)]"
    case "expired":
      return "bg-[color-mix(in_srgb,#fee2e2_72%,white)] text-[#991b1b] ring-[color-mix(in_srgb,#ef4444_35%,transparent)]"
    case "no_show":
      return "bg-[color-mix(in_srgb,#fee2e2_72%,white)] text-[#991b1b] ring-[color-mix(in_srgb,#ef4444_35%,transparent)]"
    case "cancelled":
      return "bg-[color-mix(in_srgb,var(--rootsy-bruma-200)_70%,white)] text-[var(--rootsy-bruma-600)] ring-[color-mix(in_srgb,var(--rootsy-bruma-400)_28%,transparent)]"
    default:
      return ""
  }
}
