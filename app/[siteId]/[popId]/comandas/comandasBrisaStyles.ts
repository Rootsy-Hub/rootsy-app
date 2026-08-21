import "@/components/data-workspace/dataWorkspaceBlocksAtmosphere.css"
import { layoutsOperarSummarySectionTitleClass } from "@/app/library/layouts/layoutsOperarStyles"
import {
  dataWorkspaceBlocksSkeletonBreathTone,
  dataWorkspaceEntityCardBadgeClass,
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardHeaderClass,
  dataWorkspaceEntityCardLosetaClass,
  dataWorkspaceEntityCardSaldoSectionClass,
  dataWorkspaceEntityCardStatLabelClass,
  dataWorkspaceEntityCardTitleClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"

/** Valle de comandas — mismo recuadro que bloques (bruma + planeta). */
export const comandasBrisaPageMainClass = cn(
  "data-workspace-blocks-atmosphere rootsy-app-light",
  "flex min-h-0 flex-1 flex-col overflow-hidden text-foreground",
)

export const comandasBrisaBoardShellClass =
  "flex min-h-0 flex-1 flex-col overflow-hidden"

/** Headers a todo el ancho — misma altura que toolbar operar. */
export const comandasBrisaHeaderRowClass = cn(
  "grid shrink-0 grid-cols-4",
  "h-16 border-b border-[var(--rootsy-bruma-200)]",
)

export const comandasBrisaBodyRowClass = cn(
  "grid min-h-0 flex-1 grid-cols-4 overflow-hidden",
  "divide-x divide-[var(--rootsy-bruma-200)]",
)

export const comandasBrisaColumnHeaderClass =
  "flex min-w-0 items-center gap-2 px-4"

export const comandasBrisaColumnTitleClass = layoutsOperarSummarySectionTitleClass

export const comandasBrisaColumnIconClass =
  "size-3.5 shrink-0 text-[var(--rootsy-savia-600)]"

export const comandasBrisaCountPillClass = cn(
  "inline-flex size-5 shrink-0 items-center justify-center rounded-full",
  "border border-[color-mix(in_srgb,var(--rootsy-savia-600)_25%,var(--rootsy-bruma-200))]",
  "bg-[color-mix(in_srgb,var(--rootsy-savia-600)_10%,white)]",
  "font-canopy text-[10px] font-semibold tabular-nums text-[var(--rootsy-savia-800)]",
)

export const comandasBrisaCountPillWideClass = "size-6 text-[9px]"

export const comandasBrisaDropZoneClass = cn(
  "flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto p-4",
  "transition-[background-color,box-shadow] duration-150 ease-[cubic-bezier(0.4,1,0.6,1)]",
)

export const comandasBrisaDropZoneOverClass = cn(
  "bg-[color-mix(in_srgb,var(--rootsy-savia-100)_55%,transparent)]",
  "shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--rootsy-savia-600)_22%,transparent)]",
)

export const comandasBrisaDropZoneBlockedClass = "opacity-50"

/** Pedido — misma loseta que Cuentas. */
export const comandasBrisaTicketCardClass = cn(
  dataWorkspaceEntityCardLosetaClass,
  "h-auto",
  "cursor-grab active:cursor-grabbing",
)

export const comandasBrisaTicketCardIdleClass = "cursor-default active:cursor-default"

export const comandasBrisaTicketHeaderClass = cn(
  dataWorkspaceEntityCardHeaderClass,
  "pr-4",
)

export const comandasBrisaTicketBodyClass = dataWorkspaceEntityCardSaldoSectionClass

export const comandasBrisaTicketEyebrowClass = dataWorkspaceEntityCardEyebrowClass

export const comandasBrisaTicketTitleClass = dataWorkspaceEntityCardTitleClass

export const comandasBrisaTicketMetaClass = dataWorkspaceEntityCardStatLabelClass

export const comandasBrisaTicketDetailClass =
  "font-canopy text-sm leading-relaxed text-[var(--rootsy-bruma-600)]"

export const comandasBrisaTicketBadgeClass = dataWorkspaceEntityCardBadgeClass

export const comandasBrisaTicketListClass = "flex flex-col gap-4"

export const comandasBrisaTicketOverlayClass = cn(
  comandasBrisaTicketCardClass,
  "w-[min(100%,18rem)] cursor-grabbing",
)

export const comandasBrisaSkeletonBarClass = dataWorkspaceBlocksSkeletonBreathTone.bar
export const comandasBrisaSkeletonBoxClass = dataWorkspaceBlocksSkeletonBreathTone.box
