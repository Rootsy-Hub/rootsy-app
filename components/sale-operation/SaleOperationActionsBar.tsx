"use client"

import {
  layoutsOperarTicketActionCircleRadius,
  layoutsOperarTicketActionConfirmIconPx,
  layoutsOperarTicketActionConfirmSizePx,
  layoutsOperarTicketActionDiscardIconPx,
  layoutsOperarTicketActionDiscardSizePx,
} from "@/app/library/layouts/layoutsOperarStyles"
import { RootsIconButton } from "@/components/rootsy-button"
import {
  saleOpActionConfirmClass,
  saleOpActionDiscardClass,
  saleOpActionIconWrapConfirmClass,
  saleOpActionIconWrapConfirmDisabledClass,
  saleOpActionIconWrapDiscardClass,
  saleOpActionsBarShellClass,
} from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"
import { CircleDollarSign, HandCoins, Loader2, X } from "lucide-react"

const ticketActionDiscardStyle = {
  borderRadius: layoutsOperarTicketActionCircleRadius,
  width: layoutsOperarTicketActionDiscardSizePx,
  height: layoutsOperarTicketActionDiscardSizePx,
} as const

const ticketActionConfirmStyle = {
  borderRadius: layoutsOperarTicketActionCircleRadius,
  width: layoutsOperarTicketActionConfirmSizePx,
  height: layoutsOperarTicketActionConfirmSizePx,
} as const

export type SaleOperationActionsBarProps = {
  discardDisabled?: boolean
  confirmDisabled?: boolean
  confirmLoading?: boolean
  confirmLabel?: string
  confirmTitle?: string
  onDiscard: () => void
  onConfirm: () => void
  flush?: boolean
  /** Ticket operar — umbral circular Descartar · Cobrar. */
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

  if (variant === "operar") {
    return (
      <>
        <RootsIconButton
          label="Descartar"
          theme="workspace"
          emphasis="outlined"
          size="large"
          sizeChildren={false}
          disabled={discardDisabled}
          onClick={onDiscard}
          style={ticketActionDiscardStyle}
        >
          <X
            size={layoutsOperarTicketActionDiscardIconPx}
            strokeWidth={2.5}
            aria-hidden
          />
        </RootsIconButton>
        <RootsIconButton
          label={confirmLoading ? "Procesando" : confirmLabel}
          theme="pos"
          emphasis="primary"
          size="large"
          sizeChildren={false}
          loading={confirmLoading}
          disabled={confirmDisabled}
          title={confirmTitle}
          onClick={onConfirm}
          style={ticketActionConfirmStyle}
        >
          <HandCoins size={layoutsOperarTicketActionConfirmIconPx} aria-hidden />
        </RootsIconButton>
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
      <button
        type="button"
        disabled={discardDisabled}
        onClick={onDiscard}
        className={cn(saleOpActionDiscardClass, !flush && "rounded-xl")}
      >
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
      </button>
      <button
        type="button"
        disabled={confirmInactive}
        onClick={onConfirm}
        title={confirmTitle}
        className={cn(saleOpActionConfirmClass, !flush && "rounded-xl")}
      >
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
      </button>
    </div>
  )
}
