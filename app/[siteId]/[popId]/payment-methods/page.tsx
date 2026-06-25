"use client"

import {
  createPopPaymentMethod,
  deletePopPaymentMethod,
  getPaymentMethodsPosList,
  updatePopPaymentMethod,
  type PaymentMethodKind,
  type PaymentMethodPosRow,
  type TreasuryAccountOption,
  type UpsertPopPaymentMethodInput,
} from "@/app/[siteId]/[popId]/payment-methods/actions"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataWorkspaceLayout } from "@/components/layouts/DataWorkspaceLayout"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import withAuth from "@/hoc/withAuth"
import { paymentKindLabel } from "@/lib/paymentMethodLabels"
import { treasuryKindLabel } from "@/lib/treasuryAccountKinds"
import { getWorkspaceHeaderForPop } from "@/lib/workspaceHeaderServer"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react"

const KIND_OPTIONS: { value: PaymentMethodKind; label: string }[] = [
  { value: "cash", label: "Efectivo" },
  { value: "card_debit", label: "Tarjeta débito" },
  { value: "card_credit", label: "Tarjeta crédito" },
  { value: "transfer", label: "Transferencia" },
  { value: "other", label: "Otro" },
]

function defaultForm(treasuryAccounts: TreasuryAccountOption[]): UpsertPopPaymentMethodInput {
  return {
    name: "",
    kind: "card_debit",
    usage: "receive",
    sortOrder: 0,
    treasuryAccountId: treasuryAccounts[0]?.id ?? "",
  }
}

function PaymentMethodFormFields({
  form,
  setForm,
  treasuryAccounts,
  idPrefix,
}: {
  form: UpsertPopPaymentMethodInput
  setForm: Dispatch<SetStateAction<UpsertPopPaymentMethodInput>>
  treasuryAccounts: TreasuryAccountOption[]
  idPrefix: string
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-name`}>Nombre</Label>
        <Input
          id={`${idPrefix}-name`}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
          placeholder="Ej. Visa débito, Mercado Pago POS"
          className="bg-background"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-kind`}>Tipo en el mostrador</Label>
        <select
          id={`${idPrefix}-kind`}
          value={form.kind}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              kind: e.target.value as PaymentMethodKind,
            }))
          }
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {KIND_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-treasury`}>Cuenta de tesorería</Label>
        <select
          id={`${idPrefix}-treasury`}
          required
          value={form.treasuryAccountId}
          onChange={(e) =>
            setForm((f) => ({ ...f, treasuryAccountId: e.target.value }))
          }
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {treasuryAccounts.length === 0 ? (
            <option value="">Sin cuentas — creá una en Cuentas</option>
          ) : (
            treasuryAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({treasuryKindLabel(a.kind)})
              </option>
            ))
          )}
        </select>
        <p className="text-xs text-muted-foreground">
          Los cobros de ventas se acreditan en esta cuenta (banco, caja, billetera,
          etc.). Configurala en{" "}
          <strong className="font-medium text-foreground/80">Cuentas</strong>.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-sort`}>Orden en listas</Label>
        <Input
          id={`${idPrefix}-sort`}
          type="number"
          value={form.sortOrder}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              sortOrder: Number(e.target.value),
            }))
          }
          className="bg-background"
        />
      </div>
    </>
  )
}

function PaymentMethodsPage() {
  const router = useRouter()
  const routerRef = useRef(router)
  routerRef.current = router
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const [popName, setPopName] = useState("")
  const [workspaceHeader, setWorkspaceHeader] = useState<{
    userFullName: string
    userImageUrl: string | null
    roleLabel: string
  } | null>(null)
  const [headerError, setHeaderError] = useState<string | null>(null)
  const [rows, setRows] = useState<PaymentMethodPosRow[]>([])
  const [treasuryAccounts, setTreasuryAccounts] = useState<TreasuryAccountOption[]>(
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
  const [createForm, setCreateForm] = useState<UpsertPopPaymentMethodInput>(() =>
    defaultForm([]),
  )

  const [editRow, setEditRow] = useState<PaymentMethodPosRow | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editBanner, setEditBanner] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<UpsertPopPaymentMethodInput>(() =>
    defaultForm([]),
  )

  const [deleteRow, setDeleteRow] = useState<PaymentMethodPosRow | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const loadHeader = useCallback(async () => {
    if (!popId) return
    const head = await getWorkspaceHeaderForPop(popId)
    if (!head.success) {
      setHeaderError(head.error)
      return
    }
    setHeaderError(null)
    setPopName((prev) => prev || head.popName)
    setWorkspaceHeader({
      userFullName: head.userFullName,
      userImageUrl: head.userImageUrl,
      roleLabel: head.roleLabel,
    })
  }, [popId])

  const load = useCallback(async () => {
    if (!popId || !siteId) return
    const res = await getPaymentMethodsPosList(popId)
    if (!res.success) {
      setError(res.error || "Error")
      setRows([])
      setTreasuryAccounts(res.treasuryAccounts)
      setCanCreate(false)
      setCanUpdate(false)
      setCanDelete(false)
      if (res.redirect) {
        setTimeout(() => routerRef.current.push(res.redirect!), 1200)
      }
      return
    }
    setRows(res.rows)
    setTreasuryAccounts(res.treasuryAccounts)
    setPopName(res.popName)
    setCanCreate(res.canCreate)
    setCanUpdate(res.canUpdate)
    setCanDelete(res.canDelete)
    setError(null)
  }, [popId, siteId])

  useEffect(() => {
    if (!popId || !siteId) {
      setLoading(false)
      setError("No se encontró el punto de venta.")
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        await Promise.all([load(), loadHeader()])
      } catch {
        if (!cancelled) setError("Error inesperado")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [popId, siteId, load, loadHeader])

  const openCreate = () => {
    setCreateBanner(null)
    setCreateForm(defaultForm(treasuryAccounts))
    setCreateOpen(true)
  }

  const submitCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId) return
    setCreateSaving(true)
    setCreateBanner(null)
    const res = await createPopPaymentMethod(popId, createForm)
    setCreateSaving(false)
    if (!res.success) {
      setCreateBanner(res.error)
      return
    }
    setCreateOpen(false)
    await load()
  }

  const openEdit = (row: PaymentMethodPosRow) => {
    setEditBanner(null)
    setEditRow(row)
    setEditForm({
      name: row.name,
      kind: row.kind,
      usage: "receive",
      sortOrder: row.sortOrder,
      treasuryAccountId: row.treasuryAccountId,
    })
  }

  const submitEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !editRow) return
    setEditSaving(true)
    setEditBanner(null)
    const res = await updatePopPaymentMethod(popId, editRow.id, editForm)
    setEditSaving(false)
    if (!res.success) {
      setEditBanner(res.error)
      return
    }
    setEditRow(null)
    await load()
  }

  const submitDelete = async () => {
    if (!popId || !deleteRow) return
    setDeleteBusy(true)
    const res = await deletePopPaymentMethod(popId, deleteRow.id)
    setDeleteBusy(false)
    if (!res.success) {
      setDeleteRow(null)
      return
    }
    setDeleteRow(null)
    await load()
  }

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">No se encontró el punto de venta.</p>
      </div>
    )
  }

  return (
    <>
      <DataWorkspaceLayout
        siteId={siteId}
        popId={popId}
        popName={popName}
        title="Formas de pago"
        headerVariant="dark"
        loading={loading}
        userName={workspaceHeader?.userFullName}
        userAvatarSrc={workspaceHeader?.userImageUrl ?? undefined}
        userRoleLabel={workspaceHeader?.roleLabel}
        contentFlush
        mainMaxWidthClass="max-w-4xl"
        headerActions={
          canCreate ? (
            <DataWorkspaceHeaderIconButton
              label="Nueva forma de pago"
              headerVariant="dark"
              primary
              onClick={openCreate}
              disabled={treasuryAccounts.length === 0}
            >
              <Plus className="size-5" aria-hidden />
            </DataWorkspaceHeaderIconButton>
          ) : null
        }
      >
        <div className="relative flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          {headerError ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              Cabecera: {headerError}
            </div>
          ) : null}

          <div className="max-w-2xl space-y-2">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Medios que aparecen al cobrar en ventas: tarjetas, QR, Mercado Pago,
              etc. Cada forma apunta a una{" "}
              <strong className="font-medium text-foreground/85">
                cuenta de tesorería
              </strong>{" "}
              donde se acredita el dinero.
            </p>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando…</p>
          ) : error ? (
            <div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : treasuryAccounts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
              Primero creá cuentas de tesorería (banco, caja, billetera) en{" "}
              <strong className="text-foreground">Cuentas</strong> para poder
              configurar formas de pago.
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
              No hay formas de pago configuradas. Agregá Visa, Cabal, efectivo
              mostrador, etc.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cuenta de tesorería</TableHead>
                    <TableHead className="w-[1%] whitespace-nowrap text-right">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className={cn(!row.isActive && "opacity-60")}
                    >
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {paymentKindLabel(row.kind)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.treasuryAccountName}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {canUpdate ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => openEdit(row)}
                            >
                              Editar
                            </Button>
                          ) : null}
                          {canDelete ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteRow(row)}
                            >
                              Eliminar
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DataWorkspaceLayout>

      <Dialog open={createOpen} onOpenChange={(o) => !o && setCreateOpen(false)}>
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className="border-border bg-card text-foreground sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>Nueva forma de pago</DialogTitle>
            <DialogDescription className="sr-only">
              Formulario para crear un medio de cobro en ventas.
            </DialogDescription>
          </DialogHeader>
          {createBanner ? (
            <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {createBanner}
            </p>
          ) : null}
          <form className="space-y-4" onSubmit={(e) => void submitCreate(e)}>
            <PaymentMethodFormFields
              form={createForm}
              setForm={setCreateForm}
              treasuryAccounts={treasuryAccounts}
              idPrefix="c"
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createSaving}>
                {createSaving ? "Guardando…" : "Crear"}
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
            <DialogTitle>Editar forma de pago</DialogTitle>
            <DialogDescription className="sr-only">
              Modificá nombre, tipo o cuenta de tesorería del medio seleccionado.
            </DialogDescription>
          </DialogHeader>
          {editBanner ? (
            <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {editBanner}
            </p>
          ) : null}
          <form className="space-y-4" onSubmit={(e) => void submitEdit(e)}>
            <PaymentMethodFormFields
              form={editForm}
              setForm={setEditForm}
              treasuryAccounts={treasuryAccounts}
              idPrefix="e"
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setEditRow(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={editSaving}>
                {editSaving ? "Guardando…" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteRow !== null} onOpenChange={(o) => !o && setDeleteRow(null)}>
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className="border-border bg-card text-foreground sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>¿Eliminar esta forma de pago?</DialogTitle>
            <DialogDescription>
              Se quitará{" "}
              <strong className="text-foreground">
                {deleteRow?.name || "este medio"}
              </strong>{" "}
              del mostrador. No se borran ventas ya registradas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDeleteRow(null)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteBusy}
              onClick={() => void submitDelete()}
            >
              {deleteBusy ? "Eliminando…" : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default withAuth(PaymentMethodsPage)
