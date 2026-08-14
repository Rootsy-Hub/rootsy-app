import {
  dataWorkspaceDateFilterSummary,
  dataWorkspacePresetLabel,
  formatDataWorkspaceDateRangeLabel,
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
