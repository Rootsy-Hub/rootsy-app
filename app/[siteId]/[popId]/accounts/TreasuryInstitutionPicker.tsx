"use client"

import {
  treasuryPickerTileClass,
  TreasuryAccountBrandVisual,
} from "@/app/[siteId]/[popId]/accounts/TreasuryAccountBrandVisual"
import { RootsFormField } from "@/components/rootsy-form"
import {
  getTreasuryBrandPresets,
  TREASURY_BRAND_OTHER_KEY,
  type TreasuryBrandCategory,
} from "@/lib/treasuryAccountBrands"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"

type Props = {
  category: TreasuryBrandCategory
  value: string
  onChange: (brandKey: string) => void
  otherLabel?: string
}

export function TreasuryInstitutionPicker({
  category,
  value,
  onChange,
  otherLabel = "Otro",
}: Props) {
  const presets = getTreasuryBrandPresets(category)
  const isOtherSelected = value === TREASURY_BRAND_OTHER_KEY
  const label = category === "bank" ? "Banco" : "Billetera"

  return (
    <RootsFormField label={label}>
      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
        role="listbox"
        aria-label={category === "bank" ? "Seleccionar banco" : "Seleccionar billetera"}
      >
        {presets.map((preset) => (
          <button
            key={preset.key}
            type="button"
            role="option"
            aria-selected={value === preset.key}
            onClick={() => onChange(preset.key)}
            className="min-w-0 text-left"
          >
            <TreasuryAccountBrandVisual
              preset={preset}
              name={preset.label}
              kindLabel={label}
              compact
              selected={value === preset.key}
            />
          </button>
        ))}
        <button
          type="button"
          role="option"
          aria-selected={isOtherSelected}
          onClick={() => onChange(TREASURY_BRAND_OTHER_KEY)}
          className="min-w-0 text-left"
        >
          <div className={cn(treasuryPickerTileClass(isOtherSelected), "border-dashed")}>
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl border border-dashed border-[var(--rootsy-bruma-300)] bg-[var(--rootsy-bruma-50)] text-[var(--rootsy-bruma-500)]",
                isOtherSelected &&
                  "border-[var(--rootsy-savia-400)] bg-[var(--rootsy-white)] text-[var(--rootsy-bruma-900)]",
              )}
              aria-hidden
            >
              <Plus className="size-4 shrink-0" />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold leading-tight text-[var(--rootsy-bruma-900)]">
              {otherLabel}
            </span>
          </div>
        </button>
      </div>
    </RootsFormField>
  )
}
