import { cn } from "@/lib/utils"

export type TreasuryMovementListTokensVariant = "default" | "bruma"

const treasuryMovementListTokens: Record<
  TreasuryMovementListTokensVariant,
  {
    empty: string
    containerBorder: string
    sectionBorder: string
    rowBorder: string
    rowHover: string
    yearHeading: string
    dateHeading: string
    description: string
    subtitle: string
    amount: string
    footer: string
    footerDivider: string
    footerLoadingBorder: string
  }
> = {
  default: {
    empty: "text-sm text-muted-foreground border-border/60",
    containerBorder: "border-border/60",
    sectionBorder: "border-border/60",
    rowBorder: "border-border/40",
    rowHover: "hover:bg-muted/35",
    yearHeading: "text-base font-bold text-foreground",
    dateHeading: "text-sm font-bold text-foreground",
    description: "text-sm leading-snug text-foreground",
    subtitle: "text-xs text-muted-foreground",
    amount:
      "whitespace-nowrap font-numeric text-sm tabular-nums tracking-tight text-foreground",
    footer: "text-xs text-muted-foreground",
    footerDivider: "bg-border/60",
    footerLoadingBorder: "border-border/50",
  },
  bruma: {
    empty:
      "font-canopy text-sm text-[var(--rootsy-bruma-500)] border-[var(--rootsy-bruma-200)]",
    containerBorder: "border-[var(--rootsy-bruma-200)]",
    sectionBorder: "border-[var(--rootsy-bruma-200)]",
    rowBorder: "border-[var(--rootsy-bruma-200)]",
    rowHover: "hover:bg-[var(--rootsy-bruma-50)]",
    yearHeading:
      "font-canopy text-base font-bold text-[var(--rootsy-bruma-900)]",
    dateHeading: "font-canopy text-sm font-bold text-[var(--rootsy-bruma-900)]",
    description:
      "font-canopy text-sm leading-snug text-[var(--rootsy-bruma-900)]",
    subtitle: "font-canopy text-xs text-[var(--rootsy-bruma-500)]",
    amount:
      "whitespace-nowrap font-numeric text-sm tabular-nums tracking-tight text-[var(--rootsy-bruma-900)]",
    footer: "font-canopy text-xs text-[var(--rootsy-bruma-500)]",
    footerDivider: "bg-[var(--rootsy-bruma-200)]",
    footerLoadingBorder: "border-[var(--rootsy-bruma-200)]",
  },
}

export function treasuryMovementListTokensFor(
  variant: TreasuryMovementListTokensVariant = "default",
) {
  return treasuryMovementListTokens[variant]
}

export function treasuryMovementListEmptyClass(
  variant: TreasuryMovementListTokensVariant,
  fullWidth: boolean,
) {
  const tokens = treasuryMovementListTokensFor(variant)
  return cn(
    "flex min-h-48 items-center justify-center px-4 py-10 text-center lg:px-5",
    tokens.empty,
    !fullWidth && cn("rounded-lg border", tokens.containerBorder),
  )
}
