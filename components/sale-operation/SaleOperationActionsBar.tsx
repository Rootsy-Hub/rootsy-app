"use client"

import { Button } from "@/components/ui/button"
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

const actionBtnBase = cn(
  "h-14 w-full gap-2.5 border-0 px-4 text-[15px] font-semibold tracking-tight shadow-none transition-colors",
  "focus-visible:ring-2 focus-visible:ring-offset-0",
  "disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-40",
)

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
  return (
    <div
      className={cn(
        "grid w-full shrink-0 grid-cols-2 bg-white",
        flush
          ? "border-t border-slate-200/90"
          : "gap-2 rounded-2xl border border-slate-200/90 p-2 shadow-sm",
      )}
    >
      <button
        type="button"
        disabled={discardDisabled}
        onClick={onDiscard}
        className={cn(
          actionBtnBase,
          "inline-flex items-center justify-center",
          flush ? "rounded-none" : "rounded-xl",
          "bg-white text-rose-700 hover:bg-rose-500/10 hover:text-rose-700 active:bg-rose-500/15",
          "disabled:bg-white disabled:text-slate-400 disabled:hover:bg-white disabled:active:bg-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40",
        )}
      >
        <X className="size-[18px] shrink-0 stroke-[2.5]" aria-hidden />
        Descartar
      </button>
      <Button
        type="button"
        disabled={confirmDisabled || confirmLoading}
        onClick={onConfirm}
        title={confirmTitle}
        className={cn(
          actionBtnBase,
          flush ? "rounded-none" : "rounded-xl",
          "bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700",
          "focus-visible:ring-emerald-400/50",
        )}
      >
        {confirmLoading ? (
          <Loader2 className="size-[18px] shrink-0 animate-spin" aria-hidden />
        ) : (
          <CircleDollarSign className="size-[18px] shrink-0" aria-hidden />
        )}
        {confirmLoading ? "Procesando…" : confirmLabel}
      </Button>
    </div>
  )
}
