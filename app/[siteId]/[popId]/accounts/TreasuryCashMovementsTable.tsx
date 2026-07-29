"use client"

import type { PaymentMethodMovementRow } from "@/app/[siteId]/[popId]/accounts/treasuryDetailActions"
import {
  formatTreasuryShortDate,
  treasuryMoneyFmt as fmt,
  treasuryMovementCounterpartyLabel,
  treasuryMovementPaymentKindLabel,
  treasuryMovementTreasuryAccountLabel,
  treasuryMovementTypeLabel,
} from "@/app/[siteId]/[popId]/accounts/treasuryAccountUiUtils"
import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"

const PAGE_SIZE = 10

export function TreasuryCashMovementsTable({
  movements,
  fullWidth = false,
  showTreasuryDetails = false,
}: {
  movements: PaymentMethodMovementRow[]
  fullWidth?: boolean
  /** Banco / billetera: cuenta de tesorería y forma de pago. */
  showTreasuryDetails?: boolean
}) {
  const cellPadding = fullWidth ? "px-4 py-2.5 lg:px-5" : "px-3 py-2.5"
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [movements])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    if (visibleCount >= movements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((prev) =>
            Math.min(prev + PAGE_SIZE, movements.length),
          )
        }
      },
      { rootMargin: "120px" },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [movements.length, visibleCount])

  const visibleMovements = movements.slice(0, visibleCount)
  const hasMore = visibleCount < movements.length

  if (movements.length === 0) {
    return (
      <div
        className={cn(
          "flex min-h-48 items-center justify-center px-4 py-10 text-center text-sm text-muted-foreground lg:px-5",
          fullWidth && "border-t border-border/60",
          !fullWidth && "rounded-lg border border-border/60",
        )}
      >
        No hay movimientos en el período seleccionado.
      </div>
    )
  }

  return (
    <div
      className={cn(
        "overflow-hidden",
        fullWidth ? "border-t border-border/60" : "rounded-lg border border-border/60",
      )}
    >
      <table className="w-full border-collapse text-sm">
        {showTreasuryDetails ? (
          <thead>
            <tr className="border-b border-border/60 bg-muted/20 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
              <th className={cn("w-22 shrink-0 font-medium", cellPadding)}>
                Fecha
              </th>
              <th className={cn("min-w-28 font-medium", cellPadding)}>Tipo</th>
              <th className={cn("min-w-0 font-medium", cellPadding)}>
                Cliente o proveedor
              </th>
              <th className={cn("min-w-28 font-medium", cellPadding)}>Cuenta</th>
              <th className={cn("min-w-28 font-medium", cellPadding)}>
                Forma de pago
              </th>
              <th
                className={cn(
                  "w-30 shrink-0 text-right font-medium",
                  cellPadding,
                )}
              >
                Importe
              </th>
            </tr>
          </thead>
        ) : null}
        <tbody className="divide-y divide-border/50">
          {visibleMovements.map((movement) => {
            const counterparty = treasuryMovementCounterpartyLabel(movement)
            return (
              <tr
                key={`${movement.kind}-${movement.id}-${movement.sourceAccountName ?? ""}-${movement.treasuryAccountLabel ?? ""}`}
                className="hover:bg-muted/20"
              >
                <td
                  className={cn(
                    "w-22 shrink-0 align-middle text-xs text-muted-foreground tabular-nums",
                    cellPadding,
                  )}
                >
                  {formatTreasuryShortDate(movement.date)}
                </td>
                <td
                  className={cn(
                    "min-w-28 align-middle font-medium text-foreground",
                    cellPadding,
                  )}
                >
                  {treasuryMovementTypeLabel(movement)}
                </td>
                <td
                  className={cn(
                    "min-w-0 align-middle text-muted-foreground",
                    cellPadding,
                  )}
                >
                  <span className="block truncate">{counterparty}</span>
                </td>
                {showTreasuryDetails ? (
                  <>
                    <td
                      className={cn(
                        "min-w-28 align-middle text-foreground",
                        cellPadding,
                      )}
                    >
                      <span className="block truncate">
                        {treasuryMovementTreasuryAccountLabel(movement)}
                      </span>
                    </td>
                    <td
                      className={cn(
                        "min-w-28 align-middle text-muted-foreground",
                        cellPadding,
                      )}
                    >
                      {treasuryMovementPaymentKindLabel(movement)}
                    </td>
                  </>
                ) : null}
                <td
                  className={cn(
                    "w-30 shrink-0 align-middle text-right",
                    cellPadding,
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-sm font-semibold tabular-nums tracking-tight",
                      movement.direction === "in"
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-rose-700 dark:text-rose-400",
                    )}
                  >
                    {movement.direction === "in" ? "+" : "−"}
                    {fmt.format(movement.amount)}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {hasMore ? (
        <div
          ref={sentinelRef}
          className={cn(
            "flex items-center justify-center border-t border-border/50 py-3 text-xs text-muted-foreground",
            fullWidth ? "px-4 lg:px-5" : "px-3",
          )}
        >
          Cargando más movimientos…
        </div>
      ) : movements.length > PAGE_SIZE ? (
        <div
          className={cn(
            "border-t border-border/50 py-2 text-center text-[11px] text-muted-foreground",
            fullWidth ? "px-4 lg:px-5" : "px-3",
          )}
        >
          {movements.length} movimientos en el período
        </div>
      ) : null}
    </div>
  )
}
