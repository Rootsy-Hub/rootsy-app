"use client"

import {
  layoutsOperarSummaryActionConfirmColClass,
  layoutsOperarSummaryActionDiscardColClass,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsOperarStyles"
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

  const discardButton = (
    <button
      type="button"
      disabled={discardDisabled}
      onClick={onDiscard}
      className={cn(
        saleOpActionDiscardClass,
        variant === "operar" ? "h-full w-full" : !flush && "rounded-xl",
      )}
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
  )

  const confirmButton = (
    <button
      type="button"
      disabled={confirmInactive}
      onClick={onConfirm}
      title={confirmTitle}
      className={cn(
        saleOpActionConfirmClass,
        variant === "operar" ? "h-full w-full" : !flush && "rounded-xl",
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
        ) : (
          <CircleDollarSign className="size-4" />
        )}
      </span>
      {confirmLoading ? "Procesando…" : confirmLabel}
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
