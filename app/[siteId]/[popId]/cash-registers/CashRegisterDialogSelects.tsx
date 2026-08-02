"use client"

import type { CashTreasuryAccountOption } from "@/app/[siteId]/[popId]/cash-registers/actions"
import { FieldSelect } from "@/components/ui/field-select"
import { SelectItem } from "@/components/ui/select"
import {
  saleOpLightFormPrefix,
  saleOpLightFormSurface,
  saleOpLightSelectContent,
  saleOpLightSelectItem,
} from "@/components/sale-operation/saleOperationStyles"
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
    <FieldSelect
      id={id}
      value={hasAccounts ? selectValue : ""}
      onValueChange={onValueChange}
      disabled={disabled || !hasAccounts}
      placeholder={
        hasAccounts ? "Elegí una cuenta de efectivo" : "Sin cuentas de efectivo"
      }
      className={saleOpLightFormSurface}
      prefixClassName={saleOpLightFormPrefix}
      prefixIcon={
        <Banknote
          className="size-4 shrink-0 text-zinc-600 dark:text-zinc-600"
          aria-hidden
        />
      }
      contentClassName={saleOpLightSelectContent}
    >
      {accounts.map((account) => (
        <SelectItem
          key={account.id}
          value={account.id}
          className={saleOpLightSelectItem}
        >
          {account.name}
        </SelectItem>
      ))}
    </FieldSelect>
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
    <FieldSelect
      id={id}
      value={selectValue}
      onValueChange={(next) => {
        onValueChange(next === ARCA_PTO_VTA_UNSET ? "" : next)
      }}
      disabled={disabled}
      placeholder="Elegí el punto de venta"
      className={saleOpLightFormSurface}
      prefixClassName={saleOpLightFormPrefix}
      prefixIcon={
        <Hash
          className="size-4 shrink-0 text-zinc-600 dark:text-zinc-600"
          aria-hidden
        />
      }
      contentClassName={saleOpLightSelectContent}
    >
      <SelectItem value={ARCA_PTO_VTA_UNSET} className={saleOpLightSelectItem}>
        Sin configurar
      </SelectItem>
      {options.map((pto) => (
        <SelectItem
          key={pto}
          value={String(pto)}
          className={saleOpLightSelectItem}
        >
          {formatArcaPtoVtaLabel(pto)}
        </SelectItem>
      ))}
    </FieldSelect>
  )
}
