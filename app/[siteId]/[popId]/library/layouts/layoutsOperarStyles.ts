import { cn } from "@/lib/utils"

/** Sidebar catálogo colapsable — sale/page.tsx · w-[280px]. */
export const LAYOUTS_OPERAR_CATALOG_SIDEBAR_WIDTH_PX = 280

/** Columna ticket / resumen — Vender · Mesas · Mostrador · Compras. */
export const LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_PX = 380

/** Scope colorista — activar tokens --op-* en rootsyNaturePalette.css */
export const layoutsOperarBodyScopeClass = "layouts-operar-body"

export const layoutsOperarBodyWireframeClass = "layouts-operar-wireframe"

export const layoutsOperarHeaderScopeClass = "layouts-operar-header"

export const layoutsOperarHeaderGridClass =
  "relative z-10 grid h-17 w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 px-4"

export const layoutsOperarBodyShellClass = cn(
  "relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--op-dark-shell)]",
)

/** Grid principal — filas/columnas desde ROOTSY_LAYOUTS_OPERAR_ANATOMY vía CSS vars. */
export const layoutsOperarBodyMainGridClass = cn(
  "grid min-h-0 flex-1",
  "[grid-template-columns:var(--layouts-operar-grid-cols)]",
  "[grid-template-rows:var(--layouts-operar-grid-rows)]",
)

/** Columna catálogo + toolbox (col 1). */
export const layoutsOperarCatalogColumnClass = "col-start-1 row-start-1 flex min-h-0 min-w-0 overflow-hidden"

/** Rail catálogo — #1a2027 en producción. */
export const layoutsOperarCatalogSidebarClass = cn(
  "relative shrink-0 overflow-hidden border-r border-white/10 bg-[#1a2027]",
  "transition-[width,border-color] duration-300 ease-in-out motion-reduce:transition-none",
)

export const layoutsOperarCatalogSidebarOpenClass =
  "w-[var(--layouts-operar-catalog-sidebar-w)] min-w-[var(--layouts-operar-catalog-sidebar-w)]"
export const layoutsOperarCatalogSidebarClosedClass = "w-0 border-r-0"

/** Canvas productos — #20262e en producción. */
export const layoutsOperarCatalogCanvasClass = cn(
  "grid min-h-0 min-w-0 flex-1 bg-[#20262e]",
  "[grid-template-rows:var(--layouts-operar-catalog-rows)]",
)

export const layoutsOperarCatalogToolbarClass = cn(
  "flex min-w-0 shrink-0 items-center gap-3 border-b border-white/10 px-4",
  "[height:var(--layouts-operar-catalog-toolbar-h)]",
)

export const layoutsOperarScrollMinimalClass = "layouts-operar-scroll-minimal"
export const layoutsOperarCatalogRailScrollClass = "layouts-operar-catalog-rail-scroll"

export const layoutsOperarCatalogCanvasScrollClass = cn(
  layoutsOperarScrollMinimalClass,
  "min-h-0 flex-1 overflow-y-auto p-3",
)

/** Grilla demo — sale usa grid-cols-3 en desktop. */
export const layoutsOperarCatalogGridClass = "grid grid-cols-2 gap-3 xl:grid-cols-3"

export const layoutsOperarProductCardClass = cn(
  "layouts-operar-product-card group relative grid h-[318px] w-full grid-rows-[152px_1fr] overflow-hidden rounded-2xl text-left",
  "border border-white/10 bg-[#252b34]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_6px_16px_rgba(0,0,0,0.28)]",
  "transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5",
)

/** Tarjeta horizontal — vista lista · sale `modoVista === "lista"`. */
export const layoutsOperarProductCardListClass = cn(
  "layouts-operar-product-card group relative flex min-h-[152px] w-full items-stretch overflow-hidden rounded-2xl text-left",
  "border border-white/10 bg-[#252b34]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_6px_16px_rgba(0,0,0,0.28)]",
  "transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5",
)

export const layoutsOperarProductCardListMediaClass =
  "relative h-[152px] w-48 shrink-0 overflow-hidden bg-[#0f1416]"

export const layoutsOperarProductCardGridBodyClass =
  "grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-2 p-5"

export const layoutsOperarProductCardListBodyClass =
  "flex min-h-0 min-w-0 flex-1 flex-col justify-between gap-2 p-5"

/** Canvas oscuro para demos de artículo aislado. */
export const layoutsOperarCatalogArticleCanvasClass =
  "overflow-hidden rounded-2xl border border-border/70 bg-[#20262e] p-4"

export const layoutsOperarProductCardMediaClass =
  "relative overflow-hidden bg-[#0f1416]"

export const layoutsOperarProductCardMediaPlaceholderClass =
  "flex size-full flex-col items-center justify-center gap-2 bg-[#0f1416]"

export const layoutsOperarProductCardMediaPlaceholderIconClass = cn(
  "flex size-11 items-center justify-center rounded-xl",
  "bg-white/5 text-white/40 ring-1 ring-white/10",
)

export const layoutsOperarProductCardMediaPlaceholderLabelClass =
  "text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35"

export const layoutsOperarProductCardBodyClass =
  "flex min-h-0 flex-col justify-between gap-2 p-4"

export const layoutsOperarProductCardTitleClass =
  "line-clamp-2 text-sm font-bold leading-tight text-white"

export const layoutsOperarProductCardDescClass =
  "line-clamp-2 text-xs leading-relaxed text-white/45"

export const layoutsOperarProductCardPriceClass =
  "text-lg font-bold tabular-nums text-emerald-300/90"

export const layoutsOperarProductCardOfferClass =
  "absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"

export const layoutsOperarProductCardAddClass = cn(
  "pointer-events-none absolute right-2 bottom-2 z-10 flex size-8 items-center justify-center rounded-full",
  "border border-emerald-300/45 bg-emerald-500 text-[#0c1210]",
  "opacity-0 transition-[opacity,transform] duration-200",
  "translate-y-1 scale-95 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100",
)

/** Toolbox — fila 2 col 1 · saleOperationStyles. */
export const layoutsOperarToolboxRowClass = "col-start-1 row-start-2 min-h-0"

/** Banda toolbox aislada — altura mínima desde anatomía. */
export const layoutsOperarToolboxBandClass = cn(
  "relative min-h-0 w-full",
  "[min-height:var(--layouts-operar-toolbox-min-h)]",
)

/** Barra toolbox demo/lib — cabe en la fila de 68px min sin min-h de producción. */
export const layoutsOperarToolboxBarClass = cn(
  "box-border grid h-full min-h-0 grid-cols-2 gap-2 border-t border-white/10 bg-[rgba(11,16,14,0.92)] p-2 backdrop-blur-xl lg:grid-cols-4",
)

export function layoutsOperarToolboxSlotClass(configured: boolean) {
  return cn(
    "group flex h-full min-h-0 w-full items-center gap-2 rounded-xl border-0 px-2.5 py-1.5 text-left transition-[background-color,box-shadow] duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b100e]",
    configured
      ? "bg-emerald-500/[0.09] shadow-[inset_0_1px_0_rgba(167,243,208,0.08)] hover:bg-emerald-500/12"
      : "bg-white/[0.02] hover:bg-white/[0.05]",
  )
}

export function layoutsOperarToolboxIconWrapClass(configured: boolean) {
  return cn(
    "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-150",
    configured
      ? "bg-emerald-500/20 text-emerald-200"
      : "bg-white/[0.06] text-foreground/45 group-hover:bg-white/10 group-hover:text-foreground/75",
  )
}

/** Superficie ticket — filas desde anatomía (con o sin placement en grid). */
export const layoutsOperarSummaryPanelSurfaceClass = cn(
  "rootsy-app-light grid min-h-0 overflow-hidden",
  "[grid-template-rows:var(--layouts-operar-ticket-rows)]",
  "bg-[#eef1f5] text-[#121417]",
)

/** Panel ticket — col 2 row-span 2 · filas desde anatomía. */
export const layoutsOperarSummaryPanelClass = cn(
  layoutsOperarSummaryPanelSurfaceClass,
  "col-start-2 row-span-2 border-l border-white/10",
  "w-[var(--layouts-operar-ticket-w)] max-w-[var(--layouts-operar-ticket-w)]",
)

/** Panel ticket aislado — sección 4 · demo sin grid padre. */
export const layoutsOperarSummaryPanelStandaloneClass = cn(
  layoutsOperarSummaryPanelSurfaceClass,
  "h-full w-full",
)

/** Shell catálogo aislado — sección 2 · sidebar + canvas con vars de anatomía. */
export const layoutsOperarCatalogSectionShellClass = cn(
  layoutsOperarBodyScopeClass,
  layoutsOperarBodyShellClass,
  "flex h-full min-h-0 flex-col overflow-hidden",
)

export const layoutsOperarSummaryHeaderRowClass =
  "flex items-center justify-between gap-2 border-b border-[#dfe4ea] px-3 py-2"

export const layoutsOperarSummaryCartRowClass =
  "relative flex min-h-0 flex-col bg-[#f4f6f9]"

export const layoutsOperarSummaryActionsRowClass = cn(
  "grid shrink-0 grid-cols-2 divide-x divide-[#dfe4ea] border-t border-[#dfe4ea] bg-white",
  "[height:var(--layouts-operar-ticket-actions-h)]",
)

export const layoutsOperarSummaryTotalRowClass = cn(
  "flex items-center justify-between border-t border-[#dfe4ea] bg-[#252b34] px-3 text-white",
  "[min-height:var(--layouts-operar-ticket-total-min-h)]",
)

export const layoutsOperarSummaryCartHeadingClass =
  "text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600"

export const layoutsOperarSummaryCartMetaClass =
  "shrink-0 text-[11px] font-medium tabular-nums text-slate-500"

export const layoutsOperarSummaryEmptyStateClass =
  "flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-12 text-center"

export const layoutsOperarSummaryEmptyStateContentClass =
  "flex max-w-[260px] flex-col items-center gap-3"

export const layoutsOperarSummaryEmptyIconWrapClass =
  "flex size-14 items-center justify-center rounded-2xl bg-white text-slate-600 ring-1 ring-slate-300/90 shadow-sm"

export const layoutsOperarSummaryEmptyTitleClass = "text-sm font-semibold text-slate-700"

/** Nav rail catálogo — categorías. */
export const layoutsOperarCatalogRailNavClass = cn(
  layoutsOperarCatalogRailScrollClass,
  "flex h-full w-[var(--layouts-operar-catalog-sidebar-w)] min-w-[var(--layouts-operar-catalog-sidebar-w)] flex-col gap-6 overflow-y-auto py-4",
)

export const layoutsOperarCatalogRailSectionLabelClass =
  "mb-2.5 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--op-rail-section-label)]"

export const layoutsOperarCatalogRailListClass = "flex w-full flex-col gap-0 p-0"
export const layoutsOperarCatalogRailListItemClass = "w-full"

export const layoutsOperarCatalogRailItemClass = cn(
  "relative flex h-11 w-full items-center rounded-none px-4 text-left text-sm font-medium transition-colors duration-150",
  "border-b border-[var(--op-rail-item-border)] text-[var(--op-rail-item-text)]",
  "hover:bg-[var(--op-rail-item-hover)] hover:text-[var(--op-rail-item-text-hover)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--op-rail-focus-ring)]",
)

export const layoutsOperarCatalogRailItemSelectedClass = cn(
  "bg-[var(--op-rail-item-selected)] text-[var(--op-rail-item-text-selected)]",
  "shadow-[inset_3px_0_0_0_var(--op-rail-accent)]",
)

export const layoutsOperarCatalogRailItemWithIconClass = "gap-2.5"

export const layoutsOperarCatalogRailItemPromoSelectedClass = cn(
  "bg-[var(--op-rail-promo-selected)] text-[var(--op-rail-promo-text)]",
  "shadow-[inset_3px_0_0_0_var(--op-rail-promo-accent)]",
)

export const layoutsOperarCatalogRailItemDiscountSelectedClass = cn(
  "bg-[var(--op-rail-discount-selected)] text-[var(--op-rail-discount-text)]",
  "shadow-[inset_3px_0_0_0_var(--op-rail-discount-accent)]",
)

/** @deprecated alias — usar layoutsOperarBodyScopeClass */
export const layoutsOperationsBodyScopeClass = layoutsOperarBodyScopeClass
/** @deprecated alias */
export const layoutsOperationsBodyShellClass = layoutsOperarBodyShellClass
