"use client"

import type {
  ArcaSalePointOption,
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
import { RootsFormTextField } from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"
import { RootsBanner } from "@/components/rootsy-banner"
import { useEffect, useState, type FormEvent } from "react"

export type CashRegisterCreateInput = {
  name: string
  cashTreasuryAccountId: string
  arcaSalePointId: string | null
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  saving: boolean
  banner: string | null
  cashTreasuryAccounts: CashTreasuryAccountOption[]
  salePoints: ArcaSalePointOption[]
  onSubmit: (input: CashRegisterCreateInput) => void | Promise<void>
}

export function CashRegisterCreateDialog({
  open,
  onOpenChange,
  saving,
  banner,
  cashTreasuryAccounts,
  salePoints,
  onSubmit,
}: Props) {
  const [name, setName] = useState("")
  const [cashTreasuryAccountId, setCashTreasuryAccountId] = useState("")
  const [arcaSalePointId, setArcaSalePointId] = useState(
    CASH_REGISTER_SALE_POINT_NONE,
  )

  useEffect(() => {
    if (!open) {
      setName("")
      setCashTreasuryAccountId("")
      setArcaSalePointId(CASH_REGISTER_SALE_POINT_NONE)
      return
    }
    setCashTreasuryAccountId(cashTreasuryAccounts[0]?.id ?? "")
    setArcaSalePointId(
      salePoints.length === 1
        ? salePoints[0]!.id
        : CASH_REGISTER_SALE_POINT_NONE,
    )
  }, [open, cashTreasuryAccounts, salePoints])

  const canSubmit =
    name.trim().length > 0 &&
    cashTreasuryAccountId.length > 0 &&
    cashTreasuryAccounts.length > 0

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    void onSubmit({
      name: name.trim(),
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
          title="Nueva caja"
          description="Nombre y cuenta de efectivo."
          descriptionHidden
        />
        <RootsDialogForm onSubmit={handleSubmit}>
          <RootsDialogBody>
            {banner ? <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner> : null}
            <RootsFormTextField
              label="Nombre"
              id="cr-create-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ej. Caja mostrador, Caja 1"
            />

            <div className="pt-4">
              <CashRegisterTreasuryAccountSelect
                id="cr-create-treasury"
                label="Cuenta de efectivo destino"
                value={cashTreasuryAccountId}
                onValueChange={setCashTreasuryAccountId}
                accounts={cashTreasuryAccounts}
              />
            </div>

            <div className="pt-4">
              <CashRegisterSalePointSelect
                id="cr-create-sale-point"
                value={arcaSalePointId}
                onValueChange={setArcaSalePointId}
                salePoints={salePoints}
              />
            </div>

            <div className="pt-4">
              <RootsBanner
                intent="neutral"
                layout="message"
                density="compact"
                message="Los cobros en efectivo del turno se imputan a esta cuenta de tesorería."
              />
            </div>
          </RootsDialogBody>
          <RootsDialogDualActionFooter
            onCancel={() => onOpenChange(false)}
            confirmLabel="Crear caja"
            confirmLoadingLabel="Creando…"
            confirmType="submit"
            confirmDisabled={!canSubmit}
            confirmLoading={saving}
          />
        </RootsDialogForm>
      </RootsDialogContent>
    </Dialog>
  )
}
