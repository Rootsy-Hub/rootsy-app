"use client"

import { CLIENT_IVA_CONDITION_OPTIONS } from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import {
  layoutsOperarFormDarkMutedTextClass,
  layoutsOperarFormDarkSecondaryButtonClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { OperarReveal } from "@/components/layouts-module/OperarReveal"
import { RootsProgressButton } from "@/components/rootsy-button"
import {
  RootsFormField,
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormTextField,
  rootsFormColumnClass,
  rootsFormFieldGroupClass,
} from "@/components/rootsy-form"
import { RootsFormControlInput } from "@/components/rootsy-form/RootsFormControlInput"
import {
  useRootsFormControlTone,
  useRootsFormFieldControlProps,
} from "@/components/rootsy-form/rootsFormFieldContext"
import { usePadronAutofillRazonSocial } from "@/hooks/usePadronAutofillRazonSocial"
import { sanitizeTaxDocumentInput } from "@/lib/argentinaTaxDocumentInput"
import { validateOptionalEmailField } from "@/lib/authValidation"
import { formatPadronErrorForUser } from "@/lib/padronUserFacingError"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { useEffect, useState, type ChangeEventHandler } from "react"
import type { ClientIvaConditionValue } from "@/app/[siteId]/[popId]/clients/clientIvaConstants"

export const OPERATION_PARTY_TAX_ID_LABEL_INFO =
  "Con DNI buscamos en AFIP probando los CUIT posibles de persona física."

const TAX_ID_FIELD_ID = "operation-party-tax-id"
const ARCA_BUTTON_CLASS = "w-[9.75rem] shrink-0"

function PadronFiscalHint({
  padron,
  isDark,
}: {
  padron: ReturnType<typeof usePadronAutofillRazonSocial>
  isDark: boolean
}) {
  if (padron.busy || padron.error) return null
  if (!padron.condicionIvaNombre && !padron.domicilioFiscal) return null

  const lines: string[] = []
  if (padron.condicionIvaNombre) {
    lines.push(`Padrón AFIP: ${padron.condicionIvaNombre}`)
  }
  if (padron.domicilioFiscal) {
    lines.push(`Domicilio fiscal: ${padron.domicilioFiscal}`)
  }

  return (
    <p
      className={cn(
        "text-xs leading-relaxed",
        isDark ? layoutsOperarFormDarkMutedTextClass : "text-[var(--rootsy-bruma-500)]",
      )}
    >
      {lines.join(" · ")}
    </p>
  )
}

export type OperationPartyManualEntryFormProps = {
  popId: string
  flow: "sale" | "purchase"
  manualName: string
  onManualNameChange: (value: string) => void
  taxId: string
  onTaxIdChange: (value: string) => void
  email: string
  onEmailChange: (value: string) => void
  ivaCondition: string
  onIvaConditionChange: (value: string) => void
  disabled?: boolean
  readOnly?: boolean
  manualNameError?: string
  emailError?: string
  onIvaConditionApplied?: (iva: ClientIvaConditionValue) => void
}

export function OperationPartyManualEntryForm({
  popId,
  flow,
  manualName,
  onManualNameChange,
  taxId,
  onTaxIdChange,
  email,
  onEmailChange,
  ivaCondition,
  onIvaConditionChange,
  disabled = false,
  readOnly = false,
  manualNameError,
  emailError,
  onIvaConditionApplied,
}: OperationPartyManualEntryFormProps) {
  const [emailBlurred, setEmailBlurred] = useState(false)
  const allowManualNameEntry = flow === "sale"
  const taxInputMode = flow === "purchase" ? "cuit_only" : "cuit_or_dni"
  const taxLabel = flow === "purchase" ? "CUIT" : "CUIT / DNI"
  const taxPlaceholder = flow === "purchase" ? "30-12345678-9" : "20-12345678-9"

  const padron = usePadronAutofillRazonSocial(popId, taxId, {
    enabled: Boolean(popId) && !readOnly && !disabled,
    manual: true,
  })

  const tone = useRootsFormControlTone()
  const isDark = tone === "dark"
  const identityFieldsDisabled = disabled || readOnly || padron.busy
  const ivaFieldDisabled = disabled || readOnly

  const handlePadronLookup = () => {
    void (async () => {
      const res = await padron.lookup(taxId)
      if (!res.success) return

      const name = res.razonSocial.trim()
      if (name) onManualNameChange(name)
      if (res.mappedIvaCondition) {
        onIvaConditionChange(res.mappedIvaCondition)
        onIvaConditionApplied?.(res.mappedIvaCondition)
      }
    })()
  }

  useEffect(() => {
    if (readOnly || disabled) return
    setEmailBlurred(false)
  }, [taxId, readOnly, disabled])

  const taxFieldError = padron.error
    ? formatPadronErrorForUser(padron.error)
    : undefined
  const taxControlProps = useRootsFormFieldControlProps({
    invalid: Boolean(taxFieldError),
  })

  const inlineEmailError = validateOptionalEmailField(email)
  const displayedEmailError =
    emailError ?? (emailBlurred ? inlineEmailError : undefined)

  const showPadronHint =
    !readOnly &&
    !padron.busy &&
    !padron.error &&
    Boolean(padron.condicionIvaNombre || padron.domicilioFiscal)

  const handleTaxIdChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onTaxIdChange(sanitizeTaxDocumentInput(event.target.value, taxInputMode))
  }

  return (
    <div className={rootsFormColumnClass}>
      <div className={rootsFormFieldGroupClass}>
        <RootsFormField
          label={taxLabel}
          htmlFor={TAX_ID_FIELD_ID}
          labelInfo={flow === "sale" ? OPERATION_PARTY_TAX_ID_LABEL_INFO : undefined}
          error={taxFieldError}
        >
          <div className="flex items-center gap-2">
            <RootsFormControlInput
              id={TAX_ID_FIELD_ID}
              type="text"
              inputMode="numeric"
              className="min-w-0 flex-1"
              value={taxId}
              onChange={handleTaxIdChange}
              placeholder={taxPlaceholder}
              autoComplete="off"
              disabled={identityFieldsDisabled}
              readOnly={readOnly}
              autoFocus={!readOnly}
              invalid={taxControlProps.isInvalid}
              aria-describedby={taxControlProps.describedBy}
              aria-invalid={taxControlProps.isInvalid || undefined}
            />
            {isDark ? (
              <button
                type="button"
                className={cn(
                  layoutsOperarFormDarkSecondaryButtonClass,
                  ARCA_BUTTON_CLASS,
                )}
                disabled={identityFieldsDisabled || !padron.canLookup}
                onClick={handlePadronLookup}
              >
                {padron.busy ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                    Consultando
                  </>
                ) : (
                  "Consultar ARCA"
                )}
              </button>
            ) : (
              <RootsProgressButton
                type="button"
                semantic="secondary"
                className={ARCA_BUTTON_CLASS}
                disabled={identityFieldsDisabled || !padron.canLookup}
                loading={padron.busy}
                loadingLabel="Consultando"
                onClick={handlePadronLookup}
              >
                Consultar ARCA
              </RootsProgressButton>
            )}
          </div>
        </RootsFormField>

        <OperarReveal open={showPadronHint}>
          <div className="pt-2">
            <PadronFiscalHint padron={padron} isDark={isDark} />
          </div>
        </OperarReveal>
      </div>

      <RootsFormTextField
        label="Nombre o razón social"
        id="operation-party-manual-name"
        value={manualName}
        onChange={(e) => onManualNameChange(e.target.value)}
        placeholder={
          allowManualNameEntry
            ? "Nombre visible en operaciones y facturas"
            : padron.busy
              ? "Consultando ARCA…"
              : "Se completa al consultar ARCA"
        }
        autoComplete="off"
        disabled={identityFieldsDisabled || !allowManualNameEntry}
        readOnly={readOnly || !allowManualNameEntry}
        required={allowManualNameEntry}
        error={manualNameError}
      />

      {flow === "sale" ? (
        <RootsFormTextField
          label="Email"
          id="operation-party-email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          onBlur={() => setEmailBlurred(true)}
          placeholder="opcional@ejemplo.com"
          autoComplete="email"
          disabled={disabled}
          readOnly={readOnly}
          error={displayedEmailError}
          invalid={Boolean(displayedEmailError)}
        />
      ) : null}

      <RootsFormSelectField
        label="Condición IVA"
        id="operation-party-iva-condition"
        value={ivaCondition || "__none__"}
        placeholder="Sin definir"
        disabled={ivaFieldDisabled}
        readOnly={readOnly}
        onValueChange={(v) => {
          const next = v === "__none__" ? "" : v
          onIvaConditionChange(next)
          if (next && onIvaConditionApplied) {
            onIvaConditionApplied(next as ClientIvaConditionValue)
          }
        }}
      >
        <RootsFormSelectItem value="__none__">Sin definir</RootsFormSelectItem>
        {CLIENT_IVA_CONDITION_OPTIONS.map((o) => (
          <RootsFormSelectItem key={o.value} value={o.value}>
            {o.label}
          </RootsFormSelectItem>
        ))}
      </RootsFormSelectField>
    </div>
  )
}
