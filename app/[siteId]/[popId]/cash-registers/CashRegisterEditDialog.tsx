"use client"

import type {
  CashRegisterRow,
  CashTreasuryAccountOption,
} from "@/app/[siteId]/[popId]/cash-registers/actions"
import { CashRegisterTreasuryAccountSelect } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterDialogSelects"
import type { CashRegisterArcaFormPayload } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterArcaConfigFields"
import { CashRegisterArcaPopFiscalPanel } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterArcaPopFiscalPanel"
import {
  CashRegisterArcaConfigFields,
  formatArcaExpiryLabel,
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
  RootsFormCheckboxField,
  RootsFormGrid,
  RootsFormTextField,
  rootsFormColumnClass,
} from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"
import { useEffect, useState, type FormEvent } from "react"

export type CashRegisterEditSubmitPayload = {
  name: string
  isActive: boolean
  cashTreasuryAccountId: string
} & CashRegisterArcaFormPayload

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: CashRegisterRow | null
  saving: boolean
  banner: string | null
  cashTreasuryAccounts: CashTreasuryAccountOption[]
  popFiscalCuit: string | null
  popFiscalRazonSocial: string | null
  settingsHref?: string
  formatDateTime: (iso: string) => string
  onSubmit: (payload: CashRegisterEditSubmitPayload) => void | Promise<void>
}

function storedCertificateLabel(row: CashRegisterRow): string {
  const secret = row.arcaCertificateSecretName?.trim()
  if (secret) return secret
  if (row.arcaCertificateLastFour?.trim()) {
    return `certificado ••••${row.arcaCertificateLastFour.trim()}`
  }
  return "certificado.crt"
}

export function CashRegisterEditDialog({
  open,
  onOpenChange,
  row,
  saving,
  banner,
  cashTreasuryAccounts,
  popFiscalCuit,
  popFiscalRazonSocial,
  settingsHref,
  formatDateTime,
  onSubmit,
}: Props) {
  const [name, setName] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [cashTreasuryAccountId, setCashTreasuryAccountId] = useState("")
  const [arcaPtoVta, setArcaPtoVta] = useState("")
  const [arcaExpiresAt, setArcaExpiresAt] = useState("")
  const [crtFile, setCrtFile] = useState<File | null>(null)
  const [keyFile, setKeyFile] = useState<File | null>(null)

  useEffect(() => {
    if (!open || !row) return
    setName(row.name)
    setIsActive(row.isActive)
    setCashTreasuryAccountId(
      row.cashTreasuryAccountId ?? cashTreasuryAccounts[0]?.id ?? "",
    )
    setArcaPtoVta(row.arcaPtoVta != null ? String(row.arcaPtoVta) : "")
    setArcaExpiresAt(row.arcaCertificateExpiresAt ?? "")
    setCrtFile(null)
    setKeyFile(null)
  }, [open, row, cashTreasuryAccounts])

  const canSubmit =
    name.trim().length > 0 &&
    cashTreasuryAccountId.length > 0 &&
    cashTreasuryAccounts.length > 0

  const storedCrtName = row?.arcaCrtUploadedAt ? storedCertificateLabel(row) : null
  const storedKeyName = row?.arcaKeyUploadedAt ? "clave.key" : null
  const storedCrtUploadedAt = row?.arcaCrtUploadedAt
    ? formatDateTime(row.arcaCrtUploadedAt)
    : null
  const storedKeyUploadedAt = row?.arcaKeyUploadedAt
    ? formatDateTime(row.arcaKeyUploadedAt)
    : null
  const certExpiryLabel = formatArcaExpiryLabel(
    arcaExpiresAt || row?.arcaCertificateExpiresAt,
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    void onSubmit({
      name: name.trim(),
      isActive,
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
          title="Editar caja"
          description={
            row?.name
              ? `Configuración de ${row.name}`
              : "Nombre, cuenta de efectivo y facturación electrónica."
          }
          descriptionHidden
        />
        <RootsDialogForm onSubmit={handleSubmit}>
          <RootsDialogBody>
            {banner ? <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner> : null}
            <RootsFormGrid>
              <div className={rootsFormColumnClass}>
                <RootsFormTextField
                  label="Nombre"
                  id="cr-edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <RootsFormCheckboxField
                  id="cr-edit-active"
                  label="Caja activa"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />

                <CashRegisterTreasuryAccountSelect
                  id="cr-edit-treasury"
                  label="Cuenta de efectivo destino"
                  value={cashTreasuryAccountId}
                  onValueChange={setCashTreasuryAccountId}
                  accounts={cashTreasuryAccounts}
                />

                <CashRegisterArcaPopFiscalPanel
                  fiscalCuit={popFiscalCuit}
                  fiscalRazonSocial={popFiscalRazonSocial}
                  settingsHref={settingsHref}
                />
              </div>

              <div className={rootsFormColumnClass}>
                <CashRegisterArcaConfigFields
                  idPrefix="cr-edit"
                  arcaPtoVta={arcaPtoVta}
                  onArcaPtoVtaChange={setArcaPtoVta}
                  arcaExpiresAt={arcaExpiresAt}
                  onArcaExpiresAtChange={setArcaExpiresAt}
                  crtFile={crtFile}
                  onCrtFileChange={setCrtFile}
                  keyFile={keyFile}
                  onKeyFileChange={setKeyFile}
                  storedCrtName={storedCrtName}
                  storedKeyName={storedKeyName}
                  storedCrtUploadedAt={storedCrtUploadedAt}
                  storedKeyUploadedAt={storedKeyUploadedAt}
                  certExpiryLabel={certExpiryLabel}
                />
              </div>
            </RootsFormGrid>
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
