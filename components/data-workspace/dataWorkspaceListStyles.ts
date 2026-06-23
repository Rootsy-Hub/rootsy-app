/** Tokens compartidos entre listados tipo “workspace” (layout preview, clientes, etc.). */

import { cn } from "@/lib/utils"

export const dataWorkspaceShellCard =
  "rounded-2xl border border-border/80 bg-card shadow-sm"

export const toolbarBlockLabelClass =
  "text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground"

/** Toolbar flush (período, filtros, búsqueda). */
export const lightToolbarShellClass =
  "shrink-0 border-b border-border/80 bg-card"

export const lightToolbarPanelClass =
  "border-b border-r border-border/80 bg-card px-4 py-3.5 xl:border-b-0"

export const lightToolbarPanelLastClass =
  "border-b border-border/80 bg-card px-4 py-3.5 xl:border-b-0 xl:border-r-0"

export const lightToolbarFocusClass =
  "focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20"

export const lightToolbarControlClass =
  "h-11 w-full max-w-full rounded-md border-border/60 bg-muted/25 text-sm text-foreground shadow-sm transition-[color,background-color,border-color,box-shadow] duration-150 hover:bg-muted/40"

export const lightToolbarControlActiveClass =
  "border-primary/35 bg-primary/10 text-foreground ring-1 ring-primary/15"

export const lightToolbarButtonClass = cn(
  lightToolbarControlClass,
  "gap-2 px-3 font-medium",
  lightToolbarFocusClass,
)

export const lightToolbarInputClass = cn(
  lightToolbarControlClass,
  "pl-9 font-normal placeholder:text-muted-foreground shadow-none",
  lightToolbarFocusClass,
)

export const lightToolbarClearButtonClass =
  "absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-[color,background-color] duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"

export const lightFilterChipClass =
  "max-w-full gap-1 rounded-md border-border/50 py-0 pr-0.5 font-normal"

export const thBase =
  "sticky top-0 z-20 h-10 border-b border-border bg-muted/90 px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/70 shadow-[0_1px_0_0_hsl(var(--border))] backdrop-blur-sm supports-[backdrop-filter]:bg-muted/75 dark:border-border/55 dark:bg-background/90 dark:text-muted-foreground dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)] supports-[backdrop-filter]:dark:bg-background/82"

/** Header claro de tabla con columnas en negrita. */
export const lightTableThClass = cn(thBase, "font-bold text-foreground")

export const tableChromeFooterClass =
  "border-t border-border/80 bg-muted/35 dark:border-border/50 dark:bg-muted/20"

export const darkTableFooterClass =
  "border-t border-white/10 bg-[#12161c]"

export const darkTableFooterNavGroupClass =
  "flex min-w-0 flex-1 items-stretch"

export const darkTableFooterControlSurfaceClass =
  "bg-[#2a313a] text-white transition-colors hover:bg-[#323b46] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400/40"

export const darkTableFooterNavButtonClass = cn(
  "inline-flex size-16 shrink-0 items-center justify-center rounded-none disabled:pointer-events-none disabled:opacity-35",
  darkTableFooterControlSurfaceClass,
)

export const footerPaginationSelectTriggerClass = cn(
  "h-11 min-h-11 min-w-[4.25rem] gap-1.5 rounded-lg border-0 px-3.5 text-sm font-medium text-white shadow-none",
  "!bg-[#2a313a] hover:!bg-[#323b46] dark:!bg-[#2a313a] dark:hover:!bg-[#323b46]",
  "data-[size=default]:!h-11 data-[size=sm]:!h-11",
  "focus-visible:border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400/40 focus-visible:ring-offset-0",
  "[&_svg:not([class*='text-'])]:!text-white/60",
  "*:data-[slot=select-value]:text-white",
)

export const darkTableFooterCenterClass =
  "flex min-w-0 flex-1 items-center justify-center gap-3 self-center px-4"

export const darkTableFooterCenterMutedClass =
  "text-sm font-medium tabular-nums text-slate-500"

export const tableRowSelectCheckboxClass =
  "size-4 border border-foreground/22 bg-background/85 shadow-sm dark:border-foreground/28 dark:bg-card/90 [&_[data-slot=checkbox-indicator]_svg]:size-3.5 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary/55 data-[state=indeterminate]:bg-primary/10 data-[state=indeterminate]:text-primary"

export const selectColumnInnerClass =
  "flex w-full items-center justify-center px-2"

/** Tablas de datos dentro del shell workspace (scroll horizontal común). */
export const workspaceDataTableClassName =
  "relative w-full min-w-[80rem] table-fixed caption-bottom text-sm"

/** Precios e importes: monoespacio + alineación numérica estable. */
export const tdMoneyClass =
  "font-mono text-[13px] tabular-nums tracking-tight text-foreground"

export const tdMoneyMutedClass =
  "font-mono text-[13px] tabular-nums tracking-tight text-muted-foreground"

export function workspaceTableBodyRowClassNames(index: number): string {
  return cn(
    "border-border/50 transition-colors hover:bg-primary/10",
    index % 2 === 0
      ? "bg-white/30"
      : "bg-muted/25 dark:bg-muted/15",
  )
}
