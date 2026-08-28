"use client"

import {
  getLayoutsOperarToolboxProposal,
  getLayoutsOperarToolboxProposalBandProps,
  getLayoutsOperarToolboxProposalBarGridClass,
  getLayoutsOperarToolboxProposalCanvasEdgeStyle,
  layoutsOperarToolboxProposalIconWrapClass,
  layoutsOperarToolboxProposalSlotClass,
  layoutsOperarToolboxProposalSlotLabelClass,
  layoutsOperarToolboxProposalSlotValueClass,
  type LayoutsOperarToolboxProposalId,
} from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import { layoutsOperarToolboxRowClass } from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"
import { Banknote, Receipt, User } from "lucide-react"
import type { ReactNode } from "react"

type DemoToolboxSlot = {
  id: string
  label: string
  value: string
  configured: boolean
  icon: ReactNode
}

const DEMO_TOOLBOX_SLOTS: DemoToolboxSlot[] = [
  {
    id: "cliente",
    label: "Cliente",
    value: "María González",
    configured: true,
    icon: <User className="size-5" aria-hidden />,
  },
  {
    id: "comprobante",
    label: "Comprobante",
    value: "Factura B",
    configured: true,
    icon: <Receipt className="size-5" aria-hidden />,
  },
  {
    id: "pago",
    label: "Pago",
    value: "Caja principal",
    configured: true,
    icon: <Banknote className="size-5" aria-hidden />,
  },
]

/** Grid de slots — sin banda; va dentro de LayoutsOperarToolboxProposalBand. */
export function LayoutsOperarToolboxProposalBar({
  proposalId,
  className,
}: {
  proposalId: LayoutsOperarToolboxProposalId
  className?: string
}) {
  const slotCount = DEMO_TOOLBOX_SLOTS.length

  return (
    <div
      role="toolbar"
      aria-label="Configuración de la venta"
      className={cn(getLayoutsOperarToolboxProposalBarGridClass(proposalId), className)}
    >
      {DEMO_TOOLBOX_SLOTS.map((slot, index) => (
        <button
          key={slot.id}
          type="button"
          tabIndex={-1}
          aria-hidden
          className={layoutsOperarToolboxProposalSlotClass(
            proposalId,
            slot.configured,
            index,
            slotCount,
          )}
        >
          <span
            className={layoutsOperarToolboxProposalIconWrapClass(proposalId, slot.configured)}
          >
            {slot.icon}
          </span>
          <span className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
            <span className={layoutsOperarToolboxProposalSlotLabelClass(proposalId)}>
              {slot.label}
            </span>
            <span
              className={layoutsOperarToolboxProposalSlotValueClass(proposalId, slot.configured)}
            >
              {slot.configured ? slot.value : "—"}
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}

/** Banda toolbox completa — fondo, borde, altura y layout de la propuesta. */
export function LayoutsOperarToolboxProposalBand({
  proposalId,
  children,
  className,
  measureBadge,
}: {
  proposalId: LayoutsOperarToolboxProposalId
  children?: ReactNode
  className?: string
  measureBadge?: ReactNode
}) {
  const bandProps = getLayoutsOperarToolboxProposalBandProps(proposalId)

  return (
    <div {...bandProps} className={cn(bandProps.className, className)}>
      {measureBadge}
      {children !== undefined ? children : <LayoutsOperarToolboxProposalBar proposalId={proposalId} />}
    </div>
  )
}

/** Propuesta toolbox en el grid operar — fila 2 col 1. */
export function LayoutsOperarToolboxProposalGridCell({
  proposalId,
  className,
  measureBadge,
}: {
  proposalId: LayoutsOperarToolboxProposalId
  className?: string
  measureBadge?: ReactNode
}) {
  return (
    <LayoutsOperarToolboxProposalBand
      proposalId={proposalId}
      className={cn(layoutsOperarToolboxRowClass, className)}
      measureBadge={measureBadge}
    />
  )
}

/** Demo aislada — canvas de contexto + propuesta completa. */
export function LayoutsOperarToolboxProposalStrip({
  proposalId,
  measureBadge,
  canvasLabel = "canvas · negro · junta toolbox",
}: {
  proposalId: LayoutsOperarToolboxProposalId
  measureBadge?: ReactNode
  canvasLabel?: string
}) {
  const proposal = getLayoutsOperarToolboxProposal(proposalId)

  return (
    <>
      <div
        className="flex h-12 items-center px-4 font-mono text-[10px] text-[color-mix(in_srgb,var(--rootsy-sombra-300)_72%,transparent)]"
        style={getLayoutsOperarToolboxProposalCanvasEdgeStyle(proposalId)}
      >
        {canvasLabel}
      </div>
      <LayoutsOperarToolboxProposalBand proposalId={proposalId} measureBadge={measureBadge} />
      <p className="sr-only">
        Propuesta {proposal.letter} · banda {proposal.bandMinHeightPx}px · layout{" "}
        {proposal.bandLayout}
      </p>
    </>
  )
}

export { DEMO_TOOLBOX_SLOTS }
