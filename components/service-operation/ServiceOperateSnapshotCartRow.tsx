"use client"

import {
  layoutsOperarTicketProposalLineAmountClass,
  layoutsOperarTicketProposalLineMetaClass,
  layoutsOperarTicketProposalLineNameClass,
} from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import { LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import { cartLineRowGridCompactClass } from "@/components/sale-operation/CartLineQuantityLabel"
import { cn } from "@/lib/utils"

const TICKET_PROPOSAL = LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL
const PLACEHOLDER = "—"

type Props = {
  label: string
  value?: string
  valueContent?: React.ReactNode
  subtitle?: string | null
  subtitleClassName?: string
  empty?: boolean
  className?: string
}

export function ServiceOperateSnapshotCartRow({
  label,
  value = "",
  valueContent,
  subtitle,
  subtitleClassName,
  empty = false,
  className,
}: Props) {
  const subtitleTrimmed = subtitle?.trim() ?? ""
  const isEmpty = empty || (!valueContent && (value === PLACEHOLDER || !value))

  return (
    <div className={cn(cartLineRowGridCompactClass, className)}>
      <div className="min-w-0 self-center">
        <span className={layoutsOperarTicketProposalLineNameClass(TICKET_PROPOSAL)}>
          {label}
        </span>
        {subtitleTrimmed ? (
          <span
            className={cn(
              subtitleClassName ?? layoutsOperarTicketProposalLineMetaClass(TICKET_PROPOSAL),
              "mt-0.5 block",
            )}
          >
            {subtitleTrimmed}
          </span>
        ) : null}
      </div>
      {valueContent ?? (
        <span
          className={cn(
            layoutsOperarTicketProposalLineAmountClass(TICKET_PROPOSAL),
            "self-center pt-0",
            isEmpty && "font-normal text-[var(--layouts-operar-light-cart-line-meta)]",
          )}
          title={isEmpty ? undefined : value}
        >
          {value}
        </span>
      )}
    </div>
  )
}
