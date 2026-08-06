import { rootsySpacePx } from "@/lib/design-system"
import { cn } from "@/lib/utils"

/** Rail categorías — 6× space.600 (288px) · surco fijo alineado a grilla 8px. */
export const LAYOUTS_OPERAR_CATALOG_SIDEBAR_WIDTH_PX = rootsySpacePx("600") * 6

/** Columna ticket bruma — 10× space.500 (400px) · carrito + stepper + totales. */
export const LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_PX = rootsySpacePx("500") * 10

export const LAYOUTS_OPERAR_CATALOG_SIDEBAR_WIDTH_TOKEN = "6× space.600"
export const LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_TOKEN = "10× space.500"

/** Clases Tailwind derivadas — producción POS (sale, compras, mesas). */
export const layoutsOperarCatalogSidebarOpenWidthClass = `w-[${LAYOUTS_OPERAR_CATALOG_SIDEBAR_WIDTH_PX}px]`
export const layoutsOperarCatalogSidebarOpenMinWidthClass = `min-w-[${LAYOUTS_OPERAR_CATALOG_SIDEBAR_WIDTH_PX}px]`
export const layoutsOperarSummaryPanelMaxWidthClass = `max-w-[${LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_PX}px]`

export const layoutsOperarCatalogSidebarInnerClass = cn(
  "flex h-full flex-col",
  layoutsOperarCatalogSidebarOpenWidthClass,
  layoutsOperarCatalogSidebarOpenMinWidthClass,
)

export function layoutsOperarCatalogSidebarAsideWidthClass(open: boolean) {
  return open ? layoutsOperarCatalogSidebarOpenWidthClass : "w-0 border-r-0"
}

/** Scope operar — activar tokens en layoutsOperarTheme.css bajo .rootsy-theme-pos. */
export const layoutsOperarBodyScopeClass = "layouts-operar-body"

export const layoutsOperarBodyWireframeClass = "layouts-operar-wireframe"

export const layoutsOperarHeaderScopeClass = "layouts-operar-header"

export const layoutsOperarHeaderGridClass =
  "relative z-10 grid h-17 w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 px-4"

export const layoutsOperarBodyShellClass = cn(
  "relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--rootsy-sombra-950)]",
)

/** Grid principal — filas/columnas desde ROOTSY_LAYOUTS_OPERAR_ANATOMY vía CSS vars. */
export const layoutsOperarBodyMainGridClass = cn(
  "grid min-h-0 flex-1",
  "[grid-template-columns:var(--layouts-operar-grid-cols)]",
  "[grid-template-rows:var(--layouts-operar-grid-rows)]",
)

/** Columna catálogo + toolbox (col 1). */
export const layoutsOperarCatalogColumnClass = "col-start-1 row-start-1 flex min-h-0 min-w-0 overflow-hidden"

/** Catálogo en grid principal — separador hacia toolbox. */
export const layoutsOperarCatalogColumnInMainGridClass = cn(
  layoutsOperarCatalogColumnClass,
  "border-b border-[var(--layouts-operar-border-dark-default)]",
)

/** Rail catálogo — dosel denso sombra-950. */
export const layoutsOperarCatalogSidebarClass = cn(
  "relative shrink-0 overflow-hidden bg-[var(--rootsy-sombra-950)]",
  "border-r border-[var(--layouts-operar-border-dark-hairline)]",
  "transition-[width,border-color] duration-300 ease-in-out motion-reduce:transition-none",
)

export const layoutsOperarCatalogSidebarOpenClass =
  "w-[var(--layouts-operar-catalog-sidebar-w)] min-w-[var(--layouts-operar-catalog-sidebar-w)]"
export const layoutsOperarCatalogSidebarClosedClass = "w-0 border-r-0"

/** Estructura catálogo wireframe — color vía getLayoutsOperarWireframeZoneStyle. */
export const layoutsOperarWireframeCatalogSidebarClass = cn(
  "relative shrink-0 overflow-hidden",
  layoutsOperarCatalogSidebarOpenClass,
)

export const layoutsOperarWireframeCatalogCanvasClass = cn(
  "grid min-h-0 min-w-0 flex-1",
  "[grid-template-rows:var(--layouts-operar-catalog-rows)]",
)

export const layoutsOperarWireframeCatalogToolbarClass = cn(
  "relative flex min-w-0 shrink-0 items-center gap-3 px-4",
  "[height:var(--layouts-operar-catalog-toolbar-h)]",
)

export const layoutsOperarWireframeSummaryPanelClass = cn(
  "col-start-2 row-span-2 grid min-h-0 overflow-hidden",
  "[grid-template-rows:var(--layouts-operar-ticket-rows)]",
  "w-[var(--layouts-operar-ticket-w)] max-w-[var(--layouts-operar-ticket-w)]",
  "border-l border-[var(--layouts-operar-border-split)]",
)

/** Canvas productos — sombra-800. */
export const layoutsOperarCatalogCanvasClass = cn(
  "grid min-h-0 min-w-0 flex-1 bg-[var(--rootsy-sombra-800)]",
  "[grid-template-rows:var(--layouts-operar-catalog-rows)]",
)

export const layoutsOperarCatalogToolbarClass = cn(
  "flex min-w-0 shrink-0 items-center gap-3 border-b border-[var(--layouts-operar-border-dark-hairline)] px-4",
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
  "border border-[var(--layouts-operar-border-dark-card)] bg-[var(--rootsy-sombra-600)]",
  "transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5",
)

/** Tarjeta horizontal — vista lista · sale `modoVista === "lista"`. */
export const layoutsOperarProductCardListClass = cn(
  "layouts-operar-product-card group relative flex min-h-[152px] w-full items-stretch overflow-hidden rounded-2xl text-left",
  "border border-[var(--layouts-operar-border-dark-card)] bg-[var(--rootsy-sombra-600)]",
  "transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5",
)

export const layoutsOperarProductCardListMediaClass =
  "relative h-[152px] w-48 shrink-0 overflow-hidden bg-[var(--layouts-operar-product-card-media-bg)]"

export const layoutsOperarProductCardGridBodyClass =
  "grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-2 p-5"

export const layoutsOperarProductCardListBodyClass =
  "flex min-h-0 min-w-0 flex-1 flex-col justify-between gap-2 p-5"

/** Canvas oscuro para demos de artículo aislado. */
export const layoutsOperarCatalogArticleCanvasClass = cn(
  layoutsOperarBodyScopeClass,
  "overflow-hidden rounded-2xl border border-[var(--layouts-operar-border-dark-hairline)]",
  "bg-[var(--rootsy-sombra-800)] p-4",
)

/** Canvas artículo + tema POS — activa tokens tarjeta (layoutsOperarTheme.css) en demos §2.1 / §2.2. */
export const layoutsOperarCatalogArticleDemoScopeClass = cn(
  "rootsy-theme-pos rootsy-radius-system",
  layoutsOperarCatalogArticleCanvasClass,
)

export const layoutsOperarProductCardMediaClass =
  "relative overflow-hidden bg-[var(--layouts-operar-product-card-media-bg)]"

/** Superficie foto ausente — sin icono ni copy; paridad object-cover + hover de imagen real. */
export const layoutsOperarProductCardMediaEmptyStateClass = cn(
  "relative size-full overflow-hidden",
  "transition-transform duration-300 ease-out group-hover:scale-[1.03]",
)

export const layoutsOperarProductCardMediaEmptyStateGrainClass =
  "layouts-operar-product-card-media-empty-grain pointer-events-none absolute inset-0"

export const layoutsOperarProductCardBodyClass =
  "flex min-h-0 flex-col justify-between gap-2 p-4"

export const layoutsOperarProductCardTitleClass =
  "line-clamp-2 text-sm font-bold leading-tight text-[var(--layouts-operar-product-card-title)]"

export const layoutsOperarProductCardDescClass =
  "line-clamp-2 text-xs leading-relaxed text-[var(--layouts-operar-product-card-desc)]"

export const layoutsOperarProductCardPriceClass =
  "text-lg font-bold tabular-nums text-[var(--layouts-operar-product-card-price)]"

export const layoutsOperarProductCardOfferClass =
  "absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"

export const layoutsOperarProductCardAddClass = cn(
  "pointer-events-none absolute right-2 bottom-2 z-10 flex size-8 items-center justify-center rounded-full",
  "border border-[color-mix(in_srgb,var(--rootsy-savia-300)_45%,transparent)]",
  "bg-[var(--rootsy-savia-500)] text-[var(--rootsy-savia-950)]",
  "opacity-0 transition-[opacity,transform] duration-200",
  "translate-y-1 scale-95 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100",
)

/** Toolbox — fila 2 col 1 · saleOperationStyles. */
export const layoutsOperarToolboxRowClass = "col-start-1 row-start-2 min-h-0"

/** Banda toolbox aislada — altura mínima desde anatomía. */
export const layoutsOperarToolboxBandClass = cn(
  "relative min-h-0 w-full",
  "min-h-[var(--layouts-operar-toolbox-min-h)] sm:min-h-[var(--layouts-operar-toolbox-min-h-sm)]",
)

/** Grid interno toolbox — superficie en banda padre (zone style o bar surface). */
export const layoutsOperarToolboxBarGridClass = cn(
  "box-border grid h-full min-h-0 grid-cols-2 gap-2 lg:grid-cols-4",
  "p-[var(--layouts-operar-toolbox-band-py)] sm:gap-2.5 sm:p-[var(--layouts-operar-toolbox-band-py-sm)]",
)

/** Shell sombra-950 — demos toolbox aisladas sobre fondo claro de la doc. */
export const layoutsOperarToolboxDemoShellClass = cn(
  layoutsOperarBodyShellClass,
  "overflow-hidden",
)

/** Barra toolbox standalone — incluye superficie sombra-950. */
export const layoutsOperarToolboxBarClass = cn(
  layoutsOperarToolboxBarGridClass,
  "border-t border-[var(--layouts-operar-border-dark-default)]",
  "bg-[var(--rootsy-sombra-950)]",
)

export function layoutsOperarToolboxSlotClass(configured: boolean) {
  return cn(
    "group flex h-full min-h-[var(--layouts-operar-toolbox-slot-min-h)] w-full items-center gap-2.5 rounded-xl border-0 px-2.5 py-2 text-left transition-[background-color,box-shadow] duration-150 sm:min-h-[var(--layouts-operar-toolbox-slot-min-h-sm)] sm:gap-3 sm:px-3",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rootsy-savia-400)]/45",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rootsy-sombra-950)]",
    configured
      ? "bg-[var(--layouts-operar-footer-slot-configured)] shadow-[inset_0_1px_0_var(--layouts-operar-footer-slot-highlight)] hover:bg-[color-mix(in_srgb,var(--rootsy-savia-600)_18%,var(--rootsy-sombra-950))]"
      : "bg-white/[0.02] hover:bg-[var(--layouts-operar-footer-slot-hover)]",
  )
}

export function layoutsOperarToolboxIconWrapClass(configured: boolean) {
  return cn(
    "flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-150",
    configured
      ? "bg-[var(--layouts-operar-footer-icon-configured-bg)] text-[var(--layouts-operar-footer-icon-configured-text)]"
      : "bg-[var(--layouts-operar-footer-icon-bg)] text-[var(--layouts-operar-footer-icon-text)] group-hover:bg-[var(--layouts-operar-footer-icon-hover-bg)] group-hover:text-[var(--layouts-operar-footer-icon-hover-text)]",
  )
}

/** Superficie ticket — filas desde anatomía (con o sin placement en grid). */
export const layoutsOperarSummaryPanelSurfaceClass = cn(
  "rootsy-app-light grid min-h-0 overflow-hidden",
  "[grid-template-rows:var(--layouts-operar-ticket-rows)]",
  "bg-[var(--rootsy-bruma-100)] text-[var(--rootsy-bruma-900)]",
)

/** Panel ticket — col 2 row-span 2 · filas desde anatomía. */
export const layoutsOperarSummaryPanelClass = cn(
  layoutsOperarSummaryPanelSurfaceClass,
  "col-start-2 row-span-2 border-l border-[var(--layouts-operar-border-split)]",
  "w-[var(--layouts-operar-ticket-w)] max-w-[var(--layouts-operar-ticket-w)]",
)

/** Panel ticket aislado — sección 4 · demo sin grid padre. */
export const layoutsOperarSummaryPanelStandaloneClass = cn(
  layoutsOperarBodyScopeClass,
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
  "flex items-center justify-between gap-2 border-b border-[var(--layouts-operar-border-light)] px-3 py-2"

export const layoutsOperarSummaryCartRowClass =
  "relative flex min-h-0 flex-col bg-[var(--rootsy-bruma-100)]"

export const layoutsOperarSummaryActionsRowClass = cn(
  "grid shrink-0 grid-cols-2 divide-x divide-[var(--layouts-operar-border-light)]",
  "border-t border-[var(--layouts-operar-border-light)] bg-white",
  "[height:var(--layouts-operar-ticket-actions-h)]",
)

export const layoutsOperarSummaryTotalRowClass = cn(
  "layouts-operar-summary-totals flex items-center justify-between px-4 py-3",
  "border-t border-[var(--layouts-operar-border-totals)]",
  "min-h-[var(--layouts-operar-ticket-total-min-h)] sm:min-h-[var(--layouts-operar-ticket-total-min-h-sm)]",
)

export const layoutsOperarSummaryCartHeadingClass =
  "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--layouts-operar-light-cart-heading)]"

export const layoutsOperarSummaryCartMetaClass =
  "shrink-0 text-[11px] font-medium tabular-nums text-[var(--layouts-operar-light-cart-meta)]"

export const layoutsOperarSummaryEmptyStateClass =
  "flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-12 text-center"

export const layoutsOperarSummaryEmptyStateContentClass =
  "flex max-w-[260px] flex-col items-center gap-3"

export const layoutsOperarSummaryEmptyIconWrapClass = cn(
  "flex size-14 items-center justify-center rounded-2xl bg-white",
  "text-[var(--layouts-operar-light-empty-icon-text)]",
  "ring-1 ring-[var(--layouts-operar-light-empty-icon-ring)] shadow-sm",
)

export const layoutsOperarSummaryEmptyTitleClass =
  "text-sm font-semibold text-[var(--layouts-operar-light-empty-title)]"

export const layoutsOperarSummaryTotalsLabelClass =
  "text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--layouts-operar-light-totals-label)]"

export const layoutsOperarSummaryTotalsAmountClass =
  "text-xl font-bold tabular-nums tracking-tight text-[var(--layouts-operar-light-totals-amount)] sm:text-2xl"

/** Nav rail catálogo — categorías. */
export const layoutsOperarCatalogRailNavClass = cn(
  layoutsOperarCatalogRailScrollClass,
  "flex h-full w-[var(--layouts-operar-catalog-sidebar-w)] min-w-[var(--layouts-operar-catalog-sidebar-w)] flex-col gap-6 overflow-y-auto py-4",
)

export const layoutsOperarCatalogRailSectionLabelClass =
  "mb-2 px-4 text-[11px] font-semibold uppercase tracking-[0.13em] text-[color-mix(in_srgb,var(--rootsy-sombra-400)_88%,var(--rootsy-bruma-100))]"

export const layoutsOperarCatalogRailListClass = "flex w-full flex-col gap-0 p-0"
export const layoutsOperarCatalogRailListItemClass = "w-full"

/** Rail categorías — lista clara · legibilidad cajero. */
export const layoutsOperarCatalogRailItemClass = cn(
  "relative flex min-h-12 w-full items-center rounded-none px-4 text-left text-[15px] font-medium leading-snug transition-colors duration-150",
  "border-b border-[var(--layouts-operar-rail-item-border)] text-[var(--layouts-operar-rail-item-text)]",
  "hover:bg-[var(--layouts-operar-rail-item-hover)] hover:text-[var(--layouts-operar-rail-item-text-hover)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--layouts-operar-rail-focus-ring)]",
)

export const layoutsOperarCatalogRailItemSelectedClass = cn(
  "bg-[var(--layouts-operar-rail-item-selected)] font-semibold text-[var(--layouts-operar-rail-item-text-selected)]",
  "shadow-[inset_3px_0_0_0_var(--layouts-operar-rail-accent)]",
)

export const layoutsOperarCatalogRailItemWithIconClass = "gap-2.5"

export const layoutsOperarCatalogRailItemPromoSelectedClass = cn(
  "bg-[var(--layouts-operar-rail-promo-selected)] font-semibold text-[var(--layouts-operar-rail-promo-text)]",
  "shadow-[inset_3px_0_0_0_var(--layouts-operar-rail-promo-accent)]",
)

export const layoutsOperarCatalogRailItemDiscountSelectedClass = cn(
  "bg-[var(--layouts-operar-rail-discount-selected)] font-semibold text-[var(--layouts-operar-rail-discount-text)]",
  "shadow-[inset_3px_0_0_0_var(--layouts-operar-rail-discount-accent)]",
)

/** @deprecated alias — usar layoutsOperarBodyScopeClass */
export const layoutsOperationsBodyScopeClass = layoutsOperarBodyScopeClass
/** @deprecated alias */
export const layoutsOperationsBodyShellClass = layoutsOperarBodyShellClass
