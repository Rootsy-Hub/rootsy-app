/** Tokens compartidos entre listados tipo “workspace” (layout preview, clientes, etc.). */

import { cn } from "@/lib/utils"

export const dataWorkspaceShellCard =
  "rounded-2xl border border-border/80 bg-card shadow-sm"

export const toolbarBlockLabelClass =
  "text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground"

export const thBase =
  "sticky top-0 z-20 h-10 border-b border-border bg-muted/90 px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/70 shadow-[0_1px_0_0_hsl(var(--border))] backdrop-blur-sm supports-[backdrop-filter]:bg-muted/75 dark:border-border/55 dark:bg-background/90 dark:text-muted-foreground dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)] supports-[backdrop-filter]:dark:bg-background/82"

export const tableChromeFooterClass =
  "border-t border-border/80 bg-muted/35 dark:border-border/50 dark:bg-muted/20"

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
