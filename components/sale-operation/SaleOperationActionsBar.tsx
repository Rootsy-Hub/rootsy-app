"use client"

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
}: SaleOperationActionsBarProps) {
  const confirmInactive = confirmDisabled || confirmLoading

  return (
    <div
      className={
        flush
          ? saleOpActionsBarShellClass
          : "grid w-full shrink-0 grid-cols-2 gap-2 rounded-2xl border border-[#dfe4ea] bg-white p-2 shadow-sm"
      }
    >
      <button
        type="button"
        disabled={discardDisabled}
        onClick={onDiscard}
        className={cn(
          saleOpActionDiscardClass,
          !flush && "rounded-xl",
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
      <button
        type="button"
        disabled={confirmInactive}
        onClick={onConfirm}
        title={confirmTitle}
        className={cn(
          saleOpActionConfirmClass,
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
          ) : (
            <CircleDollarSign className="size-4" />
          )}
        </span>
        {confirmLoading ? "Procesando…" : confirmLabel}
      </button>
    </div>
  )
}
