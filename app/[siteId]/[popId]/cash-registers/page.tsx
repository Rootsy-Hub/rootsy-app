"use client"

import {
  addCashMovement,
  closeCashSession,
  createCashRegister,
  deleteCashRegister,
  getCashRegisterSummary,
  getCashRegistersPageData,
  openCashSession,
  updateCashRegister,
  uploadCashRegisterArcaCertificates,
  type CashRegisterRow,
  type CashRegisterSummaryData,
  type CashTreasuryAccountOption,
  type ClosingSnapshot,
  type PaymentMethodOption,
} from "@/app/[siteId]/[popId]/cash-registers/actions"
import { CashRegisterCard } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterCard"
import { dataWorkspaceShellCard } from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspaceLayout } from "@/components/layouts/DataWorkspaceLayout"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
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
import withAuth from "@/hoc/withAuth"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { cn } from "@/lib/utils"
import {
  DoorClosed,
  DoorOpen,
  FileDown,
  FileSpreadsheet,
  FileText,
  MinusCircle,
  Pencil,
  Plus,
  Printer,
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

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(n)
}

function formatDateTime(iso: string) {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat("es", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d)
}

function shortUserId(id: string | null) {
  if (!id) return "—"
  return id.length > 14 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id
}

function sessionOpenedLabel(
  sessionId: string,
  sessions: { id: string; openedAt: string }[],
): string {
  const s = sessions.find((x) => x.id === sessionId)
  return s ? formatDateTime(s.openedAt) : shortUserId(sessionId)
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

  const [createOpen, setCreateOpen] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [createBanner, setCreateBanner] = useState<string | null>(null)
  const [createName, setCreateName] = useState("")
  const [createSort, setCreateSort] = useState(0)
  const [createCashTreasuryId, setCreateCashTreasuryId] = useState("")

  const [editRow, setEditRow] = useState<CashRegisterRow | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editBanner, setEditBanner] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editSort, setEditSort] = useState(0)
  const [editActive, setEditActive] = useState(true)
  const [editCashTreasuryId, setEditCashTreasuryId] = useState("")
  const [editArcaPtoVta, setEditArcaPtoVta] = useState("")
  const [editArcaExpiresAt, setEditArcaExpiresAt] = useState("")
  const editCrtRef = useRef<HTMLInputElement>(null)
  const editKeyRef = useRef<HTMLInputElement>(null)

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
  const [closePm, setClosePm] = useState<Record<string, string>>({})
  const [closeNote, setCloseNote] = useState("")

  const [moveRow, setMoveRow] = useState<CashRegisterRow | null>(null)
  const [moveKind, setMoveKind] = useState<"deposit" | "withdrawal">("deposit")
  const [moveSaving, setMoveSaving] = useState(false)
  const [moveBanner, setMoveBanner] = useState<string | null>(null)
  const [moveAmount, setMoveAmount] = useState("")
  const [moveNote, setMoveNote] = useState("")

  const [summaryRow, setSummaryRow] = useState<CashRegisterRow | null>(null)
  const [summaryData, setSummaryData] = useState<CashRegisterSummaryData | null>(
    null,
  )
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)

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
    setCreateName("")
    setCreateSort(0)
    setCreateCashTreasuryId(cashTreasuryAccounts[0]?.id ?? "")
    setCreateOpen(true)
  }

  const submitCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !siteId) return
    setCreateSaving(true)
    setCreateBanner(null)
    const res = await createCashRegister(popId, {
      name: createName,
      sortOrder: createSort,
      cashTreasuryAccountId: createCashTreasuryId,
    })
    setCreateSaving(false)
    if (!res.success) {
      setCreateBanner(res.error)
      return
    }
    setCreateOpen(false)
    await load()
  }

  const startEdit = (r: CashRegisterRow) => {
    setEditBanner(null)
    setEditRow(r)
    setEditName(r.name)
    setEditSort(r.sortOrder)
    setEditActive(r.isActive)
    setEditCashTreasuryId(r.cashTreasuryAccountId ?? cashTreasuryAccounts[0]?.id ?? "")
    setEditArcaPtoVta(r.arcaPtoVta != null ? String(r.arcaPtoVta) : "")
    setEditArcaExpiresAt(r.arcaCertificateExpiresAt ?? "")
  }

  const submitEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !siteId || !editRow) return
    setEditSaving(true)
    setEditBanner(null)
    const ptoRaw = editArcaPtoVta.trim()
    const ptoParsed = ptoRaw === "" ? null : Number(ptoRaw)
    if (
      ptoParsed != null &&
      (!Number.isFinite(ptoParsed) ||
        ptoParsed < 0 ||
        ptoParsed > 99999)
    ) {
      setEditBanner("Punto de venta inválido (0–99999 o vacío).")
      setEditSaving(false)
      return
    }
    const crt = editCrtRef.current?.files?.[0]
    const key = editKeyRef.current?.files?.[0]
    if ((crt && !key) || (!crt && key)) {
      setEditBanner("Subí ambos archivos (.crt y .key) o ninguno.")
      setEditSaving(false)
      return
    }
    if (crt && key) {
      const fd = new FormData()
      fd.append("crt", crt)
      fd.append("key", key)
      const exp = editArcaExpiresAt.trim().slice(0, 10)
      if (exp.length > 0) fd.append("expiresAt", exp)
      const up = await uploadCashRegisterArcaCertificates(popId, editRow.id, fd)
      if (!up.success) {
        setEditBanner(up.error)
        setEditSaving(false)
        return
      }
      if (editCrtRef.current) editCrtRef.current.value = ""
      if (editKeyRef.current) editKeyRef.current.value = ""
    }
    const res = await updateCashRegister(popId, editRow.id, {
      name: editName,
      sortOrder: editSort,
      isActive: editActive,
      cashTreasuryAccountId: editCashTreasuryId,
      arcaPtoVta: ptoParsed,
      arcaCertificateSecretName: editRow.arcaCertificateSecretName ?? null,
      arcaCertificateLastFour: editRow.arcaCertificateLastFour ?? null,
      arcaCertificateExpiresAt: editArcaExpiresAt.trim().slice(0, 10) || null,
    })
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
      Number(openingCash),
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
    if (!r.openSessionId) return
    setCloseBanner(null)
    setCloseNote("")
    setCloseCash(
      r.cashBalance != null ? String(r.cashBalance) : "",
    )
    const next: Record<string, string> = {}
    for (const pm of paymentMethods) {
      if (pm.kind !== "cash") next[pm.kind] = "0"
    }
    setClosePm(next)
    setCloseRow(r)
  }

  const submitClose = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !siteId || !closeRow?.openSessionId) return
    setCloseSaving(true)
    setCloseBanner(null)
    const pm: Record<string, number> = {}
    for (const [k, v] of Object.entries(closePm)) {
      const n = Number(v)
      if (Number.isFinite(n)) pm[k] = n
    }
    const snapshot: ClosingSnapshot = {
      cash: Number(closeCash),
      payment_methods: pm,
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
      amount: Number(moveAmount),
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

  const openSummary = async (r: CashRegisterRow) => {
    if (!popId || !siteId) return
    setSummaryRow(r)
    setSummaryData(null)
    setSummaryError(null)
    setSummaryLoading(true)
    const res = await getCashRegisterSummary(popId, r.id)
    setSummaryLoading(false)
    if (!res.success) {
      setSummaryError(res.error)
      return
    }
    setSummaryData(res.data)
  }

  useEffect(() => {
    if (!closeRow || paymentMethods.length === 0) return
    setClosePm((prev) => {
      const next = { ...prev }
      for (const pm of paymentMethods) {
        if (pm.kind === "cash") continue
        if (next[pm.kind] === undefined) next[pm.kind] = "0"
      }
      return next
    })
  }, [closeRow, paymentMethods])

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado.</p>
      </div>
    )
  }

  return (
    <>
      <DataWorkspaceLayout
        siteId={siteId}
        popId={popId}
        popName={popName}
        title="Cajas"
        headerVariant="dark"
        loading={pageLoading}
        userName={bootstrap?.userFullName}
        userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
        userRoleLabel={bootstrap?.roleLabel}
        contentFlush
        mainMaxWidthClass="max-w-none"
        mainClassName="min-h-0 overflow-y-auto"
        headerActions={
          canCreate ? (
            <DataWorkspaceHeaderIconButton
              label="Nueva caja"
              headerVariant="dark"
              primary
              onClick={() => openCreate()}
            >
              <Plus className="size-5" aria-hidden />
            </DataWorkspaceHeaderIconButton>
          ) : null
        }
      >
        <div className="relative flex w-full min-h-0 flex-1 flex-col">
          <div className="relative flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
            {headerError ? (
              <div
                role="alert"
                className="rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                Cabecera: {headerError}
              </div>
            ) : null}

            {loading ? (
              <p className="text-sm text-muted-foreground">Cargando cajas…</p>
            ) : error ? (
              <div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : (
              <>
                <div className={cn(dataWorkspaceShellCard, "p-5")}>
                  <div className="mb-4">
                    <h2 className="text-sm font-semibold text-foreground">
                      Cajas registradoras
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      Abrí un turno para controlar el efectivo físico en el
                      cajón. Al cerrar, cargá el efectivo contado y los totales
                      por medio de pago. Las ventas y movimientos del turno se
                      reflejan en el arqueo.
                    </p>
                  </div>

                  {registers.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
                      No hay cajas configuradas.
                      {canCreate ? " Creá una desde el botón superior." : ""}
                    </p>
                  ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                      {registers.map((r) => (
                        <CashRegisterCard
                          key={r.id}
                          row={r}
                          canCreate={canCreate}
                          canUpdate={canUpdate}
                          canDelete={canDelete}
                          onSummary={() => void openSummary(r)}
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
              </>
            )}
          </div>
        </div>
      </DataWorkspaceLayout>

      <Dialog open={createOpen} onOpenChange={(o) => !o && setCreateOpen(false)}>
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className="border-border bg-card text-foreground sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground">
              Add cash register
            </DialogTitle>
          </DialogHeader>
          {createBanner ? (
            <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {createBanner}
            </p>
          ) : null}
          <form className="space-y-4" onSubmit={(e) => void submitCreate(e)}>
            <div className="space-y-2">
              <Label htmlFor="cr-name">
                Name
              </Label>
              <Input
                id="cr-name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cr-sort">
                Sort order
              </Label>
              <Input
                id="cr-sort"
                type="number"
                value={createSort}
                onChange={(e) => setCreateSort(Number(e.target.value))}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cr-cash-ta">Cuenta de efectivo destino</Label>
              <select
                id="cr-cash-ta"
                value={createCashTreasuryId}
                onChange={(e) => setCreateCashTreasuryId(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {cashTreasuryAccounts.length === 0 ? (
                  <option value="">Sin cuentas de efectivo</option>
                ) : (
                  cashTreasuryAccounts.map((ta) => (
                    <option key={ta.id} value={ta.id}>
                      {ta.name}
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-muted-foreground">
                Los cobros en efectivo del turno se imputan a esta cuenta de tesorería.
              </p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createSaving}
              >
                {createSaving ? "Saving…" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editRow !== null} onOpenChange={(o) => !o && setEditRow(null)}>
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className="border-border bg-card text-foreground sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground">
              Editar caja registradora
            </DialogTitle>
          </DialogHeader>
          {editBanner ? (
            <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {editBanner}
            </p>
          ) : null}
          <form className="space-y-4" onSubmit={(e) => void submitEdit(e)}>
            <div className="space-y-2">
              <Label htmlFor="e-cr-name">
                Name
              </Label>
              <Input
                id="e-cr-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-cr-sort">
                Sort order
              </Label>
              <Input
                id="e-cr-sort"
                type="number"
                value={editSort}
                onChange={(e) => setEditSort(Number(e.target.value))}
                className="bg-background"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={editActive}
                onChange={(e) => setEditActive(e.target.checked)}
                className="size-4 rounded border-zinc-600 bg-zinc-900 accent-cyan-500"
              />
              Active
            </label>
            <div className="space-y-2">
              <Label htmlFor="e-cr-cash-ta">Cuenta de efectivo destino</Label>
              <select
                id="e-cr-cash-ta"
                value={editCashTreasuryId}
                onChange={(e) => setEditCashTreasuryId(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {cashTreasuryAccounts.length === 0 ? (
                  <option value="">Sin cuentas de efectivo</option>
                ) : (
                  cashTreasuryAccounts.map((ta) => (
                    <option key={ta.id} value={ta.id}>
                      {ta.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="space-y-4 border-t border-zinc-700/80 pt-4">
              <p>Facturación electrónica (ARCA)</p>
              <p className="text-xs leading-relaxed text-zinc-500">
                Punto de venta AFIP y el par certificado / clave privada. Los
                archivos se suben al bucket privado y solo los usa el servidor
                (service role).
              </p>
              <div className="space-y-2">
                <Label htmlFor="e-arca-pto">
                  Punto de venta
                </Label>
                <Input
                  id="e-arca-pto"
                  type="number"
                  min={0}
                  max={99999}
                  value={editArcaPtoVta}
                  onChange={(e) => setEditArcaPtoVta(e.target.value)}
                  placeholder="Vacío o 0–99999"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e-arca-exp">
                  Vencimiento del certificado (opcional)
                </Label>
                <Input
                  id="e-arca-exp"
                  type="date"
                  value={editArcaExpiresAt}
                  onChange={(e) => setEditArcaExpiresAt(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e-arca-crt">
                  Certificado (.crt)
                </Label>
                <Input
                  id="e-arca-crt"
                  ref={editCrtRef}
                  type="file"
                  accept=".crt,.pem,.key,text/plain,text/*"
                  className={cn("bg-background", "py-2")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e-arca-key">
                  Clave privada (.key)
                </Label>
                <Input
                  id="e-arca-key"
                  ref={editKeyRef}
                  type="file"
                  accept=".crt,.pem,.key,text/plain,text/*"
                  className={cn("bg-background", "py-2")}
                />
              </div>
              <p className="text-xs text-zinc-600">
                Dejá ambos archivos vacíos si no querés reemplazar el par
                guardado.
              </p>
              {editRow?.arcaCrtUploadedAt ? (
                <p className="text-xs text-cyan-400/90">
                  Última subida:{" "}
                  <span className="text-zinc-400">.crt</span>{" "}
                  {formatDateTime(editRow.arcaCrtUploadedAt)} ·{" "}
                  <span className="text-zinc-400">.key</span>{" "}
                  {editRow.arcaKeyUploadedAt
                    ? formatDateTime(editRow.arcaKeyUploadedAt)
                    : "—"}
                </p>
              ) : (
                <p className="text-xs text-zinc-600">
                  Aún no hay certificados en el bucket para esta caja.
                </p>
              )}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditRow(null)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={editSaving}
              >
                {editSaving ? "Guardando…" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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

      <Dialog open={openRow !== null} onOpenChange={(o) => !o && setOpenRow(null)}>
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className="border-border bg-card text-foreground sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground">
              Open register
            </DialogTitle>
          </DialogHeader>
          {openBanner ? (
            <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {openBanner}
            </p>
          ) : null}
          <form className="space-y-4" onSubmit={(e) => void submitOpen(e)}>
            <div className="space-y-2">
              <Label htmlFor="op-cash">
                Opening cash counted
              </Label>
              <Input
                id="op-cash"
                type="number"
                value={openingCash}
                onChange={(e) => setOpeningCash(e.target.value)}
                min={0}
                step="0.01"
                className={cn("bg-background", "font-mono text-lg")}
                required
              />
              <p className="text-xs text-zinc-500">
                Count the physical cash in the drawer. Other payment channels
                are usually not tracked at open unless you later reconcile them
                at close.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="op-note">
                Note (optional)
              </Label>
              <Textarea
                id="op-note"
                value={openingNote}
                onChange={(e) => setOpeningNote(e.target.value)}
                placeholder="e.g. vouchers left from previous shift, irregularities…"
                rows={3}
                className={cn("bg-background", "resize-y")}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenRow(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={openSaving}
              >
                {openSaving ? "Opening…" : "Open"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={closeRow !== null} onOpenChange={(o) => !o && setCloseRow(null)}>
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className="border-border bg-card text-foreground sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground">
              Cerrar caja (cierre de arqueo)
            </DialogTitle>
          </DialogHeader>
          {closeBanner ? (
            <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {closeBanner}
            </p>
          ) : null}
          <form className="space-y-4" onSubmit={(e) => void submitClose(e)}>
            <p className="text-sm leading-relaxed text-zinc-400">
              Contá el <strong className="text-zinc-300">efectivo físico</strong>{" "}
              que hay en el cajón y cargalo abajo: es lo que permite ver faltantes
              o sobrantes frente al efectivo teórico del turno. Para tarjetas,
              transferencias y otros medios digitales, el sistema ya tiene los
              importes por venta: podés cargar el total que informe tu liquidación
              o dejarlo en 0 si asumís que coincide; sirve para registrar
              diferencias con el adquirente o el banco.
            </p>
            <div className="space-y-2">
              <Label htmlFor="cl-cash">
                Efectivo contado al cierre
              </Label>
              <Input
                id="cl-cash"
                type="number"
                value={closeCash}
                onChange={(e) => setCloseCash(e.target.value)}
                min={0}
                step="0.01"
                required
                className={cn("bg-background", "font-mono")}
              />
            </div>
            {paymentMethods.filter((pm) => pm.kind !== "cash").length > 0 ? (
              <div className="space-y-3">
                <Label>
                  Otros medios (conteo / liquidación del turno)
                </Label>
                <p className="text-xs text-zinc-500">
                  Opcional: totales esperados o informados por cierre; el efectivo
                  va arriba.
                </p>
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-white/[0.06] bg-black/30 p-3">
                  {paymentMethods
                    .filter((pm) => pm.kind !== "cash")
                    .map((pm) => (
                    <div key={pm.kind} className="flex items-center gap-2">
                      <span className="min-w-0 flex-1 truncate text-sm text-zinc-300">
                        {pm.label}
                      </span>
                      <Input
                        type="number"
                        value={closePm[pm.kind] ?? "0"}
                        onChange={(e) =>
                          setClosePm((m) => ({
                            ...m,
                            [pm.kind]: e.target.value,
                          }))
                        }
                        min={0}
                        step="0.01"
                        className={cn("bg-background", "w-32 font-mono")}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500">
                No payment methods found for this store (or permission is
                missing). You can still close with cash only.
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="cl-note">
                Nota de cierre (faltantes, sobrantes, referencias)
              </Label>
              <Textarea
                id="cl-note"
                value={closeNote}
                onChange={(e) => setCloseNote(e.target.value)}
                placeholder="Ej. diferencia con liquidación, retiros justificados…"
                rows={3}
                className={cn("bg-background", "resize-y")}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCloseRow(null)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={closeSaving}
              >
                {closeSaving ? "Cerrando…" : "Cerrar caja"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={summaryRow !== null}
        onOpenChange={(o) => {
          if (!o) {
            setSummaryRow(null)
            setSummaryData(null)
            setSummaryError(null)
          }
        }}
      >
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className="flex !h-[min(92vh,880px)] !max-h-[min(92vh,880px)] !w-[min(96vw,1100px)] !max-w-[min(96vw,1100px)] flex-col gap-0 overflow-hidden border-border bg-card p-0 text-foreground sm:!max-w-[min(96vw,1100px)]"
        >
          <div className="flex shrink-0 flex-col gap-1 border-b border-border/80 px-5 py-4 pr-14">
            <DialogTitle className="text-left text-lg font-semibold text-foreground">
              Arqueo de caja · {summaryRow?.name ?? "—"}
            </DialogTitle>
            <DialogDescription className="text-left text-xs text-muted-foreground">
              Totales por forma de pago según ventas registradas en esta caja,
              efectivo teórico del turno abierto, movimientos de cajón y cierres
              contados.
            </DialogDescription>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled
                className="pointer-events-none opacity-50"
                title="Próximamente"
              >
                <Printer className="size-3.5" aria-hidden />
                Imprimir
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled
                className="pointer-events-none opacity-50"
                title="Próximamente"
              >
                <FileSpreadsheet className="size-3.5" aria-hidden />
                Excel
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled
                className="pointer-events-none opacity-50"
                title="Próximamente"
              >
                <FileDown className="size-3.5" aria-hidden />
                PDF
              </Button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {summaryLoading ? (
              <p className="animate-pulse font-mono text-sm text-violet-400/80">
                Cargando resumen…
              </p>
            ) : summaryError ? (
              <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {summaryError}
              </p>
            ) : summaryData ? (
              <div className="space-y-8">
                <section className="rounded-lg border border-cyan-500/25 bg-black/45 p-4">
                  <h4 className={cn("text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground", "mb-1 text-cyan-300/90")}>
                    Arqueo de caja
                  </h4>
                  <p className="mb-4 text-xs text-zinc-500">
                    Los importes por medio de pago suman las{" "}
                    <strong className="text-zinc-400">ventas completadas</strong>{" "}
                    hechas con esta caja. El efectivo en cajón del turno actual es:{" "}
                    <strong className="text-zinc-400">
                      apertura + ventas en efectivo + ingresos al cajón − retiros
                    </strong>
                    . Los totales de tarjeta/transferencia suelen coincidir con el
                    sistema; igual podés contrastarlos al cerrar si tu adquirente
                    informa diferencias.
                  </p>
                  {!summaryData.arqueo ? (
                    <p className="font-mono text-sm text-zinc-500">
                      Sin datos de arqueo (falta permiso de lectura de ventas).
                    </p>
                  ) : (
                    <>
                      <div className="mb-4 overflow-x-auto rounded border border-zinc-800/80">
                        <table className="w-full min-w-[420px] border-collapse font-mono text-xs">
                          <thead>
                            <tr className="border-b border-zinc-800 bg-zinc-950/80 text-left text-[10px] uppercase tracking-widest text-zinc-500">
                              <th className="px-3 py-2">Medio de pago</th>
                              <th className="px-3 py-2">Tipo</th>
                              <th className="px-3 py-2 text-right">
                                Total ventas (caja)
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {summaryData.arqueo.ventasPorMedioPago.length ===
                            0 ? (
                              <tr>
                                <td
                                  colSpan={3}
                                  className="px-3 py-3 text-zinc-600"
                                >
                                  Sin ventas completadas aún en esta caja.
                                </td>
                              </tr>
                            ) : (
                              summaryData.arqueo.ventasPorMedioPago.map((row) => (
                                <tr
                                  key={row.paymentKind}
                                  className="border-b border-zinc-800/50 text-zinc-200"
                                >
                                  <td className="px-3 py-2">{row.name}</td>
                                  <td className="px-3 py-2 text-zinc-500">
                                    {row.kind}
                                  </td>
                                  <td className="px-3 py-2 text-right tabular-nums">
                                    {formatMoney(row.totalVentas)}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                      {summaryData.arqueo.sesionAbierta ? (
                        <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/15 p-3">
                          <p className={cn("text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground", "mb-2 text-emerald-400/90")}>
                            Turno abierto (efectivo físico)
                          </p>
                          <div className="grid gap-2 font-mono text-sm sm:grid-cols-2">
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-zinc-600">
                                Efectivo al abrir
                              </p>
                              <p className="text-cyan-200 tabular-nums">
                                {formatMoney(
                                  summaryData.arqueo.sesionAbierta.openingCash,
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-zinc-600">
                                + Ventas efectivo (turno)
                              </p>
                              <p className="text-emerald-300/90 tabular-nums">
                                {formatMoney(
                                  summaryData.arqueo.sesionAbierta.ventasEfectivo,
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-zinc-600">
                                + Ingresos al cajón
                              </p>
                              <p className="text-emerald-300/90 tabular-nums">
                                {formatMoney(
                                  summaryData.arqueo.sesionAbierta.ingresosCajon,
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-zinc-600">
                                − Retiros del cajón
                              </p>
                              <p className="text-rose-300/90 tabular-nums">
                                {formatMoney(
                                  summaryData.arqueo.sesionAbierta.egresosCajon,
                                )}
                              </p>
                            </div>
                            <div className="sm:col-span-2 border-t border-white/10 pt-2">
                              <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                                = Efectivo teórico en cajón (para comparar al
                                contar)
                              </p>
                              <p className="text-lg font-semibold text-white tabular-nums">
                                {formatMoney(
                                  summaryData.arqueo.sesionAbierta
                                    .efectivoTeoricoEnCajon,
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-600">
                          No hay sesión abierta: el desglose de efectivo del turno
                          aparece cuando la caja está abierta.
                        </p>
                      )}
                      <div className="mt-4 border-t border-white/10 pt-4">
                        <p className={cn("text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground", "mb-2 text-zinc-500")}>
                          Movimientos de cajón (todas las sesiones)
                        </p>
                        <div className="grid gap-3 font-mono text-sm sm:grid-cols-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-600">
                              Ingresos (depósitos)
                            </p>
                            <p className="text-lg text-emerald-300 tabular-nums">
                              {formatMoney(summaryData.totals.depositTotal)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-600">
                              Egresos (retiros)
                            </p>
                            <p className="text-lg text-rose-300 tabular-nums">
                              {formatMoney(summaryData.totals.withdrawalTotal)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-600">
                              Neto ingresos − retiros
                            </p>
                            <p className="text-lg text-cyan-300 tabular-nums">
                              {formatMoney(summaryData.totals.netCashMovements)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </section>

                <section className="rounded-lg border border-white/[0.07] bg-black/40 p-4">
                  <h4 className={cn("text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground", "mb-1 text-zinc-400")}>
                    Ventas recientes (detalle)
                  </h4>
                  <p className="mb-3 text-xs text-zinc-600">
                    Cada venta guarda la sesión de caja abierta al facturar. Solo
                    se listan ventas de esta caja registradora.
                  </p>
                  {!summaryData.salesIncluded ? (
                    <p className="font-mono text-sm text-zinc-500">
                      No tenés permiso para ver ventas (`sale:read`). Pedí acceso
                      o revisá con un usuario autorizado.
                    </p>
                  ) : summaryData.sales.length === 0 ? (
                    <p className="font-mono text-sm text-zinc-600">
                      No hay ventas registradas con esta caja.
                    </p>
                  ) : (
                    <div className="overflow-x-auto rounded border border-zinc-800/80">
                      <table className="w-full min-w-[760px] border-collapse font-mono text-xs">
                        <thead>
                          <tr className="border-b border-zinc-800 bg-zinc-950/80 text-left text-[10px] uppercase tracking-widest text-zinc-500">
                            <th className="px-2 py-2">Fecha venta</th>
                            <th className="px-2 py-2">Sesión (apertura)</th>
                            <th className="px-2 py-2 text-right">Total</th>
                            <th className="px-2 py-2">Estado</th>
                            <th className="px-2 py-2">Cliente / nombre</th>
                            <th className="px-2 py-2">Usuario</th>
                          </tr>
                        </thead>
                        <tbody>
                          {summaryData.sales.map((s) => (
                            <tr
                              key={s.id}
                              className="border-b border-zinc-800/50 text-zinc-300"
                            >
                              <td className="whitespace-nowrap px-2 py-2">
                                {formatDateTime(s.soldAt)}
                              </td>
                              <td className="whitespace-nowrap px-2 py-2 text-zinc-500">
                                {sessionOpenedLabel(
                                  s.cashRegisterSessionId,
                                  summaryData.sessions,
                                )}
                              </td>
                              <td className="px-2 py-2 text-right tabular-nums text-emerald-300/90">
                                {s.currency}{" "}
                                {formatMoney(s.total)}
                              </td>
                              <td className="px-2 py-2 capitalize text-zinc-400">
                                {s.status}
                              </td>
                              <td className="max-w-[200px] truncate px-2 py-2 text-zinc-500">
                                {s.customerName ?? "—"}
                              </td>
                              <td
                                className="px-2 py-2 text-zinc-500"
                                title={s.createdBy ?? undefined}
                              >
                                {shortUserId(s.createdBy)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                {summaryData.aggregatedClosingLines.length > 0 ? (
                  <section className="rounded-lg border border-white/[0.07] bg-black/40 p-4">
                    <h4 className={cn("text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground", "mb-1 text-zinc-400")}>
                      Totales por medio de pago (suma de arqueos al cierre)
                    </h4>
                    <p className="mb-3 text-xs text-zinc-600">
                      Son montos contados al cerrar cada sesión, no flujo del
                      período.
                    </p>
                    <div className="overflow-x-auto rounded border border-zinc-800/80">
                      <table className="w-full border-collapse font-mono text-sm">
                        <thead>
                          <tr className="border-b border-zinc-800 bg-zinc-950/80 text-left text-[10px] uppercase tracking-widest text-zinc-500">
                            <th className="px-3 py-2">Medio</th>
                            <th className="px-3 py-2 text-right">Monto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {summaryData.aggregatedClosingLines.map((row) => (
                            <tr
                              key={row.label}
                              className="border-b border-zinc-800/50 text-zinc-200"
                            >
                              <td className="px-3 py-2">{row.label}</td>
                              <td className="px-3 py-2 text-right tabular-nums">
                                {formatMoney(row.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                ) : null}

                <section>
                  <h4 className={cn("text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground", "mb-3 text-zinc-400")}>
                    Sesiones
                  </h4>
                  <div className="overflow-x-auto rounded border border-zinc-800/80">
                    <table className="w-full min-w-[720px] border-collapse font-mono text-xs">
                      <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-950/80 text-left text-[10px] uppercase tracking-widest text-zinc-500">
                          <th className="px-2 py-2">Apertura</th>
                          <th className="px-2 py-2">Estado</th>
                          <th className="px-2 py-2 text-right">Apertura $</th>
                          <th className="px-2 py-2 text-right">Dep.</th>
                          <th className="px-2 py-2 text-right">Ret.</th>
                          <th className="px-2 py-2">Cierre</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summaryData.sessions.map((s) => (
                          <tr
                            key={s.id}
                            className="border-b border-zinc-800/50 text-zinc-300"
                          >
                            <td className="whitespace-nowrap px-2 py-2">
                              {formatDateTime(s.openedAt)}
                            </td>
                            <td className="px-2 py-2">
                              {s.status === "open" ? (
                                <span className="text-emerald-400">Abierta</span>
                              ) : (
                                <span className="text-zinc-500">Cerrada</span>
                              )}
                            </td>
                            <td className="px-2 py-2 text-right tabular-nums">
                              {formatMoney(s.openingCash)}
                            </td>
                            <td className="px-2 py-2 text-right tabular-nums text-emerald-400/90">
                              {formatMoney(s.movementDeposits)}
                            </td>
                            <td className="px-2 py-2 text-right tabular-nums text-rose-400/90">
                              {formatMoney(s.movementWithdrawals)}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 text-zinc-500">
                              {s.closedAt
                                ? formatDateTime(s.closedAt)
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {summaryData.closingBlocks.map((block) => (
                  <section
                    key={block.sessionId}
                    className="rounded-lg border border-violet-500/20 bg-violet-950/20 p-4"
                  >
                    <h4 className={cn("text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground", "mb-3 text-violet-300/90")}>
                      Arqueo al cierre · sesión{" "}
                      {formatDateTime(block.openedAt)}
                    </h4>
                    <div className="overflow-x-auto rounded border border-zinc-800/80">
                      <table className="w-full border-collapse font-mono text-sm">
                        <thead>
                          <tr className="border-b border-zinc-800 bg-zinc-950/80 text-left text-[10px] uppercase tracking-widest text-zinc-500">
                            <th className="px-3 py-2">Medio</th>
                            <th className="px-3 py-2 text-right">Contado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {block.lines.map((line) => (
                            <tr
                              key={`${block.sessionId}-${line.label}`}
                              className="border-b border-zinc-800/50 text-zinc-200"
                            >
                              <td className="px-3 py-2">{line.label}</td>
                              <td className="px-3 py-2 text-right tabular-nums">
                                {formatMoney(line.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                ))}

                <section>
                  <h4 className={cn("text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground", "mb-3 text-zinc-400")}>
                    Movimientos (depósitos y retiros)
                  </h4>
                  {summaryData.movements.length === 0 ? (
                    <p className="font-mono text-sm text-zinc-600">
                      No hay movimientos registrados en esta caja.
                    </p>
                  ) : (
                    <div className="overflow-x-auto rounded border border-zinc-800/80">
                      <table className="w-full min-w-[640px] border-collapse font-mono text-xs">
                        <thead>
                          <tr className="border-b border-zinc-800 bg-zinc-950/80 text-left text-[10px] uppercase tracking-widest text-zinc-500">
                            <th className="px-2 py-2">Fecha</th>
                            <th className="px-2 py-2">Tipo</th>
                            <th className="px-2 py-2 text-right">Monto</th>
                            <th className="px-2 py-2">Nota</th>
                            <th className="px-2 py-2">Usuario</th>
                          </tr>
                        </thead>
                        <tbody>
                          {summaryData.movements.map((m) => (
                            <tr
                              key={m.id}
                              className="border-b border-zinc-800/50 text-zinc-300"
                            >
                              <td className="whitespace-nowrap px-2 py-2">
                                {formatDateTime(m.createdAt)}
                              </td>
                              <td className="px-2 py-2">
                                {m.kind === "deposit" ? (
                                  <span className="text-emerald-400">
                                    Ingreso
                                  </span>
                                ) : (
                                  <span className="text-rose-400">Retiro</span>
                                )}
                              </td>
                              <td className="px-2 py-2 text-right tabular-nums">
                                {formatMoney(m.amount)}
                              </td>
                              <td className="max-w-[200px] truncate px-2 py-2 text-zinc-500">
                                {m.note ?? "—"}
                              </td>
                              <td
                                className="px-2 py-2 text-zinc-500"
                                title={m.createdBy ?? undefined}
                              >
                                {shortUserId(m.createdBy)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={moveRow !== null} onOpenChange={(o) => !o && setMoveRow(null)}>
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className="border-border bg-card text-foreground sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground">
              {moveKind === "deposit" ? "Deposit cash" : "Withdraw cash"}
            </DialogTitle>
          </DialogHeader>
          {moveBanner ? (
            <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {moveBanner}
            </p>
          ) : null}
          <form className="space-y-4" onSubmit={(e) => void submitMove(e)}>
            <div className="space-y-2">
              <Label htmlFor="mv-amt">
                Amount
              </Label>
              <Input
                id="mv-amt"
                type="number"
                value={moveAmount}
                onChange={(e) => setMoveAmount(e.target.value)}
                min={0}
                step="0.01"
                required
                className={cn("bg-background", "font-mono text-lg")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mv-note">
                Note (optional)
              </Label>
              <Input
                id="mv-note"
                value={moveNote}
                onChange={(e) => setMoveNote(e.target.value)}
                className="bg-background"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMoveRow(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={moveSaving}
              >
                {moveSaving ? "Saving…" : "Confirm"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default withAuth(CashRegistersPage)
