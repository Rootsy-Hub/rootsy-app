"use client"

import type { UpsertPopPrinterInput } from "@/app/[siteId]/[popId]/printers/actions"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import {
  RootsFormIntegerField,
  RootsFormSwitchField,
  RootsFormTextField,
} from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"
import { useEffect, useState, type FormEvent } from "react"

type FormState = {
  name: string
  isActive: boolean
  sortOrder: string
  integrationKind: string
  connectionHint: string
}

const EMPTY_FORM: FormState = {
  name: "",
  isActive: true,
  sortOrder: "0",
  integrationKind: "",
  connectionHint: "",
}

function toInput(form: FormState): UpsertPopPrinterInput {
  return {
    name: form.name,
    isActive: form.isActive,
    sortOrder: Number(form.sortOrder) || 0,
    integrationKind: form.integrationKind,
    connectionHint: form.connectionHint,
  }
}

function formFromInitial(initialValue?: UpsertPopPrinterInput | null): FormState {
  if (!initialValue) return EMPTY_FORM
  return {
    name: initialValue.name,
    isActive: initialValue.isActive,
    sortOrder: String(initialValue.sortOrder),
    integrationKind: initialValue.integrationKind,
    connectionHint: initialValue.connectionHint,
  }
}

type Props = {
  open: boolean
  mode: "create" | "edit"
  saving: boolean
  banner: string | null
  initialValue?: UpsertPopPrinterInput | null
  onOpenChange: (open: boolean) => void
  onSubmit: (input: UpsertPopPrinterInput) => void | Promise<void>
}

export function PrinterUpsertDialog({
  open,
  mode,
  saving,
  banner,
  initialValue,
  onOpenChange,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<FormState>(() =>
    mode === "edit" ? formFromInitial(initialValue) : EMPTY_FORM,
  )

  useEffect(() => {
    if (!open) return
    setForm(mode === "edit" ? formFromInitial(initialValue) : EMPTY_FORM)
    // Hidrata al abrir; el padre pasa un `key` estable por impresora.
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const canSubmit = form.name.trim().length > 0

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    void onSubmit(toInput(form))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent>
        <RootsDialogHeader
          title={mode === "create" ? "Nueva impresora" : "Editar impresora"}
        />
        <RootsDialogForm onSubmit={handleSubmit}>
          <RootsDialogBody className="space-y-4">
            {banner ? (
              <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner>
            ) : null}
            <RootsFormTextField
              label="Nombre"
              id="printer-name"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              required
              autoFocus
              placeholder="Ej. Caja 1, Cocina"
            />
            <RootsFormSwitchField
              label="Activa"
              id="printer-active"
              checked={form.isActive}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, isActive: checked }))
              }
            />
            <RootsFormIntegerField
              label="Orden"
              id="printer-sort"
              value={form.sortOrder}
              onChange={(sortOrder) =>
                setForm((prev) => ({ ...prev, sortOrder }))
              }
            />
            <RootsFormTextField
              label="Tipo de integración"
              id="printer-kind"
              value={form.integrationKind}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  integrationKind: e.target.value,
                }))
              }
              hint="Opcional. P. ej. extensión, bridge."
            />
            <RootsFormTextField
              label="Conexión"
              id="printer-hint"
              value={form.connectionHint}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  connectionHint: e.target.value,
                }))
              }
              hint="Opcional. IP, nombre de impresora, etc."
            />
          </RootsDialogBody>
          <RootsDialogDualActionFooter
            onCancel={() => onOpenChange(false)}
            confirmLabel={mode === "create" ? "Crear" : "Guardar"}
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
