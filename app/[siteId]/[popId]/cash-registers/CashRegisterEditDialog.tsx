"use client"

import type {
  ArcaSalePointOption,
  CashRegisterRow,
  CashTreasuryAccountOption,
} from "@/app/[siteId]/[popId]/cash-registers/actions"
import {
  CASH_REGISTER_SALE_POINT_NONE,
  CashRegisterSalePointSelect,
  CashRegisterTreasuryAccountSelect,
} from "@/app/[siteId]/[popId]/cash-registers/CashRegisterDialogSelects"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import {
  RootsFormCheckboxField,
  RootsFormTextField,
} from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"
import { useEffect, useState, type FormEvent } from "react"

export type CashRegisterEditSubmitPayload = {
  name: string
  isActive: boolean
  cashTreasuryAccountId: string
  arcaSalePointId: string | null
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: CashRegisterRow | null
  saving: boolean
  banner: string | null
  cashTreasuryAccounts: CashTreasuryAccountOption[]
  salePoints: ArcaSalePointOption[]
  onSubmit: (payload: CashRegisterEditSubmitPayload) => void | Promise<void>
}

export function CashRegisterEditDialog({
  open,
  onOpenChange,
  row,
  saving,
  banner,
  cashTreasuryAccounts,
  salePoints,
  onSubmit,
}: Props) {
  const [name, setName] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [cashTreasuryAccountId, setCashTreasuryAccountId] = useState("")
  const [arcaSalePointId, setArcaSalePointId] = useState(
    CASH_REGISTER_SALE_POINT_NONE,
  )

  useEffect(() => {
    if (!open || !row) return
    setName(row.name)
    setIsActive(row.isActive)
    setCashTreasuryAccountId(
      row.cashTreasuryAccountId ?? cashTreasuryAccounts[0]?.id ?? "",
    )
    setArcaSalePointId(row.arcaSalePointId ?? CASH_REGISTER_SALE_POINT_NONE)
  }, [open, row, cashTreasuryAccounts])

  const canSubmit =
    name.trim().length > 0 &&
    cashTreasuryAccountId.length > 0 &&
    cashTreasuryAccounts.length > 0

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    void onSubmit({
      name: name.trim(),
      isActive,
      cashTreasuryAccountId,
      arcaSalePointId:
        arcaSalePointId === CASH_REGISTER_SALE_POINT_NONE
          ? null
          : arcaSalePointId,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="default">
        <RootsDialogHeader
          title="Editar caja"
          description={
            row?.name
              ? `Configuración de ${row.name}`
              : "Nombre y cuenta de efectivo."
          }
          descriptionHidden
        />
        <RootsDialogForm onSubmit={handleSubmit}>
          <RootsDialogBody>
            {banner ? <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner> : null}
            <RootsFormTextField
              label="Nombre"
              id="cr-edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="pt-4">
              <RootsFormCheckboxField
                id="cr-edit-active"
                label="Caja activa"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            <div className="pt-4">
              <CashRegisterTreasuryAccountSelect
                id="cr-edit-treasury"
                label="Cuenta de efectivo destino"
                value={cashTreasuryAccountId}
                onValueChange={setCashTreasuryAccountId}
                accounts={cashTreasuryAccounts}
              />
            </div>

            <div className="pt-4">
              <CashRegisterSalePointSelect
                id="cr-edit-sale-point"
                value={arcaSalePointId}
                onValueChange={setArcaSalePointId}
                salePoints={salePoints}
              />
            </div>
          </RootsDialogBody>
          <RootsDialogDualActionFooter
            onCancel={() => onOpenChange(false)}
            confirmLabel="Guardar"
            confirmLoadingLabel="Guardando…"
            confirmType="submit"
            confirmDisabled={!canSubmit}
            confirmLoading={saving}
          />
        </RootsDialogForm>
      </RootsDialogContent>
    </Dialog>
  )
}
