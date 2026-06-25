/** Tokens compartidos entre listados tipo “workspace” (layout preview, clientes, etc.). */

import { cn } from "@/lib/utils"

export const dataWorkspaceShellCard =
  "rounded-2xl border border-border/80 bg-card shadow-sm"

/** Superficie del listado (flush): tono suave con gradiente, no blanco plano. */
export const workspaceTableSurfaceClass =
  "bg-[linear-gradient(180deg,oklch(0.988_0.005_115)_0%,oklch(0.972_0.013_132)_52%,oklch(0.984_0.008_118)_100%)]"

/** Brillo ambiental sobre la superficie de tabla. */
export const workspaceTableSurfaceGlowClass =
  "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_60%_at_100%_100%,oklch(0.72_0.11_155/0.08),transparent_60%),radial-gradient(ellipse_50%_42%_at_0%_0%,oklch(0.88_0.06_140/0.07),transparent_55%)]"

/** Encabezado sticky sobre superficie con gradiente. */
export const workspaceTableHeaderCellClass = cn(
  "sticky top-0 z-20 h-10 border-b border-border/45 px-2 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-foreground/75",
  "bg-[oklch(0.978_0.01_125/0.9)] shadow-[0_1px_0_0_oklch(0.88_0.02_130/0.28)] backdrop-blur-md",
)

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

/** Acción terciaria «Limpiar» en barra de selección múltiple (hover neutro, sin accent). */
export const listBulkToolbarClearButtonClass =
  "h-8 bg-transparent px-2.5 font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/25 active:bg-muted/60"

export const thBase =
  "sticky top-0 z-20 h-10 border-b border-border bg-muted/90 px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/70 shadow-[0_1px_0_0_hsl(var(--border))] backdrop-blur-sm supports-[backdrop-filter]:bg-muted/75 dark:border-border/55 dark:bg-background/90 dark:text-muted-foreground dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)] supports-[backdrop-filter]:dark:bg-background/82"

/** Header claro de tabla con columnas en negrita. */
export const lightTableThClass = workspaceTableHeaderCellClass

export const tableChromeFooterClass =
  "border-t border-border/80 bg-muted/35 dark:border-border/50 dark:bg-muted/20"

export const darkTableFooterClass = cn(
  "border-t border-zinc-800/90 backdrop-blur-xl",
  "bg-[linear-gradient(165deg,#09090b_0%,#09090b_56%,#18181b_100%)]",
)

export const darkTableFooterNavGroupClass =
  "flex min-w-0 flex-1 items-stretch"

export const darkTableFooterControlSurfaceClass = cn(
  "border-zinc-800/90 bg-zinc-900 text-zinc-100 transition-colors",
  "hover:bg-zinc-800 hover:text-white",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-500/40",
)

export const darkTableFooterNavButtonClass = cn(
  "inline-flex size-16 shrink-0 items-center justify-center rounded-none disabled:pointer-events-none disabled:opacity-35",
  darkTableFooterControlSurfaceClass,
)

export const footerPaginationSelectTriggerClass = cn(
  "h-11 min-h-11 min-w-[4.25rem] gap-1.5 rounded-lg border border-zinc-800/90 px-3.5 text-sm font-medium text-zinc-100 shadow-none",
  "!bg-zinc-900 hover:!bg-zinc-800",
  "data-[size=default]:!h-11 data-[size=sm]:!h-11",
  "focus-visible:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-500/40 focus-visible:ring-offset-0",
  "[&_svg:not([class*='text-'])]:!text-zinc-400",
  "*:data-[slot=select-value]:text-zinc-100",
)

export const darkTableFooterCenterClass =
  "flex min-w-0 flex-1 items-center justify-center gap-3 self-center px-4"

export const darkTableFooterCenterMutedClass =
  "text-sm font-medium tabular-nums text-zinc-500"

export const tableRowSelectCheckboxClass =
  "size-4 border border-foreground/22 bg-background/85 shadow-sm dark:border-foreground/28 dark:bg-card/90 [&_[data-slot=checkbox-indicator]_svg]:size-3.5 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary/55 data-[state=indeterminate]:bg-primary/10 data-[state=indeterminate]:text-primary"

export const selectColumnInnerClass =
  "flex w-full items-center justify-center px-2"

/** Texto copiable solo dentro de tablas de listado. */
export const workspaceTableSelectableTextClass =
  "select-text [&_th]:select-text [&_td]:select-text"

/** Alcance en el frame de tabla para reactivar selección bajo un shell select-none. */
export const workspaceTableFrameSelectableScopeClass =
  "[&_table]:select-text [&_table_th]:select-text [&_table_td]:select-text"

/** Tablas de datos dentro del shell workspace (scroll horizontal común). */
export const workspaceDataTableClassName = cn(
  "relative w-full min-w-[80rem] table-fixed caption-bottom text-sm",
  workspaceTableSelectableTextClass,
)

/** Precios e importes: monoespacio + alineación numérica estable. */
export const tdMoneyClass =
  "font-mono text-[13px] tabular-nums tracking-tight text-foreground"

export const tdMoneyMutedClass =
  "font-mono text-[13px] tabular-nums tracking-tight text-muted-foreground"

/** Total cobrado / importe principal. */
export const tdMoneyTotalClass =
  "font-mono text-[13px] font-semibold tabular-nums tracking-tight text-emerald-700"

/** Descuentos aplicados. */
export const tdMoneyDiscountClass =
  "font-mono text-[13px] font-medium tabular-nums tracking-tight text-amber-700"

/** IVA u otros impuestos. */
export const tdMoneyVatClass =
  "font-mono text-[13px] font-medium tabular-nums tracking-tight text-sky-700"

/** Cliente registrado (enlace a ficha). */
export const tdClientLinkedClass =
  "truncate font-medium text-violet-700 underline-offset-2 transition-colors hover:text-violet-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/35 rounded-sm"

/** Cliente con nombre pero sin ficha vinculada. */
export const tdClientNamedClass =
  "truncate font-medium text-violet-700/90"

/** Venta sin cliente identificado. */
export const tdClientAnonymousClass =
  "truncate text-sm text-muted-foreground"

/** Fila de encabezado de tabla (sin hover). */
export const workspaceTableHeaderRowClass = "border-0 hover:bg-transparent"

/** Filas de carga / vacío / mensajes (sin hover). */
export const workspaceTablePlaceholderRowClass = cn(
  "border-b border-border/40 bg-muted/25",
  "hover:bg-muted/25 pointer-events-none",
)

/** Filas de detalle expandido o contenido anidado (sin hover). */
export const workspaceTableStaticRowClass = cn(
  "border-b border-border/40 bg-muted/30",
  "hover:bg-muted/30",
)

export function workspaceTableBodyRowClassNames(
  index: number,
  options?: { selected?: boolean },
): string {
  return cn(
    "border-b border-border/40 transition-colors duration-150",
    "hover:bg-primary/[0.07]",
    index % 2 === 0 ? "bg-transparent" : "bg-foreground/[0.022]",
    options?.selected &&
      "bg-primary/[0.09] hover:bg-primary/[0.11] ring-1 ring-inset ring-primary/15",
  )
}
