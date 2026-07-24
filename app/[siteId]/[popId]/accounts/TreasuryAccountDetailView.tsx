"use client"

import {
  getTreasuryAccountPageData,
  type TreasuryAccountTableRow,
  type TreasuryChildAccountRow,
  type TreasuryFundingOption,
} from "@/app/[siteId]/[popId]/accounts/actions"
import {
  TreasuryBrandIsotype,
  TreasuryBrandName,
} from "@/app/[siteId]/[popId]/accounts/TreasuryBrandMark"
import {
  addManualBankStatementLine,
  clearMovementReconciliation,
  deleteBankStatementLine,
  getTreasuryAccountDetail,
  importBankStatementCsv,
  recordPosAcreditationForAccount,
  recordTreasurySettlementForAccount,
  setMovementReconciliation,
  type BankStatementLineRow,
  type PaymentMethodMovementRow,
  type TreasuryAccountDetailResult,
  type TreasurySettlementRow,
} from "@/app/[siteId]/[popId]/accounts/treasuryDetailActions"
import {
  defaultTreasuryPeriodEnd,
  defaultTreasuryPeriodStart,
  findMatchingBankStatementLine,
  formatTreasuryShortDate,
  treasuryMoneyFmt as fmt,
  treasuryMovementKindLabel,
} from "@/app/[siteId]/[popId]/accounts/treasuryAccountUiUtils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { resolveTreasuryAccountBrand } from "@/lib/treasuryAccountBrands"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  CreditCard,
  Landmark,
  Trash2,
  Upload,
  Wifi,
} from "lucide-react"
import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react"

type DetailSection = "resumen" | "movimientos" | "conciliacion"

function moneyOrDash(amount: number | null | undefined): string {
  if (amount == null) return "—"
  return fmt.format(amount)
}

function BalanceTile({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: "amber"
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3",
        highlight
          ? "border-amber-200/70 bg-amber-50/80 dark:border-amber-900/40 dark:bg-amber-950/30"
          : "border-border/60 bg-muted/20",
      )}
    >
      <p
        className={cn(
          "text-[10px] font-semibold uppercase tracking-wide",
          highlight ? "text-amber-900/80" : "text-muted-foreground",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-mono text-xl font-bold tabular-nums",
          highlight ? "text-amber-950 dark:text-amber-100" : "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  )
}

function ChildIntegrationCard({
  child,
  canSettle,
  canUpdate,
  onPayCard,
  onAcreditPos,
  onOpenDetail,
}: {
  child: TreasuryChildAccountRow
  canSettle: boolean
  canUpdate: boolean
  onPayCard: (child: TreasuryChildAccountRow) => void
  onAcreditPos: (child: TreasuryChildAccountRow) => void
  onOpenDetail: (childId: string) => void
}) {
  const isPos = child.childRole === "pos"
  const balance = isPos
    ? (child.ledgerBalance ?? 0)
    : child.outstandingBalance

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {isPos ? "Terminal POS" : "Tarjeta corporativa"}
          </p>
          <button
            type="button"
            className="mt-1 truncate text-left text-base font-semibold text-foreground hover:underline"
            onClick={() => onOpenDetail(child.id)}
          >
            {child.name}
          </button>
        </div>
        {isPos ? (
          <Wifi className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        ) : (
          <CreditCard className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        )}
      </div>
      <p className="mt-3 font-mono text-2xl font-bold tabular-nums">
        {fmt.format(balance)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {isPos ? "A liquidar en este terminal" : "Deuda pendiente del resumen"}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {isPos && canUpdate && balance > 0 ? (
          <Button type="button" size="sm" onClick={() => onAcreditPos(child)}>
            Registrar acreditación
          </Button>
        ) : null}
        {!isPos && canSettle && balance > 0 ? (
          <Button type="button" size="sm" onClick={() => onPayCard(child)}>
            Pagar resumen
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onOpenDetail(child.id)}
        >
          Ver detalle
        </Button>
      </div>
    </div>
  )
}

export function TreasuryAccountDetailView({
  popId,
  accountId,
  onOpenAccount,
  onHubRefresh,
  onAccountMetaChange,
}: {
  popId: string
  accountId: string
  onOpenAccount: (accountId: string) => void
  onHubRefresh?: () => void | Promise<void>
  onAccountMetaChange?: (account: TreasuryAccountTableRow) => void
}) {
  const [account, setAccount] = useState<TreasuryAccountTableRow | null>(null)
  const [children, setChildren] = useState<TreasuryChildAccountRow[]>([])
  const [isMother, setIsMother] = useState(true)
  const [parentAccount, setParentAccount] = useState<{
    id: string
    name: string
  } | null>(null)
  const [fundingAccounts, setFundingAccounts] = useState<TreasuryFundingOption[]>(
    [],
  )
  const [canUpdate, setCanUpdate] = useState(false)
  const [canSettle, setCanSettle] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [detailData, setDetailData] = useState<TreasuryAccountDetailResult | null>(
    null,
  )
  const [section, setSection] = useState<DetailSection>("resumen")
  const [periodFrom, setPeriodFrom] = useState(defaultTreasuryPeriodStart)
  const [periodTo, setPeriodTo] = useState(defaultTreasuryPeriodEnd)

  const [csvText, setCsvText] = useState("")
  const [csvImporting, setCsvImporting] = useState(false)
  const [csvBanner, setCsvBanner] = useState<string | null>(null)
  const [manualDate, setManualDate] = useState(defaultTreasuryPeriodEnd())
  const [manualDesc, setManualDesc] = useState("")
  const [manualAmount, setManualAmount] = useState("")
  const [manualDirection, setManualDirection] = useState<"in" | "out">("out")
  const [manualSaving, setManualSaving] = useState(false)
  const [reconcileBusyKey, setReconcileBusyKey] = useState<string | null>(null)

  const [settleChild, setSettleChild] = useState<TreasuryChildAccountRow | null>(
    null,
  )
  const [settleAmount, setSettleAmount] = useState("")
  const [settleDate, setSettleDate] = useState(defaultTreasuryPeriodEnd())
  const [settleFundingId, setSettleFundingId] = useState("")
  const [settleNotes, setSettleNotes] = useState("")
  const [settleSaving, setSettleSaving] = useState(false)
  const [settleBanner, setSettleBanner] = useState<string | null>(null)

  const [posChild, setPosChild] = useState<TreasuryChildAccountRow | null>(null)
  const [posAmount, setPosAmount] = useState("")
  const [posDate, setPosDate] = useState(defaultTreasuryPeriodEnd())
  const [posNotes, setPosNotes] = useState("")
  const [posSaving, setPosSaving] = useState(false)
  const [posBanner, setPosBanner] = useState<string | null>(null)

  const loadPage = useCallback(async () => {
    if (!popId || !accountId) return null
    const res = await getTreasuryAccountPageData(popId, accountId)
    if (!res.success) {
      setError(res.error || "Error")
      return null
    }
    setAccount(res.account)
    setChildren(res.children)
    setIsMother(res.isMother)
    setParentAccount(res.parentAccount)
    setFundingAccounts(res.fundingAccounts)
    setCanUpdate(res.canUpdate)
    setCanSettle(res.canSettle)
    setError(null)
    return res
  }, [popId, accountId])

  useEffect(() => {
    if (account) onAccountMetaChange?.(account)
  }, [account, onAccountMetaChange])

  const loadDetail = useCallback(
    async (pageRes?: Awaited<ReturnType<typeof getTreasuryAccountPageData>>) => {
      if (!popId || !accountId) return
      setDetailLoading(true)
      setDetailError(null)

      let childIds: string[] = []
      if (pageRes?.success && pageRes.isMother) {
        childIds = pageRes.children.map((c) => c.id)
      } else if (isMother && children.length > 0) {
        childIds = children.map((c) => c.id)
      }

      const res = await getTreasuryAccountDetail(popId, accountId, {
        dateFrom: periodFrom,
        dateTo: periodTo,
        includeRelatedAccounts: childIds.length > 0,
        relatedTreasuryAccountIds: childIds,
      })
      setDetailLoading(false)
      if (!res.success) {
        setDetailError(res.error)
        return
      }
      setDetailData(res.data)
    },
    [popId, accountId, periodFrom, periodTo, isMother, children],
  )

  useEffect(() => {
    if (!popId || !accountId) {
      setLoading(false)
      setError("No se encontró la cuenta.")
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setSection("resumen")
      setError(null)
      setDetailData(null)
      try {
        const pageRes = await loadPage()
        if (cancelled || !pageRes?.success) return

        setDetailLoading(true)
        setDetailError(null)
        const childIds = pageRes.children.map((c) => c.id)
        const res = await getTreasuryAccountDetail(popId, accountId, {
          dateFrom: periodFrom,
          dateTo: periodTo,
          includeRelatedAccounts: pageRes.isMother && childIds.length > 0,
          relatedTreasuryAccountIds: childIds,
        })
        if (!cancelled) {
          setDetailLoading(false)
          if (!res.success) setDetailError(res.error)
          else setDetailData(res.data)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popId, accountId])

  const reloadAll = useCallback(async () => {
    const pageRes = await loadPage()
    if (pageRes?.success) await loadDetail(pageRes)
    await onHubRefresh?.()
  }, [loadPage, loadDetail, onHubRefresh])

  const applyPeriod = async () => {
    await loadDetail()
  }

  const handleImportCsv = async () => {
    if (!popId || !csvText.trim()) return
    setCsvImporting(true)
    setCsvBanner(null)
    const res = await importBankStatementCsv(popId, accountId, csvText)
    setCsvImporting(false)
    if (!res.success) {
      setCsvBanner(res.error)
      return
    }
    const warn =
      res.warnings.length > 0
        ? `Importadas ${res.imported} líneas con ${res.warnings.length} advertencias.`
        : `Se importaron ${res.imported} líneas.`
    setCsvBanner(warn)
    setCsvText("")
    await reloadAll()
  }

  const handleAddManualLine = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId) return
    setManualSaving(true)
    setCsvBanner(null)
    const res = await addManualBankStatementLine(popId, accountId, {
      lineDate: manualDate,
      description: manualDesc,
      amount: Number(String(manualAmount).replace(",", ".")),
      direction: manualDirection,
    })
    setManualSaving(false)
    if (!res.success) {
      setCsvBanner(res.error)
      return
    }
    setManualDesc("")
    setManualAmount("")
    await reloadAll()
  }

  const handleDeleteStatementLine = async (lineId: string) => {
    if (!popId) return
    const res = await deleteBankStatementLine(popId, lineId)
    if (!res.success) {
      setCsvBanner(res.error)
      return
    }
    await reloadAll()
  }

  const handleReconcileMovement = async (m: PaymentMethodMovementRow) => {
    if (!popId) return
    const key = `${m.kind}:${m.movementRefId}`
    setReconcileBusyKey(key)
    const match =
      detailData?.statementLines != null
        ? findMatchingBankStatementLine(m, detailData.statementLines)
        : null
    const res = await setMovementReconciliation(
      popId,
      accountId,
      m.kind,
      m.movementRefId,
      match?.id ?? null,
    )
    setReconcileBusyKey(null)
    if (!res.success) {
      setDetailError(res.error)
      return
    }
    await reloadAll()
  }

  const handleUnreconcileMovement = async (m: PaymentMethodMovementRow) => {
    if (!popId) return
    const key = `${m.kind}:${m.movementRefId}`
    setReconcileBusyKey(key)
    const res = await clearMovementReconciliation(popId, m.kind, m.movementRefId)
    setReconcileBusyKey(null)
    if (!res.success) {
      setDetailError(res.error)
      return
    }
    await reloadAll()
  }

  const openPayCard = (child: TreasuryChildAccountRow) => {
    setSettleBanner(null)
    setSettleChild(child)
    setSettleAmount(
      child.outstandingBalance > 0 ? String(child.outstandingBalance) : "",
    )
    setSettleDate(defaultTreasuryPeriodEnd())
    setSettleFundingId(fundingAccounts[0]?.id ?? "")
    setSettleNotes("")
  }

  const submitSettle = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !settleChild) return
    setSettleSaving(true)
    setSettleBanner(null)
    const res = await recordTreasurySettlementForAccount(popId, {
      cardTreasuryAccountId: settleChild.id,
      fundingTreasuryAccountId: settleFundingId,
      amount: Number(String(settleAmount).replace(",", ".")),
      settledAt: settleDate,
      notes: settleNotes,
    })
    setSettleSaving(false)
    if (!res.success) {
      setSettleBanner(res.error)
      return
    }
    setSettleChild(null)
    await reloadAll()
  }

  const openPosAcredit = (child: TreasuryChildAccountRow) => {
    setPosBanner(null)
    setPosChild(child)
    setPosAmount(
      (child.ledgerBalance ?? 0) > 0 ? String(child.ledgerBalance) : "",
    )
    setPosDate(defaultTreasuryPeriodEnd())
    setPosNotes("")
  }

  const submitPosAcredit = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !posChild) return
    setPosSaving(true)
    setPosBanner(null)
    const motherId = isMother ? accountId : (parentAccount?.id ?? "")
    if (!motherId) {
      setPosBanner("No se encontró la cuenta madre.")
      setPosSaving(false)
      return
    }
    const res = await recordPosAcreditationForAccount(popId, {
      posTreasuryAccountId: posChild.id,
      motherTreasuryAccountId: motherId,
      amount: Number(String(posAmount).replace(",", ".")),
      creditedAt: posDate,
      notes: posNotes,
    })
    setPosSaving(false)
    if (!res.success) {
      setPosBanner(res.error)
      return
    }
    setPosChild(null)
    await reloadAll()
  }

  const brand = account
    ? resolveTreasuryAccountBrand({
        kind: account.kind,
        brandKey: account.brandKey,
        name: account.name,
      })
    : null

  const headerGradient =
    brand?.headerGradient ?? "from-muted via-muted/80 to-muted/60"
  const headerText = brand?.headerTextClass ?? "text-foreground"

  const posChildren = children.filter((c) => c.childRole === "pos")
  const cardChildren = children.filter((c) => c.childRole === "card_payable")
  const recentMovements = detailData?.movements.slice(0, 12) ?? []

  return (
    <>
      <div className="relative flex w-full min-h-0 flex-1 flex-col">
        <div className="relative flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          {loading ? (
              <p className="text-sm text-muted-foreground">Cargando cuenta…</p>
            ) : error ? (
              <div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : account ? (
              <>
                {parentAccount ? (
                  <p className="text-sm text-muted-foreground">
                    Vinculada a{" "}
                    <button
                      type="button"
                      className="font-medium text-foreground underline-offset-2 hover:underline"
                      onClick={() => onOpenAccount(parentAccount.id)}
                    >
                      {parentAccount.name}
                    </button>
                  </p>
                ) : null}

                <section
                  className={cn(
                    "overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm",
                  )}
                >
                  <div className={cn("bg-linear-to-br px-6 py-5", headerGradient)}>
                    <div className="flex flex-wrap items-center gap-4">
                      <TreasuryBrandIsotype
                        brandKey={brand?.key}
                        monogram={
                          brand?.monogram ??
                          (account.name.slice(0, 2).toUpperCase() || "—")
                        }
                        headerTextClass={headerText}
                        size="lg"
                      />
                      <div>
                        <TreasuryBrandName
                          preset={brand}
                          name={account.name}
                          textClass={headerText}
                          className="text-2xl"
                        />
                        <p className={cn("mt-1 text-sm opacity-85", headerText)}>
                          {account.accountingAccountLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
                    <BalanceTile
                      label="Saldo real"
                      value={moneyOrDash(account.ledgerBalance)}
                    />
                    <BalanceTile
                      label="A liquidar"
                      value={fmt.format(account.toLiquidateBalance)}
                    />
                    <BalanceTile
                      label="A pagar"
                      value={fmt.format(account.toPayBalance)}
                    />
                    {account.isCardPayable ? (
                      <BalanceTile
                        label="Deuda pendiente del resumen"
                        value={fmt.format(account.outstandingBalance)}
                        highlight="amber"
                      />
                    ) : null}
                  </div>
                </section>

                {isMother && (posChildren.length > 0 || cardChildren.length > 0) ? (
                  <section className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Landmark className="size-4 text-muted-foreground" />
                      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Integraciones vinculadas
                      </h2>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {posChildren.map((child) => (
                        <ChildIntegrationCard
                          key={child.id}
                          child={child}
                          canSettle={canSettle}
                          canUpdate={canUpdate}
                          onPayCard={openPayCard}
                          onAcreditPos={openPosAcredit}
                          onOpenDetail={onOpenAccount}
                        />
                      ))}
                      {cardChildren.map((child) => (
                        <ChildIntegrationCard
                          key={child.id}
                          child={child}
                          canSettle={canSettle}
                          canUpdate={canUpdate}
                          onPayCard={openPayCard}
                          onAcreditPos={openPosAcredit}
                          onOpenDetail={onOpenAccount}
                        />
                      ))}
                    </div>
                  </section>
                ) : null}

                {!isMother && account.isCardPayable && canSettle ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      disabled={account.outstandingBalance <= 0}
                      onClick={() =>
                        openPayCard({
                          id: account.id,
                          name: account.name,
                          kind: account.kind,
                          chartAccountCode: account.chartAccountCode,
                          ledgerBalance: account.ledgerBalance,
                          childRole: "card_payable",
                          outstandingBalance: account.outstandingBalance,
                          settledTotal: account.settledTotal,
                        })
                      }
                    >
                      Pagar resumen
                    </Button>
                  </div>
                ) : null}

                {!isMother &&
                !account.isCardPayable &&
                (account.ledgerBalance ?? 0) > 0 &&
                canUpdate &&
                parentAccount ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={() =>
                        openPosAcredit({
                          id: account.id,
                          name: account.name,
                          kind: account.kind,
                          chartAccountCode: account.chartAccountCode,
                          ledgerBalance: account.ledgerBalance,
                          childRole: "pos",
                          outstandingBalance: 0,
                          settledTotal: 0,
                        })
                      }
                    >
                      Registrar acreditación
                    </Button>
                  </div>
                ) : null}

                <section className="space-y-4">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Actividad y resumen
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Filtrá por período para ver entradas, salidas y movimientos
                        recientes.
                      </p>
                    </div>
                    <div className="flex gap-1 rounded-lg border border-border/60 p-1">
                      {(
                        [
                          ["resumen", "Resumen"],
                          ["movimientos", "Movimientos"],
                          ...(detailData?.supportsBankReconciliation
                            ? [["conciliacion", "Conciliación"] as const]
                            : []),
                        ] as const
                      ).map(([id, label]) => (
                        <button
                          key={id}
                          type="button"
                          className={cn(
                            "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                            section === id
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                          onClick={() => setSection(id)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border/60 bg-muted/15 p-4">
                    <div className="space-y-1">
                      <Label htmlFor="period-from" className="text-xs">
                        Desde
                      </Label>
                      <Input
                        id="period-from"
                        type="date"
                        value={periodFrom}
                        onChange={(e) => setPeriodFrom(e.target.value)}
                        className="h-9 w-40 bg-background"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="period-to" className="text-xs">
                        Hasta
                      </Label>
                      <Input
                        id="period-to"
                        type="date"
                        value={periodTo}
                        onChange={(e) => setPeriodTo(e.target.value)}
                        className="h-9 w-40 bg-background"
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={detailLoading}
                      onClick={() => void applyPeriod()}
                    >
                      {detailLoading ? "Actualizando…" : "Aplicar período"}
                    </Button>
                  </div>

                  {detailError ? (
                    <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                      {detailError}
                    </p>
                  ) : null}

                  {section === "resumen" && detailData ? (
                    <div className="grid gap-4 sm:grid-cols-3">
                      <BalanceTile
                        label="Entradas del período"
                        value={fmt.format(detailData.movementTotals.in)}
                      />
                      <BalanceTile
                        label="Salidas del período"
                        value={fmt.format(detailData.movementTotals.out)}
                      />
                      <BalanceTile
                        label="Neto del período"
                        value={fmt.format(detailData.movementTotals.net)}
                      />
                    </div>
                  ) : null}

                  {section === "resumen" && recentMovements.length > 0 ? (
                    <div>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Últimos movimientos
                      </h3>
                      <MovementList movements={recentMovements} compact />
                    </div>
                  ) : null}

                  {section === "movimientos" && detailData ? (
                    <div className="space-y-4">
                      {detailData.settlements.length > 0 ? (
                        <div>
                          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Liquidaciones del resumen
                          </h3>
                          <ul className="space-y-2 rounded-xl border border-border/60 p-3">
                            {detailData.settlements.map((s: TreasurySettlementRow) => (
                              <li
                                key={s.id}
                                className="flex items-start justify-between gap-2 text-sm"
                              >
                                <div>
                                  <p className="font-medium tabular-nums">
                                    {fmt.format(s.amount)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatTreasuryShortDate(s.settledAt)}
                                    {s.fundingMethodName
                                      ? ` · desde ${s.fundingMethodName}`
                                      : ""}
                                    {s.notes ? ` · ${s.notes}` : ""}
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {detailData.movements.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                          No hay movimientos en el período seleccionado.
                        </p>
                      ) : (
                        <MovementList
                          movements={detailData.movements}
                          supportsReconciliation={
                            detailData.supportsBankReconciliation
                          }
                          statementLines={detailData.statementLines}
                          canUpdate={canUpdate}
                          reconcileBusyKey={reconcileBusyKey}
                          onReconcile={handleReconcileMovement}
                          onUnreconcile={handleUnreconcileMovement}
                        />
                      )}
                    </div>
                  ) : null}

                  {section === "conciliacion" &&
                  detailData?.supportsBankReconciliation ? (
                    <ReconciliationPanel
                      detailData={detailData}
                      csvText={csvText}
                      setCsvText={setCsvText}
                      csvImporting={csvImporting}
                      csvBanner={csvBanner}
                      canUpdate={canUpdate}
                      manualDate={manualDate}
                      setManualDate={setManualDate}
                      manualDesc={manualDesc}
                      setManualDesc={setManualDesc}
                      manualAmount={manualAmount}
                      setManualAmount={setManualAmount}
                      manualDirection={manualDirection}
                      setManualDirection={setManualDirection}
                      manualSaving={manualSaving}
                      onImportCsv={() => void handleImportCsv()}
                      onAddManualLine={(e) => void handleAddManualLine(e)}
                      onDeleteLine={(id) => void handleDeleteStatementLine(id)}
                    />
                  ) : null}
                </section>
              </>
            ) : null}
        </div>
      </div>

      <Dialog open={settleChild !== null} onOpenChange={(o) => !o && setSettleChild(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pagar resumen</DialogTitle>
            <DialogDescription>
              Registrá el pago del resumen de{" "}
              <strong>{settleChild?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          {settleBanner ? (
            <p className="text-sm text-destructive">{settleBanner}</p>
          ) : null}
          <form className="space-y-4" onSubmit={(e) => void submitSettle(e)}>
            <div className="space-y-2">
              <Label htmlFor="settle-amount">Importe</Label>
              <Input
                id="settle-amount"
                type="number"
                min={0}
                step="0.01"
                required
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settle-date">Fecha de pago</Label>
              <Input
                id="settle-date"
                type="date"
                required
                value={settleDate}
                onChange={(e) => setSettleDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settle-funding">Pagado desde</Label>
              <select
                id="settle-funding"
                required
                value={settleFundingId}
                onChange={(e) => setSettleFundingId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {fundingAccounts.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="settle-notes">Notas (opcional)</Label>
              <Input
                id="settle-notes"
                value={settleNotes}
                onChange={(e) => setSettleNotes(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSettleChild(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={settleSaving}>
                {settleSaving ? "Registrando…" : "Registrar pago"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={posChild !== null} onOpenChange={(o) => !o && setPosChild(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar acreditación POS</DialogTitle>
            <DialogDescription>
              Transferí el saldo a liquidar de{" "}
              <strong>{posChild?.name}</strong> al saldo real de la cuenta madre.
            </DialogDescription>
          </DialogHeader>
          {posBanner ? (
            <p className="text-sm text-destructive">{posBanner}</p>
          ) : null}
          <form className="space-y-4" onSubmit={(e) => void submitPosAcredit(e)}>
            <div className="space-y-2">
              <Label htmlFor="pos-amount">Importe acreditado</Label>
              <Input
                id="pos-amount"
                type="number"
                min={0}
                step="0.01"
                required
                value={posAmount}
                onChange={(e) => setPosAmount(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pos-date">Fecha de acreditación</Label>
              <Input
                id="pos-date"
                type="date"
                required
                value={posDate}
                onChange={(e) => setPosDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pos-notes">Notas (opcional)</Label>
              <Input
                id="pos-notes"
                value={posNotes}
                onChange={(e) => setPosNotes(e.target.value)}
                placeholder="Ej. Liquidación semanal Mercado Pago"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPosChild(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={posSaving}>
                {posSaving ? "Registrando…" : "Registrar acreditación"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

function MovementList({
  movements,
  compact,
  supportsReconciliation,
  statementLines,
  canUpdate,
  reconcileBusyKey,
  onReconcile,
  onUnreconcile,
}: {
  movements: PaymentMethodMovementRow[]
  compact?: boolean
  supportsReconciliation?: boolean
  statementLines?: BankStatementLineRow[]
  canUpdate?: boolean
  reconcileBusyKey?: string | null
  onReconcile?: (m: PaymentMethodMovementRow) => void
  onUnreconcile?: (m: PaymentMethodMovementRow) => void
}) {
  return (
    <ul
      className={cn(
        "space-y-1 overflow-y-auto rounded-xl border border-border/60",
        compact ? "max-h-64" : "max-h-[32rem]",
      )}
    >
      {movements.map((m) => {
        const busyKey = `${m.kind}:${m.movementRefId}`
        const isBusy = reconcileBusyKey === busyKey
        const match =
          supportsReconciliation &&
          !m.reconciled &&
          statementLines &&
          statementLines.length > 0
            ? findMatchingBankStatementLine(m, statementLines)
            : null
        return (
          <li
            key={`${m.kind}-${m.id}-${m.sourceAccountName ?? ""}`}
            className="flex items-center justify-between gap-2 border-b border-border/40 px-3 py-2.5 last:border-0"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {m.label}
                {m.reconciled ? (
                  <CheckCircle2 className="ml-1 inline size-3.5 text-emerald-600" />
                ) : null}
              </p>
              <p className="text-xs text-muted-foreground">
                {treasuryMovementKindLabel(m.kind)} ·{" "}
                {formatTreasuryShortDate(m.date)}
                {m.sourceAccountName ? ` · ${m.sourceAccountName}` : ""}
                {match ? " · Coincide con extracto" : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  m.direction === "in"
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-rose-700 dark:text-rose-400",
                )}
              >
                {m.direction === "in" ? "+" : "−"}
                {fmt.format(m.amount)}
              </span>
              {supportsReconciliation && canUpdate && onReconcile && onUnreconcile ? (
                m.reconciled ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    disabled={isBusy}
                    onClick={() => onUnreconcile(m)}
                  >
                    {isBusy ? "…" : "Deshacer"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    disabled={isBusy}
                    onClick={() => onReconcile(m)}
                  >
                    {isBusy ? "…" : "Conciliar"}
                  </Button>
                )
              ) : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function ReconciliationPanel({
  detailData,
  csvText,
  setCsvText,
  csvImporting,
  csvBanner,
  canUpdate,
  manualDate,
  setManualDate,
  manualDesc,
  setManualDesc,
  manualAmount,
  setManualAmount,
  manualDirection,
  setManualDirection,
  manualSaving,
  onImportCsv,
  onAddManualLine,
  onDeleteLine,
}: {
  detailData: TreasuryAccountDetailResult
  csvText: string
  setCsvText: (v: string) => void
  csvImporting: boolean
  csvBanner: string | null
  canUpdate: boolean
  manualDate: string
  setManualDate: (v: string) => void
  manualDesc: string
  setManualDesc: (v: string) => void
  manualAmount: string
  setManualAmount: (v: string) => void
  manualDirection: "in" | "out"
  setManualDirection: (v: "in" | "out") => void
  manualSaving: boolean
  onImportCsv: () => void
  onAddManualLine: (e: FormEvent) => void
  onDeleteLine: (lineId: string) => void
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/60 bg-muted/15 px-4 py-3 text-sm">
        <p className="font-semibold">Conciliación bancaria</p>
        <p className="mt-1 text-muted-foreground">
          Movimientos:{" "}
          <strong className="text-foreground">
            {detailData.reconciliationSummary.movementsReconciled}
          </strong>{" "}
          conciliados ·{" "}
          <strong className="text-foreground">
            {detailData.reconciliationSummary.movementsPending}
          </strong>{" "}
          pendientes · Extracto:{" "}
          <strong className="text-foreground">
            {detailData.reconciliationSummary.statementReconciled}
          </strong>
          /{detailData.statementLines.length} usadas
        </p>
      </div>

      {csvBanner ? (
        <p
          className={cn(
            "rounded-lg border px-3 py-2 text-sm",
            csvBanner.startsWith("Se importaron") || csvBanner.includes("Importadas")
              ? "border-emerald-200/70 bg-emerald-50/80 text-emerald-900"
              : "border-destructive/25 bg-destructive/5 text-destructive",
          )}
        >
          {csvBanner}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="csv-import">Importar CSV (fecha, descripción, importe)</Label>
        <Textarea
          id="csv-import"
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          rows={4}
          className="font-mono text-xs"
          disabled={!canUpdate || csvImporting}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={!canUpdate || csvImporting || !csvText.trim()}
            onClick={onImportCsv}
          >
            <Upload className="mr-1.5 size-3.5" />
            {csvImporting ? "Importando…" : "Importar CSV"}
          </Button>
        </div>
      </div>

      <form
        className="space-y-3 rounded-xl border border-border/60 p-4"
        onSubmit={onAddManualLine}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Línea manual del extracto
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            required
            value={manualDate}
            onChange={(e) => setManualDate(e.target.value)}
            disabled={!canUpdate || manualSaving}
          />
          <select
            value={manualDirection}
            onChange={(e) => setManualDirection(e.target.value as "in" | "out")}
            className="flex h-10 rounded-md border border-input bg-background px-2 text-sm"
            disabled={!canUpdate || manualSaving}
          >
            <option value="out">Salida</option>
            <option value="in">Entrada</option>
          </select>
        </div>
        <Input
          required
          placeholder="Descripción"
          value={manualDesc}
          onChange={(e) => setManualDesc(e.target.value)}
          disabled={!canUpdate || manualSaving}
        />
        <Input
          type="number"
          min={0}
          step="0.01"
          required
          placeholder="Importe"
          value={manualAmount}
          onChange={(e) => setManualAmount(e.target.value)}
          className="font-mono"
          disabled={!canUpdate || manualSaving}
        />
        <Button type="submit" size="sm" disabled={!canUpdate || manualSaving}>
          {manualSaving ? "Agregando…" : "Agregar línea"}
        </Button>
      </form>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Líneas del extracto ({detailData.statementLines.length})
        </h3>
        {detailData.statementLines.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            Importá un CSV o cargá líneas manuales.
          </p>
        ) : (
          <ul className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-border/60">
            {detailData.statementLines.map((line) => (
              <li
                key={line.id}
                className="flex items-center justify-between gap-2 border-b border-border/40 px-3 py-2 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{line.description || "Sin descripción"}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTreasuryShortDate(line.lineDate)} ·{" "}
                    {line.source === "csv" ? "CSV" : "Manual"}
                    {line.reconciled ? " · Conciliada" : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 text-sm font-semibold tabular-nums",
                    line.direction === "in"
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-rose-700 dark:text-rose-400",
                  )}
                >
                  {line.direction === "in" ? "+" : "−"}
                  {fmt.format(line.amount)}
                </span>
                {canUpdate && !line.reconciled ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-8 shrink-0"
                    onClick={() => onDeleteLine(line.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
