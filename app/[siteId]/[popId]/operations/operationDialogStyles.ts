import { tdMoneyClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import { LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_PX } from "@/app/[siteId]/[popId]/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"

export const opsDialogLight = "rootsy-app-light text-foreground"

export const opsDialogSurfaceMd = cn(
  opsDialogLight,
  `gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-0 shadow-2xl ring-1 ring-black/[0.04] sm:max-w-[calc(21rem+${LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_PX}px+3rem)]`,
  "max-h-[min(90vh,820px)] flex flex-col overflow-hidden",
)

export const opsDialogSurfacePurchase = cn(
  opsDialogLight,
  "gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-0 shadow-2xl ring-1 ring-black/[0.04] sm:max-w-[calc(21rem+32rem+3rem)]",
  "max-h-[min(90vh,820px)] flex flex-col overflow-hidden",
)

export const opsDialogHeader =
  "shrink-0 border-b border-border/50 bg-muted/25 px-6 pb-4 pt-5 text-left"

export const opsDialogSectionTitle =
  "mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500"

export const opsDialogDetailMoneyClass = cn("font-medium text-foreground", tdMoneyClass)

export const opsDialogTotalMoneyClass = cn(
  "text-base font-semibold text-primary",
  tdMoneyClass,
)
