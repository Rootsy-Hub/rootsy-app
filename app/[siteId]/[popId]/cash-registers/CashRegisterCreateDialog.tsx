"use client"

import type { CashTreasuryAccountOption } from "@/app/[siteId]/[popId]/cash-registers/actions"
import { CashRegisterTreasuryAccountSelect } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterDialogSelects"
import { CashRegisterArcaPopFiscalPanel } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterArcaPopFiscalPanel"
import {
  CashRegisterArcaConfigFields,
  type CashRegisterArcaFormPayload,
} from "@/app/[siteId]/[popId]/cash-registers/CashRegisterArcaConfigFields"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import {
  RootsFormGrid,
  RootsFormTextField,
  rootsFormColumnClass,
} from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"
import { RootsBanner } from "@/components/rootsy-banner"
import { useEffect, useState, type FormEvent } from "react"

export type CashRegisterCreateInput = {
  name: string
  cashTreasuryAccountId: string
} & CashRegisterArcaFormPayload

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  saving: boolean
  banner: string | null
  cashTreasuryAccounts: CashTreasuryAccountOption[]
  popFiscalCuit: string | null
  popFiscalRazonSocial: string | null
  settingsHref?: string
  onSubmit: (input: CashRegisterCreateInput) => void | Promise<void>
}

export function CashRegisterCreateDialog({
  open,
  onOpenChange,
  saving,
  banner,
  cashTreasuryAccounts,
  popFiscalCuit,
  popFiscalRazonSocial,
  settingsHref,
  onSubmit,
}: Props) {
  const [name, setName] = useState("")
  const [cashTreasuryAccountId, setCashTreasuryAccountId] = useState("")
  const [arcaPtoVta, setArcaPtoVta] = useState("")
  const [arcaExpiresAt, setArcaExpiresAt] = useState("")
  const [crtFile, setCrtFile] = useState<File | null>(null)
  const [keyFile, setKeyFile] = useState<File | null>(null)

  useEffect(() => {
    if (!open) {
      setName("")
      setCashTreasuryAccountId("")
      setArcaPtoVta("")
      setArcaExpiresAt("")
      setCrtFile(null)
      setKeyFile(null)
      return
    }
    setCashTreasuryAccountId(cashTreasuryAccounts[0]?.id ?? "")
  }, [open, cashTreasuryAccounts])

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
      arcaPtoVta,
      arcaExpiresAt,
      crtFile,
      keyFile,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="twoCol">
        <RootsDialogHeader
          title="Nueva caja"
          description="Nombre, cuenta de efectivo y facturación electrónica."
          descriptionHidden
        />
        <RootsDialogForm onSubmit={handleSubmit}>
          <RootsDialogBody>
            {banner ? <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner> : null}
            <RootsFormGrid>
              <div className={rootsFormColumnClass}>
                <RootsFormTextField
                  label="Nombre"
                  id="cr-create-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ej. Caja mostrador, Caja 1"
                />

                <CashRegisterTreasuryAccountSelect
                  id="cr-create-treasury"
                  label="Cuenta de efectivo destino"
                  value={cashTreasuryAccountId}
                  onValueChange={setCashTreasuryAccountId}
                  accounts={cashTreasuryAccounts}
                />
                <RootsBanner
                  intent="neutral"
                  layout="message"
                  density="compact"
                  message="Los cobros en efectivo del turno se imputan a esta cuenta de tesorería."
                />

                <CashRegisterArcaPopFiscalPanel
                  fiscalCuit={popFiscalCuit}
                  fiscalRazonSocial={popFiscalRazonSocial}
                  settingsHref={settingsHref}
                />
              </div>

              <div className={rootsFormColumnClass}>
                <CashRegisterArcaConfigFields
                  idPrefix="cr-create"
                  arcaPtoVta={arcaPtoVta}
                  onArcaPtoVtaChange={setArcaPtoVta}
                  arcaExpiresAt={arcaExpiresAt}
                  onArcaExpiresAtChange={setArcaExpiresAt}
                  crtFile={crtFile}
                  onCrtFileChange={setCrtFile}
                  keyFile={keyFile}
                  onKeyFileChange={setKeyFile}
                  filesHint="Subí ambos archivos (.crt y .key) juntos, o dejalos vacíos si los cargás después."
                />
              </div>
            </RootsFormGrid>
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
