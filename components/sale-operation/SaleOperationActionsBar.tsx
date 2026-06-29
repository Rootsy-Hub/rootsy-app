"use client"

import { Button } from "@/components/ui/button"
import { CircleCheck, CircleX } from "lucide-react"

export type SaleOperationActionsBarProps = {
  discardDisabled?: boolean
  confirmDisabled?: boolean
  confirmLoading?: boolean
  confirmLabel?: string
  confirmTitle?: string
  onDiscard: () => void
  onConfirm: () => void
}

export function SaleOperationActionsBar({
  discardDisabled = false,
  confirmDisabled = false,
  confirmLoading = false,
  confirmLabel = "Vender",
  confirmTitle,
  onDiscard,
  onConfirm,
}: SaleOperationActionsBarProps) {
  return (
    <div className="bg-[#f8fafc] p-3 text-[#121417]">
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={discardDisabled}
          onClick={onDiscard}
          className="h-11 gap-2 border-rose-200/90 bg-white font-medium text-rose-700 shadow-none hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800 focus-visible:ring-2 focus-visible:ring-rose-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8fafc] disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-45"
        >
          <CircleX className="size-4 shrink-0" aria-hidden />
          Descartar
        </Button>
        <Button
          type="button"
          disabled={confirmDisabled || confirmLoading}
          onClick={onConfirm}
          title={confirmTitle}
          className="h-11 gap-2 border-0 bg-emerald-600 font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:bg-emerald-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8fafc] active:bg-emerald-700 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-45"
        >
          <CircleCheck className="size-4 shrink-0 opacity-95" aria-hidden />
          {confirmLoading ? "Procesando…" : confirmLabel}
        </Button>
      </div>
    </div>
  )
}
