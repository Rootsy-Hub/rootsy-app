"use client"

import type {
  CashRegisterRow,
  CashTreasuryAccountOption,
} from "@/app/[siteId]/[popId]/cash-registers/actions"
import { CashRegisterTreasuryAccountSelect } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterDialogSelects"
import type { CashRegisterArcaFormPayload } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterArcaConfigFields"
import {
  cashRegisterDialogContentClass,
  CashRegisterDialogTwoColumnBody,
} from "@/app/[siteId]/[popId]/cash-registers/CashRegisterDialogLayout"
import { CashRegisterArcaPopFiscalPanel } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterArcaPopFiscalPanel"
import {
  CashRegisterArcaConfigFields,
  formatArcaExpiryLabel,
} from "@/app/[siteId]/[popId]/cash-registers/CashRegisterArcaConfigFields"
import { CheckoutDialogFooter } from "@/components/checkout/CheckoutDialogFooter"
import {
  CheckoutSectionLabel,
  CheckoutSectionPanel,
} from "@/components/checkout/CheckoutFormFields"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  saleOpChannelFormField,
  saleOpDialogHeader,
} from "@/components/sale-operation/saleOperationStyles"
import { useEffect, useRef, useState, type FormEvent } from "react"

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
  const crtRef = useRef<HTMLInputElement>(null)
  const keyRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

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
    if (crtRef.current) crtRef.current.value = ""
    if (keyRef.current) keyRef.current.value = ""
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
      <DialogContent className={cashRegisterDialogContentClass}>
        <DialogHeader className={cn(saleOpDialogHeader, "shrink-0")}>
          <DialogTitle className="text-base font-semibold tracking-tight">
            Editar caja
          </DialogTitle>
          <DialogDescription className="sr-only">
            {row?.name
              ? `Configuración de ${row.name}`
              : "Nombre, cuenta de efectivo y facturación electrónica."}
          </DialogDescription>
        </DialogHeader>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <CashRegisterDialogTwoColumnBody
            banner={banner}
            left={
              <>
                <CheckoutSectionPanel>
                  <div className="space-y-2.5">
                    <CheckoutSectionLabel>Nombre</CheckoutSectionLabel>
                    <Input
                      id="cr-edit-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className={cn(saleOpChannelFormField, "h-11")}
                    />
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Checkbox
                      id="cr-edit-active"
                      checked={isActive}
                      onCheckedChange={(checked) => setIsActive(checked === true)}
                    />
                    <Label
                      htmlFor="cr-edit-active"
                      className="cursor-pointer text-sm font-normal text-foreground"
                    >
                      Caja activa
                    </Label>
                  </div>

                  <div className="space-y-2.5">
                    <CheckoutSectionLabel>Cuenta de efectivo destino</CheckoutSectionLabel>
                    <CashRegisterTreasuryAccountSelect
                      id="cr-edit-treasury"
                      value={cashTreasuryAccountId}
                      onValueChange={setCashTreasuryAccountId}
                      accounts={cashTreasuryAccounts}
                    />
                  </div>
                </CheckoutSectionPanel>

                <CashRegisterArcaPopFiscalPanel
                  fiscalCuit={popFiscalCuit}
                  fiscalRazonSocial={popFiscalRazonSocial}
                  settingsHref={settingsHref}
                />
              </>
            }
            right={
              <CashRegisterArcaConfigFields
                idPrefix="cr-edit"
                arcaPtoVta={arcaPtoVta}
                onArcaPtoVtaChange={setArcaPtoVta}
                arcaExpiresAt={arcaExpiresAt}
                onArcaExpiresAtChange={setArcaExpiresAt}
                crtRef={crtRef}
                keyRef={keyRef}
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
            }
          />

          <CheckoutDialogFooter
            onCancel={() => onOpenChange(false)}
            cancelDisabled={saving}
            primary={{
              label: "Guardar",
              onClick: () => formRef.current?.requestSubmit(),
              disabled: !canSubmit,
              loading: saving,
              loadingLabel: "Guardando…",
            }}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
