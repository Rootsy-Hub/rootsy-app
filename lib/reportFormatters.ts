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

/** Importe abreviado para espacios chicos (KPIs, ejes). */
export function formatReportMoneyCompactAr(n: number): string {
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)

  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toLocaleString("es-AR", {
      maximumFractionDigits: 1,
    })} M`
  }

  if (abs >= 1_000) {
    return `${sign}$${(abs / 1_000).toLocaleString("es-AR", {
      maximumFractionDigits: abs >= 10_000 ? 0 : 1,
    })} k`
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: abs >= 100 ? 0 : 2,
    maximumFractionDigits: abs >= 100 ? 0 : 2,
  }).format(n)
}

/** Cantidad abreviada para espacios chicos (KPIs, ejes). */
export function formatReportNumberCompactAr(n: number): string {
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)

  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toLocaleString("es-AR", {
      maximumFractionDigits: 1,
    })} M`
  }

  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toLocaleString("es-AR", {
      maximumFractionDigits: abs >= 10_000 ? 0 : 1,
    })} k`
  }

  return n.toLocaleString("es-AR")
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

/** Etiqueta de período para archivos exportados — solo fechas, sin preset. */
export function formatReportExportPeriodLabel(bounds: {
  from: string | null
  to: string | null
}): string {
  return formatDataWorkspaceDateRangeLabel(bounds)
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
