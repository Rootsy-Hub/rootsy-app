"use client"

import type { UpsertPopSupplierInput } from "@/app/[siteId]/[popId]/suppliers/actions"
import { CurrentAccountTermsFields } from "@/app/[siteId]/[popId]/current-accounts/CurrentAccountTermsFields"
import { CLIENT_IVA_CONDITION_OPTIONS } from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import type { usePadronAutofillRazonSocial } from "@/hooks/usePadronAutofillRazonSocial"
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

export function SupplierUpsertFormFields({
  idPrefix,
  form,
  setForm,
  padron,
  showPadronNameButton = false,
  taxInputRef,
  nameInputRef,
}: {
  idPrefix: string
  form: UpsertPopSupplierInput
  setForm: Dispatch<SetStateAction<UpsertPopSupplierInput>>
  padron: ReturnType<typeof usePadronAutofillRazonSocial>
  showPadronNameButton?: boolean
  taxInputRef?: React.RefObject<HTMLInputElement | null>
  nameInputRef?: React.RefObject<HTMLInputElement | null>
}) {
  const taxHint = padron.busy
    ? "Consultando padrón AFIP…"
    : !padron.error
      ? "El padrón completa razón social, condición IVA y domicilio cuando estén disponibles."
      : undefined

  const ivaHint =
    padron.mappedIvaCondition && !form.ivaCondition && padron.condicionIvaNombre
      ? `AFIP informa «${padron.condicionIvaNombre}». Se completará al guardar si no elegís otra condición.`
      : undefined

  return (
    <div className={cn(rootsFormColumnClass, "gap-6")}>
      <FormSection
        title="Identificación fiscal"
        description="Cargá el CUIT para traer datos de AFIP."
      >
        <RootsFormTextField
          ref={taxInputRef}
          label="CUIT / ID fiscal"
          id={`${idPrefix}-tax`}
          value={form.taxId}
          onChange={(e) => setForm((f) => ({ ...f, taxId: e.target.value }))}
          placeholder="Ej. 30-12345678-9"
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
            placeholder="Nombre visible en compras"
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
          label="Proveedor activo"
          description='Los inactivos se ocultan con el filtro «Solo proveedores activos».'
          id={`${idPrefix}-active`}
          checked={form.isActive}
          onCheckedChange={(checked) =>
            setForm((f) => ({ ...f, isActive: checked }))
          }
        />

        <RootsFormSwitchField
          label="Cuenta corriente"
          description="Solo con alta se puede comprar a cuenta. También se habilita desde Cuentas corrientes."
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
