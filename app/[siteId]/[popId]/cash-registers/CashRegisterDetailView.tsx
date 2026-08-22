"use client"

import type {
  CashRegisterRow,
  CashRegisterSummaryData,
} from "@/app/[siteId]/[popId]/cash-registers/actions"
import {
  fetchCashRegisterPage,
  fetchCashRegisterTotals,
  mergeCashRegisterSummary,
} from "@/lib/rootsyApi/cashRegistersClient"
import { CashRegisterDetailHeaderCard } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterDetailHeaderCard"
import { CashRegisterClosedSessionsPanel } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterClosedSessionsPanel"
import {
  CashRegisterDetailContentSkeleton,
  CashRegisterDetailSkeleton,
  resolveCashRegisterDetailSkeletonVariant,
} from "@/app/[siteId]/[popId]/cash-registers/CashRegisterDetailSkeleton"
import { CashRegisterSessionArqueoPanel } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterSessionArqueoPanel"
import { findOpenSession } from "@/app/[siteId]/[popId]/cash-registers/cashRegisterDetailUtils"
import {
  computeDataWorkspaceDateBounds,
  type DataWorkspaceDatePreset,
} from "@/lib/dataWorkspaceDateFilter"
import { cn } from "@/lib/utils"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import type { DateRange } from "react-day-picker"

type Props = {
  siteId: string
  popId: string
  registerId: string
  register?: CashRegisterRow | null
  refreshToken?: number
}

type ContentView = "history" | "arqueo"

export function CashRegisterDetailView({
  siteId,
  popId,
  registerId,
  register,
  refreshToken = 0,
}: Props) {
  const searchParams = useSearchParams()
  const entryHint =
    searchParams.get("v") === "arqueo"
      ? ("arqueo" as const)
      : searchParams.get("v") === "history"
        ? ("history" as const)
        : null
  const cashRegistersBasePath = `/${siteId}/${popId}/cash-registers`
  const [data, setData] = useState<CashRegisterSummaryData | null>(null)
  const [registerActive, setRegisterActive] = useState(
    register?.isActive !== false,
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contentView, setContentView] = useState<ContentView>("history")
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [historyRequested, setHistoryRequested] = useState(false)
  const [datePreset, setDatePreset] =
    useState<DataWorkspaceDatePreset>("this_month")
  const [customDateRange, setCustomDateRange] = useState<
    DateRange | undefined
  >(undefined)

  const loadSummary = useCallback(async () => {
    setLoading(true)
    setError(null)
    const pageRes = await fetchCashRegisterPage(popId, registerId)
    if (!pageRes.success) {
      setLoading(false)
      setData(null)
      setError(pageRes.error)
      return
    }
    setRegisterActive(pageRes.data.isActive)
    setData(mergeCashRegisterSummary(pageRes.data, null))
    const totalsRes = await fetchCashRegisterTotals(popId, registerId)
    setLoading(false)
    if (!totalsRes.success) return
    setData(mergeCashRegisterSummary(pageRes.data, totalsRes.data))
  }, [popId, registerId])

  useEffect(() => {
    void loadSummary()
  }, [loadSummary, refreshToken])

  useEffect(() => {
    setContentView("history")
    setSelectedSessionId(null)
    setHistoryRequested(false)
  }, [registerId])

  const openSession = useMemo(
    () => (data ? findOpenSession(data.sessions) : null),
    [data],
  )

  const activeSessionId = useMemo(() => {
    if (historyRequested) {
      return contentView === "arqueo" ? selectedSessionId : null
    }
    if (contentView === "arqueo" && selectedSessionId) {
      return selectedSessionId
    }
    return openSession?.id ?? null
  }, [
    contentView,
    historyRequested,
    openSession,
    selectedSessionId,
  ])

  const isOpen = Boolean(openSession)
  const displayName = register?.name ?? data?.registerName ?? "—"

  const dateBounds = useMemo(
    () => computeDataWorkspaceDateBounds(datePreset, customDateRange),
    [datePreset, customDateRange],
  )

  const isLiveOpenArqueo =
    isOpen &&
    !historyRequested &&
    activeSessionId === openSession?.id

  const activeSession = useMemo(
    () =>
      activeSessionId
        ? (data?.sessions.find((session) => session.id === activeSessionId) ??
          null)
        : null,
    [activeSessionId, data?.sessions],
  )

  const showInitialSkeleton = loading && !data
  const isArqueoView = Boolean(activeSessionId)
  const isHistoryListView = !activeSessionId
  const useFlushBottomLayout = isArqueoView || isHistoryListView
  const skeletonVariant = resolveCashRegisterDetailSkeletonVariant({
    isArqueoView,
    entryHint,
    hasSummaryData: data != null,
  })

  if (showInitialSkeleton) {
    return (
      <div
        className={cn(
          "relative flex w-full flex-1 flex-col",
          useFlushBottomLayout
            ? "min-h-full gap-6 px-4 pt-6 pb-0 sm:px-6 lg:px-8"
            : "gap-6 px-4 py-6 sm:px-6 lg:px-8",
        )}
      >
        <CashRegisterDetailSkeleton variant={skeletonVariant} />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative flex w-full flex-col",
        useFlushBottomLayout && "min-h-full flex-1",
      )}
    >
      <div
        className={cn(
          "relative flex w-full flex-col",
          useFlushBottomLayout
            ? "min-h-full flex-1 gap-6 px-4 pt-6 pb-0 sm:px-6 lg:px-8"
            : "gap-6 px-4 py-6 sm:px-6 lg:px-8",
        )}
      >
        <div className="shrink-0">
          <CashRegisterDetailHeaderCard
            registerName={displayName}
            isRegisterOpen={isOpen}
            isRegisterActive={registerActive}
            cashRegistersBasePath={cashRegistersBasePath}
            activeSession={activeSession}
            showHistorialAction={isLiveOpenArqueo}
            onShowHistory={() => {
              setHistoryRequested(true)
              setContentView("history")
              setSelectedSessionId(null)
            }}
            onBack={
              !isLiveOpenArqueo && activeSession
                ? () => {
                    setContentView("history")
                    setSelectedSessionId(null)
                  }
                : undefined
            }
          />
        </div>

      {loading ? (
        <CashRegisterDetailContentSkeleton variant={skeletonVariant} />
      ) : error ? (
        <div className="rounded-[1.375rem] border border-[color-mix(in_srgb,var(--color-status-danger)_25%,var(--rootsy-bruma-200))] bg-[color-mix(in_srgb,var(--color-status-danger)_6%,white)] px-4 py-3 font-canopy text-sm text-[var(--color-status-danger)]">
          {error}
        </div>
      ) : data ? (
        activeSessionId ? (
          <CashRegisterSessionArqueoPanel
            siteId={siteId}
            popId={popId}
            sessionId={activeSessionId}
            refreshToken={refreshToken}
            className="flex flex-1 flex-col"
          />
        ) : (
          <CashRegisterClosedSessionsPanel
            sessions={data.sessions}
            datePreset={datePreset}
            customDateRange={customDateRange}
            dateBounds={dateBounds}
            operationalDayCloseTime={data.operationalDayCloseTime}
            onPresetChange={setDatePreset}
            onCustomRangeChange={setCustomDateRange}
            onViewArqueo={(sessionId) => {
              setContentView("arqueo")
              setSelectedSessionId(sessionId)
            }}
          />
        )
      ) : null}
      </div>
    </div>
  )
}
