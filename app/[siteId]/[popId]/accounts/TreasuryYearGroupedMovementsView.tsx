"use client"

import type { TreasuryYearGroupedItems } from "@/app/[siteId]/[popId]/accounts/treasuryAccountUiUtils"
import { cn } from "@/lib/utils"
import type { KeyboardEvent, ReactNode } from "react"

type Props<T> = {
  yearGroups: TreasuryYearGroupedItems<T>[]
  emptyMessage: string
  fullWidth?: boolean
  className?: string
  rowClassName?: string
  getRowKey: (item: T) => string
  renderRow: (item: T) => {
    description: ReactNode
    subtitle?: ReactNode
    amount: string
    suppressTopBorder?: boolean
    trailing?: ReactNode
    onClick?: () => void
    descriptionClassName?: string
    amountClassName?: string
  }
}

export function TreasuryYearGroupedMovementsView<T>({
  yearGroups,
  emptyMessage,
  fullWidth = false,
  className,
  rowClassName,
  getRowKey,
  renderRow,
}: Props<T>) {
  const totalItems = yearGroups.reduce(
    (sum, yearGroup) =>
      sum +
      yearGroup.dateGroups.reduce(
        (daySum, dateGroup) => daySum + dateGroup.items.length,
        0,
      ),
    0,
  )

  if (totalItems === 0) {
    return (
      <div
        className={cn(
          "flex min-h-48 items-center justify-center px-4 py-10 text-center text-sm text-muted-foreground lg:px-5",
          !fullWidth && "rounded-lg border border-border/60",
          className,
        )}
      >
        {emptyMessage}
      </div>
    )
  }

  return (
    <div
      className={cn(
        !fullWidth && "rounded-lg border border-border/60",
        className,
      )}
    >
      {yearGroups.map((yearGroup, yearIndex) => (
        <section
          key={yearGroup.year}
          className={cn(yearIndex > 0 && "border-t border-border/60")}
        >
          <h3 className="px-4 pt-4 pb-1 text-base font-bold text-foreground lg:px-5">
            {yearGroup.year}
          </h3>

          {yearGroup.dateGroups.map((group) => (
            <section key={group.dateKey}>
              <h4 className="px-4 pt-2 pb-0 text-sm font-bold text-foreground lg:px-5">
                {group.dateLabel}
              </h4>
              <ul>
                {group.items.map((item, itemIndex) => {
                  const row = renderRow(item)
                  const showTopBorder =
                    itemIndex > 0 && !row.suppressTopBorder
                  return (
                    <li
                      key={getRowKey(item)}
                      className={cn(
                        "flex items-start justify-between gap-4 px-4 py-3 lg:px-5",
                        showTopBorder && "border-t border-border/40",
                        row.onClick &&
                          "cursor-pointer transition-colors duration-150 hover:bg-muted/35",
                        rowClassName,
                      )}
                      {...(row.onClick
                        ? {
                            role: "button" as const,
                            tabIndex: 0,
                            onClick: row.onClick,
                            onKeyDown: (event: KeyboardEvent<HTMLLIElement>) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault()
                                row.onClick?.()
                              }
                            },
                          }
                        : {})}
                    >
                      <div className="min-w-0 flex-1">
                        <div
                          className={cn(
                            "text-sm leading-snug text-foreground",
                            row.descriptionClassName,
                          )}
                        >
                          {row.description}
                        </div>
                        {row.subtitle ? (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {row.subtitle}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={cn(
                            "whitespace-nowrap font-numeric text-sm tabular-nums tracking-tight text-foreground",
                            row.amountClassName,
                          )}
                        >
                          {row.amount}
                        </span>
                        {row.trailing}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </section>
      ))}
    </div>
  )
}
