"use client"

import { TreasuryInstitutionPicker } from "@/app/[siteId]/[popId]/accounts/TreasuryInstitutionPicker"
import { treasuryPickerTileClass } from "@/app/[siteId]/[popId]/accounts/TreasuryAccountBrandVisual"
import type { UpsertTreasuryAccountInput } from "@/app/[siteId]/[popId]/accounts/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  accountNameFromCreateSelection,
  CREATE_ACCOUNT_KIND_OPTIONS,
  defaultBrandKeyForKind,
  TREASURY_BRAND_OTHER_KEY,
} from "@/lib/treasuryAccountBrands"
import type { TreasuryAccountKind } from "@/lib/treasuryAccountKinds"
import { cn } from "@/lib/utils"
import { Banknote, CircleEllipsis, Landmark, Loader2, Wallet } from "lucide-react"
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    void onSubmit(toUpsertInput(form))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-rootsy-light-shell="true"
        showCloseButton
        className={cn(
          "rootsy-app-light gap-0 overflow-hidden border-border bg-card p-0 text-foreground shadow-xl sm:max-w-lg",
        )}
      >
        <DialogHeader className="space-y-1 border-b border-border/60 bg-muted/20 px-6 py-5">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Nueva cuenta
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Elegí el tipo de cuenta y, si es banco o billetera, la institución.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5">
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel>Tipo de cuenta</FieldLabel>
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
                          "min-h-14 flex-col items-start gap-1 py-2.5",
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <Icon
                            className={cn(
                              "size-4 shrink-0",
                              selected ? "text-foreground" : "text-muted-foreground",
                            )}
                            aria-hidden
                          />
                          <span
                            className={cn(
                              "text-sm font-semibold",
                              selected ? "text-foreground" : "text-foreground/80",
                            )}
                          >
                            {opt.label}
                          </span>
                        </span>
                        <span className="text-[11px] font-normal leading-snug text-muted-foreground">
                          {opt.description}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </Field>

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
                <Field>
                  <FieldLabel htmlFor="create-custom-name">
                    {form.kind === "cash"
                      ? "Nombre de la caja"
                      : form.kind === "other"
                        ? "Nombre de la cuenta"
                        : form.kind === "bank"
                          ? "Nombre del banco"
                          : "Nombre de la billetera"}
                  </FieldLabel>
                  <Input
                    id="create-custom-name"
                    value={form.customName}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        customName: e.target.value,
                      }))
                    }
                    required
                    placeholder={
                      form.kind === "cash"
                        ? "Ej. Caja mostrador, Caja chica"
                        : form.kind === "bank"
                          ? "Ej. Banco Credicoop"
                          : form.kind === "wallet"
                            ? "Ej. Cuenta DNI"
                            : "Ej. Inversión, Fondo"
                    }
                    className="bg-background"
                  />
                </Field>
              ) : null}
            </FieldGroup>

            {banner ? (
              <p
                className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                role="alert"
              >
                {banner}
              </p>
            ) : null}
          </div>

          <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !canSubmit}>
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Guardando…
                </>
              ) : (
                "Crear cuenta"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
