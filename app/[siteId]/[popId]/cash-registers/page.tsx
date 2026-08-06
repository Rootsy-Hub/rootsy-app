"use client"

import {
  addCashMovement,
  closeCashSession,
  createCashRegister,
  deleteCashRegister,
  getCashRegistersPageData,
  openCashSession,
  type CashRegisterRow,
  type CashTreasuryAccountOption,
  type ClosingSnapshot,
  type PaymentMethodOption,
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
import { CashRegisterMoveDialog } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterMoveDialog"
import { CashRegisterOpenDialog } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterOpenDialog"
import { CashRegistersGridSkeleton } from "@/app/[siteId]/[popId]/cash-registers/CashRegistersGridSkeleton"
import {
  hasCashRegisterArcaInput,
  saveCashRegisterArcaConfig,
} from "@/app/[siteId]/[popId]/cash-registers/cashRegisterArcaClient"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import {
  dataWorkspaceBlocksEmptyStateClass,
  dataWorkspaceBlocksPageContentClass,
  dataWorkspaceBlocksPageMainClass,
  dataWorkspaceEntityCardsGridClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  formatMoneyInputForField,
  parseMoneyInput,
} from "@/lib/moneyInput"
import { formatLocaleDateTime } from "@/lib/popTimezone"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import withAuth from "@/hoc/withAuth"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import {
  DoorClosed,
  DoorOpen,
  MinusCircle,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react"

function formatDateTime(iso: string) {
  return formatLocaleDateTime(iso)
}

function CashRegistersPage() {
  const router = useRouter()
  const routerRef = useRef(router)
  routerRef.current = router
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const { bootstrap, loading: bootstrapLoading, error: bootstrapError } =
    usePopWorkspace()

  const [registers, setRegisters] = useState<CashRegisterRow[]>([])
  const [cashTreasuryAccounts, setCashTreasuryAccounts] = useState<
    CashTreasuryAccountOption[]
  >([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>(
    [],
  )
  const [canCreate, setCanCreate] = useState(false)
  const [canUpdate, setCanUpdate] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [popFiscalCuit, setPopFiscalCuit] = useState<string | null>(null)
  const [popFiscalRazonSocial, setPopFiscalRazonSocial] = useState<string | null>(
    null,
  )

  const popSettingsHref =
    siteId && popId ? `/${siteId}/${popId}/settings` : undefined
  const cashRegistersBasePath = `/${siteId}/${popId}/cash-registers`

  const [createOpen, setCreateOpen] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [createBanner, setCreateBanner] = useState<string | null>(null)

  const [editRow, setEditRow] = useState<CashRegisterRow | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editBanner, setEditBanner] = useState<string | null>(null)

  const [deleteRow, setDeleteRow] = useState<CashRegisterRow | null>(null)
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

  const load = useCallback(async () => {
    if (!popId || !siteId) return
    const res = await getCashRegistersPageData(popId)
    if (!res.success) {
      setError(res.error || "Error")
      setRegisters([])
      setCashTreasuryAccounts([])
      setPaymentMethods([])
      setCanCreate(false)
      setCanUpdate(false)
      setCanDelete(false)
      setPopFiscalCuit(null)
      setPopFiscalRazonSocial(null)
      if (res.redirect) {
        setTimeout(() => routerRef.current.push(res.redirect!), 1200)
      }
      return
    }
    setRegisters(res.registers)
    setCashTreasuryAccounts(res.cashTreasuryAccounts)
    setPaymentMethods(res.paymentMethods)
    setCanCreate(res.canCreate)
    setCanUpdate(res.canUpdate)
    setCanDelete(res.canDelete)
    setPopFiscalCuit(res.popFiscalCuit)
    setPopFiscalRazonSocial(res.popFiscalRazonSocial)
    setError(null)
  }, [popId, siteId])

  useEffect(() => {
    if (!popId || !siteId) {
      setLoading(false)
      setError("Store ID not found")
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        await load()
      } catch {
        if (!cancelled) setError("Error inesperado")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [popId, siteId, load])

  const pageLoading = bootstrapLoading || loading
  const popName = bootstrap?.popName ?? ""
  const headerError = bootstrapError

  const openCreate = () => {
    setCreateBanner(null)
    setCreateOpen(true)
  }

  const submitCreate = async (input: CashRegisterCreateInput) => {
    if (!popId || !siteId) return
    setCreateSaving(true)
    setCreateBanner(null)
    const res = await createCashRegister(popId, {
      name: input.name,
      sortOrder: 0,
      cashTreasuryAccountId: input.cashTreasuryAccountId,
    })
    if (!res.success) {
      setCreateSaving(false)
      setCreateBanner(res.error)
      return
    }

    if (hasCashRegisterArcaInput(input)) {
      const arcaRes = await saveCashRegisterArcaConfig(
        popId,
        res.registerId,
        {
          name: input.name,
          sortOrder: 0,
          isActive: true,
          cashTreasuryAccountId: input.cashTreasuryAccountId,
          arcaCertificateSecretName: null,
          arcaCertificateLastFour: null,
        },
        input,
      )
      if (!arcaRes.success) {
        setCreateSaving(false)
        setCreateBanner(
          `La caja se creó, pero no se pudo guardar la configuración ARCA: ${arcaRes.error}`,
        )
        await load()
        return
      }
    }

    setCreateSaving(false)
    setCreateOpen(false)
    await load()
  }

  const startEdit = (r: CashRegisterRow) => {
    setEditBanner(null)
    setEditRow(r)
  }

  const submitEdit = async (payload: CashRegisterEditSubmitPayload) => {
    if (!popId || !siteId || !editRow) return
    setEditSaving(true)
    setEditBanner(null)
    const res = await saveCashRegisterArcaConfig(
      popId,
      editRow.id,
      {
        name: payload.name,
        sortOrder: editRow.sortOrder,
        isActive: payload.isActive,
        cashTreasuryAccountId: payload.cashTreasuryAccountId,
        arcaCertificateSecretName: editRow.arcaCertificateSecretName ?? null,
        arcaCertificateLastFour: editRow.arcaCertificateLastFour ?? null,
      },
      payload,
    )
    setEditSaving(false)
    if (!res.success) {
      setEditBanner(res.error)
      return
    }
    setEditRow(null)
    await load()
  }

  const submitDelete = async () => {
    if (!popId || !siteId || !deleteRow) return
    setDeleteBusy(true)
    setDeleteBanner(null)
    const res = await deleteCashRegister(popId, deleteRow.id)
    setDeleteBusy(false)
    if (!res.success) {
      setDeleteBanner(res.error)
      return
    }
    setDeleteRow(null)
    await load()
  }

  const startOpen = (r: CashRegisterRow) => {
    setOpenBanner(null)
    setOpeningCash("0")
    setOpeningNote("")
    setOpenRow(r)
  }

  const submitOpen = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !siteId || !openRow) return
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
    await load()
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
    if (!popId || !siteId || !closeRow?.openSessionId) return
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
    const res = await closeCashSession(
      popId,
      closeRow.openSessionId,
      snapshot,
    )
    setCloseSaving(false)
    if (!res.success) {
      setCloseBanner(res.error)
      return
    }
    setCloseRow(null)
    await load()
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
    if (!popId || !siteId || !moveRow?.openSessionId) return
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
    await load()
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
        contentFlush
        mainMaxWidthClass="max-w-none"
        mainClassName={dataWorkspaceBlocksPageMainClass}
        headerActions={
          canCreate ? (
            <DataWorkspaceHeaderIconButton
              label="Nueva caja"
              headerVariant={dataWorkspaceModuleHeaderVariant}
              primary
              onClick={() => openCreate()}
            >
              <Plus className="size-5" aria-hidden />
            </DataWorkspaceHeaderIconButton>
          ) : null
        }
      >
        <div className={dataWorkspaceBlocksPageContentClass}>
            {headerError ? (
              <div
                role="alert"
                className="rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                Cabecera: {headerError}
              </div>
            ) : null}

            {pageLoading ? (
              <CashRegistersGridSkeleton />
            ) : error ? (
              <div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : registers.length === 0 ? (
              <p className={dataWorkspaceBlocksEmptyStateClass}>
                No hay cajas configuradas.
                {canCreate ? " Creá una desde el botón superior." : ""}
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
                    detailHref={`${cashRegistersBasePath}/${r.id}`}
                    onEdit={() => startEdit(r)}
                    onDelete={() => setDeleteRow(r)}
                    onOpen={() => startOpen(r)}
                    onClose={() => startClose(r)}
                    onDeposit={() => startMove(r, "deposit")}
                    onWithdraw={() => startMove(r, "withdrawal")}
                  />
                ))}
              </div>
            )}
        </div>
      </DataWorkspaceModuleLayout>

      <CashRegisterCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        saving={createSaving}
        banner={createBanner}
        cashTreasuryAccounts={cashTreasuryAccounts}
        popFiscalCuit={popFiscalCuit}
        popFiscalRazonSocial={popFiscalRazonSocial}
        settingsHref={popSettingsHref}
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
        popFiscalCuit={popFiscalCuit}
        popFiscalRazonSocial={popFiscalRazonSocial}
        settingsHref={popSettingsHref}
        formatDateTime={formatDateTime}
        onSubmit={submitEdit}
      />

      <Dialog
        open={deleteRow !== null}
        onOpenChange={(o) => {
          if (!o) {
            setDeleteRow(null)
            setDeleteBanner(null)
          }
        }}
      >
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className="border-border bg-card text-foreground sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground">
              Delete cash register?
            </DialogTitle>
          </DialogHeader>
          {deleteBanner ? (
            <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {deleteBanner}
            </p>
          ) : null}
          <p className="text-sm text-zinc-400">
            This will remove{" "}
            <strong className="text-cyan-200">
              {deleteRow?.name || "this register"}
            </strong>{" "}
            and its history. The register must be closed.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteRow(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteBusy}
              className="border border-red-500/50 bg-red-950/80 font-semibold text-red-100 hover:bg-red-900"
              onClick={() => void submitDelete()}
            >
              {deleteBusy ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

export default withAuth(CashRegistersPage)
