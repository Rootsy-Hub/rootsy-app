"use client"

import { CheckoutFieldHint } from "@/components/checkout/CheckoutFormFields"
import {
  saleOpFmt,
  saleOpImporteBaseClass,
} from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"
import {
  CircleDollarSign,
  CreditCard,
  Receipt,
  User,
  type LucideIcon,
} from "lucide-react"

type Props = {
  total: number
  hint?: string | null
  partyLabel?: string
  partyValue: string
  comprobanteLabel: string
  paymentLabel: string
  partyIcon?: LucideIcon
}

export function CheckoutConfirmSummary({
  total,
  hint,
  partyLabel = "Cliente",
  partyValue,
  comprobanteLabel,
  paymentLabel,
  partyIcon: PartyIcon = User,
}: Props) {
  const details = [
    { key: "party", icon: PartyIcon, label: partyLabel, value: partyValue },
    {
      key: "comprobante",
      icon: Receipt,
      label: "Comprobante",
      value: comprobanteLabel,
    },
    { key: "payment", icon: CreditCard, label: "Pago", value: paymentLabel },
  ] as const

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-xl border border-primary/25 bg-primary/5">
        <div className="flex items-center justify-between gap-3 px-3.5 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <CircleDollarSign className="size-[17px]" aria-hidden />
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Total a cobrar ahora
            </p>
          </div>
          <p
            className={cn(
              saleOpImporteBaseClass,
              "shrink-0 text-2xl font-semibold leading-none tracking-tight text-foreground",
            )}
          >
            {saleOpFmt.format(total)}
          </p>
        </div>

        <ul className="divide-y divide-primary/15 border-t border-primary/15 bg-primary/3">
          {details.map(({ key, icon: Icon, label, value }) => (
            <li
              key={key}
              className="flex min-w-0 items-center gap-2 px-3.5 py-2"
            >
              <Icon
                className="size-3.5 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {label}
              </span>
              <span
                className="min-w-0 flex-1 truncate text-right text-xs font-medium text-foreground"
                title={value}
              >
                {value}
              </span>
            </li>
          ))}
        </ul>
      </div>
      {hint ? <CheckoutFieldHint>{hint}</CheckoutFieldHint> : null}
    </div>
  )
}
