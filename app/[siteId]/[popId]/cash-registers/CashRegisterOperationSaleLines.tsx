import type { CashRegisterOperationSaleLine } from "@/lib/cashRegisterOperationDetail"
import { formatCashRegisterMoney } from "@/app/[siteId]/[popId]/cash-registers/cashRegisterFormatters"
import { cn } from "@/lib/utils"

function formatQuantity(quantity: number): string {
  if (Number.isInteger(quantity)) return String(quantity)
  return String(quantity)
}

type Props = {
  lines: CashRegisterOperationSaleLine[]
  generalDiscountAmount?: number
  className?: string
}

export function CashRegisterOperationSaleLines({
  lines,
  generalDiscountAmount = 0,
  className,
}: Props) {
  if (lines.length === 0 && !(generalDiscountAmount > 0)) return null

  return (
    <ul className={cn("mt-2 space-y-1", className)}>
      {lines.map((line, index) => (
        <li key={`${line.name}-${index}`}>
          <div className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-baseline gap-x-2">
            <span className="font-numeric text-xs tabular-nums text-[var(--rootsy-bruma-500)]">
              {formatQuantity(line.quantity)}
            </span>
            <span className="min-w-0 truncate font-canopy text-xs leading-4 text-[var(--rootsy-bruma-700)]">
              {line.name}
            </span>
            <span className="font-numeric text-xs tabular-nums text-[var(--rootsy-bruma-700)]">
              {formatCashRegisterMoney(line.lineTotal)}
            </span>
          </div>
          {line.quantity !== 1 ||
          line.discountLabel ||
          line.extras ||
          line.comment ? (
            <div className="mt-0.5 pl-[calc(1.5rem+0.5rem)]">
              {line.quantity !== 1 ? (
                <p className="font-canopy text-[11px] leading-4 text-[var(--rootsy-bruma-500)]">
                  {formatCashRegisterMoney(line.unitPrice)} c/u
                  {line.discountLabel
                    ? ` · ${line.discountLabel}`
                    : line.discountAmount > 0
                      ? ` · −${formatCashRegisterMoney(line.discountAmount)}`
                      : ""}
                </p>
              ) : line.discountLabel || line.discountAmount > 0 ? (
                <p className="font-canopy text-[11px] leading-4 text-[var(--rootsy-bruma-500)]">
                  {line.discountLabel ??
                    `−${formatCashRegisterMoney(line.discountAmount)}`}
                </p>
              ) : null}
              {line.extras ? (
                <p className="truncate font-canopy text-[11px] leading-4 text-[var(--rootsy-bruma-500)]">
                  {line.extras}
                </p>
              ) : null}
              {line.comment ? (
                <p className="truncate font-canopy text-[11px] leading-4 text-[var(--rootsy-bruma-500)]">
                  {line.comment}
                </p>
              ) : null}
            </div>
          ) : null}
        </li>
      ))}
      {generalDiscountAmount > 0 ? (
        <li className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-baseline gap-x-2">
          <span aria-hidden />
          <span className="font-canopy text-[11px] leading-4 text-[var(--rootsy-bruma-500)]">
            Descuento general
          </span>
          <span className="font-numeric text-xs tabular-nums text-[var(--rootsy-bruma-500)]">
            −{formatCashRegisterMoney(generalDiscountAmount)}
          </span>
        </li>
      ) : null}
    </ul>
  )
}
