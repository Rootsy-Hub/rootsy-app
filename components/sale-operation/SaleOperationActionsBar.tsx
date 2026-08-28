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
  saleOpActionComandasFillClass,
  saleOpActionConfirmClass,
  saleOpActionDiscardClass,
  saleOpActionDiscardFillClass,
  saleOpActionIconWrapConfirmClass,
  saleOpActionIconWrapConfirmDisabledClass,
  saleOpActionIconWrapDiscardClass,
  saleOpActionPayClass,
  saleOpActionsBarShellClass,
  saleOpTicketActionComandasClass,
  saleOpTicketActionPayClass,
} from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"
import { Banknote, ChefHat, CircleDollarSign, HandCoins, Loader2, X } from "lucide-react"

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
  discardTitle?: string
  confirmDisabled?: boolean
  confirmLoading?: boolean
  confirmLabel?: string
  confirmTitle?: string
  /** Cobrar entra plata (savia). Pagar sale plata (otoño). */
  confirmTone?: "charge" | "pay"
  onDiscard: () => void
  onConfirm: () => void
  onComandas?: () => void
  comandasDisabled?: boolean
  comandasTitle?: string
  flush?: boolean
  /** Ticket operar — umbral circular Descartar · Cobrar / Pagar. */
  variant?: "default" | "operar" | "mobile"
  className?: string
}

export function SaleOperationActionsBar({
  discardDisabled = false,
  discardTitle,
  confirmDisabled = false,
  confirmLoading = false,
  confirmLabel,
  confirmTitle,
  confirmTone = "charge",
  onDiscard,
  onConfirm,
  onComandas,
  comandasDisabled = false,
  comandasTitle,
  flush = false,
  variant = "default",
  className,
}: SaleOperationActionsBarProps) {
  const confirmInactive = confirmDisabled || confirmLoading
  const isPay = confirmTone === "pay"
  const resolvedConfirmLabel = confirmLabel ?? (isPay ? "Pagar" : "Vender")
  const ConfirmIcon = isPay ? Banknote : HandCoins
  const mobileConfirmLabel =
    isPay
      ? (confirmLabel ?? "Pagar")
      : confirmLabel && confirmLabel !== "Vender"
        ? confirmLabel
        : "Cobrar"

  if (variant === "mobile") {
    const showComandas = typeof onComandas === "function"

    return (
      <div
        className={cn(
          saleOpActionsBarShellClass,
          "border-t border-[var(--layouts-operar-border-light)]",
          className,
        )}
      >
        {showComandas ? (
          <div className="grid min-w-0 grid-cols-2">
            <button
              type="button"
              disabled={discardDisabled}
              aria-label="Descartar"
              title={discardTitle}
              onClick={onDiscard}
              className={saleOpActionDiscardFillClass}
            >
              <X className="size-5 stroke-[2.5]" aria-hidden />
            </button>
            <button
              type="button"
              disabled={comandasDisabled}
              aria-label="Comandas"
              title={comandasTitle}
              onClick={() => onComandas?.()}
              className={saleOpActionComandasFillClass}
            >
              <ChefHat className="size-5" aria-hidden />
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={discardDisabled}
            title={discardTitle}
            onClick={onDiscard}
            className={saleOpActionDiscardClass}
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
        )}
        <button
          type="button"
          disabled={confirmInactive}
          onClick={onConfirm}
          title={confirmTitle}
          className={isPay ? saleOpActionPayClass : saleOpActionConfirmClass}
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
            ) : isPay ? (
              <Banknote className="size-4" />
            ) : (
              <CircleDollarSign className="size-4" />
            )}
          </span>
          {confirmLoading ? "Procesando…" : mobileConfirmLabel}
        </button>
      </div>
    )
  }

  const showComandas = typeof onComandas === "function"

  if (variant === "operar") {
    return (
      <div className="flex h-full w-full items-center justify-center gap-[var(--rootsy-space-300)]">
        <RootsIconButton
          label="Descartar"
          theme="workspace"
          emphasis="outlined"
          size="large"
          sizeChildren={false}
          disabled={discardDisabled}
          title={discardTitle}
          onClick={onDiscard}
          style={ticketActionDiscardStyle}
        >
          <X
            size={layoutsOperarTicketActionDiscardIconPx}
            strokeWidth={2.5}
            aria-hidden
          />
        </RootsIconButton>
        {showComandas ? (
          <RootsIconButton
            label="Comandas"
            theme="pos"
            emphasis="primary"
            size="large"
            sizeChildren={false}
            disabled={comandasDisabled}
            title={comandasTitle}
            onClick={() => onComandas?.()}
            className={saleOpTicketActionComandasClass}
            style={ticketActionDiscardStyle}
          >
            <ChefHat
              size={layoutsOperarTicketActionDiscardIconPx}
              strokeWidth={2}
              aria-hidden
            />
          </RootsIconButton>
        ) : null}
        <RootsIconButton
          label={confirmLoading ? "Procesando" : resolvedConfirmLabel}
          theme="pos"
          emphasis="primary"
          size="large"
          sizeChildren={false}
          loading={confirmLoading}
          disabled={confirmDisabled}
          title={confirmTitle}
          onClick={onConfirm}
          className={isPay ? saleOpTicketActionPayClass : undefined}
          style={ticketActionConfirmStyle}
        >
          <ConfirmIcon size={layoutsOperarTicketActionConfirmIconPx} aria-hidden />
        </RootsIconButton>
      </div>
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
        title={discardTitle}
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
        className={cn(
          isPay ? saleOpActionPayClass : saleOpActionConfirmClass,
          !flush && "rounded-xl",
        )}
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
          ) : isPay ? (
            <Banknote className="size-4" />
          ) : (
            <CircleDollarSign className="size-4" />
          )}
        </span>
        {confirmLoading ? "Procesando…" : resolvedConfirmLabel}
      </button>
    </div>
  )
}
