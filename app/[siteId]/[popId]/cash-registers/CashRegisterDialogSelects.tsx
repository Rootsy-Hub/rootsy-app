"use client"

import type {
  ArcaSalePointOption,
  CashTreasuryAccountOption,
} from "@/app/[siteId]/[popId]/cash-registers/actions"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
} from "@/components/rootsy-form"
import { formatArcaPtoVta } from "@/lib/arcaPtoVta"
import { Banknote, Hash } from "lucide-react"

export const CASH_REGISTER_SALE_POINT_NONE = "none"

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

type SalePointSelectProps = {
  id: string
  value: string
  onValueChange: (value: string) => void
  salePoints: ArcaSalePointOption[]
  disabled?: boolean
}

export function CashRegisterSalePointSelect({
  id,
  value,
  onValueChange,
  salePoints,
  disabled = false,
}: SalePointSelectProps) {
  const hasPoints = salePoints.length > 0
  const selectValue = value || CASH_REGISTER_SALE_POINT_NONE

  return (
    <RootsFormSelectField
      label="Punto de venta AFIP"
      id={id}
      value={hasPoints ? selectValue : CASH_REGISTER_SALE_POINT_NONE}
      onValueChange={onValueChange}
      disabled={disabled || !hasPoints}
      placeholder={
        hasPoints
          ? "Elegí un punto de venta"
          : "Creá un punto de venta en Facturas"
      }
      hint="Se usa al emitir facturas con esta caja."
      prefix={<Hash className="size-4 shrink-0" aria-hidden />}
    >
      <RootsFormSelectItem value={CASH_REGISTER_SALE_POINT_NONE}>
        Sin punto de venta
      </RootsFormSelectItem>
      {salePoints.map((point) => (
        <RootsFormSelectItem key={point.id} value={point.id}>
          {formatArcaPtoVta(point.ptoVta)}
          {point.configured ? "" : " · Pendiente"}
        </RootsFormSelectItem>
      ))}
    </RootsFormSelectField>
  )
}
