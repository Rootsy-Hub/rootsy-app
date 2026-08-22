"use client"

import {
  SaleFinalizeDialog,
  type SaleFinalizeTone,
} from "@/components/checkout/SaleFinalizeDialog"
import type { LucideIcon } from "lucide-react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  confirmLabel: string
  submitting: boolean
  submitError: string | null
  total: number
  subtotal?: number
  descuentoMonto?: number
  hayDescuento?: boolean
  partyLabel?: string
  partyValue: string
  partyIcon?: LucideIcon
  comprobanteLabel: string
  paymentLabel: string
  tone?: SaleFinalizeTone
  amountLabel?: string
  onConfirm: () => void | Promise<void>
}

/** @deprecated Alias — usar SaleFinalizeDialog directamente. */
export function SimpleOperationCheckoutConfirmDialog(props: Props) {
  return <SaleFinalizeDialog {...props} />
}
