import { cn } from "@/lib/utils"

/** Ancho fijo del rail lateral del canvas — catálogo / sidebar operativo. */
export const LAYOUTS_OPERATIONS_CANVAS_RAIL_WIDTH_PX = 230

/** Ancho fijo de la columna de resumen — Mesas, Mostrador, Compras. */
export const LAYOUTS_OPERATIONS_SUMMARY_PANEL_WIDTH_PX = 380

/** Scope colorista — activar tokens --op-* en rootsyNaturePalette.css */
export const layoutsOperationsBodyScopeClass = "layouts-operations-body"

/** Modificador wireframe — paleta noche en columna dark (ver rootsyNaturePalette.css). */
export const layoutsOperationsBodyWireframeClass = "layouts-operations-wireframe"

export const layoutsOperationsHeaderScopeClass = "layouts-operations-header"

/** Grid del header — igual que DataWorkspaceLayout en operaciones. */
export const layoutsOperationsHeaderGridClass =
  "relative z-10 grid h-17 w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 px-4"

/** Cuerpo bajo el header — ancla nocturna entre las dos columnas. */
export const layoutsOperationsBodyShellClass = cn(
  "relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--op-dark-shell)]",
)

/** Dos columnas: dark fluida + resumen light fijo. */
export const layoutsOperationsBodyColumnsClass =
  "grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_380px]"

/** Columna izquierda — canvas arriba + banda inferior h-20. */
export const layoutsOperationsMainColumnClass =
  "grid min-h-0 min-w-0 grid-rows-[minmax(0,1fr)_auto]"

/** Zona principal — rail fijo + canvas fluido. */
export const layoutsOperationsMainCanvasClass =
  "grid min-h-0 grid-cols-[230px_minmax(0,1fr)] overflow-hidden"

/** Rail catálogo — 230px, categorías en noche 950. */
export const layoutsOperationsMainCanvasRailClass = cn(
  "w-[230px] max-w-[230px] shrink-0 overflow-hidden",
  "border-r border-[var(--op-dark-divider)]",
  "bg-[var(--op-dark-rail)]",
)

/** Canvas de trabajo — catálogo de productos sobre noche 900. */
export const layoutsOperationsMainCanvasContentClass =
  "min-h-0 overflow-hidden bg-[var(--op-dark-canvas)]"

/** Scroll minimalista compartido (rail + canvas catálogo). */
export const layoutsOperationsCatalogRailScrollClass = "layouts-operations-catalog-rail-scroll"

export const layoutsOperationsScrollMinimalClass = "layouts-operations-scroll-minimal"

/** Scroll del catálogo de productos en el canvas. */
export const layoutsOperationsCatalogCanvasScrollClass = cn(
  layoutsOperationsScrollMinimalClass,
  "min-h-0 flex-1 overflow-y-auto",
)

/** Grilla de productos — 2 cols en preview, 3 en canvas ancho. */
export const layoutsOperationsCatalogGridClass =
  "grid grid-cols-2 gap-3 p-3 xl:grid-cols-3"

/** Card de producto — noche 800 elevada, elevation.raised + radius.xlarge (lib). */
export const layoutsOperationsProductCardClass = cn(
  "layouts-operations-product-card group relative grid h-[280px] w-full grid-rows-[132px_1fr] overflow-hidden text-left",
  "transition-[box-shadow,transform] duration-200 ease-out",
  "hover:-translate-y-0.5",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--op-rail-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--op-dark-canvas)]",
)

export const layoutsOperationsProductCardMediaClass =
  "relative overflow-hidden bg-[var(--op-product-card-media-bg)]"

export const layoutsOperationsProductCardMediaPlaceholderClass =
  "flex size-full flex-col items-center justify-center gap-2 bg-[var(--op-product-card-media-bg)]"

export const layoutsOperationsProductCardMediaPlaceholderIconClass = cn(
  "flex size-11 items-center justify-center rounded-xl",
  "bg-[var(--op-product-card-placeholder-icon-bg)] text-[var(--op-product-card-placeholder-icon-text)]",
  "ring-1 ring-[var(--op-product-card-placeholder-icon-ring)]",
)

export const layoutsOperationsProductCardMediaPlaceholderLabelClass =
  "text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--op-product-card-placeholder-label)]"

export const layoutsOperationsProductCardBodyClass =
  "flex min-h-0 flex-col justify-between gap-2 p-4"

export const layoutsOperationsProductCardTitleClass =
  "line-clamp-2 text-sm font-bold leading-tight text-[var(--op-product-card-title)]"

export const layoutsOperationsProductCardDescClass =
  "line-clamp-2 text-xs leading-relaxed text-[var(--op-product-card-desc)]"

export const layoutsOperationsProductCardPriceClass =
  "text-lg font-bold tabular-nums text-[var(--op-product-card-price)]"

export const layoutsOperationsProductCardOfferClass =
  "absolute left-2 top-2 z-10 rounded-md bg-[var(--op-product-card-offer-bg)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--op-product-card-offer-text)]"

export const layoutsOperationsProductCardAddClass = cn(
  "pointer-events-none absolute right-2 bottom-2 z-10 flex size-8 items-center justify-center rounded-full",
  "border border-[color-mix(in_srgb,var(--nature-canopy-300)_45%,transparent)] bg-[var(--nature-canopy-500)] text-[var(--nature-night-950)]",
  "opacity-0 shadow-[0_4px_16px_color-mix(in_srgb,var(--nature-canopy-600)_55%,transparent)] transition-[opacity,transform] duration-200",
  "translate-y-1 scale-95 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100",
)

/** Toolbox / configuración — h-20, puente entre rail y canvas. */
export const layoutsOperationsMainFooterClass = cn(
  "h-20 shrink-0 overflow-hidden",
  "border-t border-[var(--op-dark-divider)]",
  "bg-[var(--op-dark-footer)]",
)

/** Barra toolbox — 4 slots como Vender, bloques rectangulares a ancho completo. */
export const layoutsOperationsToolboxBarClass = "grid h-full w-full grid-cols-4 gap-0"

export const layoutsOperationsToolboxSlotClass = cn(
  "group relative flex h-full min-w-0 items-center gap-2 px-2.5 text-left transition-colors duration-150 sm:gap-2.5 sm:px-3",
  "border-r border-[var(--op-footer-slot-border)] last:border-r-0",
  "hover:bg-[var(--op-footer-slot-hover)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--op-rail-focus-ring)]",
)

export const layoutsOperationsToolboxSlotConfiguredClass =
  "bg-[var(--op-footer-slot-configured)] shadow-[inset_0_1px_0_0_var(--op-footer-slot-highlight)]"

export const layoutsOperationsToolboxIconWrapClass = cn(
  "flex size-8 shrink-0 items-center justify-center rounded-md transition-colors duration-150",
  "bg-[var(--op-footer-icon-bg)] text-[var(--op-footer-icon-text)]",
  "group-hover:bg-[var(--op-footer-icon-hover-bg)] group-hover:text-[var(--op-footer-icon-hover-text)]",
)

export const layoutsOperationsToolboxIconWrapConfiguredClass = cn(
  "bg-[var(--op-footer-icon-configured-bg)] text-[var(--op-footer-icon-configured-text)]",
  "group-hover:bg-[var(--op-footer-icon-configured-bg)] group-hover:text-[var(--op-footer-icon-configured-text)]",
)

export const layoutsOperationsToolboxSlotLabelClass =
  "mb-0 block truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--op-footer-slot-label)]"

export const layoutsOperationsToolboxSlotValueClass =
  "block truncate text-xs font-semibold leading-tight text-[var(--op-footer-slot-value)]"

export const layoutsOperationsToolboxSlotValueMutedClass =
  "block truncate text-xs font-semibold leading-tight text-[var(--op-footer-slot-value-muted)]"

/** Columna resumen — light, separada del bloque dark. */
export const layoutsOperationsSummaryPanelClass = cn(
  "rootsy-app-light grid h-full min-h-0 shrink-0 grid-rows-[auto_minmax(0,1fr)_auto]",
  "w-[380px] max-w-[380px]",
  "border-l border-[var(--op-light-border-panel)]",
  "bg-[var(--op-light-panel)]",
)

/** Tabs del resumen — tierra 50 sobre panel tierra. */
export const layoutsOperationsSummaryTabsRowClass =
  "h-11 shrink-0 border-b border-[var(--op-light-border)] bg-[var(--op-light-tabs)]"

/** Cuerpo del ticket — tierra 100 para legibilidad sobre el panel claro. */
export const layoutsOperationsSummaryContentClass =
  "min-h-0 overflow-hidden bg-[var(--op-light-content)]"

/** Totales — h-20, gradiente tierra oscuro (700 → 800 → 900). */
export const layoutsOperationsSummaryTotalsRowClass = cn(
  "layouts-operations-summary-totals",
  "relative h-20 shrink-0 overflow-hidden",
  "border-t border-[var(--op-light-totals-border)]",
)

export const layoutsOperationsSummaryTotalsRowEdgeClass =
  "pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-[linear-gradient(90deg,transparent_0%,var(--op-light-edge-glow)_18%,color-mix(in_srgb,var(--nature-earth-400)_62%,transparent)_50%,var(--op-light-edge-glow)_82%,transparent_100%)]"

export const layoutsOperationsSummaryTotalsLabelClass =
  "text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--op-light-text-totals-label)]"

export const layoutsOperationsSummaryTotalsAmountClass =
  "text-base font-semibold tabular-nums text-[var(--op-light-text-totals-amount)]"

/** Cabecera del ticket — título + contador de líneas. */
export const layoutsOperationsSummaryCartHeadingClass =
  "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--op-light-cart-heading)]"

export const layoutsOperationsSummaryCartMetaClass =
  "shrink-0 text-[11px] font-medium tabular-nums text-[var(--op-light-cart-meta)]"

/** Empty state del ticket — icono + título centrados en el cuerpo. */
export const layoutsOperationsSummaryEmptyStateClass =
  "flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-12 text-center"

export const layoutsOperationsSummaryEmptyStateContentClass =
  "flex max-w-[260px] flex-col items-center gap-3"

export const layoutsOperationsSummaryEmptyIconWrapClass =
  "flex size-14 items-center justify-center rounded-2xl bg-[var(--op-light-empty-icon-bg)] text-[var(--op-light-empty-icon-text)] ring-1 ring-[var(--op-light-empty-icon-ring)] shadow-[var(--op-light-empty-shadow)]"

export const layoutsOperationsSummaryEmptyTitleClass =
  "text-sm font-semibold text-[var(--op-light-empty-title)]"

/** Nav del rail catálogo — bloques apilados a ancho completo. */
export const layoutsOperationsCatalogRailNavClass = cn(
  layoutsOperationsCatalogRailScrollClass,
  "flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto py-4",
)

export const layoutsOperationsCatalogRailSectionLabelClass =
  "mb-2.5 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--op-rail-section-label)]"

export const layoutsOperationsCatalogRailListClass = "flex w-full flex-col gap-0 p-0"

export const layoutsOperationsCatalogRailListItemClass = "w-full"

export const layoutsOperationsCatalogRailItemClass = cn(
  "relative flex h-11 w-full items-center rounded-none px-4 text-left text-sm font-medium transition-colors duration-150",
  "border-b border-[var(--op-rail-item-border)]",
  "text-[var(--op-rail-item-text)]",
  "hover:bg-[var(--op-rail-item-hover)] hover:text-[var(--op-rail-item-text-hover)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--op-rail-focus-ring)]",
)

export const layoutsOperationsCatalogRailItemSelectedClass = cn(
  "bg-[var(--op-rail-item-selected)] text-[var(--op-rail-item-text-selected)]",
  "shadow-[inset_3px_0_0_0_var(--op-rail-accent)]",
)

export const layoutsOperationsCatalogRailItemWithIconClass = "gap-2.5"

export const layoutsOperationsCatalogRailItemPromoSelectedClass = cn(
  "bg-[var(--op-rail-promo-selected)] text-[var(--op-rail-promo-text)]",
  "shadow-[inset_3px_0_0_0_var(--op-rail-promo-accent)]",
)

export const layoutsOperationsCatalogRailItemDiscountSelectedClass = cn(
  "bg-[var(--op-rail-discount-selected)] text-[var(--op-rail-discount-text)]",
  "shadow-[inset_3px_0_0_0_var(--op-rail-discount-accent)]",
)
