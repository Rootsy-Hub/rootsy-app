"use client"

import { TreasuryAccountBrandVisual } from "@/app/[siteId]/[popId]/accounts/TreasuryAccountBrandVisual"
import { FieldLabel } from "@/components/ui/field"
import {
  getTreasuryBrandPresets,
  TREASURY_BRAND_OTHER_KEY,
  type TreasuryBrandCategory,
} from "@/lib/treasuryAccountBrands"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"

const lightLabel = "text-zinc-700 dark:text-zinc-700"

/** Selección visible sobre tiles neutros y sobre marcas con color de fondo. */
const pickerTileSelectedClass =
  "z-[1] shadow-md ring-2 ring-zinc-900/20 ring-offset-2 ring-offset-white"

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

  return (
    <div className="space-y-2">
      <FieldLabel className={lightLabel}>
        {category === "bank" ? "Banco" : "Billetera"}
      </FieldLabel>
      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
        role="listbox"
        aria-label={
          category === "bank"
            ? "Seleccionar banco"
            : "Seleccionar billetera"
        }
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
              kindLabel={category === "bank" ? "Banco" : "Billetera"}
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
          <div
            className={cn(
              "flex min-h-[58px] items-center gap-2.5 rounded-xl border border-dashed px-2.5 py-2 text-sm font-semibold transition-all",
              isOtherSelected
                ? cn(
                    "border-zinc-500 bg-zinc-50 text-zinc-900",
                    pickerTileSelectedClass,
                  )
                : cn(
                    "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900",
                  ),
            )}
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl border border-dashed",
                isOtherSelected
                  ? "border-zinc-300 bg-white text-zinc-800"
                  : "border-zinc-200 bg-zinc-50 text-zinc-400",
              )}
              aria-hidden
            >
              <Plus className="size-4 shrink-0" />
            </span>
            <span className="min-w-0 flex-1 truncate leading-tight">{otherLabel}</span>
          </div>
        </button>
      </div>
    </div>
  )
}
