import { cn } from "@/lib/utils"

/** Ancho fijo del rail lateral del canvas — catálogo / sidebar operativo. */
export const LAYOUTS_OPERATIONS_CANVAS_RAIL_WIDTH_PX = 230

/** Ancho fijo de la columna de resumen — Mesas, Mostrador, Compras. */
export const LAYOUTS_OPERATIONS_SUMMARY_PANEL_WIDTH_PX = 380

/** Scope colorista — activar tokens --op-* en rootsyNaturePalette.css */
export const layoutsOperationsBodyScopeClass = "layouts-operations-body"

export const layoutsOperationsHeaderScopeClass = "layouts-operations-header"

/** Grid del header — igual que DataWorkspaceLayout en operaciones. */
export const layoutsOperationsHeaderGridClass =
  "relative z-10 grid h-18 w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 px-4"

/** Cuerpo bajo el header — ancla nocturna entre las dos columnas. */
export const layoutsOperationsBodyShellClass =
  "relative min-h-0 flex-1 overflow-hidden bg-[var(--op-dark-shell)]"

/** Dos columnas: dark fluida + resumen light fijo. */
export const layoutsOperationsBodyColumnsClass =
  "grid h-full min-h-0 grid-cols-[minmax(0,1fr)_380px]"

/** Columna izquierda — canvas arriba + banda inferior h-17. */
export const layoutsOperationsMainColumnClass =
  "grid min-h-0 min-w-0 grid-rows-[minmax(0,1fr)_auto]"

/** Zona principal — rail fijo + canvas fluido. */
export const layoutsOperationsMainCanvasClass =
  "grid min-h-0 grid-cols-[230px_minmax(0,1fr)] overflow-hidden"

/** Rail catálogo — 230px, el tono más profundo del bloque dark. */
export const layoutsOperationsMainCanvasRailClass = cn(
  "w-[230px] max-w-[230px] shrink-0 overflow-hidden",
  "border-r border-[var(--op-dark-divider)]",
  "bg-[var(--op-dark-rail)]",
)

/** Canvas de trabajo — noche con levísima tinta canopy. */
export const layoutsOperationsMainCanvasContentClass =
  "min-h-0 overflow-hidden bg-[var(--op-dark-canvas)]"

/** Toolbox / configuración — h-17, puente entre rail y canvas. */
export const layoutsOperationsMainFooterClass = cn(
  "h-17 shrink-0 overflow-hidden",
  "border-t border-[var(--op-dark-divider)]",
  "bg-[var(--op-dark-footer)]",
)

/** Columna resumen — light, separada del bloque dark. */
export const layoutsOperationsSummaryPanelClass = cn(
  "rootsy-app-light grid h-full min-h-0 shrink-0 grid-rows-[auto_minmax(0,1fr)_auto]",
  "w-[380px] max-w-[380px]",
  "border-l border-[var(--op-light-border-panel)]",
  "bg-[var(--op-light-panel)]",
)

/** Tabs del resumen — blanco puro sobre panel tierra. */
export const layoutsOperationsSummaryTabsRowClass =
  "h-11 shrink-0 border-b border-[var(--op-light-border)] bg-[var(--op-light-tabs)]"

/** Cuerpo del ticket — blanco para máxima legibilidad. */
export const layoutsOperationsSummaryContentClass =
  "min-h-0 overflow-hidden bg-[var(--op-light-content)]"

/** Totales — light anclado: tierra clara, tipografía oscura. */
export const layoutsOperationsSummaryTotalsRowClass = cn(
  "relative shrink-0 overflow-hidden",
  "min-h-[calc(4.5rem+1rem)] sm:min-h-[calc(4.75rem+1.25rem)]",
  "border-t border-[var(--op-light-border)]",
  "bg-[var(--op-light-totals)]",
)

export const layoutsOperationsSummaryTotalsRowEdgeClass =
  "pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-[linear-gradient(90deg,transparent_0%,var(--op-light-edge-glow)_18%,color-mix(in_srgb,var(--nature-earth-400)_62%,transparent)_50%,var(--op-light-edge-glow)_82%,transparent_100%)]"

export const layoutsOperationsSummaryTotalsLabelClass =
  "text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--op-light-text-totals-label)]"

export const layoutsOperationsSummaryTotalsAmountClass =
  "text-base font-semibold tabular-nums text-[var(--op-light-text-strong)]"
