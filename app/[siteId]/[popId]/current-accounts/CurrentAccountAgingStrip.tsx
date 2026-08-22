"use client"

import {
  RootsNaturePill,
  type RootsNaturePillVariant,
} from "@/components/rootsy-pill"
import {
  CURRENT_ACCOUNT_AGING_BUCKETS,
  type CurrentAccountAgingBucket,
  type CurrentAccountAgingTotals,
} from "@/lib/currentAccounts"

const moneyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

export function currentAccountAgingPillVariant(
  bucket: CurrentAccountAgingBucket,
): RootsNaturePillVariant {
  if (bucket === "d61_plus") return "danger"
  if (bucket === "d31_60") return "bruma"
  if (bucket === "d1_30") return "warning"
  return "savia"
}

export function CurrentAccountAgingStrip({
  aging,
  className,
}: {
  aging: CurrentAccountAgingTotals
  className?: string
}) {
  return (
    <div className={className}>
      <p className="sr-only">Antigüedad de la deuda</p>
      <ul className="flex flex-wrap items-center gap-2">
        {CURRENT_ACCOUNT_AGING_BUCKETS.map((bucket) => {
          const amount = aging[bucket.value]
          if (amount <= 0.009) return null
          return (
            <li key={bucket.value}>
              <RootsNaturePill
                variant={currentAccountAgingPillVariant(bucket.value)}
              >
                {bucket.label} {moneyFormatter.format(amount)}
              </RootsNaturePill>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
