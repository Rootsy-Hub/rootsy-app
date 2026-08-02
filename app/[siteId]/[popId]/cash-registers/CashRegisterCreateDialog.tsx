"use client"

import type { CashTreasuryAccountOption } from "@/app/[siteId]/[popId]/cash-registers/actions"
import { CashRegisterTreasuryAccountSelect } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterDialogSelects"
import {
  cashRegisterDialogContentClass,
  CashRegisterDialogTwoColumnBody,
} from "@/app/[siteId]/[popId]/cash-registers/CashRegisterDialogLayout"
import { CashRegisterArcaPopFiscalPanel } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterArcaPopFiscalPanel"
import {
  CashRegisterArcaConfigFields,
  type CashRegisterArcaFormPayload,
} from "@/app/[siteId]/[popId]/cash-registers/CashRegisterArcaConfigFields"
import { CheckoutDialogFooter } from "@/components/checkout/CheckoutDialogFooter"
import {
  CheckoutSectionLabel,
  CheckoutSectionPanel,
} from "@/components/checkout/CheckoutFormFields"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  saleOpChannelFormField,
  saleOpChannelHint,
  saleOpDialogHeader,
} from "@/components/sale-operation/saleOperationStyles"
import { useEffect, useRef, useState, type FormEvent } from "react"

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
  const formRef = useRef<HTMLFormElement>(null)
  const crtRef = useRef<HTMLInputElement>(null)
  const keyRef = useRef<HTMLInputElement>(null)
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
      if (crtRef.current) crtRef.current.value = ""
      if (keyRef.current) keyRef.current.value = ""
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
      <DialogContent className={cashRegisterDialogContentClass}>
        <DialogHeader className={cn(saleOpDialogHeader, "shrink-0")}>
          <DialogTitle className="text-base font-semibold tracking-tight">
            Nueva caja
          </DialogTitle>
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
                      id="cr-create-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Ej. Caja mostrador, Caja 1"
                      className={cn(saleOpChannelFormField, "h-11")}
                    />
                  </div>

                  <div className="space-y-2.5">
                    <CheckoutSectionLabel>Cuenta de efectivo destino</CheckoutSectionLabel>
                    <CashRegisterTreasuryAccountSelect
                      id="cr-create-treasury"
                      value={cashTreasuryAccountId}
                      onValueChange={setCashTreasuryAccountId}
                      accounts={cashTreasuryAccounts}
                    />
                    <p className={saleOpChannelHint}>
                      Los cobros en efectivo del turno se imputan a esta cuenta de
                      tesorería.
                    </p>
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
                idPrefix="cr-create"
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
                filesHint="Subí ambos archivos (.crt y .key) juntos, o dejalos vacíos si los cargás después."
              />
            }
          />

          <CheckoutDialogFooter
            onCancel={() => onOpenChange(false)}
            cancelDisabled={saving}
            primary={{
              label: "Crear caja",
              onClick: () => formRef.current?.requestSubmit(),
              disabled: !canSubmit,
              loading: saving,
              loadingLabel: "Creando…",
            }}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
