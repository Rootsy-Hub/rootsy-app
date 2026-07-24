"use client"

import { TreasuryAccountBrandVisual } from "@/app/[siteId]/[popId]/accounts/TreasuryAccountBrandVisual"
import { Label } from "@/components/ui/label"
import {
  getTreasuryBrandPresets,
  TREASURY_BRAND_OTHER_KEY,
  type TreasuryBrandCategory,
} from "@/lib/treasuryAccountBrands"
import { cn } from "@/lib/utils"

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

  return (
    <div className="space-y-2">
      <Label>
        {category === "bank" ? "Banco" : "Billetera"}
      </Label>
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
          aria-selected={value === TREASURY_BRAND_OTHER_KEY}
          onClick={() => onChange(TREASURY_BRAND_OTHER_KEY)}
          className="min-w-0 text-left"
        >
          <div
            className={cn(
              "flex h-full min-h-[52px] items-center justify-center rounded-xl border border-dashed px-3 py-2.5 text-sm font-semibold transition-all",
              value === TREASURY_BRAND_OTHER_KEY
                ? "border-foreground/30 bg-muted/60 text-foreground ring-2 ring-foreground/15"
                : "border-border/80 bg-background text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground",
            )}
          >
            {otherLabel}
          </div>
        </button>
      </div>
    </div>
  )
}
