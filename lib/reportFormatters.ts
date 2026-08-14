import {
  dataWorkspaceDateFilterSummary,
  dataWorkspacePresetLabel,
  formatDataWorkspaceDateRangeLabel,
  formatIsoDateShort,
  type DataWorkspaceDatePreset,
} from "@/lib/dataWorkspaceDateFilter"

export function formatReportMoneyAr(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

export function formatReportPeriodSummary(
  preset: DataWorkspaceDatePreset,
  bounds: { from: string | null; to: string | null },
): string {
  if (preset === "custom") {
    return dataWorkspaceDateFilterSummary(preset, bounds)
  }

  const range = formatDataWorkspaceDateRangeLabel(bounds)
  if (preset === "all") return range

  return `${dataWorkspacePresetLabel(preset)} (${range})`
}

export function formatReportAsOfSummary(
  preset: DataWorkspaceDatePreset,
  bounds: { from: string | null; to: string | null },
  asOf: string,
): string {
  const cutoff = formatIsoDateShort(asOf)
  if (preset === "all") {
    return `Fecha de corte: ${cutoff} (saldos acumulados al día de hoy)`
  }
  if (preset === "custom") {
    return `Fecha de corte: ${cutoff} · ${dataWorkspaceDateFilterSummary(preset, bounds)}`
  }
  return `Fecha de corte: ${cutoff} · ${dataWorkspacePresetLabel(preset)}`
}
