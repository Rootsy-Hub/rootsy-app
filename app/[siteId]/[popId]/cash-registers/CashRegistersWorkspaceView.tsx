"use client"

import { RootsIconButton } from "@/components/rootsy-button"
import type {
  ArcaSalePointOption,
  CashRegisterRow,
  CashTreasuryAccountOption,
  ClosingSnapshot,
} from "@/app/[siteId]/[popId]/cash-registers/actions"
import { CashRegisterCard } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterCard"
import {
  CashRegisterCreateDialog,
  type CashRegisterCreateInput,
} from "@/app/[siteId]/[popId]/cash-registers/CashRegisterCreateDialog"
import {
  CashRegisterEditDialog,
  type CashRegisterEditSubmitPayload,
} from "@/app/[siteId]/[popId]/cash-registers/CashRegisterEditDialog"
import { CashRegisterCloseDialog } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterCloseDialog"
import { CashRegisterDeleteBlockedDialog } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterDeleteBlockedDialog"
import { CashRegisterDeleteDialog } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterDeleteDialog"
import { CashRegisterMoveDialog } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterMoveDialog"
import { CashRegisterOpenDialog } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterOpenDialog"
import { CashRegistersGridSkeleton } from "@/app/[siteId]/[popId]/cash-registers/CashRegistersGridSkeleton"
import { DataWorkspaceBlocksSection } from "@/components/data-workspace/DataWorkspaceBlocksSection"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { RootsBanner } from "@/components/rootsy-banner"
import {
  dataWorkspaceBlocksEmptyStateClass,
  dataWorkspaceBlocksPageContentClass,
  dataWorkspaceBlocksPageMainClass,
  dataWorkspaceEntityCardsGridClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { useAfterHydration } from "@/hooks/useIsHydrated"
import { usePopMenuCache } from "@/hooks/usePopMenuCache"
import {
  formatMoneyInputForField,
  parseMoneyInput,
} from "@/lib/moneyInput"
import { hasPopAccessPermission } from "@/lib/popAccessPermissions"
import { POP_PERMS } from "@/lib/popPermissionConstants"
import {
  addCashMovement,
  closeCashSession,
  createCashRegister,
  deleteCashRegister,
  fetchCashRegisters,
  fetchCashRegistersFormContext,
  fetchCashRegistersOpenTotals,
  mergeCashRegisterRow,
  openCashSession,
  updateCashRegister,
  type CashRegisterListRow,
  type CashRegisterOpenTotals,
} from "@/lib/rootsyApi/cashRegistersClient"
import { Plus } from "lucide-react"
import { useParams } from "@/lib/pop-spa/navigation"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react"

export function CashRegistersWorkspaceView() {
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const { bootstrap, loading: bootstrapLoading, error: bootstrapError, hasPermission } =
    usePopWorkspace()
  const afterHydration = useAfterHydration()
  const menuCache = usePopMenuCache(popId ?? "")

  const checkPerm = useCallback(
    (perm: { resource: string; action: string }) =>
      afterHydration &&
      (hasPermission(perm.resource, perm.action) ||
        (menuCache.popAccess
          ? hasPopAccessPermission(
              menuCache.popAccess,
              perm.resource,
              perm.action,
            )
          : false)),
    [afterHydration, hasPermission, menuCache.popAccess],
  )
  const canCreate = checkPerm(POP_PERMS.CASH_REGISTER_CREATE)
  const canUpdate = checkPerm(POP_PERMS.CASH_REGISTER_UPDATE)
  const canDelete = checkPerm(POP_PERMS.CASH_REGISTER_DELETE)

  const [listRows, setListRows] = useState<CashRegisterListRow[]>([])
  const [openTotals, setOpenTotals] = useState<
    Record<string, CashRegisterOpenTotals>
  >({})
  const [cashTreasuryAccounts, setCashTreasuryAccounts] = useState<
    CashTreasuryAccountOption[]
  >([])
  const [salePoints, setSalePoints] = useState<ArcaSalePointOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const cashRegistersBasePath = `/${siteId}/${popId}/cash-registers`

  const [createOpen, setCreateOpen] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [createBanner, setCreateBanner] = useState<string | null>(null)

  const [editRow, setEditRow] = useState<CashRegisterRow | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editBanner, setEditBanner] = useState<string | null>(null)

  const [deleteRow, setDeleteRow] = useState<CashRegisterRow | null>(null)
  const [deleteBlockedRow, setDeleteBlockedRow] = useState<CashRegisterRow | null>(
    null,
  )
  const [deleteConfirmValue, setDeleteConfirmValue] = useState("")
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteBanner, setDeleteBanner] = useState<string | null>(null)

  const [openRow, setOpenRow] = useState<CashRegisterRow | null>(null)
  const [openSaving, setOpenSaving] = useState(false)
  const [openBanner, setOpenBanner] = useState<string | null>(null)
  const [openingCash, setOpeningCash] = useState("0")
  const [openingNote, setOpeningNote] = useState("")

  const [closeRow, setCloseRow] = useState<CashRegisterRow | null>(null)
  const [closeSaving, setCloseSaving] = useState(false)
  const [closeBanner, setCloseBanner] = useState<string | null>(null)
  const [closeCash, setCloseCash] = useState("")
  const [closeTreasuryLines, setCloseTreasuryLines] = useState<
    Record<string, string>
  >({})
  const [closeNote, setCloseNote] = useState("")

  const [moveRow, setMoveRow] = useState<CashRegisterRow | null>(null)
  const [moveKind, setMoveKind] = useState<"deposit" | "withdrawal">("deposit")
  const [moveSaving, setMoveSaving] = useState(false)
  const [moveBanner, setMoveBanner] = useState<string | null>(null)
  const [moveAmount, setMoveAmount] = useState("")
  const [moveNote, setMoveNote] = useState("")

  const registers = useMemo(
    () => listRows.map((row) => mergeCashRegisterRow(row, openTotals[row.id])),
    [listRows, openTotals],
  )

  const loadList = useCallback(async () => {
    if (!popId) return
    const res = await fetchCashRegisters(popId)
    if (!res.success) {
      setError(res.error || "Error")
      setListRows([])
      return
    }
    setListRows(res.registers)
    setError(null)
  }, [popId])

  const loadOpenTotals = useCallback(async () => {
    if (!popId) return
    const res = await fetchCashRegistersOpenTotals(popId)
    if (!res.success) {
      setOpenTotals({})
      return
    }
    setOpenTotals(res.byRegisterId)
  }, [popId])

  const loadFormContext = useCallback(async () => {
    if (!popId) return
    const res = await fetchCashRegistersFormContext(popId)
    if (!res.success) return
    setCashTreasuryAccounts(res.data.cashTreasuryAccounts)
    setSalePoints(res.data.salePoints)
  }, [popId])

  const reload = useCallback(async () => {
    await loadList()
    void loadOpenTotals()
  }, [loadList, loadOpenTotals])

  useEffect(() => {
    if (!popId || !siteId) {
      setLoading(false)
      setError("Punto de venta no encontrado.")
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        await loadList()
      } catch {
        if (!cancelled) setError("Error inesperado")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [loadList, popId, siteId])

  useEffect(() => {
    if (!popId || !siteId) return
    void loadOpenTotals()
    void loadFormContext()
  }, [loadFormContext, loadOpenTotals, popId, siteId])

  const pageLoading = bootstrapLoading || loading
  const popName = bootstrap?.popName ?? ""
  const headerError = bootstrapError

  const openCreate = () => {
    setCreateBanner(null)
    setCreateOpen(true)
  }

  const submitCreate = async (input: CashRegisterCreateInput) => {
    if (!popId) return
    setCreateSaving(true)
    setCreateBanner(null)
    const res = await createCashRegister(popId, {
      name: input.name,
      sortOrder: 0,
      cashTreasuryAccountId: input.cashTreasuryAccountId,
      arcaSalePointId: input.arcaSalePointId,
    })
    if (!res.success) {
      setCreateSaving(false)
      setCreateBanner(res.error)
      return
    }
    setCreateSaving(false)
    setCreateOpen(false)
    await reload()
  }

  const startEdit = (r: CashRegisterRow) => {
    setEditBanner(null)
    setEditRow(r)
  }

  const submitEdit = async (payload: CashRegisterEditSubmitPayload) => {
    if (!popId || !editRow) return
    setEditSaving(true)
    setEditBanner(null)
    const res = await updateCashRegister(popId, editRow.id, {
      name: payload.name,
      sortOrder: editRow.sortOrder,
      isActive: payload.isActive,
      cashTreasuryAccountId: payload.cashTreasuryAccountId,
      arcaSalePointId: payload.arcaSalePointId,
    })
    setEditSaving(false)
    if (!res.success) {
      setEditBanner(res.error)
      return
    }
    setEditRow(null)
    await reload()
  }

  const startDelete = (r: CashRegisterRow) => {
    if (r.openSessionId) {
      setDeleteBlockedRow(r)
      return
    }
    setDeleteBanner(null)
    setDeleteConfirmValue("")
    setDeleteRow(r)
  }

  const submitDelete = async () => {
    if (!popId || !deleteRow) return
    setDeleteBusy(true)
    setDeleteBanner(null)
    const res = await deleteCashRegister(popId, deleteRow.id)
    setDeleteBusy(false)
    if (!res.success) {
      setDeleteBanner(res.error)
      return
    }
    setDeleteRow(null)
    setDeleteConfirmValue("")
    await reload()
  }

  const startOpen = (r: CashRegisterRow) => {
    setOpenBanner(null)
    setOpeningCash("0")
    setOpeningNote("")
    setOpenRow(r)
  }

  const submitOpen = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !openRow) return
    setOpenSaving(true)
    setOpenBanner(null)
    const res = await openCashSession(
      popId,
      openRow.id,
      parseMoneyInput(openingCash),
      openingNote,
    )
    setOpenSaving(false)
    if (!res.success) {
      setOpenBanner(res.error)
      return
    }
    setOpenRow(null)
    await reload()
  }

  const startClose = (r: CashRegisterRow) => {
    if (!r.openSessionId || !r.canCloseOpenSession) return
    setCloseBanner(null)
    setCloseNote("")
    const efectivoTeorico = r.openSessionTotals?.efectivoTeoricoEnCajon ?? 0
    setCloseCash(formatMoneyInputForField(efectivoTeorico))
    const next: Record<string, string> = {}
    for (const line of r.openSessionTotals?.cobrosParaCierre ?? []) {
      next[line.key] = formatMoneyInputForField(line.total)
    }
    setCloseTreasuryLines(next)
    setCloseRow(r)
  }

  const submitClose = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !closeRow?.openSessionId) return
    setCloseSaving(true)
    setCloseBanner(null)
    const treasuryLines: Record<string, number> = {}
    for (const [k, v] of Object.entries(closeTreasuryLines)) {
      treasuryLines[k] = parseMoneyInput(v)
    }
    const snapshot: ClosingSnapshot = {
      cash: parseMoneyInput(closeCash),
      treasury_lines: treasuryLines,
      note: closeNote.trim() || undefined,
    }
    const res = await closeCashSession(popId, closeRow.openSessionId, snapshot)
    setCloseSaving(false)
    if (!res.success) {
      setCloseBanner(res.error)
      return
    }
    setCloseRow(null)
    await reload()
  }

  const startMove = (r: CashRegisterRow, kind: "deposit" | "withdrawal") => {
    if (!r.openSessionId) return
    setMoveKind(kind)
    setMoveBanner(null)
    setMoveAmount("")
    setMoveNote("")
    setMoveRow(r)
  }

  const submitMove = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !moveRow?.openSessionId) return
    setMoveSaving(true)
    setMoveBanner(null)
    const res = await addCashMovement(popId, moveRow.openSessionId, {
      kind: moveKind,
      amount: parseMoneyInput(moveAmount),
      note: moveNote,
    })
    setMoveSaving(false)
    if (!res.success) {
      setMoveBanner(res.error)
      return
    }
    setMoveRow(null)
    await reload()
  }

  useEffect(() => {
    if (!closeRow) return
    setCloseTreasuryLines((prev) => {
      const next = { ...prev }
      for (const line of closeRow.openSessionTotals?.cobrosParaCierre ?? []) {
        if (next[line.key] === undefined) {
          next[line.key] = formatMoneyInputForField(line.total)
        }
      }
      return next
    })
  }, [closeRow])

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado.</p>
      </div>
    )
  }

  return (
    <>
      <DataWorkspaceModuleLayout
        siteId={siteId}
        popId={popId}
        popName={popName}
        title="Cajas"
        headerVariant={dataWorkspaceModuleHeaderVariant}
        loading={pageLoading}
        userName={bootstrap?.userFullName}
        userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
        userRoleLabel={bootstrap?.roleLabel}
        headerActions={
          canCreate ? (
            <RootsIconButton
              label="Nueva caja"
              semantic="primary"
              atmosphere="eter"
              size="default"
              onClick={() => openCreate()}
            >
              <Plus className="size-5" aria-hidden />
            </RootsIconButton>
          ) : null
        }
        contentFlush
        mainMaxWidthClass="max-w-none"
        mainClassName={dataWorkspaceBlocksPageMainClass}
      >
        <div className={dataWorkspaceBlocksPageContentClass}>
          {headerError ? (
            <RootsBanner
              intent="danger"
              layout="message"
              message={`Cabecera: ${headerError}`}
            />
          ) : null}

          {pageLoading ? (
            <CashRegistersGridSkeleton />
          ) : error ? (
            <RootsBanner intent="danger" layout="message" message={error} />
          ) : (
            <DataWorkspaceBlocksSection>
              {registers.length === 0 ? (
                <p className={dataWorkspaceBlocksEmptyStateClass}>
                  {canCreate
                    ? "Todavía no hay cajas. Creá la primera."
                    : "Todavía no hay cajas configuradas."}
                </p>
              ) : (
                <div className={dataWorkspaceEntityCardsGridClass}>
                  {registers.map((r) => (
                    <CashRegisterCard
                      key={r.id}
                      row={r}
                      canCreate={canCreate}
                      canUpdate={canUpdate}
                      canDelete={canDelete}
                      detailHref={`${cashRegistersBasePath}/${r.id}${r.openSessionId ? "?v=arqueo" : ""}`}
                      onEdit={() => startEdit(r)}
                      onDelete={() => startDelete(r)}
                      onOpen={() => startOpen(r)}
                      onClose={() => startClose(r)}
                      onDeposit={() => startMove(r, "deposit")}
                      onWithdraw={() => startMove(r, "withdrawal")}
                    />
                  ))}
                </div>
              )}
            </DataWorkspaceBlocksSection>
          )}
        </div>
      </DataWorkspaceModuleLayout>

      <CashRegisterCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        saving={createSaving}
        banner={createBanner}
        cashTreasuryAccounts={cashTreasuryAccounts}
        salePoints={salePoints}
        onSubmit={submitCreate}
      />

      <CashRegisterEditDialog
        open={editRow !== null}
        onOpenChange={(open) => {
          if (!open) setEditRow(null)
        }}
        row={editRow}
        saving={editSaving}
        banner={editBanner}
        cashTreasuryAccounts={cashTreasuryAccounts}
        salePoints={salePoints}
        onSubmit={submitEdit}
      />

      <CashRegisterDeleteBlockedDialog
        open={deleteBlockedRow !== null}
        registerName={deleteBlockedRow?.name ?? null}
        onOpenChange={(open) => {
          if (!open) setDeleteBlockedRow(null)
        }}
        onClose={() => setDeleteBlockedRow(null)}
      />

      <CashRegisterDeleteDialog
        open={deleteRow !== null}
        registerName={deleteRow?.name ?? null}
        confirmValue={deleteConfirmValue}
        banner={deleteBanner}
        busy={deleteBusy}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteRow(null)
            setDeleteBanner(null)
          }
        }}
        onClose={() => {
          setDeleteRow(null)
          setDeleteBanner(null)
        }}
        onConfirmValueChange={setDeleteConfirmValue}
        onAfterClose={() => setDeleteConfirmValue("")}
        onConfirmDelete={() => void submitDelete()}
      />

      <CashRegisterOpenDialog
        open={openRow !== null}
        onOpenChange={(open) => {
          if (!open) setOpenRow(null)
        }}
        registerName={openRow?.name}
        saving={openSaving}
        banner={openBanner}
        openingCash={openingCash}
        onOpeningCashChange={setOpeningCash}
        note={openingNote}
        onNoteChange={setOpeningNote}
        onSubmit={submitOpen}
      />

      <CashRegisterCloseDialog
        open={closeRow !== null}
        onOpenChange={(open) => {
          if (!open) setCloseRow(null)
        }}
        row={closeRow}
        saving={closeSaving}
        banner={closeBanner}
        closeCash={closeCash}
        onCloseCashChange={setCloseCash}
        closeTreasuryLines={closeTreasuryLines}
        onCloseTreasuryLineChange={(key, value) =>
          setCloseTreasuryLines((prev) => ({ ...prev, [key]: value }))
        }
        closeNote={closeNote}
        onCloseNoteChange={setCloseNote}
        onSubmit={submitClose}
      />

      <CashRegisterMoveDialog
        open={moveRow !== null}
        onOpenChange={(open) => {
          if (!open) setMoveRow(null)
        }}
        kind={moveKind}
        registerName={moveRow?.name}
        saving={moveSaving}
        banner={moveBanner}
        amount={moveAmount}
        onAmountChange={setMoveAmount}
        note={moveNote}
        onNoteChange={setMoveNote}
        onSubmit={submitMove}
      />
    </>
  )
}
