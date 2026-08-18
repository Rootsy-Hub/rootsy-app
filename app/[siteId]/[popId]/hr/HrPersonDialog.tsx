"use client"

import type { EmployeeRow, UpsertEmployeeInput } from "@/app/[siteId]/[popId]/hr/hrTypes"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import {
  RootsFormDateField,
  RootsFormMoneyField,
  RootsFormTextField,
  RootsFormTextareaField,
} from "@/components/rootsy-form"
import { formatMoneyInputForField } from "@/lib/moneyInput"
import { Dialog } from "@/components/ui/dialog"
import { useEffect, useState, type FormEvent } from "react"

export type HrPersonFormState = {
  firstName: string
  lastName: string
  jobTitle: string
  documentNumber: string
  email: string
  phone: string
  monthlySalary: string
  hiredAt: string
  notes: string
}

export function emptyPersonForm(): HrPersonFormState {
  return {
    firstName: "",
    lastName: "",
    jobTitle: "",
    documentNumber: "",
    email: "",
    phone: "",
    monthlySalary: "",
    hiredAt: "",
    notes: "",
  }
}

export function personFormFromEmployee(person: EmployeeRow): HrPersonFormState {
  return {
    firstName: person.firstName,
    lastName: person.lastName,
    jobTitle: person.jobTitle ?? "",
    documentNumber: person.documentNumber ?? "",
    email: person.email ?? "",
    phone: person.phone ?? "",
    monthlySalary:
      person.monthlySalary == null ? "" : formatMoneyInputForField(person.monthlySalary),
    hiredAt: person.hiredAt ?? "",
    notes: person.notes ?? "",
  }
}

type Props = {
  open: boolean
  person: EmployeeRow | null
  saving: boolean
  error: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (input: UpsertEmployeeInput) => void | Promise<void>
}

export function HrPersonDialog({
  open,
  person,
  saving,
  error,
  onOpenChange,
  onSubmit,
}: Props) {
  const [form, setForm] = useState(emptyPersonForm)
  const isEdit = person != null

  useEffect(() => {
    if (!open) {
      setForm(emptyPersonForm())
      return
    }
    setForm(person ? personFormFromEmployee(person) : emptyPersonForm())
  }, [open, person])

  const canSubmit = form.firstName.trim().length > 0

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    void onSubmit({
      id: person?.id,
      ...form,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="wide" showCloseButton={!saving}>
        <RootsDialogForm onSubmit={handleSubmit}>
          <RootsDialogHeader
            open={open}
            title={isEdit ? "Persona del negocio" : "Nueva persona"}
            description={
              isEdit
                ? "Sueldo, CUIL e ingreso. No hace falta que entre a Rootsy."
                : "Cargala aunque no use Rootsy. Después podés marcarle la entrada o invitarla."
            }
          />
          <RootsDialogBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <RootsFormTextField
                label="Nombre"
                id="hr-person-first"
                value={form.firstName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, firstName: event.target.value }))
                }
                autoFocus
                required
              />
              <RootsFormTextField
                label="Apellido"
                id="hr-person-last"
                value={form.lastName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, lastName: event.target.value }))
                }
              />
            </div>
            <RootsFormTextField
              label="Qué hace"
              id="hr-person-job"
              value={form.jobTitle}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, jobTitle: event.target.value }))
              }
              placeholder="Mozo, cocina, administración…"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <RootsFormTextField
                label="CUIL"
                id="hr-person-cuil"
                value={form.documentNumber}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, documentNumber: event.target.value }))
                }
                placeholder="20-12345678-3"
                hint="Para lo legal. Si no lo tenés ahora, lo cargás después."
              />
              <RootsFormDateField
                label="Ingreso"
                id="hr-person-hired"
                value={form.hiredAt}
                onChange={(value) => setForm((prev) => ({ ...prev, hiredAt: value }))}
              />
            </div>
            <RootsFormMoneyField
              label="Sueldo mensual"
              id="hr-person-salary"
              value={form.monthlySalary}
              onChange={(value) => setForm((prev) => ({ ...prev, monthlySalary: value }))}
              hint="Lo que le pagás. Queda acá, a la vista."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <RootsFormTextField
                label="Correo"
                id="hr-person-email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
                hint="Si más adelante va a entrar a Rootsy."
              />
              <RootsFormTextField
                label="Teléfono"
                id="hr-person-phone"
                value={form.phone}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, phone: event.target.value }))
                }
              />
            </div>
            <RootsFormTextareaField
              label="Notas"
              id="hr-person-notes"
              value={form.notes}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, notes: event.target.value }))
              }
              hint="Opcional. Convenio, horarios, lo que el local necesite acordarse."
            />
            {error ? <RootsDialogErrorBanner>{error}</RootsDialogErrorBanner> : null}
          </RootsDialogBody>
          <RootsDialogDualActionFooter
            onCancel={() => onOpenChange(false)}
            confirmLabel={isEdit ? "Guardar" : "Cargar persona"}
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
