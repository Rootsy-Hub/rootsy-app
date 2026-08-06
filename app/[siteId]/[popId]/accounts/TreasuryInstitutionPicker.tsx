"use client"

import {
  TreasuryAccountBrandVisual,
} from "@/app/[siteId]/[popId]/accounts/TreasuryAccountBrandVisual"
import { RootsFormField } from "@/components/rootsy-form"
import {
  getTreasuryBrandPresets,
  type TreasuryBrandCategory,
} from "@/lib/treasuryAccountBrands"

type Props = {
  category: TreasuryBrandCategory
  value: string | null
  onChange: (brandKey: string | null) => void
}

export function TreasuryInstitutionPicker({
  category,
  value,
  onChange,
}: Props) {
  const presets = getTreasuryBrandPresets(category)
  const label =
    category === "bank" ? "Institución (Opcional)" : "Billetera (Opcional)"

  return (
    <RootsFormField label={label}>
      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
        role="listbox"
        aria-label={category === "bank" ? "Seleccionar banco" : "Seleccionar billetera"}
      >
        {presets.map((preset) => {
          const selected = value === preset.key
          return (
            <button
              key={preset.key}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onChange(selected ? null : preset.key)}
              className="min-w-0 text-left"
            >
              <TreasuryAccountBrandVisual
                preset={preset}
                name={preset.label}
                kindLabel={label}
                compact
                selected={selected}
              />
            </button>
          )
        })}
      </div>
    </RootsFormField>
  )
}
