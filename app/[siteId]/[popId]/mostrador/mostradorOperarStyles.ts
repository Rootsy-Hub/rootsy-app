import {
  layoutsOperarCatalogToolbarIconMutedClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  mesasFloorEmptyHintClass,
  mesasFloorEmptyStrongClass,
  mesasFloorEmptyTextClass,
  mesasLayoutErrorBannerClass,
  mesasRealtimeBannerClass,
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

/** Superficie del tablero — mismo canvas que plano de mesas (sombra-800). */
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

export const mostradorRealtimeBannerClass = mesasRealtimeBannerClass

export const mostradorErrorBannerClass = mesasLayoutErrorBannerClass

export const mostradorLoadingTextClass = mesasFloorEmptyTextClass

export const mostradorEmptyTextClass = mesasFloorEmptyTextClass

export const mostradorEmptyHintClass = mesasFloorEmptyHintClass

export const mostradorEmptyStrongClass = mesasFloorEmptyStrongClass

/** Texto principal en cards del tablero (número de pedido). */
export const mostradorOrderNumberClass =
  "text-sm font-bold text-[color-mix(in_srgb,var(--rootsy-bruma-50)_92%,white)]"

export const mostradorOrderMetaClass =
  "text-xs text-[color-mix(in_srgb,var(--rootsy-sombra-300)_55%,transparent)]"

export const mostradorOrderSubtitleClass =
  "truncate text-sm text-[color-mix(in_srgb,var(--rootsy-bruma-100)_88%,white)]"

export const mostradorOrderDetailClass =
  "text-xs text-[color-mix(in_srgb,var(--rootsy-sombra-300)_50%,transparent)]"

/** Pago en panel claro (ticket). */
export const mostradorPaymentPaidTextClass =
  "font-medium text-[color-mix(in_srgb,var(--rootsy-savia-700)_92%,black)]"

export const mostradorPaymentUnpaidTextClass =
  "font-medium text-[color-mix(in_srgb,var(--rootsy-savia-600)_55%,#b45309)]"
