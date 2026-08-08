"use client"

import type { CashTreasuryAccountOption } from "@/app/[siteId]/[popId]/cash-registers/actions"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
} from "@/components/rootsy-form"
import { Banknote, Hash } from "lucide-react"
import { useMemo } from "react"

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
  label: string
  value: string
  onValueChange: (value: string) => void
  accounts: CashTreasuryAccountOption[]
  disabled?: boolean
}

export function CashRegisterTreasuryAccountSelect({
  id,
  label,
  value,
  onValueChange,
  accounts,
  disabled = false,
}: TreasurySelectProps) {
  const hasAccounts = accounts.length > 0
  const selectValue = value || accounts[0]?.id || ""

  return (
    <RootsFormSelectField
      label={label}
      id={id}
      value={hasAccounts ? selectValue : ""}
      onValueChange={onValueChange}
      disabled={disabled || !hasAccounts}
      placeholder={
        hasAccounts ? "Elegí una cuenta de efectivo" : "Sin cuentas de efectivo"
      }
      prefix={<Banknote className="size-4 shrink-0" aria-hidden />}
    >
      {accounts.map((account) => (
        <RootsFormSelectItem key={account.id} value={account.id}>
          {account.name}
        </RootsFormSelectItem>
      ))}
    </RootsFormSelectField>
  )
}

type PtoVtaSelectProps = {
  id: string
  label?: string
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

export function CashRegisterArcaPtoVtaSelect({
  id,
  label = "Punto de venta",
  value,
  onValueChange,
  disabled = false,
}: PtoVtaSelectProps) {
  const options = useMemo(() => buildArcaPtoVtaOptions(value), [value])
  const selectValue = value.trim() === "" ? ARCA_PTO_VTA_UNSET : value

  return (
    <RootsFormSelectField
      label={label}
      id={id}
      value={selectValue}
      onValueChange={(next) => {
        onValueChange(next === ARCA_PTO_VTA_UNSET ? "" : next)
      }}
      disabled={disabled}
      placeholder="Elegí el punto de venta"
      prefix={<Hash className="size-4 shrink-0" aria-hidden />}
    >
      <RootsFormSelectItem value={ARCA_PTO_VTA_UNSET}>
        Sin configurar
      </RootsFormSelectItem>
      {options.map((pto) => (
        <RootsFormSelectItem key={pto} value={String(pto)}>
          {formatArcaPtoVtaLabel(pto)}
        </RootsFormSelectItem>
      ))}
    </RootsFormSelectField>
  )
}
