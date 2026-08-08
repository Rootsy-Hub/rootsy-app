"use client"

import { TreasuryInstitutionPicker } from "@/app/[siteId]/[popId]/accounts/TreasuryInstitutionPicker"
import type { UpsertTreasuryAccountInput } from "@/app/[siteId]/[popId]/accounts/actions"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormTextField,
} from "@/components/rootsy-form"
import { TREASURY_MOTHER_CREATE_KIND_OPTIONS } from "@/lib/treasuryAccountBrands"
import type { TreasuryAccountKind } from "@/lib/treasuryAccountKinds"
import { Dialog } from "@/components/ui/dialog"
import { useEffect, useState, type FormEvent } from "react"

export type TreasuryAccountCreateFormState = {
  name: string
  kind: TreasuryAccountKind
  brandKey: string | null
}

export function defaultTreasuryCreateForm(): TreasuryAccountCreateFormState {
  return {
    name: "",
    kind: "bank",
    brandKey: null,
  }
}

function toUpsertInput(form: TreasuryAccountCreateFormState): UpsertTreasuryAccountInput {
  return {
    name: form.name.trim(),
    kind: form.kind,
    sortOrder: 0,
    brandKey: form.brandKey,
  }
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  saving: boolean
  banner: string | null
  onSubmit: (input: UpsertTreasuryAccountInput) => void | Promise<void>
}

export function TreasuryAccountCreateDialog({
  open,
  onOpenChange,
  saving,
  banner,
  onSubmit,
}: Props) {
  const [form, setForm] = useState(defaultTreasuryCreateForm)

  useEffect(() => {
    if (!open) {
      setForm(defaultTreasuryCreateForm())
    }
  }, [open])

  const canSubmit = form.name.trim().length > 0

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    void onSubmit(toUpsertInput(form))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="wide">
        <RootsDialogHeader title="Nueva cuenta" />
        <RootsDialogForm onSubmit={handleSubmit}>
          <RootsDialogBody className="space-y-4">
            <RootsFormTextField
              label="Nombre"
              id="create-account-name"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              required
              autoFocus
              placeholder="Ej. Cuenta principal, Caja chica"
            />

            <RootsFormSelectField
              label="Tipo de cuenta"
              id="create-account-kind"
              value={form.kind}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  kind: value as TreasuryAccountKind,
                  brandKey: value === "cash" ? null : prev.brandKey,
                }))
              }
            >
              {TREASURY_MOTHER_CREATE_KIND_OPTIONS.map((opt) => (
                <RootsFormSelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </RootsFormSelectItem>
              ))}
            </RootsFormSelectField>

            {form.kind === "bank" ? (
              <TreasuryInstitutionPicker
                category="bank"
                value={form.brandKey}
                onChange={(brandKey) =>
                  setForm((prev) => ({ ...prev, brandKey }))
                }
              />
            ) : null}

            {form.kind === "wallet" ? (
              <TreasuryInstitutionPicker
                category="wallet"
                value={form.brandKey}
                onChange={(brandKey) =>
                  setForm((prev) => ({ ...prev, brandKey }))
                }
              />
            ) : null}

            {banner ? <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner> : null}
          </RootsDialogBody>
          <RootsDialogDualActionFooter
            onCancel={() => onOpenChange(false)}
            confirmLabel="Crear cuenta"
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
