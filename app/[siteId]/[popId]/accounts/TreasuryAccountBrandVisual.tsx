"use client"

import {
  TreasuryBrandIsotype,
  TreasuryBrandName,
} from "@/app/[siteId]/[popId]/accounts/TreasuryBrandMark"
import type { TreasuryAccountBrandPreset } from "@/lib/treasuryAccountBrands"
import { cn } from "@/lib/utils"

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
  const gradient =
    preset?.headerGradient ?? "from-muted via-muted/80 to-muted/60"
  const headerText = preset?.headerTextClass ?? "text-foreground"

  if (compact) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-xl border text-left transition-all",
          selected
            ? "border-white/90 ring-2 ring-white/40 shadow-md"
            : "border-transparent hover:border-white/30 hover:shadow-sm",
          className,
        )}
      >
        <div
          className={cn(
            "flex min-h-[58px] items-center gap-2.5 bg-linear-to-br px-2.5 py-2 transition-[filter] duration-150",
            !selected && "hover:brightness-110",
            gradient,
          )}
        >
          {preset ? (
            <>
              <TreasuryBrandIsotype
                brandKey={preset.key}
                monogram={preset.monogram}
                headerTextClass={headerText}
                size="sm"
              />
              <TreasuryBrandName
                preset={preset}
                name={name}
                compact
                textClass={headerText}
                className="flex-1"
              />
            </>
          ) : (
            <span className={cn("w-full text-center text-sm font-semibold", headerText)}>
              Otro
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/60 bg-card",
        className,
      )}
    >
      <div className={cn("relative bg-linear-to-br px-4 pb-8 pt-4", gradient)}>
        <p
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.16em] opacity-80",
            headerText,
          )}
        >
          {kindLabel}
        </p>
        <div className="mt-3 flex items-center gap-3">
          {preset ? (
            <>
              <TreasuryBrandIsotype
                brandKey={preset.key}
                monogram={preset.monogram}
                headerTextClass={headerText}
                size="lg"
              />
              <TreasuryBrandName preset={preset} name={name} textClass={headerText} />
            </>
          ) : (
            <p
              className={cn(
                "truncate text-lg font-semibold tracking-tight",
                headerText,
              )}
            >
              {name}
            </p>
          )}
        </div>
      </div>
      <div className="-mt-5 px-4 pb-4">
        <div className="rounded-xl border border-border/60 bg-background px-3 py-2 shadow-sm">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Saldo real
          </p>
          <p className="mt-0.5 font-mono text-xl font-bold tabular-nums text-foreground">
            —
          </p>
        </div>
      </div>
    </div>
  )
}
