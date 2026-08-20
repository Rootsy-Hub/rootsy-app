"use client"

import {
  RootsFormMoneyField,
  RootsFormSelectField,
  RootsFormSelectItem,
} from "@/components/rootsy-form"
import {
  CURRENT_ACCOUNT_SALE_DEFAULT_DUE_DAYS,
  CURRENT_ACCOUNT_TERM_DAY_OPTIONS,
} from "@/lib/currentAccounts"
import { useMemo } from "react"

type Props = {
  idPrefix: string
  creditLimit: string
  termDays: string
  onCreditLimitChange: (value: string) => void
  onTermDaysChange: (value: string) => void
  disabled?: boolean
}

export function CurrentAccountTermsFields({
  idPrefix,
  creditLimit,
  termDays,
  onCreditLimitChange,
  onTermDaysChange,
  disabled,
}: Props) {
  const options = useMemo(() => {
    const current = Number(termDays)
    const days = [...CURRENT_ACCOUNT_TERM_DAY_OPTIONS]
    if (
      Number.isFinite(current) &&
      current >= 1 &&
      !days.includes(current as (typeof days)[number])
    ) {
      days.push(current)
      days.sort((a, b) => a - b)
    }
    return days
  }, [termDays])

  const selectValue = options.some((days) => String(days) === termDays)
    ? termDays
    : String(CURRENT_ACCOUNT_SALE_DEFAULT_DUE_DAYS)

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <RootsFormMoneyField
        id={`${idPrefix}-limit`}
        label="Límite de crédito"
        hint="Vacío = sin tope."
        value={creditLimit}
        onChange={onCreditLimitChange}
        disabled={disabled}
      />
      <RootsFormSelectField
        id={`${idPrefix}-days`}
        label="Plazo"
        hint="Días para el vencimiento."
        value={selectValue}
        onValueChange={onTermDaysChange}
        disabled={disabled}
      >
        {options.map((days) => (
          <RootsFormSelectItem key={days} value={String(days)}>
            {days} días
          </RootsFormSelectItem>
        ))}
      </RootsFormSelectField>
    </div>
  )
}
