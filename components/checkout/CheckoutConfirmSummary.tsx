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
      <div className="overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--rootsy-savia-400)_35%,transparent)] bg-[color-mix(in_srgb,var(--rootsy-savia-400)_6%,white)]">
        <div className="flex items-center justify-between gap-3 px-3.5 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--rootsy-savia-400)_12%,white)] text-[var(--rootsy-savia-700)]">
              <CircleDollarSign className="size-[17px]" aria-hidden />
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--rootsy-bruma-500)]">
              Total a cobrar ahora
            </p>
          </div>
          <p
            className={cn(
              saleOpImporteBaseClass,
              "shrink-0 text-2xl font-semibold leading-none tracking-tight text-[var(--rootsy-bruma-900)]",
            )}
          >
            {saleOpFmt.format(total)}
          </p>
        </div>

        <ul className="divide-y divide-[color-mix(in_srgb,var(--rootsy-savia-400)_15%,transparent)] border-t border-[color-mix(in_srgb,var(--rootsy-savia-400)_15%,transparent)] bg-[color-mix(in_srgb,var(--rootsy-savia-400)_4%,white)]">
          {details.map(({ key, icon: Icon, label, value }) => (
            <li
              key={key}
              className="flex min-w-0 items-center gap-2 px-3.5 py-2"
            >
              <Icon
                className="size-3.5 shrink-0 text-[var(--rootsy-bruma-500)]"
                aria-hidden
              />
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--rootsy-bruma-500)]">
                {label}
              </span>
              <span
                className="min-w-0 flex-1 truncate text-right text-xs font-medium text-[var(--rootsy-bruma-900)]"
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
