"use client"

import type { CashTreasuryAccountOption } from "@/app/[siteId]/[popId]/cash-registers/actions"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { saleOpChannelFormField } from "@/components/sale-operation/saleOperationStyles"
import { useMemo } from "react"

const selectTriggerClass = cn(saleOpChannelFormField, "h-11 w-full")
const selectContentClass = "z-[120] max-h-60"

export const ARCA_PTO_VTA_UNSET = "__unset__"

export function formatArcaPtoVtaLabel(value: number): string {
  return String(value).padStart(5, "0")
}

export function buildArcaPtoVtaOptions(currentRaw: string): number[] {
  const options = new Set<number>()
  for (let i = 1; i <= 99; i++) options.add(i)
  const current = currentRaw.trim()
  if (current !== "") {
    const parsed = Number(current)
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 99999) {
      options.add(Math.trunc(parsed))
    }
  }
  return [...options].sort((a, b) => a - b)
}

type TreasurySelectProps = {
  id: string
  value: string
  onValueChange: (value: string) => void
  accounts: CashTreasuryAccountOption[]
  disabled?: boolean
}

export function CashRegisterTreasuryAccountSelect({
  id,
  value,
  onValueChange,
  accounts,
  disabled = false,
}: TreasurySelectProps) {
  const hasAccounts = accounts.length > 0
  const selectValue = value || accounts[0]?.id || ""

  return (
    <Select
      value={hasAccounts ? selectValue : undefined}
      onValueChange={onValueChange}
      disabled={disabled || !hasAccounts}
    >
      <SelectTrigger id={id} className={selectTriggerClass}>
        <SelectValue
          placeholder={
            hasAccounts ? "Elegí una cuenta de efectivo" : "Sin cuentas de efectivo"
          }
        />
      </SelectTrigger>
      <SelectContent className={selectContentClass} position="popper">
        {accounts.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            {account.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

type PtoVtaSelectProps = {
  id: string
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

export function CashRegisterArcaPtoVtaSelect({
  id,
  value,
  onValueChange,
  disabled = false,
}: PtoVtaSelectProps) {
  const options = useMemo(() => buildArcaPtoVtaOptions(value), [value])
  const selectValue = value.trim() === "" ? ARCA_PTO_VTA_UNSET : value

  return (
    <Select
      value={selectValue}
      onValueChange={(next) => {
        onValueChange(next === ARCA_PTO_VTA_UNSET ? "" : next)
      }}
      disabled={disabled}
    >
      <SelectTrigger id={id} className={selectTriggerClass}>
        <SelectValue placeholder="Elegí el punto de venta" />
      </SelectTrigger>
      <SelectContent className={selectContentClass} position="popper">
        <SelectItem value={ARCA_PTO_VTA_UNSET}>Sin configurar</SelectItem>
        {options.map((pto) => (
          <SelectItem key={pto} value={String(pto)}>
            {formatArcaPtoVtaLabel(pto)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
