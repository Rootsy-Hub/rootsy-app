"use client"

import type {
  ServiceChargeCreateFieldErrors,
  ServiceChargeCreateWizardForm,
} from "@/app/[siteId]/[popId]/active-services/serviceChargeCreateFormState"
import {
  RootsFormCheckboxChoiceRow,
  RootsFormIntegerField,
  RootsFormSelectField,
  RootsFormSelectItem,
  rootsFormCheckboxChoiceListClass,
  rootsFormColumnClass,
  rootsFormTwoColRowClass,
} from "@/components/rootsy-form"
import {
  SERVICE_DUE_DAYS_LABEL_INFO,
  SERVICE_PAYMENT_TIMINGS,
  SERVICE_PAYMENT_TIMING_LABELS,
  type ServicePaymentTiming,
} from "@/lib/serviceCatalogTypes"
import {
  SERVICE_CHARGE_COMPROBANTE_AUTO,
  serviceChargeComprobanteFromSelectValue,
  serviceChargeComprobanteSelectValue,
} from "@/app/[siteId]/[popId]/active-services/serviceChargeCreateFormState"
import {
  SALE_COMPROBANTE_SIN_LABEL,
  type SaleComprobantePickerOption,
} from "@/lib/saleComprobantePicker"
import { layoutsOperarFormDarkMutedTextClass } from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"
import { User } from "lucide-react"

type Props = {
  form: ServiceChargeCreateWizardForm
  fieldErrors: ServiceChargeCreateFieldErrors
  comprobanteFormOptions: SaleComprobantePickerOption[]
  suggestedComprobante: string | null
  disabled?: boolean
  showSectionTitle?: boolean
  tone?: "light" | "dark"
  canReadClients?: boolean
  onChange: (patch: Partial<ServiceChargeCreateWizardForm>) => void
}

export function ServiceChargeBillingFields({
  form,
  fieldErrors,
  comprobanteFormOptions,
  suggestedComprobante,
  disabled = false,
  showSectionTitle = true,
  tone = "light",
  canReadClients = true,
  onChange,
}: Props) {
  const isDark = tone === "dark"

  return (
    <div className={rootsFormColumnClass}>
      {showSectionTitle ? (
        <p
          className={cn(
            "text-xs font-medium uppercase tracking-wide",
            isDark
              ? layoutsOperarFormDarkMutedTextClass
              : "text-[var(--rootsy-bruma-500)]",
          )}
        >
          Facturación
        </p>
      ) : null}

      <RootsFormSelectField
        label="Comprobante"
        id="charge-comprobante"
        value={serviceChargeComprobanteSelectValue(form.comprobanteLabel)}
        onValueChange={(value) =>
          onChange({
            comprobanteLabel: serviceChargeComprobanteFromSelectValue(value),
          })
        }
        placeholder={SALE_COMPROBANTE_SIN_LABEL}
        disabled={disabled}
      >
        <RootsFormSelectItem value={SALE_COMPROBANTE_SIN_LABEL}>
          {SALE_COMPROBANTE_SIN_LABEL}
        </RootsFormSelectItem>
        {suggestedComprobante ? (
          <RootsFormSelectItem value={SERVICE_CHARGE_COMPROBANTE_AUTO}>
            {`Según condición IVA (${suggestedComprobante})`}
          </RootsFormSelectItem>
        ) : null}
        {comprobanteFormOptions
          .filter((option) => option.kind !== "none")
          .map((option) => (
            <RootsFormSelectItem key={option.label} value={option.label}>
              {option.label}
            </RootsFormSelectItem>
          ))}
      </RootsFormSelectField>

      <div className={rootsFormTwoColRowClass}>
        <RootsFormSelectField
          label="¿Cuándo se paga?"
          id="charge-payment-timing"
          value={form.paymentTiming}
          onValueChange={(value) =>
            onChange({ paymentTiming: value as ServicePaymentTiming })
          }
          disabled={disabled}
          error={fieldErrors.paymentTiming}
          invalid={Boolean(fieldErrors.paymentTiming)}
        >
          {SERVICE_PAYMENT_TIMINGS.map((timing) => (
            <RootsFormSelectItem key={timing} value={timing}>
              {SERVICE_PAYMENT_TIMING_LABELS[timing]}
            </RootsFormSelectItem>
          ))}
        </RootsFormSelectField>

        <RootsFormIntegerField
          label="Vencimiento"
          id="charge-due-days-after"
          value={form.dueDaysAfter}
          onChange={(value) => onChange({ dueDaysAfter: value })}
          disabled={disabled}
          max={365}
          labelInfo={SERVICE_DUE_DAYS_LABEL_INFO}
          error={fieldErrors.dueDaysAfter}
          invalid={Boolean(fieldErrors.dueDaysAfter)}
        />
      </div>

      <div className={rootsFormCheckboxChoiceListClass}>
        <RootsFormCheckboxChoiceRow
          id="charge-issue-invoice"
          label="Emitir comprobante fiscal"
          description="Al crear el cargo"
          checked={form.issueInvoiceOnCreate}
          disabled={disabled}
          onCheckedChange={(checked) =>
            onChange({
              issueInvoiceOnCreate: checked,
              ...(checked
                ? { emailInvoiceToClient: true }
                : {
                    printInvoiceOnCreate: false,
                    emailInvoiceToClient: false,
                  }),
            })
          }
        />

        {form.issueInvoiceOnCreate ? (
          <>
            <RootsFormCheckboxChoiceRow
              id="charge-print-invoice"
              label="Imprimir comprobante"
              checked={form.printInvoiceOnCreate}
              disabled={disabled}
              className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-150"
              onCheckedChange={(checked) =>
                onChange({ printInvoiceOnCreate: checked })
              }
            />
            <RootsFormCheckboxChoiceRow
              id="charge-email-invoice"
              label="Enviar comprobante por email"
              checked={form.emailInvoiceToClient}
              disabled={disabled}
              className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-150"
              onCheckedChange={(checked) =>
                onChange({ emailInvoiceToClient: checked })
              }
            />
          </>
        ) : null}
      </div>

      {!canReadClients ? (
        <p
          className={cn(
            "flex items-center gap-2 text-xs",
            isDark
              ? layoutsOperarFormDarkMutedTextClass
              : "text-[var(--rootsy-bruma-500)]",
          )}
        >
          <User className="size-3.5 shrink-0" aria-hidden />
          Sin permiso de clientes — el comprobante sugerido puede variar.
        </p>
      ) : null}
    </div>
  )
}
