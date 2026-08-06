"use client"

import {
  createTreasuryAccount,
  createTreasuryChildAccount,
  deleteTreasuryAccount,
  getTreasuryAccountsHub,
  updateTreasuryAccount,
  type TreasuryAccountTableRow,
  type TreasuryChildAccountKind,
  type UpsertTreasuryAccountInput,
} from "@/app/[siteId]/[popId]/accounts/actions"
import { TreasuryAccountCard } from "@/app/[siteId]/[popId]/accounts/TreasuryAccountCard"
import { TreasuryAccountsGridSkeleton } from "@/app/[siteId]/[popId]/accounts/TreasuryAccountsGridSkeleton"
import { TreasuryAccountCreateDialog } from "@/app/[siteId]/[popId]/accounts/TreasuryAccountCreateDialog"
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
import withAuth from "@/hoc/withAuth"
import {
  TREASURY_ACCOUNT_KINDS,
  type TreasuryAccountKind,
} from "@/lib/treasuryAccountKinds"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import {
  treasuryChildCreateDialogCopy,
  type TreasuryAccountMenuActionId,
} from "@/lib/treasuryAccountMenuActions"
import {
  Plus,
} from "lucide-react"
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

const KIND_OPTIONS = TREASURY_ACCOUNT_KINDS.filter(
  (k) => k.value !== "card_payable",
).map((k) => ({
  value: k.value,
  label: k.label,
}))

function defaultForm(): UpsertTreasuryAccountInput {
  return {
    name: "",
    kind: "bank",
    sortOrder: 0,
  }
}

function TreasuryAccountFormFields({
  form,
  setForm,
  idPrefix,
  kindDisabled,
}: {
  form: UpsertTreasuryAccountInput
  setForm: Dispatch<SetStateAction<UpsertTreasuryAccountInput>>
  idPrefix: string
  kindDisabled?: boolean
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
          placeholder="Ej. Banco Galicia, Caja chica, Mercado Pago"
          className="bg-background"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-kind`}>Tipo de cuenta</Label>
        <select
          id={`${idPrefix}-kind`}
          value={form.kind}
          disabled={kindDisabled}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              kind: e.target.value as TreasuryAccountKind,
            }))
          }
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        >
          {KIND_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {!kindDisabled ? (
          <p className="text-xs text-muted-foreground">
            Al crear la cuenta se genera automáticamente la subcuenta en el plan
            contable.
          </p>
        ) : null}
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

function AccountsPage() {
  const router = useRouter()
  const routerRef = useRef(router)
  routerRef.current = router
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const { bootstrap, loading: bootstrapLoading, error: bootstrapError } =
    usePopWorkspace()

  const [rows, setRows] = useState<TreasuryAccountTableRow[]>([])
  const [canCreate, setCanCreate] = useState(false)
  const [canUpdate, setCanUpdate] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [createBanner, setCreateBanner] = useState<string | null>(null)

  const [editRow, setEditRow] = useState<TreasuryAccountTableRow | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editBanner, setEditBanner] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(defaultForm)

  const [deleteRow, setDeleteRow] = useState<TreasuryAccountTableRow | null>(
    null,
  )
  const [deleteBusy, setDeleteBusy] = useState(false)

  const [childCreate, setChildCreate] = useState<{
    parent: TreasuryAccountTableRow
    kind: TreasuryChildAccountKind
  } | null>(null)
  const [childName, setChildName] = useState("")
  const [childSaving, setChildSaving] = useState(false)
  const [childBanner, setChildBanner] = useState<string | null>(null)

  const accountsBasePath = `/${siteId}/${popId}/accounts`

  const load = useCallback(async () => {
    if (!popId || !siteId) return
    const res = await getTreasuryAccountsHub(popId)
    if (!res.success) {
      setError(res.error || "Error")
      setRows([])
      setCanCreate(false)
      setCanUpdate(false)
      setCanDelete(false)
      if (res.redirect) {
        setTimeout(() => routerRef.current.push(res.redirect!), 1200)
      }
      return
    }
    setRows(res.rows)
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

  const submitCreate = async (input: UpsertTreasuryAccountInput) => {
    if (!popId) return
    setCreateSaving(true)
    setCreateBanner(null)
    const res = await createTreasuryAccount(popId, input)
    setCreateSaving(false)
    if (!res.success) {
      setCreateBanner(res.error)
      return
    }
    setCreateOpen(false)
    await load()
  }

  const openEdit = (row: TreasuryAccountTableRow) => {
    setEditBanner(null)
    setEditRow(row)
    setEditForm({
      name: row.name,
      kind: row.kind,
      sortOrder: row.sortOrder,
    })
  }

  const submitEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !editRow) return
    setEditSaving(true)
    setEditBanner(null)
    const res = await updateTreasuryAccount(popId, editRow.id, editForm)
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
    const res = await deleteTreasuryAccount(popId, deleteRow.id)
    setDeleteBusy(false)
    if (!res.success) {
      setDeleteRow(null)
      return
    }
    setDeleteRow(null)
    await load()
  }

  const openChildCreate = (
    parent: TreasuryAccountTableRow,
    kind: TreasuryChildAccountKind,
  ) => {
    setChildBanner(null)
    setChildName("")
    setChildCreate({ parent, kind })
  }

  const submitChildCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !childCreate) return
    setChildSaving(true)
    setChildBanner(null)
    const res = await createTreasuryChildAccount(
      popId,
      childCreate.parent.id,
      childCreate.kind,
      childName,
    )
    setChildSaving(false)
    if (!res.success) {
      setChildBanner(res.error)
      return
    }
    setChildCreate(null)
    await load()
  }

  const handleAccountMenuAction = (
    row: TreasuryAccountTableRow,
    actionId: TreasuryAccountMenuActionId,
  ) => {
    switch (actionId) {
      case "edit":
        openEdit(row)
        break
      case "delete":
        setDeleteRow(row)
        break
      case "add_pos":
        openChildCreate(row, "pos")
        break
      case "add_corporate_card":
        openChildCreate(row, "card_payable")
        break
    }
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
    <DataWorkspaceModuleLayout
      siteId={siteId}
      popId={popId}
      popName={popName}
      title="Cuentas"
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
            label="Nueva cuenta"
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
            <TreasuryAccountsGridSkeleton />
          ) : error ? (
            <div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : rows.length === 0 ? (
            <p className={dataWorkspaceBlocksEmptyStateClass}>
              No hay cuentas configuradas.
            </p>
          ) : (
            <div className={dataWorkspaceEntityCardsGridClass}>
              {rows.map((r) => (
                <TreasuryAccountCard
                  key={r.id}
                  row={r}
                  canCreate={canCreate}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  detailHref={`${accountsBasePath}/${r.id}`}
                  onMenuAction={(actionId) => handleAccountMenuAction(r, actionId)}
                />
              ))}
            </div>
          )}
      </div>
    </DataWorkspaceModuleLayout>

    <TreasuryAccountCreateDialog
      open={createOpen}
      onOpenChange={setCreateOpen}
      saving={createSaving}
      banner={createBanner}
      onSubmit={submitCreate}
    />

    <Dialog open={editRow !== null} onOpenChange={(o) => !o && setEditRow(null)}>
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className="border-border bg-card text-foreground sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>Editar cuenta</DialogTitle>
            <DialogDescription className="sr-only">
              Modificá nombre, tipo, uso o cuenta contable del medio seleccionado.
            </DialogDescription>
          </DialogHeader>
          {editBanner ? (
            <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {editBanner}
            </p>
          ) : null}
          <form className="space-y-4" onSubmit={(e) => void submitEdit(e)}>
            <TreasuryAccountFormFields
              form={editForm}
              kindDisabled={false}
              setForm={setEditForm}
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
            <DialogTitle>¿Eliminar esta cuenta?</DialogTitle>
            <DialogDescription>
              Se quitará{" "}
              <strong className="text-foreground">
                {deleteRow?.name || "este medio"}
              </strong>{" "}
              de tesorería. No se borran movimientos ya registrados.
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

      <Dialog
        open={childCreate !== null}
        onOpenChange={(o) => !o && setChildCreate(null)}
      >
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className="border-border bg-card text-foreground sm:max-w-md"
        >
          {childCreate ? (() => {
            const copy = treasuryChildCreateDialogCopy(
              childCreate.kind,
              childCreate.parent.name,
            )
            return (
              <>
                <DialogHeader>
                  <DialogTitle>{copy.title}</DialogTitle>
                  <DialogDescription>{copy.description}</DialogDescription>
                </DialogHeader>
                {childBanner ? (
                  <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {childBanner}
                  </p>
                ) : null}
                <form
                  className="space-y-4"
                  onSubmit={(e) => void submitChildCreate(e)}
                >
                  <div className="space-y-2">
                    <Label htmlFor="child-name">{copy.nameLabel}</Label>
                    <Input
                      id="child-name"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      required
                      autoFocus
                      placeholder={copy.namePlaceholder}
                      className="bg-background"
                    />
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setChildCreate(null)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={childSaving}>
                      {childSaving ? "Guardando…" : copy.submitLabel}
                    </Button>
                  </DialogFooter>
                </form>
              </>
            )
          })() : null}
        </DialogContent>
      </Dialog>

    </>
  )
}

export default withAuth(AccountsPage)
