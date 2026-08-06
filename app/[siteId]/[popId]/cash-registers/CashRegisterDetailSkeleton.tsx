"use client"

import {
  dataWorkspaceBlocksSkeletonTone,
  dataWorkspaceDetailBodyClass,
  dataWorkspaceDetailCardClass,
  dataWorkspaceDetailCardHeaderClass,
  dataWorkspaceDetailCardStatsClass,
  dataWorkspaceDetailFlushBottomCardClass,
  dataWorkspaceDetailPanelClass,
  dataWorkspaceDetailToolbarClass,
  dataWorkspaceFlushBottomPanelBodyClass,
  dataWorkspaceFlushBottomPanelChromeClass,
  dataWorkspaceFlushBottomPanelClass,
  workspaceTableLayoutClassName,
  workspaceTableNatureSkeletonTone,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  workspaceTableLayoutHeaderHeadClass,
  workspaceTableLayoutListBodyScopeClass,
  workspaceTableLayoutListSurfaceClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { workspaceLayoutsTablesScopeClass } from "@/components/layouts-tables/rootsLayoutsTablesProductStyles"
import { cn } from "@/lib/utils"
import "@/components/layouts-tables/rootsLayoutsTablesScope.css"

const sk = dataWorkspaceBlocksSkeletonTone
const skTable = workspaceTableNatureSkeletonTone

const OPERATION_ROW_WIDTHS = ["w-[72%]", "w-[58%]", "w-[64%]", "w-[52%]", "w-[60%]"] as const

/** `history` = listado de arqueos · `arqueo` = detalle de turno (abierto o cerrado). */
export type CashRegisterDetailSkeletonVariant = "history" | "arqueo"

function CashRegisterDetailHeaderSkeleton({
  variant = "history",
}: {
  variant?: CashRegisterDetailSkeletonVariant
}) {
  const isArqueo = variant === "arqueo"

  return (
    <article aria-hidden className={dataWorkspaceDetailCardClass}>
      <div className={dataWorkspaceDetailCardHeaderClass}>
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className={cn("size-10 shrink-0 rounded-xl", sk.box)} />
          <div className={cn("size-11 shrink-0 rounded-xl", sk.box)} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 space-y-2">
                <div className={cn("h-2.5 w-32", sk.pill)} />
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  <div className={cn("h-7 w-36 max-w-full sm:w-44", sk.bar)} />
                  {isArqueo ? (
                    <>
                      <div className={cn("hidden h-3 w-2 sm:block", sk.pill)} />
                      <div className={cn("h-4 w-20", sk.barSm)} />
                    </>
                  ) : null}
                  <div className={cn("h-6 w-20 rounded-full", sk.pill)} />
                </div>
              </div>
              {isArqueo ? (
                <div className={cn("hidden h-8 w-40 rounded-[12px] lg:block", sk.box)} />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {isArqueo ? (
        <div className={cn(dataWorkspaceDetailCardStatsClass, "sm:grid-cols-3")}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className={cn("h-2.5 w-24", sk.pill)} />
              <div className={cn("h-8 w-28", sk.bar)} />
            </div>
          ))}
        </div>
      ) : null}
    </article>
  )
}

function CashRegisterArqueoComparisonSkeleton({
  sessionOpen = true,
}: {
  sessionOpen?: boolean
}) {
  return (
    <section
      aria-hidden
      className={cn(dataWorkspaceDetailPanelClass, "shrink-0 overflow-hidden")}
    >
      <div className="grid gap-0 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, columnIndex) => (
          <div
            key={columnIndex}
            className={cn(
              "border-b border-[var(--rootsy-bruma-200)] lg:border-b-0",
              columnIndex === 0 && "lg:border-r",
            )}
          >
            <div className="space-y-2 border-b border-[var(--rootsy-bruma-200)] px-4 py-3 sm:px-5">
              <div className={cn("h-2.5 w-16", sk.pill)} />
              <div className={cn("h-4 w-40 max-w-full", sk.barSm)} />
              <div className={cn("h-4 w-28 max-w-full", sk.barSm)} />
            </div>
            {columnIndex === 1 && sessionOpen ? (
              <div className="flex min-h-56 flex-col items-center justify-center gap-3 px-4 py-10">
                <div className={cn("size-12 rounded-full", sk.box)} />
                <div className={cn("h-4 w-48 max-w-full", sk.barSm)} />
              </div>
            ) : (
              <div className={cn(dataWorkspaceDetailBodyClass, "space-y-3")}>
                {Array.from({ length: columnIndex === 0 ? 4 : 3 }).map(
                  (___, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="flex items-center justify-between gap-3 py-0.5"
                    >
                      <div className={cn("h-4 w-32 max-w-[55%]", sk.barSm)} />
                      <div className={cn("h-4 w-20 shrink-0", sk.barSm)} />
                    </div>
                  ),
                )}
                {columnIndex === 0 ? (
                  <div className="pt-2">
                    <div className={cn("mb-2 h-2.5 w-36", sk.pill)} />
                    <div className="space-y-3">
                      {Array.from({ length: 2 }).map((__, rowIndex) => (
                        <div
                          key={rowIndex}
                          className="flex items-center justify-between gap-3 py-0.5"
                        >
                          <div className={cn("h-4 w-28 max-w-[55%]", sk.barSm)} />
                          <div className={cn("h-4 w-20 shrink-0", sk.barSm)} />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function CashRegisterOperationsListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div aria-hidden className="min-h-0 flex-1">
      <div className="px-4 pt-4 pb-1 lg:px-5">
        <div className={cn("h-4 w-10", sk.bar)} />
      </div>
      <div className="px-4 py-2 lg:px-5">
        <div className={cn("h-3.5 w-28", sk.barSm)} />
      </div>
      <ul>
        {Array.from({ length: rows }).map((_, index) => (
          <li
            key={index}
            className={cn(
              "flex items-start justify-between gap-4 px-4 py-3 lg:px-5",
              index > 0 && "border-t border-[var(--rootsy-bruma-200)]",
            )}
          >
            <div className="min-w-0 flex-1 space-y-1.5">
              <div
                className={cn(
                  "h-4",
                  sk.barSm,
                  OPERATION_ROW_WIDTHS[index % OPERATION_ROW_WIDTHS.length],
                )}
              />
              <div className={cn("h-3 w-36 max-w-full", sk.pill)} />
            </div>
            <div className={cn("h-4 w-16 shrink-0", sk.barSm)} />
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3 px-4 py-6 lg:px-5">
        <div className={cn("h-px flex-1", sk.pill)} />
        <div className={cn("h-3 w-36", sk.barSm)} />
        <div className={cn("h-px flex-1", sk.pill)} />
      </div>
    </div>
  )
}

function CashRegisterOperationsPanelSkeleton() {
  return (
    <section aria-hidden className={cn(dataWorkspaceFlushBottomPanelClass, "min-h-0 flex-1")}>
      <div
        className={cn(
          "shrink-0 border-b border-[var(--rootsy-bruma-200)] px-4 py-4 lg:px-5",
          dataWorkspaceFlushBottomPanelChromeClass,
        )}
      >
        <div className={cn("h-10 w-full rounded-[12px]", sk.box)} />
      </div>
      <div className={cn(dataWorkspaceFlushBottomPanelBodyClass, "min-h-0 flex-1")}>
        <CashRegisterOperationsListSkeleton />
      </div>
    </section>
  )
}

function CashRegisterArqueosHistorySkeleton() {
  return (
    <article aria-hidden className={dataWorkspaceDetailFlushBottomCardClass}>
      <div
        className={cn(
          dataWorkspaceDetailToolbarClass,
          "lg:flex-row lg:items-center lg:justify-between",
        )}
      >
        <div className={cn("h-9 w-44 shrink-0 rounded-[12px]", sk.box)} />
        <div className={cn("h-3 w-32 lg:text-right", sk.barSm)} />
      </div>

      <div
        className={cn(
          "min-h-0 flex-1 overflow-hidden",
          workspaceLayoutsTablesScopeClass,
          workspaceTableLayoutListSurfaceClass,
          workspaceTableLayoutListBodyScopeClass,
        )}
      >
        <div
          className={cn(
            workspaceTableLayoutClassName,
            workspaceTableLayoutHeaderHeadClass,
            "grid h-10 grid-cols-[4rem_minmax(11rem,1fr)_minmax(11rem,1fr)_8rem_7rem] items-center gap-3 px-3",
          )}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className={cn("h-2.5 max-w-16", skTable.pill)} />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "grid h-14 grid-cols-[4rem_minmax(11rem,1fr)_minmax(11rem,1fr)_8rem_7rem] gap-3 border-b border-[var(--wt-border)] px-3 last:border-b-0",
              index % 2 === 1 && "bg-[color-mix(in_srgb,var(--rootsy-bruma-50)_65%,white)]",
            )}
          >
            <div className={cn("h-4 w-8 self-center", skTable.barSm)} />
            <div className="flex flex-col justify-center gap-1.5">
              <div className={cn("h-4 w-full max-w-32", skTable.barSm)} />
              <div className={cn("h-3 w-full max-w-24", skTable.barSm)} />
            </div>
            <div className="flex flex-col justify-center gap-1.5">
              <div className={cn("h-4 w-full max-w-28", skTable.barSm)} />
              <div className={cn("h-3 w-full max-w-20", skTable.barSm)} />
            </div>
            <div className={cn("h-4 w-full max-w-20 justify-self-end self-center", skTable.barSm)} />
            <div className={cn("h-4 w-full max-w-16 justify-self-end self-center", skTable.barSm)} />
          </div>
        ))}
      </div>
    </article>
  )
}

export function CashRegisterSessionArqueoSkeleton({
  className,
  sessionOpen = true,
}: {
  className?: string
  sessionOpen?: boolean
}) {
  return (
    <div
      aria-hidden
      className={cn("flex min-h-0 flex-1 flex-col gap-6", className)}
    >
      <CashRegisterArqueoComparisonSkeleton sessionOpen={sessionOpen} />
      <CashRegisterOperationsPanelSkeleton />
    </div>
  )
}

export function CashRegisterDetailSkeleton({
  variant = "history",
}: {
  variant?: CashRegisterDetailSkeletonVariant
}) {
  const isArqueo = variant === "arqueo"

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando detalle de caja"
      className="flex min-h-full w-full flex-1 flex-col gap-6"
    >
      <CashRegisterDetailHeaderSkeleton variant={variant} />
      {isArqueo ? (
        <CashRegisterSessionArqueoSkeleton className="flex-1" sessionOpen />
      ) : (
        <CashRegisterArqueosHistorySkeleton />
      )}
      <span className="sr-only">Cargando detalle de caja…</span>
    </div>
  )
}

export function CashRegisterDetailContentSkeleton({
  variant = "history",
}: {
  variant?: CashRegisterDetailSkeletonVariant
}) {
  return variant === "arqueo" ? (
    <CashRegisterSessionArqueoSkeleton className="flex-1" />
  ) : (
    <CashRegisterArqueosHistorySkeleton />
  )
}

/** @deprecated Usar CashRegisterDetailSkeletonVariant */
export type CashRegisterDetailSkeletonLegacyVariant = "open" | "closed"

export function resolveCashRegisterDetailSkeletonVariant(options: {
  isArqueoView: boolean
  entryHint?: "arqueo" | "history" | null
  hasSummaryData: boolean
}): CashRegisterDetailSkeletonVariant {
  if (options.isArqueoView) return "arqueo"
  if (!options.hasSummaryData && options.entryHint === "arqueo") return "arqueo"
  return "history"
}
