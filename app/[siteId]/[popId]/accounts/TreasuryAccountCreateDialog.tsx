"use client"

import { TreasuryInstitutionPicker } from "@/app/[siteId]/[popId]/accounts/TreasuryInstitutionPicker"
import { treasuryPickerTileClass } from "@/app/[siteId]/[popId]/accounts/TreasuryAccountBrandVisual"
import type { UpsertTreasuryAccountInput } from "@/app/[siteId]/[popId]/accounts/actions"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { RootsFormField, RootsFormTextField } from "@/components/rootsy-form"
import {
  accountNameFromCreateSelection,
  CREATE_ACCOUNT_KIND_OPTIONS,
  defaultBrandKeyForKind,
  TREASURY_BRAND_OTHER_KEY,
} from "@/lib/treasuryAccountBrands"
import type { TreasuryAccountKind } from "@/lib/treasuryAccountKinds"
import { cn } from "@/lib/utils"
import { Dialog } from "@/components/ui/dialog"
import { Banknote, CircleEllipsis, Landmark, Wallet } from "lucide-react"
import { useEffect, useMemo, useState, type FormEvent } from "react"

const KIND_ICONS = {
  cash: Banknote,
  bank: Landmark,
  wallet: Wallet,
  other: CircleEllipsis,
} as const

export type TreasuryAccountCreateFormState = {
  kind: TreasuryAccountKind
  brandKey: string
  customName: string
}

export function defaultTreasuryCreateForm(): TreasuryAccountCreateFormState {
  return {
    kind: "bank",
    brandKey: defaultBrandKeyForKind("bank") ?? TREASURY_BRAND_OTHER_KEY,
    customName: "",
  }
}

function toUpsertInput(form: TreasuryAccountCreateFormState): UpsertTreasuryAccountInput {
  const name = accountNameFromCreateSelection(form)
  return {
    name,
    kind: form.kind,
    sortOrder: 0,
    brandKey:
      form.kind === "bank" || form.kind === "wallet"
        ? form.brandKey === TREASURY_BRAND_OTHER_KEY
          ? null
          : form.brandKey
        : null,
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

  const resolvedName = useMemo(
    () => accountNameFromCreateSelection(form),
    [form],
  )

  const needsCustomName =
    form.kind === "cash" ||
    form.kind === "other" ||
    ((form.kind === "bank" || form.kind === "wallet") &&
      form.brandKey === TREASURY_BRAND_OTHER_KEY)

  const canSubmit =
    resolvedName.length > 0 &&
    (!needsCustomName || form.customName.trim().length > 0)

  const customNameLabel =
    form.kind === "cash"
      ? "Nombre de la caja"
      : form.kind === "other"
        ? "Nombre de la cuenta"
        : form.kind === "bank"
          ? "Nombre del banco"
          : "Nombre de la billetera"

  const customNamePlaceholder =
    form.kind === "cash"
      ? "Ej. Caja mostrador, Caja chica"
      : form.kind === "bank"
        ? "Ej. Banco Credicoop"
        : form.kind === "wallet"
          ? "Ej. Cuenta DNI"
          : "Ej. Inversión, Fondo"

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    void onSubmit(toUpsertInput(form))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="wide">
        <RootsDialogHeader
          title="Nueva cuenta"
          description="Elegí el tipo de cuenta y, si es banco o billetera, la institución."
        />
        <RootsDialogForm onSubmit={handleSubmit}>
          <RootsDialogBody className="space-y-4">
            <RootsFormField label="Tipo de cuenta">
              <div
                className="grid w-full grid-cols-2 gap-2"
                role="radiogroup"
                aria-label="Tipo de cuenta"
              >
                {CREATE_ACCOUNT_KIND_OPTIONS.map((opt) => {
                  const Icon = KIND_ICONS[opt.value]
                  const selected = form.kind === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          kind: opt.value,
                          brandKey:
                            defaultBrandKeyForKind(opt.value) ??
                            TREASURY_BRAND_OTHER_KEY,
                          customName: "",
                        }))
                      }
                      className={cn(
                        treasuryPickerTileClass(selected),
                        "min-h-[4.25rem] flex-col items-start gap-1 py-2.5",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <Icon
                          className={cn(
                            "size-4 shrink-0",
                            selected
                              ? "text-[var(--rootsy-bruma-900)]"
                              : "text-[var(--rootsy-bruma-500)]",
                          )}
                          aria-hidden
                        />
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            selected
                              ? "text-[var(--rootsy-bruma-900)]"
                              : "text-[var(--rootsy-bruma-700)]",
                          )}
                        >
                          {opt.label}
                        </span>
                      </span>
                      <span className="text-[11px] font-normal leading-snug text-[var(--rootsy-bruma-500)]">
                        {opt.description}
                      </span>
                    </button>
                  )
                })}
              </div>
            </RootsFormField>

            {form.kind === "bank" ? (
              <TreasuryInstitutionPicker
                category="bank"
                value={form.brandKey}
                onChange={(brandKey) =>
                  setForm((prev) => ({ ...prev, brandKey, customName: "" }))
                }
                otherLabel="Otro banco"
              />
            ) : null}

            {form.kind === "wallet" ? (
              <TreasuryInstitutionPicker
                category="wallet"
                value={form.brandKey}
                onChange={(brandKey) =>
                  setForm((prev) => ({ ...prev, brandKey, customName: "" }))
                }
                otherLabel="Otra billetera"
              />
            ) : null}

            {needsCustomName ? (
              <RootsFormTextField
                label={customNameLabel}
                id="create-custom-name"
                value={form.customName}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    customName: e.target.value,
                  }))
                }
                required
                placeholder={customNamePlaceholder}
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
