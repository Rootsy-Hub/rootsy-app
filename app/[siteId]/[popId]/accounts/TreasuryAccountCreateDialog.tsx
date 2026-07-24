"use client"

import { TreasuryInstitutionPicker } from "@/app/[siteId]/[popId]/accounts/TreasuryInstitutionPicker"
import { TreasuryAccountBrandVisual } from "@/app/[siteId]/[popId]/accounts/TreasuryAccountBrandVisual"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  accountNameFromCreateSelection,
  CREATE_ACCOUNT_KIND_OPTIONS,
  defaultBrandKeyForKind,
  getTreasuryBrandPreset,
  TREASURY_BRAND_OTHER_KEY,
} from "@/lib/treasuryAccountBrands"
import type { TreasuryAccountKind } from "@/lib/treasuryAccountKinds"
import { treasuryKindLabel } from "@/lib/treasuryAccountKinds"
import { cn } from "@/lib/utils"
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
  sortOrder: number
}

export function defaultTreasuryCreateForm(): TreasuryAccountCreateFormState {
  return {
    kind: "bank",
    brandKey: defaultBrandKeyForKind("bank") ?? TREASURY_BRAND_OTHER_KEY,
    customName: "",
    sortOrder: 0,
  }
}

function toUpsertInput(form: TreasuryAccountCreateFormState): UpsertTreasuryAccountInput {
  const name = accountNameFromCreateSelection(form)
  return {
    name,
    kind: form.kind,
    sortOrder: form.sortOrder,
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

  const previewName = useMemo(
    () => accountNameFromCreateSelection(form),
    [form],
  )

  const previewPreset = useMemo(() => {
    if (form.kind === "bank" || form.kind === "wallet") {
      return getTreasuryBrandPreset(
        form.brandKey === TREASURY_BRAND_OTHER_KEY ? null : form.brandKey,
      )
    }
    return null
  }, [form.brandKey, form.kind])

  const needsCustomName =
    form.kind === "cash" ||
    form.kind === "other" ||
    ((form.kind === "bank" || form.kind === "wallet") &&
      form.brandKey === TREASURY_BRAND_OTHER_KEY)

  const canSubmit =
    previewName.length > 0 &&
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
        className="max-h-[90vh] overflow-y-auto border-border bg-card text-foreground sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>Nueva cuenta</DialogTitle>
          <DialogDescription>
            Elegí el tipo de cuenta y, si es banco o billetera, la institución.
            Cada una tendrá un diseño propio en el listado.
          </DialogDescription>
        </DialogHeader>

        {banner ? (
          <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {banner}
          </p>
        ) : null}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Tipo de cuenta</Label>
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
                      "flex min-h-14 w-full flex-col items-start gap-1 rounded-xl border px-3 py-2.5 text-left transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      selected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/80 bg-background hover:border-border hover:bg-muted/50",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          selected ? "text-primary" : "text-muted-foreground",
                        )}
                        aria-hidden
                      />
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          selected ? "text-foreground" : "text-foreground/90",
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
          </div>

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
            <div className="space-y-2">
              <Label htmlFor="create-custom-name">
                {form.kind === "cash"
                  ? "Nombre de la caja"
                  : form.kind === "other"
                    ? "Nombre de la cuenta"
                    : form.kind === "bank"
                      ? "Nombre del banco"
                      : "Nombre de la billetera"}
              </Label>
              <Input
                id="create-custom-name"
                value={form.customName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, customName: e.target.value }))
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
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>Vista previa</Label>
            <TreasuryAccountBrandVisual
              preset={previewPreset}
              name={previewName || "—"}
              kindLabel={treasuryKindLabel(form.kind)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-sort">Orden en listas</Label>
            <Input
              id="create-sort"
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  sortOrder: Number(e.target.value),
                }))
              }
              className="bg-background"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !canSubmit}>
              {saving ? "Guardando…" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
