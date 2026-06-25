"use client"

import type { UpsertPopClientInput } from "@/app/[siteId]/[popId]/clients/actions"
import { CLIENT_IVA_CONDITION_OPTIONS } from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import type { usePadronAutofillRazonSocial } from "@/hooks/usePadronAutofillRazonSocial"
import type { SaleComprobantePickerOption } from "@/lib/saleComprobantePicker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
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
    <section className="space-y-3">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <div className="space-y-3">{children}</div>
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
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
      {padron.condicionIvaNombre ? (
        <p>
          Padrón AFIP:{" "}
          <span className="font-medium text-foreground">
            {padron.condicionIvaNombre}
          </span>
        </p>
      ) : null}
      {padron.domicilioFiscal ? (
        <p className={padron.condicionIvaNombre ? "mt-1" : undefined}>
          Domicilio fiscal: {padron.domicilioFiscal}
        </p>
      ) : null}
    </div>
  )
}

function PadronStatus({
  padron,
}: {
  padron: ReturnType<typeof usePadronAutofillRazonSocial>
}) {
  if (padron.busy) {
    return (
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
        Consultando padrón AFIP…
      </p>
    )
  }
  if (padron.error) {
    return <p className="text-xs text-destructive">{padron.error}</p>
  }
  return null
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
  return (
    <div className="space-y-6">
      <FormSection
        title="Identificación fiscal"
        description="Cargá el CUIT o DNI para traer datos de AFIP."
      >
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-tax`}>CUIT / DNI</Label>
          <Input
            ref={taxInputRef}
            id={`${idPrefix}-tax`}
            value={form.taxId}
            onChange={(e) =>
              setForm((f) => ({ ...f, taxId: e.target.value }))
            }
            className="bg-background"
            placeholder="Ej. 20-12345678-9"
            autoComplete="off"
          />
          <PadronStatus padron={padron} />
          {!padron.busy && !padron.error ? (
            <p className="text-xs text-muted-foreground">
              Con DNI buscamos en AFIP probando los CUIT posibles de persona física.
              Si no aparece, puede ser consumidor final sin inscripción: cargá el nombre
              manualmente.
            </p>
          ) : null}
          <PadronFiscalHint padron={padron} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-name`}>
            Razón social / nombre{" "}
            <span className="text-destructive" aria-hidden>
              *
            </span>
          </Label>
          <Input
            ref={nameInputRef}
            id={`${idPrefix}-name`}
            value={form.name}
            onChange={(e) =>
              setForm((f) => ({ ...f, name: e.target.value }))
            }
            required
            className="bg-background"
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
              className="h-8 text-xs"
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
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-iva`}>Condición IVA</Label>
          <Select
            value={form.ivaCondition || "__none__"}
            onValueChange={(v) =>
              setForm((f) => ({
                ...f,
                ivaCondition: v === "__none__" ? "" : v,
              }))
            }
          >
            <SelectTrigger id={`${idPrefix}-iva`} className="bg-background">
              <SelectValue placeholder="Sin definir" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Sin definir</SelectItem>
              {CLIENT_IVA_CONDITION_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {padron.mappedIvaCondition &&
          !form.ivaCondition &&
          padron.condicionIvaNombre ? (
            <p className="text-xs text-muted-foreground">
              AFIP informa «{padron.condicionIvaNombre}». Se completará al
              guardar si no elegís otra condición.
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-address`}>Domicilio</Label>
          <Input
            id={`${idPrefix}-address`}
            value={form.addressLine}
            onChange={(e) =>
              setForm((f) => ({ ...f, addressLine: e.target.value }))
            }
            className="bg-background"
            placeholder="Calle, localidad (opcional)"
            autoComplete="street-address"
          />
        </div>
      </FormSection>

      <FormSection
        title="Facturación"
        description="Comprobante sugerido al elegir este cliente en una venta."
      >
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-default-invoice`}>
            Comprobante por defecto
          </Label>
          <Select
            value={form.defaultInvoiceTypeLabel || "__auto__"}
            onValueChange={(v) =>
              setForm((f) => ({
                ...f,
                defaultInvoiceTypeLabel: v === "__auto__" ? "" : v,
              }))
            }
          >
            <SelectTrigger
              id={`${idPrefix}-default-invoice`}
              className="bg-background"
            >
              <SelectValue placeholder="Según condición IVA" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__auto__">
                {suggestedComprobante
                  ? `Según condición IVA (${suggestedComprobante})`
                  : "Según condición IVA"}
              </SelectItem>
              {comprobanteFormOptions.map((opt) => (
                <SelectItem key={opt.label} value={opt.label}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </FormSection>

      <FormSection title="Contacto">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-email`}>Email</Label>
          <Input
            id={`${idPrefix}-email`}
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm((f) => ({ ...f, email: e.target.value }))
            }
            className="bg-background"
            placeholder="opcional@ejemplo.com"
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-phone`}>Teléfono</Label>
          <Input
            id={`${idPrefix}-phone`}
            type="tel"
            value={form.phone}
            onChange={(e) =>
              setForm((f) => ({ ...f, phone: e.target.value }))
            }
            className="bg-background"
            placeholder="Opcional"
            autoComplete="tel"
          />
        </div>
      </FormSection>

      <FormSection title="Estado y notas">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 px-3 py-3">
          <div className="min-w-0 space-y-0.5">
            <Label htmlFor={`${idPrefix}-active`} className="text-foreground">
              Cliente activo
            </Label>
            <p className="text-xs text-muted-foreground">
              Los inactivos se ocultan con el filtro «Solo clientes activos».
            </p>
          </div>
          <Switch
            id={`${idPrefix}-active`}
            checked={form.isActive}
            onCheckedChange={(c) =>
              setForm((f) => ({ ...f, isActive: c }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-notes`}>Notas internas</Label>
          <Textarea
            id={`${idPrefix}-notes`}
            rows={3}
            value={form.notes}
            onChange={(e) =>
              setForm((f) => ({ ...f, notes: e.target.value }))
            }
            className="bg-background"
            placeholder="Observaciones para tu equipo (opcional)"
          />
        </div>
      </FormSection>
    </div>
  )
}
