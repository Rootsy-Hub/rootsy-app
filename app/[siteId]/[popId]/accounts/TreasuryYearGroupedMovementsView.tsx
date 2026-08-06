"use client"

import type { TreasuryYearGroupedItems } from "@/app/[siteId]/[popId]/accounts/treasuryAccountUiUtils"
import type { DataWorkspaceDetailEmptyStateContent } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import {
  treasuryMovementListTokensFor,
  type TreasuryMovementListTokensVariant,
} from "@/app/[siteId]/[popId]/accounts/treasuryMovementListStyles"
import { cn } from "@/lib/utils"
import type { KeyboardEvent, ReactNode } from "react"

type Props<T> = {
  yearGroups: TreasuryYearGroupedItems<T>[]
  emptyState: DataWorkspaceDetailEmptyStateContent
  fullWidth?: boolean
  tokensVariant?: TreasuryMovementListTokensVariant
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
  emptyState,
  fullWidth = false,
  tokensVariant = "default",
  className,
  rowClassName,
  getRowKey,
  renderRow,
}: Props<T>) {
  const tokens = treasuryMovementListTokensFor(tokensVariant)
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
      <DataWorkspaceDetailEmptyState
        {...emptyState}
        className={cn("min-h-48 flex-1", className)}
      />
    )
  }

  return (
    <div
      className={cn(
        !fullWidth && cn("rounded-lg border", tokens.containerBorder),
        className,
      )}
    >
      {yearGroups.map((yearGroup, yearIndex) => (
        <section
          key={yearGroup.year}
          className={cn(yearIndex > 0 && cn("border-t", tokens.sectionBorder))}
        >
          <h3 className={cn("px-4 pt-4 pb-1 lg:px-5", tokens.yearHeading)}>
            {yearGroup.year}
          </h3>

          {yearGroup.dateGroups.map((group) => (
            <section key={group.dateKey}>
              <h4 className={cn("px-4 pt-2 pb-0 lg:px-5", tokens.dateHeading)}>
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
                        showTopBorder && cn("border-t", tokens.rowBorder),
                        row.onClick &&
                          cn(
                            "cursor-pointer transition-colors duration-150",
                            tokens.rowHover,
                          ),
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
                          className={cn(tokens.description, row.descriptionClassName)}
                        >
                          {row.description}
                        </div>
                        {row.subtitle ? (
                          <p className={cn("mt-0.5", tokens.subtitle)}>
                            {row.subtitle}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className={cn(tokens.amount, row.amountClassName)}>
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
