"use client"

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
  "inline-flex h-14 w-full items-center justify-center gap-2.5 border-0 px-4 text-[15px] font-semibold tracking-tight shadow-none transition-colors",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
  "disabled:pointer-events-none disabled:cursor-not-allowed",
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
  const confirmInactive = confirmDisabled || confirmLoading

  return (
    <div
      className={cn(
        "grid w-full shrink-0 grid-cols-2 bg-white",
        flush
          ? ""
          : "gap-2 rounded-2xl border border-slate-200/90 p-2 shadow-sm",
      )}
    >
      <button
        type="button"
        disabled={discardDisabled}
        onClick={onDiscard}
        className={cn(
          actionBtnBase,
          flush ? "rounded-none" : "rounded-xl",
          "bg-white text-rose-700 hover:bg-rose-50 active:bg-rose-100/80",
          "disabled:bg-white disabled:text-slate-300 disabled:hover:bg-white disabled:active:bg-white",
          "focus-visible:ring-rose-400/40",
        )}
      >
        <X className="size-[18px] shrink-0 stroke-[2.5]" aria-hidden />
        Descartar
      </button>
      <button
        type="button"
        disabled={confirmInactive}
        onClick={onConfirm}
        title={confirmTitle}
        className={cn(
          actionBtnBase,
          flush ? "rounded-none" : "rounded-xl",
          "bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700",
          "disabled:bg-[#8faaa0] disabled:text-white/90 disabled:hover:bg-[#8faaa0] disabled:active:bg-[#8faaa0]",
          "focus-visible:ring-emerald-400/50",
        )}
      >
        {confirmLoading ? (
          <Loader2 className="size-[18px] shrink-0 animate-spin" aria-hidden />
        ) : (
          <CircleDollarSign className="size-[18px] shrink-0" aria-hidden />
        )}
        {confirmLoading ? "Procesando…" : confirmLabel}
      </button>
    </div>
  )
}
