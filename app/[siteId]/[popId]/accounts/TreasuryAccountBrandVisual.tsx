"use client"

import {
  TreasuryBrandIsotype,
  TreasuryBrandName,
} from "@/app/[siteId]/[popId]/accounts/TreasuryBrandMark"
import type { TreasuryAccountBrandPreset } from "@/lib/treasuryAccountBrands"
import { cn } from "@/lib/utils"

export function treasuryPickerTileClass(selected: boolean) {
  return cn(
    "flex min-h-[3.625rem] w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-[border-color,background-color,box-shadow] duration-150",
    "focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]",
    selected
      ? "border-[var(--rootsy-savia-500)] bg-[var(--rootsy-white)] shadow-[0_0_0_1px_var(--rootsy-savia-500),0_4px_12px_-2px_color-mix(in_srgb,var(--rootsy-savia-600)_18%,transparent)] ring-2 ring-[color-mix(in_srgb,var(--rootsy-savia-400)_28%,transparent)]"
      : "border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-white)] hover:border-[var(--rootsy-bruma-300)] hover:bg-[var(--rootsy-bruma-50)]",
  )
}

type Props = {
  preset: TreasuryAccountBrandPreset | null
  name: string
  kindLabel: string
  compact?: boolean
  selected?: boolean
  className?: string
}

export function TreasuryAccountBrandVisual({
  preset,
  name,
  kindLabel,
  compact = false,
  selected = false,
  className,
}: Props) {
  if (compact) {
    return (
      <div className={cn(treasuryPickerTileClass(selected), className)}>
        {preset ? (
          <>
            <TreasuryBrandIsotype
              brandKey={preset.key}
              monogram={preset.monogram}
              size="sm"
            />
            <TreasuryBrandName
              preset={preset}
              name={name}
              compact
              textClass="text-[var(--rootsy-bruma-900)]"
              className="min-w-0 flex-1"
            />
          </>
        ) : (
          <span className="w-full text-center text-sm font-semibold text-[var(--rootsy-bruma-900)]">
            Otro
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-white)] shadow-sm",
        className,
      )}
    >
      <div className="border-b border-[var(--rootsy-bruma-200)] px-4 py-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--rootsy-bruma-500)]">
          {kindLabel}
        </p>
        <div className="mt-0.5 flex min-w-0 items-center gap-3">
          {preset ? (
            <>
              <TreasuryBrandIsotype
                brandKey={preset.key}
                monogram={preset.monogram}
                size="md"
              />
              <TreasuryBrandName
                preset={preset}
                name={name}
                textClass="text-[var(--rootsy-bruma-900)]"
                className="min-w-0 flex-1"
              />
            </>
          ) : (
            <p className="truncate text-base font-semibold text-[var(--rootsy-bruma-900)]">
              {name}
            </p>
          )}
        </div>
      </div>
      <div className="bg-[var(--rootsy-bruma-50)] px-4 py-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--rootsy-bruma-500)]">
          Saldo real
        </p>
        <p className="mt-1 font-numeric text-xl font-bold tabular-nums text-[var(--rootsy-bruma-900)]">
          —
        </p>
      </div>
    </div>
  )
}
