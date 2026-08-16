import { cn } from "@/lib/utils"

export type TreasuryMovementListTokensVariant = "default" | "bruma"

/** font.heading.small · UI */
const rootsyMovementListHeadingSmallClass = cn(
  "font-canopy text-[length:var(--rootsy-text-heading-small-size)] leading-[var(--rootsy-text-heading-small-lh)]",
  "font-bold tracking-[-0.01em]",
)

/** font.heading.xsmall · UI */
const rootsyMovementListHeadingXsmallClass = cn(
  "font-canopy text-[length:var(--rootsy-text-heading-xsmall-size)] leading-[var(--rootsy-text-heading-xsmall-lh)]",
  "font-bold tracking-[-0.01em]",
)

/** font.body · UI */
const rootsyMovementListBodyClass = cn(
  "font-canopy text-[length:var(--rootsy-text-body-size)] leading-[var(--rootsy-text-body-lh)] font-normal",
)

/** font.body medium · fila principal (paridad layout tablas). */
const rootsyMovementListBodyMediumClass = cn(
  "font-canopy text-[length:var(--rootsy-text-body-size)] leading-[var(--rootsy-text-body-lh)] font-medium",
)

/** font.body.small · metadata */
const rootsyMovementListBodySmallClass = cn(
  "font-canopy text-[length:var(--rootsy-text-body-small-size)] leading-[var(--rootsy-text-body-small-lh)] font-normal",
)

/** font.body · numeric · montos en fila */
const rootsyMovementListNumericBodyClass = cn(
  "font-numeric text-[length:var(--rootsy-text-body-size)] leading-[var(--rootsy-text-body-lh)] font-normal tabular-nums tracking-[-0.01em]",
)

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
  },
  bruma: {
    empty: cn(
      rootsyMovementListBodyClass,
      "text-[var(--rootsy-bruma-500)] border-[var(--rootsy-bruma-200)]",
    ),
    containerBorder: "border-[var(--rootsy-bruma-200)]",
    sectionBorder: "border-[var(--rootsy-bruma-200)]",
    rowBorder: "border-[var(--rootsy-bruma-200)]",
    rowHover: "hover:bg-[var(--rootsy-bruma-50)]",
    yearHeading: cn(
      rootsyMovementListHeadingSmallClass,
      "text-[var(--rootsy-bruma-900)]",
    ),
    dateHeading: cn(
      rootsyMovementListHeadingXsmallClass,
      "text-[var(--rootsy-bruma-900)]",
    ),
    description: cn(
      rootsyMovementListBodyMediumClass,
      "text-[var(--rootsy-bruma-900)]",
    ),
    subtitle: cn(
      rootsyMovementListBodySmallClass,
      "text-[var(--rootsy-bruma-500)]",
    ),
    amount: cn(
      rootsyMovementListNumericBodyClass,
      "whitespace-nowrap text-[var(--rootsy-bruma-900)]",
    ),
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
