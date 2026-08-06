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
import { TreasuryAccountDeleteDialog } from "@/app/[siteId]/[popId]/accounts/TreasuryAccountDeleteDialog"
import { TreasuryAccountEditDialog } from "@/app/[siteId]/[popId]/accounts/TreasuryAccountEditDialog"
import { TreasuryChildAccountCreateDialog } from "@/app/[siteId]/[popId]/accounts/TreasuryChildAccountCreateDialog"
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
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { type TreasuryAccountMenuActionId } from "@/lib/treasuryAccountMenuActions"
import {
  Plus,
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react"

function defaultForm(): UpsertTreasuryAccountInput {
  return {
    name: "",
    kind: "bank",
    sortOrder: 0,
  }
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

    <TreasuryAccountEditDialog
      open={editRow !== null}
      onOpenChange={(open) => !open && setEditRow(null)}
      form={editForm}
      setForm={setEditForm}
      saving={editSaving}
      banner={editBanner}
      onSubmit={submitEdit}
    />

    <TreasuryAccountDeleteDialog
      open={deleteRow !== null}
      row={deleteRow}
      busy={deleteBusy}
      onOpenChange={(open) => !open && setDeleteRow(null)}
      onCancel={() => setDeleteRow(null)}
      onConfirm={() => void submitDelete()}
    />

    <TreasuryChildAccountCreateDialog
      open={childCreate !== null}
      onOpenChange={(open) => !open && setChildCreate(null)}
      parent={childCreate?.parent ?? null}
      kind={childCreate?.kind ?? null}
      name={childName}
      onNameChange={setChildName}
      saving={childSaving}
      banner={childBanner}
      onSubmit={submitChildCreate}
    />

    </>
  )
}

export default withAuth(AccountsPage)
