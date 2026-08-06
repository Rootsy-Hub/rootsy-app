"use client"

import {
  layoutsOperarTicketProposalActionDiscardClass,
  layoutsOperarTicketProposalActionSellClass,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsOperarHardcodedSpec"
import {
  layoutsOperarSummaryActionConfirmColClass,
  layoutsOperarSummaryActionDiscardColClass,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsOperarStyles"
import { LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL } from "@/app/[siteId]/[popId]/library/layouts/rootsyLayoutsOperarSystem"
import {
  saleOpActionConfirmClass,
  saleOpActionDiscardClass,
  saleOpActionIconWrapConfirmClass,
  saleOpActionIconWrapConfirmDisabledClass,
  saleOpActionIconWrapDiscardClass,
  saleOpActionsBarShellClass,
} from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"
import { CircleDollarSign, Loader2, X } from "lucide-react"

const TICKET_PROPOSAL = LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL

export type SaleOperationActionsBarProps = {
  discardDisabled?: boolean
  confirmDisabled?: boolean
  confirmLoading?: boolean
  confirmLabel?: string
  confirmTitle?: string
  onDiscard: () => void
  onConfirm: () => void
  flush?: boolean
  /** Grid operar 1.2.3 — dos columnas hermanas (Descartar | Vender). */
  variant?: "default" | "operar"
  className?: string
}

export function SaleOperationActionsBar({
  discardDisabled = false,
  confirmDisabled = false,
  confirmLoading = false,
  confirmLabel = "Vender",
  confirmTitle,
  onDiscard,
  onConfirm,
  flush = false,
  variant = "default",
  className,
}: SaleOperationActionsBarProps) {
  const confirmInactive = confirmDisabled || confirmLoading
  const isOperar = variant === "operar"

  const discardButton = (
    <button
      type="button"
      disabled={discardDisabled}
      onClick={onDiscard}
      className={cn(
        isOperar
          ? cn(
              layoutsOperarTicketProposalActionDiscardClass(TICKET_PROPOSAL),
              "h-full w-full border-0 bg-transparent shadow-none transition-[color,opacity] duration-150",
              "hover:text-rose-800 active:text-rose-900",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-400/35",
              "disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:text-slate-400",
            )
          : cn(saleOpActionDiscardClass, !flush && "rounded-xl"),
      )}
    >
      {isOperar ? (
        "Descartar"
      ) : (
        <>
          <span
            className={cn(
              saleOpActionIconWrapDiscardClass,
              discardDisabled && "bg-slate-200/60 text-slate-500",
            )}
            aria-hidden
          >
            <X className="size-4 stroke-[2.5]" />
          </span>
          Descartar
        </>
      )}
    </button>
  )

  const confirmButton = (
    <button
      type="button"
      disabled={confirmInactive}
      onClick={onConfirm}
      title={confirmTitle}
      className={cn(
        isOperar
          ? cn(
              layoutsOperarTicketProposalActionSellClass(TICKET_PROPOSAL),
              "h-full w-full border-0 shadow-none transition-[background-color,opacity] duration-150",
              "hover:bg-[var(--rootsy-savia-500)] active:bg-[var(--rootsy-savia-700)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-300)_55%,transparent)]",
              "disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-[var(--rootsy-savia-600)] disabled:active:bg-[var(--rootsy-savia-600)]",
            )
          : cn(saleOpActionConfirmClass, !flush && "rounded-xl"),
      )}
    >
      {isOperar ? (
        confirmLoading ? "Procesando…" : confirmLabel
      ) : (
        <>
          <span
            className={cn(
              confirmInactive
                ? saleOpActionIconWrapConfirmDisabledClass
                : saleOpActionIconWrapConfirmClass,
            )}
            aria-hidden
          >
            {confirmLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CircleDollarSign className="size-4" />
            )}
          </span>
          {confirmLoading ? "Procesando…" : confirmLabel}
        </>
      )}
    </button>
  )

  if (variant === "operar") {
    return (
      <>
        <div className={layoutsOperarSummaryActionDiscardColClass}>{discardButton}</div>
        <div className={layoutsOperarSummaryActionConfirmColClass}>{confirmButton}</div>
      </>
    )
  }

  return (
    <div
      className={cn(
        flush
          ? saleOpActionsBarShellClass
          : "grid w-full shrink-0 grid-cols-2 gap-2 rounded-2xl border border-[#dfe4ea] bg-white p-2 shadow-sm",
        className,
      )}
    >
      {discardButton}
      {confirmButton}
    </div>
  )
}
