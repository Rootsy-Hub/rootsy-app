import "@/app/library/color/rootsyNaturePalette.css"
import "@/components/data-workspace/dataWorkspaceBlocksAtmosphere.css"
import {
  comandaStatusWorld,
} from "@/app/[siteId]/[popId]/comandas/comandaStatusWorlds"
import type { ComandaStatus } from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import {
  dataWorkspaceBlocksSkeletonBreathTone,
  dataWorkspaceEntityCardBadgeClass,
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardHeaderClass,
  dataWorkspaceEntityCardLosetaClass,
  dataWorkspaceEntityCardSaldoSectionClass,
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

/** Identidad del tablero — la estación es el nombre de la pantalla. */
export const comandasBrisaBoardIdentityClass = cn(
  "flex shrink-0 items-center justify-between gap-3",
  "border-b border-[var(--rootsy-bruma-200)]",
  "bg-[var(--color-elevada)] px-4 py-3 sm:px-5",
)

export const comandasBrisaBoardIdentityCopyClass = "min-w-0"

export const comandasBrisaBoardIdentityEyebrowClass =
  dataWorkspaceEntityCardEyebrowClass

export const comandasBrisaBoardIdentityTitleClass =
  "rootsy-text-section-title text-[var(--rootsy-bruma-900)]"

/** Headers a todo el ancho — papel + riel de señal, sin losa pintada. */
export const comandasBrisaHeaderRowClass = cn(
  "rootsy-nature-palette grid shrink-0 grid-cols-4",
  "h-16 overflow-hidden",
  "divide-x divide-[var(--rootsy-bruma-200)]",
  "border-b border-[var(--rootsy-bruma-200)]",
)

export const comandasBrisaBodyRowClass = cn(
  "grid min-h-0 flex-1 grid-cols-4 overflow-hidden",
  "divide-x divide-[var(--rootsy-bruma-200)]",
)

export function comandasBrisaColumnHeaderClass(status: ComandaStatus): string {
  const world = comandaStatusWorld(status)
  return cn(
    "relative isolate flex min-w-0 items-center gap-2.5 overflow-hidden px-4",
    "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:content-['']",
    world.headerClass,
    world.railClass,
  )
}

export function comandasBrisaColumnTitleClass(status: ComandaStatus): string {
  return cn(
    "rootsy-text-heading-xsmall relative z-1",
    comandaStatusWorld(status).titleClass,
  )
}

export function comandasBrisaColumnIconClass(status: ComandaStatus): string {
  return cn(
    "relative z-1 size-4 shrink-0",
    comandaStatusWorld(status).iconClass,
  )
}

export function comandasBrisaColumnBodyClass(status: ComandaStatus): string {
  return cn("flex min-h-0 min-w-0 flex-col", comandaStatusWorld(status).bodyClass)
}

export const comandasBrisaDropZoneClass = cn(
  "flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto p-4",
  "transition-[background] duration-150 ease-[cubic-bezier(0.4,1,0.6,1)]",
)

export function comandasBrisaDropZoneOverClass(status: ComandaStatus): string {
  return comandaStatusWorld(status).dropOverClass
}

export const comandasBrisaDropZoneBlockedClass = "opacity-50"

/** Pedido — misma loseta que Cuentas. */
export const comandasBrisaTicketCardClass = cn(
  dataWorkspaceEntityCardLosetaClass,
  "h-auto",
  "cursor-grab active:cursor-grabbing",
)

export const comandasBrisaTicketCardVoidClass = cn(
  "shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--rootsy-lava-500)_38%,transparent)]",
  "bg-[color-mix(in_srgb,var(--rootsy-lava-50)_70%,var(--rootsy-blanco))]",
)

export const comandasBrisaTicketVoidActionClass = cn(
  "border-t border-[color-mix(in_srgb,var(--rootsy-lava-500)_18%,transparent)]",
  "px-4 py-3",
)

export const comandasBrisaTicketCardIdleClass = "cursor-default active:cursor-default"

export const comandasBrisaTicketHeaderClass = cn(
  dataWorkspaceEntityCardHeaderClass,
  "pr-4",
)

export const comandasBrisaTicketBodyClass = dataWorkspaceEntityCardSaldoSectionClass

export const comandasBrisaTicketEyebrowClass = dataWorkspaceEntityCardEyebrowClass

export const comandasBrisaTicketTitleClass = dataWorkspaceEntityCardTitleClass

export const comandasBrisaTicketMetaClass =
  "rootsy-text-body font-medium text-[var(--rootsy-bruma-900)]"

export const comandasBrisaTicketDetailClass =
  "font-canopy text-sm leading-relaxed text-[var(--rootsy-bruma-700)]"

export const comandasBrisaTicketBadgeClass = dataWorkspaceEntityCardBadgeClass

export const comandasBrisaTicketListClass = "flex flex-col gap-4"

/** Historial — archivo en papel, no loseta de tablero. */
export const comandasBrisaHistoryDialogClass = cn(
  "rootsy-app-light",
  "flex max-h-[min(92vh,40rem)] flex-col",
)

export const comandasBrisaHistoryListClass = "flex flex-col gap-2.5"

export const comandasBrisaHistoryRowClass = cn(
  "relative overflow-hidden rounded-2xl",
  "border border-[var(--rootsy-bruma-200)]",
  "bg-[var(--rootsy-blanco)]",
  "px-4 py-3.5",
)

export const comandasBrisaHistoryRowVoidClass = cn(
  "border-[color-mix(in_srgb,var(--rootsy-lava-500)_28%,var(--rootsy-bruma-200))]",
  "bg-[color-mix(in_srgb,var(--rootsy-lava-50)_65%,var(--rootsy-blanco))]",
)

export const comandasBrisaHistoryOriginClass =
  "rootsy-text-label text-[var(--rootsy-bruma-500)]"

export const comandasBrisaHistoryTitleClass =
  "rootsy-text-heading-xsmall text-[var(--rootsy-bruma-900)]"

export const comandasBrisaHistoryClockClass =
  "rootsy-text-heading-xsmall tabular-nums text-[var(--rootsy-bruma-900)]"

export const comandasBrisaHistoryRelativeClass =
  "rootsy-text-label text-[var(--rootsy-bruma-500)]"

export const comandasBrisaHistoryItemClass =
  "rootsy-text-body text-[var(--rootsy-bruma-800)]"

export const comandasBrisaHistoryNoteClass =
  "font-canopy text-sm leading-relaxed text-[var(--rootsy-bruma-600)]"

export const comandasBrisaHistoryIconClass =
  "mt-0.5 size-4 shrink-0 text-[var(--rootsy-savia-600)]"

export const comandasBrisaHistoryIconVoidClass = "text-[var(--rootsy-lava-600)]"

export const comandasBrisaTicketOverlayClass = cn(
  comandasBrisaTicketCardClass,
  "w-[min(100%,18rem)] cursor-grabbing",
)

export const comandasBrisaSkeletonBarClass = dataWorkspaceBlocksSkeletonBreathTone.bar
export const comandasBrisaSkeletonBoxClass = dataWorkspaceBlocksSkeletonBreathTone.box
