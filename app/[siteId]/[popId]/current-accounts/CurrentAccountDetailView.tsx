"use client"

import { CurrentAccountAgingStrip } from "@/app/[siteId]/[popId]/current-accounts/CurrentAccountAgingStrip"
import { CurrentAccountViewToolbarFilter } from "@/app/[siteId]/[popId]/current-accounts/CurrentAccountViewToolbarFilter"
import { CurrentAccountApplyDialog } from "@/app/[siteId]/[popId]/current-accounts/CurrentAccountApplyDialog"
import { CurrentAccountDetailHeaderCard } from "@/app/[siteId]/[popId]/current-accounts/CurrentAccountDetailHeaderCard"
import {
  CurrentAccountDetailContentSkeleton,
  CurrentAccountDetailSkeleton,
} from "@/app/[siteId]/[popId]/current-accounts/CurrentAccountDetailSkeleton"
import { CurrentAccountSettleDialog } from "@/app/[siteId]/[popId]/current-accounts/CurrentAccountSettleDialog"
import { CurrentAccountTermsDialog } from "@/app/[siteId]/[popId]/current-accounts/CurrentAccountTermsDialog"
import { setPopCurrentAccountEnrollment } from "@/lib/rootsyApi/currentAccountsClient"
import {
  CurrentAccountLedgerDateCell,
  CurrentAccountLedgerDocCell,
  CurrentAccountLedgerMoneyCell,
  CurrentAccountOpenAgingCell,
} from "@/app/[siteId]/[popId]/current-accounts/currentAccountsTableCells"
import {
  currentAccountLedgerDateColumnClass,
  currentAccountLedgerDocColumnClass,
  currentAccountLedgerMoneyColumnClass,
  currentAccountOpenAgingColumnClass,
} from "@/app/[siteId]/[popId]/current-accounts/currentAccountsTableLayout"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import {
  dataWorkspaceDetailFlushBottomCardClass,
  dataWorkspaceDetailToolbarClass,
  workspaceTableLayoutClassName,
  workspaceTableNatureTextSecondaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  workspaceTableLayoutHeaderHeadClass,
  workspaceTableLayoutListBodyScopeClass,
  workspaceTableLayoutListSurfaceClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { workspaceLayoutsTablesScopeClass } from "@/components/layouts-tables/rootsLayoutsTablesProductStyles"
import {
  WorkspaceTableBodyRow,
  WorkspaceTableHead,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { RootsIconButton } from "@/components/rootsy-button"
import { RootsConfirmDialog } from "@/components/rootsy-dialog"
import { Table, TableBody } from "@/components/ui/table"
import { usePopCurrentAccountLedger } from "@/hooks/usePopCurrentAccountLedger"
import {
  currentAccountOpenDocumentAgingLabel,
  emptyCurrentAccountAgingTotals,
  type CurrentAccountDirection,
} from "@/lib/currentAccounts"
import {
  exportCurrentAccountStatementPdf,
  printCurrentAccountStatementPdf,
} from "@/lib/currentAccountStatementPdfExport"
import {
  popCurrentAccountLedgerQueryRoot,
  popCurrentAccountPartiesQueryRoot,
} from "@/lib/queryKeys"
import { showReportExportInProgressToast } from "@/lib/reportExportInProgressToast"
import { cn } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import { Download, FileText, Printer, Receipt } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import "@/app/library/color/rootsyNaturePalette.css"
import "@/components/layouts-tables/rootsLayoutsTablesScope.css"

type PartyView = "open" | "ledger"

type Props = {
  popId: string
  direction: CurrentAccountDirection
  partyId: string
  view: PartyView
  listBackHref: string
  canCreate: boolean
  onViewChange: (view: PartyView) => void
  pdfBrand: {
    popName?: string
    popLogoUrl?: string
    popStreetAddress?: string | null
  }
}

export function CurrentAccountDetailView({
  popId,
  direction,
  partyId,
  view,
  listBackHref,
  canCreate,
  onViewChange,
  pdfBrand,
}: Props) {
  const queryClient = useQueryClient()
  const [settleOpen, setSettleOpen] = useState(false)
  const [applyOpen, setApplyOpen] = useState(false)
  const [unenrollOpen, setUnenrollOpen] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [pdfBusy, setPdfBusy] = useState(false)
  const [enrollmentBusy, setEnrollmentBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const ledgerQuery = usePopCurrentAccountLedger(popId, direction, partyId, {
    enabled: Boolean(popId) && Boolean(partyId),
  })

  const loading =
    ledgerQuery.isPending ||
    (ledgerQuery.isFetching && !ledgerQuery.isFetched)
  const ledger = ledgerQuery.data?.success ? ledgerQuery.data : null
  const partyName = ledger?.partyName ?? ""
  const balance = ledger?.balance ?? 0
  const openCount = ledger?.openCount ?? 0
  const overdueAmount = ledger?.overdueAmount ?? 0
  const aging = ledger?.aging ?? emptyCurrentAccountAgingTotals()
  const openDocuments = ledger?.openDocuments ?? []
  const lines = ledger?.lines ?? []
  const enrolled = ledger?.enrolled ?? false
  const creditLimit = ledger?.creditLimit ?? null
  const termDays = ledger?.termDays ?? 30
  const availableCredit = ledger?.availableCredit ?? null
  const unappliedCredit = ledger?.unappliedCredit ?? 0
  const viewingOpen = view === "open"
  const tableError =
    ledgerQuery.data?.success === false
      ? ledgerQuery.data.error
      : ledgerQuery.error instanceof Error
        ? ledgerQuery.error.message
        : ledgerQuery.error
          ? String(ledgerQuery.error)
          : null
  const error = actionError ?? tableError

  const refreshLedger = useCallback(async () => {
    if (!popId) return
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: popCurrentAccountLedgerQueryRoot(popId),
      }),
      queryClient.invalidateQueries({
        queryKey: popCurrentAccountPartiesQueryRoot(popId),
      }),
    ])
  }, [popId, queryClient])

  useEffect(() => {
    setSettleOpen(false)
    setApplyOpen(false)
    setUnenrollOpen(false)
    setTermsOpen(false)
    setActionError(null)
  }, [direction, partyId])

  const runStatementPdf = async (action: "download" | "print") => {
    if (!ledger) return
    setPdfBusy(true)
    const dismiss =
      action === "download"
        ? showReportExportInProgressToast({ title: "Generando extracto…" })
        : null
    try {
      const payload = {
        partyName,
        direction,
        balance,
        aging,
        openDocuments,
        lines,
      }
      if (action === "download") {
        await exportCurrentAccountStatementPdf(payload, pdfBrand)
      } else {
        await printCurrentAccountStatementPdf(payload, pdfBrand)
      }
    } catch (e: unknown) {
      setActionError(
        e instanceof Error ? e.message : "No se pudo generar el PDF.",
      )
    } finally {
      dismiss?.()
      setPdfBusy(false)
    }
  }

  const showInitialSkeleton = loading && !ledger
  const rows = viewingOpen ? openDocuments : lines
  const empty = !loading && rows.length === 0

  return (
    <div className="relative flex w-full min-h-full flex-1 flex-col">
      <div className="relative flex min-h-full w-full flex-1 flex-col gap-6 px-4 pt-6 pb-0 sm:px-6 lg:px-8">
        {showInitialSkeleton ? (
          <CurrentAccountDetailSkeleton view={view} />
        ) : error && !ledger ? (
          <div className="rounded-[1.375rem] border border-[color-mix(in_srgb,var(--color-status-danger)_25%,var(--rootsy-bruma-200))] bg-[color-mix(in_srgb,var(--color-status-danger)_6%,white)] px-4 py-3 font-canopy text-sm text-[var(--color-status-danger)]">
            {error}
          </div>
        ) : (
          <>
            <div className="shrink-0">
              <CurrentAccountDetailHeaderCard
                partyName={partyName}
                direction={direction}
                listBackHref={listBackHref}
                balance={balance}
                openCount={openCount}
                overdueAmount={overdueAmount}
                unappliedCredit={unappliedCredit}
                canCreate={canCreate}
                enrolled={enrolled}
                enrollmentBusy={enrollmentBusy}
                creditLimit={creditLimit}
                availableCredit={availableCredit}
                termDays={termDays}
                onSettle={() => setSettleOpen(true)}
                onApply={() => setApplyOpen(true)}
                onEditTerms={() => setTermsOpen(true)}
                onToggleEnrollment={() => {
                  if (enrolled) {
                    setUnenrollOpen(true)
                    return
                  }
                  setTermsOpen(true)
                }}
              />
            </div>

            {error ? (
              <div className="rounded-[1.375rem] border border-[color-mix(in_srgb,var(--color-status-danger)_25%,var(--rootsy-bruma-200))] bg-[color-mix(in_srgb,var(--color-status-danger)_6%,white)] px-4 py-3 font-canopy text-sm text-[var(--color-status-danger)]">
                {error}
              </div>
            ) : null}

            {loading ? (
              <CurrentAccountDetailContentSkeleton view={view} />
            ) : (
              <article className={dataWorkspaceDetailFlushBottomCardClass}>
                <div className={dataWorkspaceDetailToolbarClass}>
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                    <CurrentAccountViewToolbarFilter
                      value={view}
                      onChange={onViewChange}
                      className="w-auto"
                    />
                    <CurrentAccountAgingStrip aging={aging} />
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <p
                      className={cn(
                        "hidden text-xs lg:block",
                        workspaceTableNatureTextSecondaryClass,
                      )}
                    >
                      {viewingOpen
                        ? openCount === 1
                          ? "1 comprobante abierto"
                          : `${openCount.toLocaleString("es-AR")} comprobantes abiertos`
                        : `${lines.length.toLocaleString("es-AR")} ${
                            lines.length === 1 ? "movimiento" : "movimientos"
                          }`}
                    </p>
                    <RootsIconButton
                      theme="workspace"
                      emphasis="ghost"
                      size="default"
                      label="Descargar extracto"
                      disabled={pdfBusy}
                      onClick={() => void runStatementPdf("download")}
                    >
                      <Download aria-hidden />
                    </RootsIconButton>
                    <RootsIconButton
                      theme="workspace"
                      emphasis="ghost"
                      size="default"
                      label="Imprimir extracto"
                      disabled={pdfBusy}
                      onClick={() => void runStatementPdf("print")}
                    >
                      <Printer aria-hidden />
                    </RootsIconButton>
                  </div>
                </div>

                {empty ? (
                  <DataWorkspaceDetailEmptyState
                    icon={viewingOpen ? Receipt : FileText}
                    title={
                      viewingOpen
                        ? "No hay comprobantes abiertos"
                        : "Todavía no hay movimientos"
                    }
                  />
                ) : viewingOpen ? (
                  <div
                    className={cn(
                      "min-h-0 flex-1 overflow-x-auto",
                      workspaceLayoutsTablesScopeClass,
                      workspaceTableLayoutListSurfaceClass,
                      workspaceTableLayoutListBodyScopeClass,
                    )}
                  >
                    <Table
                      className={cn(workspaceTableLayoutClassName, "min-w-4xl")}
                    >
                      <WorkspaceTableHeader>
                        <WorkspaceTableHeaderRow>
                          <WorkspaceTableHead
                            tone="nature"
                            className={cn(
                              currentAccountLedgerDateColumnClass,
                              workspaceTableLayoutHeaderHeadClass,
                            )}
                          >
                            Fecha
                          </WorkspaceTableHead>
                          <WorkspaceTableHead
                            tone="nature"
                            className={cn(
                              currentAccountLedgerDocColumnClass,
                              workspaceTableLayoutHeaderHeadClass,
                            )}
                          >
                            Comprobante
                          </WorkspaceTableHead>
                          <WorkspaceTableHead
                            tone="nature"
                            className={cn(
                              currentAccountLedgerDateColumnClass,
                              workspaceTableLayoutHeaderHeadClass,
                            )}
                          >
                            Vence
                          </WorkspaceTableHead>
                          <WorkspaceTableHead
                            tone="nature"
                            align="right"
                            className={cn(
                              currentAccountLedgerMoneyColumnClass,
                              workspaceTableLayoutHeaderHeadClass,
                            )}
                          >
                            Restante
                          </WorkspaceTableHead>
                          <WorkspaceTableHead
                            tone="nature"
                            className={cn(
                              currentAccountOpenAgingColumnClass,
                              workspaceTableLayoutHeaderHeadClass,
                            )}
                          >
                            Tramo
                          </WorkspaceTableHead>
                        </WorkspaceTableHeaderRow>
                      </WorkspaceTableHeader>
                      <TableBody>
                        {openDocuments.map((document, index) => (
                          <WorkspaceTableBodyRow
                            key={document.id}
                            index={index}
                          >
                            <CurrentAccountLedgerDateCell
                              value={document.date}
                              occurredAt={document.occurredAt}
                            />
                            <CurrentAccountLedgerDocCell
                              label={document.documentLabel}
                              description={currentAccountOpenDocumentAgingLabel(
                                document.daysOverdue,
                              )}
                            />
                            <CurrentAccountLedgerDateCell
                              value={document.dueDate}
                            />
                            <CurrentAccountLedgerMoneyCell
                              value={document.remaining}
                            />
                            <CurrentAccountOpenAgingCell
                              bucket={document.agingBucket}
                            />
                          </WorkspaceTableBodyRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "min-h-0 flex-1 overflow-x-auto",
                      workspaceLayoutsTablesScopeClass,
                      workspaceTableLayoutListSurfaceClass,
                      workspaceTableLayoutListBodyScopeClass,
                    )}
                  >
                    <Table
                      className={cn(workspaceTableLayoutClassName, "min-w-4xl")}
                    >
                      <WorkspaceTableHeader>
                        <WorkspaceTableHeaderRow>
                          <WorkspaceTableHead
                            tone="nature"
                            className={cn(
                              currentAccountLedgerDateColumnClass,
                              workspaceTableLayoutHeaderHeadClass,
                            )}
                          >
                            Fecha
                          </WorkspaceTableHead>
                          <WorkspaceTableHead
                            tone="nature"
                            className={cn(
                              currentAccountLedgerDocColumnClass,
                              workspaceTableLayoutHeaderHeadClass,
                            )}
                          >
                            Comprobante
                          </WorkspaceTableHead>
                          <WorkspaceTableHead
                            tone="nature"
                            align="right"
                            className={cn(
                              currentAccountLedgerMoneyColumnClass,
                              workspaceTableLayoutHeaderHeadClass,
                            )}
                          >
                            Debe
                          </WorkspaceTableHead>
                          <WorkspaceTableHead
                            tone="nature"
                            align="right"
                            className={cn(
                              currentAccountLedgerMoneyColumnClass,
                              workspaceTableLayoutHeaderHeadClass,
                            )}
                          >
                            Haber
                          </WorkspaceTableHead>
                          <WorkspaceTableHead
                            tone="nature"
                            align="right"
                            className={cn(
                              currentAccountLedgerMoneyColumnClass,
                              workspaceTableLayoutHeaderHeadClass,
                            )}
                          >
                            Saldo
                          </WorkspaceTableHead>
                        </WorkspaceTableHeaderRow>
                      </WorkspaceTableHeader>
                      <TableBody>
                        {lines.map((line, index) => (
                          <WorkspaceTableBodyRow key={line.id} index={index}>
                            <CurrentAccountLedgerDateCell
                              value={line.date}
                              occurredAt={line.occurredAt}
                            />
                            <CurrentAccountLedgerDocCell
                              label={line.documentLabel}
                              description={line.description}
                            />
                            <CurrentAccountLedgerMoneyCell value={line.debit} />
                            <CurrentAccountLedgerMoneyCell
                              value={line.credit}
                            />
                            <CurrentAccountLedgerMoneyCell
                              value={line.balance}
                            />
                          </WorkspaceTableBodyRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </article>
            )}
          </>
        )}
      </div>

      {partyId ? (
        <>
          <CurrentAccountSettleDialog
            open={settleOpen}
            onOpenChange={setSettleOpen}
            popId={popId}
            direction={direction}
            partyId={partyId}
            partyName={partyName}
            documents={openDocuments}
            onSettled={() => void refreshLedger()}
          />
          <CurrentAccountApplyDialog
            open={applyOpen}
            onOpenChange={setApplyOpen}
            popId={popId}
            direction={direction}
            partyId={partyId}
            partyName={partyName}
            unappliedCredit={unappliedCredit}
            documents={openDocuments}
            onApplied={() => void refreshLedger()}
          />
          <CurrentAccountTermsDialog
            open={termsOpen}
            onOpenChange={setTermsOpen}
            popId={popId}
            direction={direction}
            partyId={partyId}
            partyName={partyName}
            creditLimit={creditLimit}
            termDays={termDays}
            onSaved={() => void refreshLedger()}
          />
          <RootsConfirmDialog
            open={unenrollOpen}
            onOpenChange={setUnenrollOpen}
            title="Deshabilitar cuenta corriente"
            description={
              direction === "payable"
                ? "Ya no se podrá comprar a cuenta de este proveedor. El saldo y el extracto se mantienen."
                : "Ya no se podrá vender a cuenta de este cliente. El saldo y el extracto se mantienen."
            }
            confirmLabel="Deshabilitar"
            busy={enrollmentBusy}
            onConfirm={() => {
              void (async () => {
                setEnrollmentBusy(true)
                setActionError(null)
                const result = await setPopCurrentAccountEnrollment(popId, {
                  direction,
                  partyId,
                  enabled: false,
                })
                setEnrollmentBusy(false)
                if (!result.success) {
                  setActionError(result.error)
                  return
                }
                setUnenrollOpen(false)
                await refreshLedger()
              })()
            }}
          />
        </>
      ) : null}
    </div>
  )
}
