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
  flush?: boolean
  /** Ticket operar — umbral circular Descartar · Cobrar / Pagar. */
  variant?: "default" | "operar" | "mobile"
  /** Mesa o pedido — caption arriba, número abajo, alineado con los círculos. */
  contextLabel?: {
    caption: string
    value: string
    /** Pedido de mostrador: el código puede ser largo. */
    valueSize?: "prominent" | "compact"
  }
  className?: string
}

export function SaleOperationActionsBar({
  discardDisabled = false,
  confirmDisabled = false,
  confirmLoading = false,
  confirmLabel,
  confirmTitle,
  confirmTone = "charge",
  onDiscard,
  onConfirm,
  onComandas,
  comandasDisabled = false,
  flush = false,
  variant = "default",
  contextLabel,
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
    return (
      <div
        className={cn(
          saleOpActionsBarShellClass,
          "border-t border-[var(--layouts-operar-border-light)]",
          className,
        )}
      >
        <button
          type="button"
          disabled={discardDisabled}
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

  if (variant === "operar") {
    return (
      <div className="flex h-full w-full items-center justify-center gap-[var(--rootsy-space-300)]">
        {contextLabel ? (
          <p
            className="flex min-w-[2.5rem] max-w-[7.5rem] flex-col items-center justify-center leading-none text-[var(--rootsy-bruma-800)]"
            aria-label={`${contextLabel.caption} ${contextLabel.value}`}
          >
            <span className="font-canopy text-xs font-bold">
              {contextLabel.caption}
            </span>
            <span
              className={cn(
                "-mt-0.5 truncate font-ledger font-bold tabular-nums tracking-tight",
                contextLabel.valueSize === "compact" ? "text-sm" : "text-2xl",
              )}
            >
              {contextLabel.value}
            </span>
          </p>
        ) : null}
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
        {contextLabel ? (
          <RootsIconButton
            label="Comandas"
            theme="pos"
            emphasis="primary"
            size="large"
            sizeChildren={false}
            disabled={comandasDisabled}
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
