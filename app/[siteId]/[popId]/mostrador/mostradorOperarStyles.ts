import {
  layoutsOperarCatalogToolbarIconMutedClass,
  layoutsOperarProductCardDescClass,
  layoutsOperarProductCardTitleClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  mesasFloorEmptyHintClass,
  mesasFloorEmptyStrongClass,
  mesasFloorEmptyTextClass,
  mesasLayoutErrorBannerClass,
  MESAS_FLOOR_PLAN_CANVAS_BG,
} from "@/app/[siteId]/[popId]/mesas/mesasOperarStyles"
import {
  operarCanvasToolbarCountPillTotalActiveClass,
  operarCanvasToolbarShellClass,
  operarCanvasToolbarTabActiveClass,
} from "@/components/sale-operation/operarCanvasToolbarStyles"
import { cn } from "@/lib/utils"

/** Canvas del tablero — mismo dosel que plano de mesas. */
export const mostradorBoardCanvasBg = MESAS_FLOOR_PLAN_CANVAS_BG

/** Superficie del tablero — mismo fondo 950 que el plano de mesas. */
export const mostradorBoardColumnBodyBg = MESAS_FLOOR_PLAN_CANVAS_BG

/** @deprecated Usar OperarCanvasToolbarColumnHeader. */
export const mostradorBoardColumnHeaderClass = operarCanvasToolbarShellClass

export const mostradorBoardColumnDividerClass =
  "divide-[var(--layouts-operar-border-dark-hairline)]"

/** @deprecated Usar operarCanvasToolbarIconClass. */
export const mostradorBoardColumnIconClass = layoutsOperarCatalogToolbarIconMutedClass

/** @deprecated Usar operarCanvasToolbarTabActiveClass. */
export const mostradorBoardColumnTitleClass = operarCanvasToolbarTabActiveClass

/** @deprecated Usar OperarCanvasToolbarCountPill. */
export const mostradorBoardCountPillClass = cn(
  "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
  operarCanvasToolbarCountPillTotalActiveClass,
)

export const mostradorErrorBannerClass = mesasLayoutErrorBannerClass

export const mostradorLoadingTextClass = mesasFloorEmptyTextClass

export const mostradorEmptyTextClass = mesasFloorEmptyTextClass

export const mostradorEmptyHintClass = mesasFloorEmptyHintClass

export const mostradorEmptyStrongClass = mesasFloorEmptyStrongClass

/** Texto principal en cards del tablero — misma voz que el catálogo. */
export const mostradorOrderNumberClass = cn(
  layoutsOperarProductCardTitleClass,
  "line-clamp-1",
)

export const mostradorOrderMetaClass = layoutsOperarProductCardDescClass

export const mostradorOrderSubtitleClass = cn(
  layoutsOperarProductCardDescClass,
  "truncate text-sm",
)

export const mostradorOrderDetailClass = layoutsOperarProductCardDescClass

/** Pago en panel claro (ticket). */
export const mostradorPaymentPaidTextClass =
  "font-medium text-[color-mix(in_srgb,var(--rootsy-savia-700)_92%,black)]"

export const mostradorPaymentUnpaidTextClass =
  "font-medium text-[color-mix(in_srgb,var(--rootsy-savia-600)_55%,#b45309)]"
