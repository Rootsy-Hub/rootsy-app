import {
  libraryNavGroupClass,
  libraryNavGroupLabelClass,
  libraryNavItemActiveClass,
  libraryNavItemClass,
  libraryScrollDarkClass,
  librarySidebarClass,
} from "@/app/library/libraryColorTheme"
import { rootsySpacePx } from "@/lib/design-system"
import "@/app/library/layouts/rootsyLayoutsEarthFloor.css"
import {
  rootsyLayoutsEarthFloorBandClass,
  rootsyLayoutsEarthFloorBorderClass,
  rootsyLayoutsEarthFloorShadowClass,
  rootsyLayoutsEarthFloorSlotClass,
  rootsyLayoutsEarthFloorSlotConfiguredClass,
  rootsyLayoutsEarthFloorSlotIconClass,
  rootsyLayoutsEarthFloorSurfaceClass,
} from "@/app/library/layouts/rootsyLayoutsEarthFloor"
import { ROOTSY_RADIUS_TOKENS } from "@/app/library/radius/rootsyRadiusSystem"
import { cn } from "@/lib/utils"

/** radius.full — círculos del umbral Descartar / Cobrar. */
export const layoutsOperarTicketActionCircleRadius =
  ROOTSY_RADIUS_TOKENS.find((item) => item.id === "full")!.value

/** Descartar · space.600. Cobrar · space.800 — el umbral de la venta. */
export const layoutsOperarTicketActionDiscardSizePx = rootsySpacePx("600")
export const layoutsOperarTicketActionConfirmSizePx = rootsySpacePx("800")
export const layoutsOperarTicketActionDiscardIconPx = rootsySpacePx("300")
export const layoutsOperarTicketActionConfirmIconPx = rootsySpacePx("400")

/** Rail categorías — w-64 · 4× space.800 (256px) · paridad Library / Estadísticas / Ajustes. */
export const LAYOUTS_OPERAR_CATALOG_SIDEBAR_WIDTH_PX = rootsySpacePx("800") * 4

/** Columna ticket bruma — 10× space.500 (400px) · carrito + stepper + totales. */
export const LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_PX = rootsySpacePx("500") * 10

export const LAYOUTS_OPERAR_CATALOG_SIDEBAR_WIDTH_TOKEN = "w-64 · 4× space.800"
export const LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_TOKEN = "10× space.500"

/** Clases Tailwind derivadas — producción POS (sale, compras, mesas). */
export const layoutsOperarCatalogSidebarOpenWidthClass = `w-[${LAYOUTS_OPERAR_CATALOG_SIDEBAR_WIDTH_PX}px]`
export const layoutsOperarCatalogSidebarOpenMinWidthClass = `min-w-[${LAYOUTS_OPERAR_CATALOG_SIDEBAR_WIDTH_PX}px]`
export const layoutsOperarSummaryPanelMaxWidthClass = `max-w-[${LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_PX}px]`

export const layoutsOperarCatalogSidebarInnerClass = cn(
  "flex h-full min-h-0 w-full flex-col overflow-hidden",
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

/** Grid principal 1 · mobile: escena única. Desktop: operación | ticket. */
export const layoutsOperarBodyMainGridClass = cn(
  "flex min-h-0 flex-1 flex-col",
  "md:grid md:[grid-template-columns:var(--layouts-operar-grid-cols)]",
  "md:[grid-template-rows:minmax(0,1fr)]",
)

/** 1.1 Columna izquierda — catálogo (1.1.1) + toolbox (1.1.2). */
export const layoutsOperarOperationColumnClass = cn(
  "grid min-h-0 min-w-0 flex-1 overflow-hidden",
  "md:col-start-1 md:row-start-1",
  "[grid-template-rows:var(--layouts-operar-operation-rows)]",
)

/** 1.1.1 Fila catálogo — sidebar + canvas. */
export const layoutsOperarCatalogRowClass = "row-start-1 min-h-0 overflow-hidden"

/** Catálogo — flex horizontal: categorías (1.1.1.1) + canvas (1.1.1.2). */
export const layoutsOperarCatalogColumnClass = "flex h-full min-h-0 min-w-0 overflow-hidden"

/** @deprecated Usar layoutsOperarCatalogColumnClass dentro de layoutsOperarCatalogRowClass. */
export const layoutsOperarCatalogColumnInMainGridClass = cn(
  layoutsOperarCatalogColumnClass,
  "border-b border-[var(--layouts-operar-border-dark-default)]",
)

/** Rail catálogo — inline en desktop; overlay a la izquierda en mobile. */
export const layoutsOperarCatalogSidebarClass = cn(
  "relative shrink-0 overflow-hidden",
  "border-r border-[var(--layouts-operar-border-dark-hairline)]",
  "transition-[width,border-color,transform] duration-300 ease-in-out motion-reduce:transition-none",
  "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-40 max-md:h-full max-md:shadow-xl",
  librarySidebarClass,
)

export const layoutsOperarCatalogSidebarOpenClass =
  "w-[var(--layouts-operar-catalog-sidebar-w)] min-w-[var(--layouts-operar-catalog-sidebar-w)]"
export const layoutsOperarCatalogSidebarClosedClass = cn(
  "w-0 border-r-0",
  "max-md:w-[var(--layouts-operar-catalog-sidebar-w)] max-md:-translate-x-full max-md:pointer-events-none",
)

export const layoutsOperarCatalogRailBackdropClass = cn(
  "fixed inset-0 z-30 bg-black/50 md:hidden",
)

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
  "col-start-2 row-start-1 grid min-h-0 overflow-hidden",
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
  "flex min-w-0 shrink-0 items-center gap-3 px-4",
  "bg-[var(--rootsy-sombra-700)]",
  "border-b border-[var(--layouts-operar-border-dark-hairline)]",
  "[height:var(--layouts-operar-catalog-toolbar-h)]",
)

/** Campo al ras — hairline del rail, mismo plano que library-nav-item. */
export const layoutsOperarCatalogToolbarControlShellClass = cn(
  "layouts-operar-catalog-toolbar-control",
  "h-10 shrink-0 rounded-lg",
  "border border-[var(--layouts-operar-border-dark-hairline)]",
  "bg-transparent",
  "shadow-none",
  "hover:border-[var(--layouts-operar-border-dark-default)]",
  "hover:bg-[color-mix(in_srgb,var(--rootsy-white)_6%,transparent)]",
)

/** Focus — mismo gesto que library-nav-item--active: hairline firme + velo, sin savia. */
export const layoutsOperarCatalogToolbarControlFocusClass = cn(
  "outline-none",
  "focus-visible:border-[var(--layouts-operar-border-dark-default)]",
  "focus-visible:bg-[color-mix(in_srgb,var(--rootsy-white)_6%,transparent)]",
  "focus-visible:text-[var(--rootsy-bruma-50)]",
  "focus-visible:ring-0 focus-visible:ring-offset-0",
)

/** Selección firme — mismo peso que library-nav-item--active. */
export const layoutsOperarCatalogToolbarViewToggleActiveSurfaceClass = cn(
  "border-transparent",
  "bg-transparent",
)

export const layoutsOperarCatalogToolbarScanInputFocusClass = cn(
  "layouts-operar-catalog-toolbar-scan-input outline-none",
  layoutsOperarCatalogToolbarControlFocusClass,
  "focus:border-[var(--layouts-operar-border-dark-default)]",
  "focus:bg-[color-mix(in_srgb,var(--rootsy-white)_6%,transparent)]",
  "focus:text-[var(--rootsy-bruma-50)]",
  "focus:font-medium",
)

export const layoutsOperarCatalogToolbarViewToggleShellClass =
  "relative flex items-center gap-0.5"

export const layoutsOperarCatalogToolbarViewToggleButtonClass = cn(
  "relative flex h-8 w-10 items-center justify-center rounded-lg",
  layoutsOperarCatalogToolbarControlFocusClass,
)

export const layoutsOperarCatalogToolbarViewToggleButtonActiveClass =
  "font-medium text-[var(--rootsy-bruma-50)]"

export const layoutsOperarCatalogToolbarViewToggleButtonIdleClass = cn(
  "text-[var(--rootsy-sombra-300)]",
  "hover:bg-[color-mix(in_srgb,var(--rootsy-white)_6%,transparent)]",
  "hover:text-[var(--rootsy-bruma-50)]",
)

export const layoutsOperarCatalogToolbarScanInputClass = cn(
  layoutsOperarCatalogToolbarControlShellClass,
  layoutsOperarCatalogToolbarScanInputFocusClass,
  "w-full min-w-0 pl-10 pr-10 text-sm font-normal text-[var(--rootsy-sombra-300)]",
  "placeholder:text-[var(--rootsy-sombra-300)]",
)

/** Placeholder e ícono — form controls dark operar (paridad toolbar). */
export const layoutsOperarFormDarkPlaceholderClass =
  "placeholder:text-[color-mix(in_srgb,var(--rootsy-sombra-300)_55%,transparent)]"

export const layoutsOperarFormDarkIconClass =
  "text-[color-mix(in_srgb,var(--rootsy-sombra-300)_70%,transparent)]"

export const layoutsOperarFormDarkMutedTextClass =
  "text-[color-mix(in_srgb,var(--rootsy-sombra-300)_55%,transparent)]"

/** Label uppercase — formularios dark operar (paridad --layouts-operar-form-dark-label). */
export const layoutsOperarFormDarkSectionLabelClass = cn(
  "text-xs font-semibold uppercase tracking-[0.1em]",
  "text-[var(--layouts-operar-form-dark-label)]",
)

export const layoutsOperarFormDarkSurfaceClass =
  "bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_55%,transparent)]"

export const layoutsOperarFormDarkBorderClass =
  "border-[color-mix(in_srgb,var(--rootsy-sombra-border)_45%,transparent)]"

/** Botón secundario sobre canvas/form dark operar — paridad controls toolbar. */
export const layoutsOperarFormDarkSecondaryButtonClass = cn(
  "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-[10px] border px-3",
  "font-canopy text-sm font-semibold leading-none whitespace-nowrap",
  "transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-150",
  layoutsOperarFormDarkBorderClass,
  layoutsOperarFormDarkSurfaceClass,
  "text-[#f4f8f6]",
  "hover:border-[color-mix(in_srgb,var(--rootsy-sombra-border)_65%,transparent)]",
  "hover:bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_72%,transparent)]",
  "active:scale-[0.995]",
  "focus-visible:outline-none focus-visible:border-[color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]",
  "focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-400)_22%,transparent)]",
  "disabled:pointer-events-none disabled:opacity-45",
)

/** Texto inline de error / requerido — formularios dark operar. */
export const layoutsOperarFormDarkFieldErrorClass =
  "text-xs font-medium leading-snug text-[color-mix(in_srgb,#fecaca_92%,white)]"

/** Banner de error — formularios dark operar (pie de paso wizard). */
export const layoutsOperarFormDarkErrorBannerClass = cn(
  "flex min-h-12 items-center justify-start gap-3 rounded-lg border px-4 py-3 text-left text-base font-medium leading-normal",
  "border-[color-mix(in_srgb,#f87171_48%,transparent)]",
  "bg-[color-mix(in_srgb,#f87171_16%,var(--rootsy-sombra-900))]",
  "text-[#fecaca]",
)

/** Franja de error bajo el header del paso — dark operar, full-bleed. */
export const layoutsOperarStepErrorBannerClass = cn(
  "relative z-10 flex shrink-0 items-start gap-3 border-b px-4 py-2.5 text-sm font-medium leading-snug sm:px-5",
  "border-[color-mix(in_srgb,#f87171_32%,transparent)]",
  "bg-[color-mix(in_srgb,#f87171_10%,var(--rootsy-sombra-950))]",
  "text-[color-mix(in_srgb,#fecaca_92%,white)]",
)

/** Dropdown / panel flotante — entrada suave desde arriba. */
export const layoutsOperarDropdownRevealClass = cn(
  "animate-in fade-in-0 slide-in-from-top-1 duration-150 motion-reduce:animate-none",
)

/** Contenido de paso wizard — entrada suave al cambiar de paso. */
export const layoutsOperarStepEnterClass = cn(
  "animate-in fade-in-0 duration-200 motion-reduce:animate-none",
  "bg-[var(--rootsy-sombra-800)]",
)

export const layoutsOperarCatalogToolbarQtyShellClass = cn(
  layoutsOperarCatalogToolbarControlShellClass,
  "flex items-center gap-0.5 px-1",
)

export const layoutsOperarCatalogToolbarPriceListClass = cn(
  layoutsOperarCatalogToolbarControlShellClass,
  layoutsOperarCatalogToolbarControlFocusClass,
  "flex min-w-[9.5rem] items-center justify-start gap-2 px-3 text-sm font-medium text-[var(--rootsy-bruma-50)]",
  "[&>svg:last-child]:hidden",
)

export const layoutsOperarCatalogToolbarIconAccentClass =
  "text-[var(--rootsy-sombra-300)]"

export const layoutsOperarCatalogToolbarIconMutedClass =
  "text-[var(--rootsy-sombra-300)]"

const layoutsOperarCatalogToolbarQtyHitClass = cn(
  "inline-flex size-8 items-center justify-center rounded-md bg-transparent",
  "hover:bg-[color-mix(in_srgb,var(--rootsy-white)_6%,transparent)]",
  "hover:text-[var(--rootsy-bruma-50)]",
)

export const layoutsOperarCatalogToolbarQtyButtonClass = cn(
  layoutsOperarCatalogToolbarQtyHitClass,
  "text-[var(--rootsy-sombra-300)]",
  layoutsOperarCatalogToolbarControlFocusClass,
)

export const layoutsOperarCatalogToolbarQtyValueClass = cn(
  layoutsOperarCatalogToolbarQtyHitClass,
  "text-center text-sm font-medium tabular-nums text-[var(--rootsy-bruma-50)]",
  layoutsOperarCatalogToolbarControlFocusClass,
)

export const layoutsOperarCatalogToolbarQtyValueHoverClass =
  layoutsOperarCatalogToolbarQtyHitClass

export const layoutsOperarScrollMinimalClass = "layouts-operar-scroll-minimal"
/** @deprecated Usar libraryScrollDarkClass — el rail reutiliza el scroll de Library. */
export const layoutsOperarCatalogRailScrollClass = libraryScrollDarkClass

export const layoutsOperarCatalogCanvasScrollClass = cn(
  layoutsOperarScrollMinimalClass,
  "min-h-0 flex-1 overflow-y-auto p-3",
)

/** Fila del canvas que envuelve el scroll. */
export const layoutsOperarCatalogCanvasBodyClass =
  "relative min-h-0 h-full overflow-hidden"

/** Canvas formularios operar (pasos wizard) — scroll horizontal + top; el aire final va en el wrapper interno. */
export const layoutsOperarFormCanvasScrollClass = cn(
  layoutsOperarScrollMinimalClass,
  "min-h-0 flex-1 overflow-y-auto",
  "px-4 pt-4 sm:px-5 sm:pt-5 lg:px-6 lg:pt-6",
)

/** Aire al final del contenido scrolleable del wizard (dentro del flujo, no solo padding del contenedor). */
export const layoutsOperarFormCanvasScrollEndClass =
  "pb-10 sm:pb-12 lg:pb-14"

/**
 * Card de catálogo operar — ancho anclado al ritmo space.500.
 * 5×40 = 200 (piso) · 6×40 = 240 (techo). La grilla suma columnas (1…n)
 * en vez de estirar o comprimir la card.
 */
export const LAYOUTS_OPERAR_CATALOG_CARD_MIN_WIDTH_PX = rootsySpacePx("500") * 5
export const LAYOUTS_OPERAR_CATALOG_CARD_MAX_WIDTH_PX = rootsySpacePx("500") * 6
/** gap-4 · space.200 */
export const LAYOUTS_OPERAR_CATALOG_GRID_GAP_PX = rootsySpacePx("200")
export const LAYOUTS_OPERAR_CATALOG_GRID_COLS_MIN = 1

/** Columnas según el ancho real del canvas, no del viewport. */
export function layoutsOperarCatalogColumnCount(containerWidthPx: number): number {
  const min = LAYOUTS_OPERAR_CATALOG_CARD_MIN_WIDTH_PX
  const max = LAYOUTS_OPERAR_CATALOG_CARD_MAX_WIDTH_PX
  const gap = LAYOUTS_OPERAR_CATALOG_GRID_GAP_PX
  const colsMin = LAYOUTS_OPERAR_CATALOG_GRID_COLS_MIN

  if (!Number.isFinite(containerWidthPx) || containerWidthPx <= 0) {
    return 2
  }

  const maxFit = Math.max(colsMin, Math.floor((containerWidthPx + gap) / (min + gap)))
  const minNeeded = Math.max(colsMin, Math.ceil((containerWidthPx + gap) / (max + gap)))

  return Math.min(maxFit, minNeeded)
}

/** Grilla fluida — piso 200px, las columnas se reparte el resto (1fr). */
export const layoutsOperarCatalogGridClass = "grid w-full min-w-0 gap-4"
export const layoutsOperarCatalogGridStyle = {
  gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${LAYOUTS_OPERAR_CATALOG_CARD_MIN_WIDTH_PX}px), 1fr))`,
} as const

export function layoutsOperarCatalogGridTemplate(columns: number): string {
  return `repeat(${columns}, minmax(0, 1fr))`
}

/** Empty catálogo — retrato centrado, mismo círculo que el toast, aire del dosel. */
export const layoutsOperarCatalogEmptyCanvasClass =
  "relative flex h-full min-h-0 flex-col overflow-hidden p-0"

export const layoutsOperarCatalogEmptyMascotShellClass =
  "flex h-full w-full flex-col items-center justify-center gap-4 px-6 py-8 text-center"

export const layoutsOperarCatalogEmptyPortraitClass =
  "layouts-operar-empty-portrait relative size-[6.5rem] shrink-0"

export const layoutsOperarCatalogEmptyPortraitFrameClass =
  "layouts-operar-empty-portrait__frame relative grid size-full place-items-center overflow-hidden rounded-full"

export const layoutsOperarCatalogEmptyPortraitWorldClass =
  "layouts-operar-empty-portrait__world"

export const layoutsOperarCatalogEmptyPortraitImageClass =
  "relative z-[1] block size-full object-contain object-[center_62%]"

export const layoutsOperarCatalogEmptyCopyClass = "max-w-[16rem]"

export const layoutsOperarCatalogEmptyTitleClass =
  "font-canopy text-sm font-semibold leading-snug text-[color-mix(in_srgb,var(--rootsy-bruma-50)_92%,transparent)]"

export const layoutsOperarCatalogEmptyHintClass =
  "mt-1 font-canopy text-xs leading-snug text-[color-mix(in_srgb,var(--rootsy-sombra-300)_88%,transparent)]"

/** Skeleton catálogo — 2 tonos sombra muy cercanos (700 base · bloque apenas más oscuro). */
export const layoutsOperarCatalogSkeletonSurfaceClass = "bg-[var(--rootsy-sombra-700)]"

export const layoutsOperarCatalogSkeletonGhostClass =
  "animate-pulse bg-[color-mix(in_srgb,var(--rootsy-sombra-700)_38%,var(--rootsy-sombra-800))]"

export const layoutsOperarProductCardClass = cn(
  "layouts-operar-product-card group relative grid h-[256px] w-full grid-rows-[120px_1fr] overflow-hidden rounded-2xl text-left",
  "border border-[var(--layouts-operar-border-dark-card)] bg-[var(--rootsy-sombra-600)]",
  "transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5",
)

/** Tarjeta horizontal — vista lista · sale `modoVista === "lista"`. */
export const layoutsOperarProductCardListClass = cn(
  "layouts-operar-product-card group relative flex min-h-[80px] w-full items-stretch overflow-hidden rounded-2xl text-left",
  "border border-[var(--layouts-operar-border-dark-card)] bg-[var(--rootsy-sombra-600)]",
  "transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5",
)

export const layoutsOperarProductCardSkeletonShellClass = cn(
  layoutsOperarProductCardClass,
  layoutsOperarCatalogSkeletonSurfaceClass,
  "pointer-events-none shadow-none hover:translate-y-0",
)

export const layoutsOperarProductCardListSkeletonShellClass = cn(
  layoutsOperarProductCardListClass,
  layoutsOperarCatalogSkeletonSurfaceClass,
  "pointer-events-none shadow-none hover:translate-y-0",
)

export const layoutsOperarProductCardListMediaClass =
  "relative h-20 w-20 shrink-0 overflow-hidden bg-[var(--layouts-operar-product-card-media-bg)]"

export const layoutsOperarProductCardGridBodyClass =
  "grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-1.5 p-3"

export const layoutsOperarProductCardListBodyClass =
  "flex min-h-0 min-w-0 flex-1 items-center justify-between gap-3 px-3 py-2"

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
  "text-base font-bold tabular-nums text-[var(--layouts-operar-product-card-price)]"

export const layoutsOperarProductCardOfferClass =
  "absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"

export const layoutsOperarProductCardAddClass = cn(
  "pointer-events-none absolute right-2 bottom-2 z-10 flex size-8 items-center justify-center rounded-full",
  "border border-[color-mix(in_srgb,var(--rootsy-savia-300)_45%,transparent)]",
  "bg-[var(--rootsy-savia-500)] text-[var(--rootsy-savia-950)]",
  "opacity-0 transition-[opacity,transform] duration-200",
  "translate-y-1 scale-95 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100",
)

/** Tarjeta catálogo seleccionada — paridad CheckoutOptionCard dark + hover savia de product card. */
export const layoutsOperarProductCardSelectedClass = cn(
  "border-[color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]",
  "bg-[color-mix(in_srgb,var(--rootsy-savia-400)_10%,var(--rootsy-sombra-600))]",
  "ring-2 ring-[color-mix(in_srgb,var(--rootsy-savia-400)_28%,transparent)] ring-offset-2 ring-offset-[var(--rootsy-sombra-800)]",
  "shadow-[inset_0_1px_0_color-mix(in_srgb,var(--rootsy-savia-300)_14%,transparent),0_0_0_1px_color-mix(in_srgb,var(--rootsy-savia-400)_24%,transparent),0_8px_22px_color-mix(in_srgb,var(--rootsy-sombra-950)_36%,transparent)]",
)

export const layoutsOperarProductCardSelectedAddClass = cn(
  "pointer-events-none absolute right-2 bottom-2 z-10 flex size-8 items-center justify-center rounded-full",
  "border border-[color-mix(in_srgb,var(--rootsy-savia-200)_55%,transparent)]",
  "bg-[var(--rootsy-savia-500)] text-[var(--rootsy-savia-950)]",
  "opacity-100 translate-y-0 scale-100",
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--rootsy-savia-600)_35%,transparent)]",
)

/** Barra de contexto del paso activo — título + resumen en una línea. */
export const layoutsOperarStepContextBarClass = cn(
  "relative flex shrink-0 items-center gap-3 overflow-hidden",
  "border-b border-[var(--layouts-operar-border-dark-hairline)]",
  "bg-[var(--rootsy-sombra-950)] px-4 sm:px-5",
  "[height:var(--layouts-operar-catalog-toolbar-h)]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
)

/** Ícono del paso — acento savia sobre dosel sombra. */
export const layoutsOperarStepContextIconWrapClass = cn(
  "flex size-10 shrink-0 items-center justify-center rounded-xl",
  "border border-[color-mix(in_srgb,var(--rootsy-savia-400)_28%,transparent)]",
  "bg-[color-mix(in_srgb,var(--rootsy-savia-700)_22%,var(--rootsy-sombra-950))]",
  "text-[color-mix(in_srgb,var(--rootsy-savia-300)_88%,white)]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
)

export const layoutsOperarStepContextLabelClass =
  "shrink-0 font-canopy text-base font-semibold leading-none tracking-tight text-[#f4f8f6]"

export const layoutsOperarStepContextSummaryClass = cn(
  "min-w-0 truncate font-canopy text-sm font-normal leading-snug",
  layoutsOperarFormDarkMutedTextClass,
)

export const layoutsOperarStepContextSeparatorClass =
  "shrink-0 text-base leading-none text-[color-mix(in_srgb,var(--rootsy-sombra-300)_40%,transparent)]"

/** Botón navegación — barra de contexto wizard operar (atrás / siguiente). */
export const layoutsOperarStepContextNavButtonClass = cn(
  "inline-flex size-10 shrink-0 items-center justify-center rounded-xl",
  layoutsOperarFormDarkBorderClass,
  layoutsOperarFormDarkSurfaceClass,
  layoutsOperarFormDarkMutedTextClass,
  "transition-[color,background-color,border-color,transform,opacity] duration-150",
  "hover:border-[color-mix(in_srgb,var(--rootsy-sombra-border)_65%,transparent)]",
  "hover:bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_72%,transparent)]",
  "hover:text-[#f4f8f6] active:scale-[0.98]",
  "focus-visible:outline-none focus-visible:border-[color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]",
  "focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-400)_22%,transparent)]",
  "disabled:pointer-events-none disabled:opacity-30",
)

/** @deprecated Usar layoutsOperarStepContextNavButtonClass */
export const layoutsOperarStepContextBackButtonClass =
  layoutsOperarStepContextNavButtonClass

/** Toolbox — fila 1.1.2 dentro de la columna operación. */
export const layoutsOperarToolboxRowClass = "row-start-2 z-[1] min-h-0 shrink-0 overflow-visible"

/** Banda toolbox aislada — altura mínima desde anatomía. */
export const layoutsOperarToolboxBandClass = cn(
  "relative min-h-0 w-full",
  "min-h-[var(--layouts-operar-toolbox-min-h)] sm:min-h-[var(--layouts-operar-toolbox-min-h-sm)]",
)

/** Piso del toolbox — mundo Sombra, paridad canvas del catálogo. */
export const layoutsOperarToolboxFloorClass = cn(
  "relative w-full overflow-visible",
  rootsyLayoutsEarthFloorBandClass,
)

/** Grid interno toolbox — superficie en banda padre (zone style o bar surface). */
export const layoutsOperarToolboxBarGridClass = cn(
  "box-border grid h-full min-h-0 grid-cols-2 gap-2 lg:grid-cols-4",
  "p-[var(--layouts-operar-toolbox-band-py)] sm:gap-2.5 sm:p-[var(--layouts-operar-toolbox-band-py-sm)]",
)

/** Grid toolbox wizard de 3 pasos (servicio · configuración · pago). */
export const layoutsOperarToolboxBarGrid3Class = cn(
  "box-border grid h-full min-h-0 grid-cols-3 gap-2",
  "p-[var(--layouts-operar-toolbox-band-py)] sm:gap-2.5 sm:p-[var(--layouts-operar-toolbox-band-py-sm)]",
)

/** Shell sombra-950 — demos toolbox aisladas sobre fondo claro de la doc. */
export const layoutsOperarToolboxDemoShellClass = cn(
  layoutsOperarBodyShellClass,
  "overflow-hidden",
)

/** Barra toolbox — tierra empapada, paridad footer de tablas. */
export const layoutsOperarToolboxBarClass = cn(
  layoutsOperarToolboxBarGridClass,
  rootsyLayoutsEarthFloorBorderClass,
  rootsyLayoutsEarthFloorSurfaceClass,
  rootsyLayoutsEarthFloorShadowClass,
)

/** Barra toolbox wizard de 3 pasos. */
export const layoutsOperarToolboxBar3Class = cn(
  layoutsOperarToolboxBarGrid3Class,
  rootsyLayoutsEarthFloorBorderClass,
  rootsyLayoutsEarthFloorSurfaceClass,
  rootsyLayoutsEarthFloorShadowClass,
)

/** Anillo savia — focus teclado y paso activo en toolbox wizard. */
export const layoutsOperarToolboxSlotFocusRingClass =
  "ring-2 ring-[color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)] ring-offset-2 ring-offset-[var(--rootsy-sombra-950)]"

export function layoutsOperarToolboxSlotClass(configured: boolean, active = false) {
  return cn(
    rootsyLayoutsEarthFloorSlotClass,
    "group flex h-full min-h-[var(--layouts-operar-toolbox-slot-min-h)] w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left sm:min-h-[var(--layouts-operar-toolbox-slot-min-h-sm)] sm:gap-3 sm:px-3",
    "focus-visible:outline-none",
    configured && rootsyLayoutsEarthFloorSlotConfiguredClass,
    active
      ? layoutsOperarToolboxSlotFocusRingClass
      : "focus-visible:ring-2 focus-visible:ring-[var(--rootsy-savia-400)]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rootsy-sombra-950)]",
  )
}

export function layoutsOperarToolboxIconWrapClass(_configured: boolean) {
  return cn(
    rootsyLayoutsEarthFloorSlotIconClass,
    "flex size-10 shrink-0 items-center justify-center rounded-lg",
  )
}

/** Superficie ticket — bloque scrolleable (pedido + ítems + totales) · acciones. */
export const layoutsOperarSummaryPanelSurfaceClass = cn(
  "layouts-operar-ticket-shell rootsy-app-light grid min-h-0 overflow-hidden",
  "[grid-template-rows:var(--layouts-operar-ticket-rows)]",
  "bg-[var(--rootsy-bruma-50)] text-[var(--rootsy-bruma-900)]",
)

/** Grid ticket interno — sin placement en grid principal (p. ej. dentro de tabs mostrador). */
export const layoutsOperarSummaryPanelInnerGridClass = cn(
  layoutsOperarSummaryPanelSurfaceClass,
  "h-full min-h-0 w-full",
  "max-md:[grid-template-rows:minmax(0,1fr)]",
)

/** Cuerpo bajo tabs Mesa/Datos — flex, sin grid 1.2.x (sesión / formulario channel). */
export const layoutsOperarSummaryPanelTabBodyClass = cn(
  "row-start-2 flex min-h-0 flex-col overflow-hidden",
  "bg-[var(--rootsy-bruma-50)] text-[var(--rootsy-bruma-900)]",
  "rootsy-app-light layouts-operar-ticket-shell h-full min-h-0 w-full",
)

/** Panel ticket 1.2 — col derecha en desktop; escena mobile a full. */
export const layoutsOperarSummaryPanelClass = cn(
  layoutsOperarSummaryPanelSurfaceClass,
  "min-h-0 h-full w-full",
  "md:col-start-2 md:row-start-1",
  "md:border-l md:border-[var(--layouts-operar-border-split)]",
  "md:w-[var(--layouts-operar-ticket-w)] md:max-w-[var(--layouts-operar-ticket-w)]",
)

/** Ticket con tabs (Mesas · Mostrador) — sin mezclar grid-template-rows en `cn`. */
export const layoutsOperarSummaryPanelTabsClass = cn(
  "layouts-operar-ticket-shell rootsy-app-light grid min-h-0 h-full w-full overflow-hidden",
  "grid-rows-[auto_minmax(0,1fr)]",
  "bg-[var(--rootsy-bruma-50)] text-[var(--rootsy-bruma-900)]",
  "md:col-start-2 md:row-start-1",
  "md:border-l md:border-[var(--layouts-operar-border-split)]",
  "md:w-[var(--layouts-operar-ticket-w)] md:max-w-[var(--layouts-operar-ticket-w)]",
)

/** Ticket simple (Vender · Compras) — una escena en mobile. */
export const layoutsOperarSummaryPanelMobileStackClass =
  "max-md:[grid-template-rows:minmax(0,1fr)]"

/** Vender servicio — panel derecho con fila de totales operar. */
export const serviceOperateSnapshotPanelClass = cn(
  layoutsOperarSummaryPanelClass,
  "service-operate-snapshot-panel",
  "max-md:[grid-template-rows:auto_minmax(0,1fr)_auto_auto]",
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

export const layoutsOperarTicketScrollColumnClass = cn(
  "layouts-operar-scroll-minimal row-start-1 flex h-full min-h-0 flex-col overflow-y-auto",
)

export const layoutsOperarSummaryHeaderRowClass =
  "flex shrink-0 items-center justify-between gap-2 px-3 py-2"

export const layoutsOperarSummaryCartRowClass =
  "relative flex min-h-0 flex-col bg-[var(--rootsy-bruma-50)]"

export const layoutsOperarSummaryActionsRowClass = cn(
  "row-start-2 grid shrink-0 grid-cols-2 overflow-hidden",
  "border-t border-[var(--layouts-operar-border-light)] bg-[var(--rootsy-bruma-50)]",
  "[height:var(--layouts-operar-ticket-actions-h)]",
)

/** 1.2.3 — umbral circular Descartar · Pedido/Mesa · Comandas · Cobrar. */
export const layoutsOperarTicketCircleActionsRowClass = cn(
  "row-start-2 flex shrink-0 items-center justify-center",
  "gap-[var(--rootsy-space-300)]",
  "border-t border-[var(--layouts-operar-border-light)] bg-[var(--rootsy-bruma-50)]",
  "[height:var(--layouts-operar-ticket-actions-h)]",
)

/** 1.2.3.1 — columna Descartar */
export const layoutsOperarSummaryActionDiscardColClass = cn(
  "col-start-1 flex h-full min-h-0 min-w-0",
  "border-r border-[var(--layouts-operar-border-light)]",
)

/** 1.2.3.2 — columna Vender / Cobrar */
export const layoutsOperarSummaryActionConfirmColClass =
  "col-start-2 flex h-full min-h-0 min-w-0"

/** @deprecated Usar layoutsOperarSummaryActionsRowClass + columnas 1.2.3.1 / 1.2.3.2 */
export const layoutsOperarSummaryActionsCellClass = layoutsOperarSummaryActionsRowClass

export const layoutsOperarSummaryTotalRowClass = cn(
  "layouts-operar-summary-totals flex items-center justify-between px-4 py-3",
  "border-t border-[var(--layouts-operar-border-light)]",
  "min-h-[var(--layouts-operar-toolbox-min-h)] sm:min-h-[var(--layouts-operar-toolbox-min-h-sm)]",
)

/** Total en el mundo del módulo — bruma-50, mismo piso que cuentas/cajas. */
export const layoutsOperarSummaryTotalsSurfaceClass = cn(
  "bg-[var(--rootsy-bruma-50)]",
  "text-[var(--rootsy-bruma-900)]",
)

/** Celdas ticket — placement explícito en grid 1.2.x. */
export const layoutsOperarSummaryHeaderCellClass = cn(
  layoutsOperarSummaryHeaderRowClass,
  "row-start-1 min-h-0 shrink-0",
)

export const layoutsOperarSummaryCartCellClass = cn(
  layoutsOperarSummaryCartRowClass,
  "row-start-2 min-h-0 overflow-hidden",
)

/** Totales al piso del pedido cuando sobra aire; si hay overflow, van al final del scroll. */
export const layoutsOperarSummaryTotalsPlacementClass = "mt-auto shrink-0"

/** @deprecated Usar layoutsOperarSummaryTotalsPlacementClass + TotalBar tone operar. */
export const layoutsOperarSummaryTotalsCellClass = cn(
  layoutsOperarSummaryTotalRowClass,
  layoutsOperarSummaryTotalsPlacementClass,
)

export const layoutsOperarSummaryCartListSurfaceClass = "bg-[var(--rootsy-bruma-50)]"

export const layoutsOperarSummaryCartHeadingClass =
  "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--layouts-operar-light-cart-heading)]"

export const layoutsOperarSummaryCartTitleClass =
  "font-canopy text-base font-bold text-[var(--rootsy-bruma-900)]"

/** Misma letra que Pedido — Por cobrar. */
export const layoutsOperarSummarySectionTitleClass = layoutsOperarSummaryCartTitleClass

export const layoutsOperarSummaryCartMetaClass =
  "shrink-0 text-[11px] font-medium tabular-nums text-[var(--layouts-operar-light-cart-meta)]"

/** Error / requerido inline — ticket y resumen cargo (fondo bruma claro). */
export const layoutsOperarLightCartFieldErrorClass =
  "text-xs font-medium leading-snug text-[var(--layouts-operar-light-cart-field-error)]"

/** @deprecated Usar DataWorkspaceDetailEmptyState (layout.blocks.empty.detail). */
export const layoutsOperarSummaryEmptyStateClass =
  "flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-12 text-center"

/** @deprecated Usar DataWorkspaceDetailEmptyState. */
export const layoutsOperarSummaryEmptyStateContentClass =
  "flex max-w-[260px] flex-col items-center gap-3"

/** @deprecated Usar dataWorkspaceDetailEmptyStateIconWrapClass. */
export const layoutsOperarSummaryEmptyIconWrapClass = cn(
  "flex size-14 items-center justify-center rounded-2xl bg-white",
  "text-[var(--layouts-operar-light-empty-icon-text)]",
  "ring-1 ring-[var(--layouts-operar-light-empty-icon-ring)] shadow-sm",
)

/** @deprecated Usar dataWorkspaceDetailEmptyStateTitleClass. */
export const layoutsOperarSummaryEmptyTitleClass =
  "text-sm font-semibold text-[var(--layouts-operar-light-empty-title)]"

export const layoutsOperarSummaryTotalsLabelClass =
  "m-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--rootsy-bruma-500)]"

export const layoutsOperarSummaryTotalsAmountClass =
  "m-0 text-xl font-bold tabular-nums tracking-tight text-[var(--rootsy-bruma-900)] sm:text-2xl"

/** Nav rail catálogo — library-nav (mismo activo que Library: texto, sin pastilla). */
export const layoutsOperarCatalogRailNavClass = cn(
  "library-nav",
  libraryScrollDarkClass,
  "flex h-full min-h-0 w-full flex-col overflow-y-auto p-4",
)

/** Bloque de un tipo de categoría (p. ej. Recetas / Productos). */
export const layoutsOperarCatalogRailSectionGroupClass = libraryNavGroupClass

/** Separador entre tipos de categoría — mismo surco que library-nav-group. */
export const layoutsOperarCatalogRailSectionGroupDividerClass = "library-nav-group--separated"

export const layoutsOperarCatalogRailSectionLabelClass = libraryNavGroupLabelClass

export const layoutsOperarCatalogRailListClass = "library-nav-list"
export const layoutsOperarCatalogRailListItemClass = "w-full"

/** Ítem de categoría — mismo library-nav-item que Library / Estadísticas / Ajustes. */
export const layoutsOperarCatalogRailItemClass = cn(
  libraryNavItemClass,
  "w-full cursor-pointer text-left",
)

export const layoutsOperarCatalogRailItemSelectedClass = libraryNavItemActiveClass

export const layoutsOperarCatalogRailItemWithIconClass = "gap-2"

/** @deprecated Usar layoutsOperarCatalogRailItemSelectedClass — mismo activo que library-nav. */
export const layoutsOperarCatalogRailItemPromoSelectedClass =
  layoutsOperarCatalogRailItemSelectedClass

/** @deprecated Usar layoutsOperarCatalogRailItemSelectedClass — mismo activo que library-nav. */
export const layoutsOperarCatalogRailItemDiscountSelectedClass =
  layoutsOperarCatalogRailItemSelectedClass

/** @deprecated alias — usar layoutsOperarBodyScopeClass */
export const layoutsOperationsBodyScopeClass = layoutsOperarBodyScopeClass
/** @deprecated alias */
export const layoutsOperationsBodyShellClass = layoutsOperarBodyShellClass
