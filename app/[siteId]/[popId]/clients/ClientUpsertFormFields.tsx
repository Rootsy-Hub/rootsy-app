"use client"

import type { UpsertPopClientInput } from "@/app/[siteId]/[popId]/clients/actions"
import { CurrentAccountTermsFields } from "@/app/[siteId]/[popId]/current-accounts/CurrentAccountTermsFields"
import { CLIENT_IVA_CONDITION_OPTIONS } from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import type { usePadronAutofillRazonSocial } from "@/hooks/usePadronAutofillRazonSocial"
import type { SaleComprobantePickerOption } from "@/lib/saleComprobantePicker"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormSwitchField,
  RootsFormTextField,
  RootsFormTextareaField,
  rootsFormColumnClass,
  rootsFormBrumaTextSecondaryClass,
  rootsFormFieldLabelClass,
} from "@/components/rootsy-form"
import { rootsFormBrumaDividerClass } from "@/components/rootsy-form/rootsFormBrumaTokens"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Dispatch, ReactNode, SetStateAction } from "react"

export const clientDialogSurface = cn(
  "rootsy-app-light gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-0 text-foreground shadow-2xl ring-1 ring-black/[0.04] sm:max-w-lg",
  "max-h-[min(90vh,720px)] flex flex-col overflow-hidden",
)

export const clientDialogHeaderClass =
  "shrink-0 space-y-1.5 border-b border-border/50 bg-muted/25 px-6 pb-4 pt-5 text-left"

export const clientDialogBodyClass =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4"

export const clientDialogFooterClass =
  "shrink-0 gap-2 border-t border-border/50 bg-muted/10 px-6 py-4 sm:flex-row sm:justify-end"

const sectionDividerClass = cn("h-px w-full shrink-0", rootsFormBrumaDividerClass)

function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h3 className={rootsFormFieldLabelClass}>{title}</h3>
        {description ? (
          <p
            className={cn(
              "mt-1 text-xs leading-relaxed",
              rootsFormBrumaTextSecondaryClass,
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

function PadronFiscalHint({
  padron,
}: {
  padron: ReturnType<typeof usePadronAutofillRazonSocial>
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
    <p className={cn("text-xs leading-relaxed", rootsFormBrumaTextSecondaryClass)}>
      {lines.join(" · ")}
    </p>
  )
}

export function ClientUpsertFormFields({
  idPrefix,
  form,
  setForm,
  padron,
  comprobanteFormOptions,
  suggestedComprobante,
  showPadronNameButton = false,
  taxInputRef,
  nameInputRef,
}: {
  idPrefix: string
  form: UpsertPopClientInput
  setForm: Dispatch<SetStateAction<UpsertPopClientInput>>
  padron: ReturnType<typeof usePadronAutofillRazonSocial>
  comprobanteFormOptions: SaleComprobantePickerOption[]
  suggestedComprobante: string | null
  showPadronNameButton?: boolean
  taxInputRef?: React.RefObject<HTMLInputElement | null>
  nameInputRef?: React.RefObject<HTMLInputElement | null>
}) {
  const taxHint = padron.busy
    ? "Consultando padrón AFIP…"
    : !padron.error
      ? "Con DNI buscamos en AFIP probando los CUIT posibles de persona física. Si no aparece, puede ser consumidor final sin inscripción: cargá el nombre manualmente."
      : undefined

  const ivaHint =
    padron.mappedIvaCondition && !form.ivaCondition && padron.condicionIvaNombre
      ? `AFIP informa «${padron.condicionIvaNombre}». Se completará al guardar si no elegís otra condición.`
      : undefined

  return (
    <div className={cn(rootsFormColumnClass, "gap-6")}>
      <FormSection
        title="Identificación fiscal"
        description="Cargá el CUIT o DNI para traer datos de AFIP."
      >
        <RootsFormTextField
          ref={taxInputRef}
          label="CUIT / DNI"
          id={`${idPrefix}-tax`}
          value={form.taxId}
          onChange={(e) => setForm((f) => ({ ...f, taxId: e.target.value }))}
          placeholder="Ej. 20-12345678-9"
          autoComplete="off"
          hint={taxHint}
          error={padron.error ?? undefined}
        />
        <PadronFiscalHint padron={padron} />

        <div className="flex flex-col gap-2">
          <RootsFormTextField
            ref={nameInputRef}
            label="Razón social / nombre"
            id={`${idPrefix}-name`}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            placeholder="Nombre visible en ventas y facturas"
            autoComplete="organization"
          />
          {showPadronNameButton &&
          padron.razonSocial.trim() &&
          padron.razonSocial.trim() !== form.name.trim() ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 self-start text-xs"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  name: padron.razonSocial.trim(),
                }))
              }
            >
              Usar razón social del padrón
            </Button>
          ) : null}
        </div>

        <RootsFormSelectField
          label="Condición IVA"
          id={`${idPrefix}-iva`}
          value={form.ivaCondition || "__none__"}
          onValueChange={(v) =>
            setForm((f) => ({
              ...f,
              ivaCondition: v === "__none__" ? "" : v,
            }))
          }
          placeholder="Sin definir"
          hint={ivaHint}
        >
          <RootsFormSelectItem value="__none__">Sin definir</RootsFormSelectItem>
          {CLIENT_IVA_CONDITION_OPTIONS.map((o) => (
            <RootsFormSelectItem key={o.value} value={o.value}>
              {o.label}
            </RootsFormSelectItem>
          ))}
        </RootsFormSelectField>

        <RootsFormTextField
          label="Domicilio"
          id={`${idPrefix}-address`}
          value={form.addressLine}
          onChange={(e) =>
            setForm((f) => ({ ...f, addressLine: e.target.value }))
          }
          placeholder="Calle, localidad (opcional)"
          autoComplete="street-address"
        />
      </FormSection>

      <div className={sectionDividerClass} aria-hidden />

      <FormSection
        title="Facturación"
        description="Comprobante sugerido al elegir este cliente en una venta."
      >
        <RootsFormSelectField
          label="Comprobante por defecto"
          id={`${idPrefix}-default-invoice`}
          value={form.defaultInvoiceTypeLabel || "__auto__"}
          onValueChange={(v) =>
            setForm((f) => ({
              ...f,
              defaultInvoiceTypeLabel: v === "__auto__" ? "" : v,
            }))
          }
          placeholder="Según condición IVA"
        >
          <RootsFormSelectItem value="__auto__">
            {suggestedComprobante
              ? `Según condición IVA (${suggestedComprobante})`
              : "Según condición IVA"}
          </RootsFormSelectItem>
          {comprobanteFormOptions.map((opt) => (
            <RootsFormSelectItem key={opt.label} value={opt.label}>
              {opt.label}
            </RootsFormSelectItem>
          ))}
        </RootsFormSelectField>
      </FormSection>

      <div className={sectionDividerClass} aria-hidden />

      <FormSection title="Contacto">
        <RootsFormTextField
          label="Email"
          id={`${idPrefix}-email`}
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="opcional@ejemplo.com"
          autoComplete="email"
        />

        <RootsFormTextField
          label="Teléfono"
          id={`${idPrefix}-phone`}
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder="Opcional"
          autoComplete="tel"
        />
      </FormSection>

      <div className={sectionDividerClass} aria-hidden />

      <FormSection title="Estado y notas">
        <RootsFormSwitchField
          label="Cliente activo"
          description='Los inactivos se ocultan con el filtro «Solo clientes activos».'
          id={`${idPrefix}-active`}
          checked={form.isActive}
          onCheckedChange={(checked) =>
            setForm((f) => ({ ...f, isActive: checked }))
          }
        />

        <RootsFormSwitchField
          label="Cuenta corriente"
          description="Solo con alta se puede vender a cuenta. También se habilita desde Cuentas corrientes."
          id={`${idPrefix}-current-account`}
          checked={form.currentAccountEnabled}
          onCheckedChange={(checked) =>
            setForm((f) => ({ ...f, currentAccountEnabled: checked }))
          }
        />

        {form.currentAccountEnabled ? (
          <CurrentAccountTermsFields
            idPrefix={`${idPrefix}-cc`}
            creditLimit={form.currentAccountCreditLimit}
            termDays={form.currentAccountTermDays}
            onCreditLimitChange={(value) =>
              setForm((f) => ({ ...f, currentAccountCreditLimit: value }))
            }
            onTermDaysChange={(value) =>
              setForm((f) => ({ ...f, currentAccountTermDays: value }))
            }
          />
        ) : null}

        <RootsFormTextareaField
          label="Notas internas"
          id={`${idPrefix}-notes`}
          rows={3}
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Observaciones para tu equipo (opcional)"
        />
      </FormSection>
    </div>
  )
}
