import type { ReportCatalogCategoryId } from "@/lib/reportsCatalog"

export type ReportHubCategoryStyle = {
  accent: string
  accentMuted: string
  border: string
  legendClass: string
}

export const REPORT_HUB_CATEGORY_STYLES: Record<
  ReportCatalogCategoryId,
  ReportHubCategoryStyle
> = {
  operativo: {
    accent: "var(--rootsy-savia-600)",
    accentMuted:
      "color-mix(in srgb, var(--rootsy-savia-500) 14%, var(--rootsy-white))",
    border:
      "color-mix(in srgb, var(--rootsy-savia-500) 30%, var(--rootsy-bruma-200))",
    legendClass: "bg-[var(--rootsy-savia-500)]",
  },
  fiscal: {
    accent: "var(--rootsy-ceniza-600)",
    accentMuted:
      "color-mix(in srgb, var(--rootsy-ceniza-500) 14%, var(--rootsy-white))",
    border:
      "color-mix(in srgb, var(--rootsy-ceniza-500) 28%, var(--rootsy-bruma-200))",
    legendClass: "bg-[var(--rootsy-ceniza-500)]",
  },
  gestion: {
    accent: "var(--rootsy-landing-teal)",
    accentMuted:
      "color-mix(in srgb, var(--rootsy-landing-teal) 14%, var(--rootsy-white))",
    border:
      "color-mix(in srgb, var(--rootsy-landing-teal) 28%, var(--rootsy-bruma-200))",
    legendClass: "bg-[var(--rootsy-landing-teal)]",
  },
  control: {
    accent: "#d97706",
    accentMuted: "color-mix(in srgb, #f59e0b 16%, var(--rootsy-white))",
    border: "color-mix(in srgb, #f59e0b 28%, var(--rootsy-bruma-200))",
    legendClass: "bg-[#f59e0b]",
  },
  config: {
    accent: "var(--rootsy-bruma-600)",
    accentMuted: "var(--rootsy-bruma-100)",
    border: "var(--rootsy-bruma-300)",
    legendClass: "bg-[var(--rootsy-bruma-500)]",
  },
}

export function getReportHubCategoryStyle(
  categoryId: ReportCatalogCategoryId,
): ReportHubCategoryStyle {
  return REPORT_HUB_CATEGORY_STYLES[categoryId]
}
