"use client"

import { RootsIconButton } from "@/components/rootsy-button"
import { TreasuryAccountCard } from "@/app/[siteId]/[popId]/accounts/TreasuryAccountCard"
import { TreasuryAccountCreateDialog } from "@/app/[siteId]/[popId]/accounts/TreasuryAccountCreateDialog"
import { TreasuryAccountDeleteDialog } from "@/app/[siteId]/[popId]/accounts/TreasuryAccountDeleteDialog"
import { TreasuryAccountEditDialog } from "@/app/[siteId]/[popId]/accounts/TreasuryAccountEditDialog"
import type { TreasuryAccountEditFormState } from "@/app/[siteId]/[popId]/accounts/TreasuryAccountFormFields"
import { TreasuryAccountsGridSkeleton } from "@/app/[siteId]/[popId]/accounts/TreasuryAccountsGridSkeleton"
import { TreasuryChildAccountCreateDialog } from "@/app/[siteId]/[popId]/accounts/TreasuryChildAccountCreateDialog"
import type {
  TreasuryAccountTableRow,
  TreasuryChildAccountKind,
  UpsertTreasuryAccountInput,
} from "@/app/[siteId]/[popId]/accounts/actions"
import {
  mergeAccountsWorkspaceUrl,
  parseAccountsWorkspaceUrl,
  type AccountFilter,
} from "@/app/[siteId]/[popId]/accounts/workspaceUrl"
import { DataWorkspaceBlocksSection } from "@/components/data-workspace/DataWorkspaceBlocksSection"
import {
  dataWorkspaceBlocksEmptyStateClass,
  dataWorkspaceBlocksPageContentClass,
  dataWorkspaceBlocksPageMainClass,
  dataWorkspaceEntityCardsGridClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { RootsBanner } from "@/components/rootsy-banner"
import { RootsConfirmDialog } from "@/components/rootsy-dialog"
import { RootsFormSegmentField } from "@/components/rootsy-form"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { useAfterHydration } from "@/hooks/useIsHydrated"
import { usePopMenuCache } from "@/hooks/usePopMenuCache"
import { hasPopAccessPermission } from "@/lib/popAccessPermissions"
import { POP_PERMS } from "@/lib/popPermissionConstants"
import {
  createTreasuryAccount,
  createTreasuryChildAccount,
  deleteTreasuryAccount,
  fetchTreasuryAccountBalances,
  fetchTreasuryAccounts,
  mergeTreasuryAccountRow,
  setTreasuryAccountActive,
  updateTreasuryAccount,
  type TreasuryAccountBalance,
  type TreasuryAccountListRow,
} from "@/lib/rootsyApi/treasuryClient"
import { type TreasuryAccountMenuActionId } from "@/lib/treasuryAccountMenuActions"
import { Plus } from "lucide-react"
import { useParams, usePathname, useSearchParams } from "@/lib/pop-spa/navigation"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react"

const ACCOUNT_FILTER_OPTIONS = [
  { value: "todas", label: "Todas" },
  { value: "banco", label: "Banco" },
  { value: "billetera", label: "Billetera" },
  { value: "efectivo", label: "Efectivo" },
  { value: "inactivas", label: "Inactivas" },
] as const

function accountMatchesFilter(row: TreasuryAccountTableRow, filter: AccountFilter) {
  if (filter === "banco") return row.kind === "bank"
  if (filter === "billetera") return row.kind === "wallet"
  if (filter === "efectivo") return row.kind === "cash"
  if (filter === "inactivas") return !row.isActive
  return true
}

function accountFilterEmptyCopy(filter: AccountFilter, canCreate: boolean) {
  if (filter === "banco") return "No hay cuentas banco."
  if (filter === "billetera") return "No hay billeteras cargadas."
  if (filter === "efectivo") return "No hay cuentas de efectivo."
  if (filter === "inactivas") return "Ninguna cuenta está desactivada."
  return canCreate
    ? "Todavía no hay cuentas. Cargá la primera."
    : "Todavía no hay cuentas configuradas."
}

function defaultEditForm(): TreasuryAccountEditFormState {
  return {
    name: "",
    kind: "bank",
  }
}

export function AccountsWorkspaceView() {
  const params = useParams()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const { bootstrap, loading: bootstrapLoading, error: bootstrapError, hasPermission } =
    usePopWorkspace()
  const afterHydration = useAfterHydration()
  const menuCache = usePopMenuCache(popId ?? "")

  const [workspaceSearch, setWorkspaceSearch] = useState(() =>
    searchParams.toString(),
  )

  useEffect(() => {
    setWorkspaceSearch(searchParams.toString())
  }, [searchParams])

  const workspaceParams = useMemo(
    () => new URLSearchParams(workspaceSearch),
    [workspaceSearch],
  )
  const ws = useMemo(
    () => parseAccountsWorkspaceUrl(workspaceParams),
    [workspaceParams],
  )

  const pushFilter = useCallback(
    (filter: AccountFilter) => {
      const next = mergeAccountsWorkspaceUrl(workspaceParams, { filter })
      const qs = next.toString()
      setWorkspaceSearch(qs)
      const href = qs ? `${pathname}?${qs}` : pathname
      window.history.replaceState(window.history.state, "", href)
    },
    [pathname, workspaceParams],
  )

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
  const canCreate = checkPerm(POP_PERMS.PAYMENT_METHOD_CREATE)
  const canUpdate = checkPerm(POP_PERMS.PAYMENT_METHOD_UPDATE)
  const canDelete = checkPerm(POP_PERMS.PAYMENT_METHOD_DELETE)

  const [listRows, setListRows] = useState<TreasuryAccountListRow[]>([])
  const [balances, setBalances] = useState<Record<string, TreasuryAccountBalance>>(
    {},
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [createBanner, setCreateBanner] = useState<string | null>(null)

  const [editRow, setEditRow] = useState<TreasuryAccountTableRow | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editBanner, setEditBanner] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(defaultEditForm)

  const [deleteRow, setDeleteRow] = useState<TreasuryAccountTableRow | null>(
    null,
  )
  const [deleteConfirmValue, setDeleteConfirmValue] = useState("")
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteBanner, setDeleteBanner] = useState<string | null>(null)

  const [deactivateRow, setDeactivateRow] =
    useState<TreasuryAccountTableRow | null>(null)
  const [deactivateBusy, setDeactivateBusy] = useState(false)
  const [deactivateBanner, setDeactivateBanner] = useState<string | null>(null)

  const [childCreate, setChildCreate] = useState<{
    parent: TreasuryAccountTableRow
    kind: TreasuryChildAccountKind
  } | null>(null)
  const [childName, setChildName] = useState("")
  const [childSaving, setChildSaving] = useState(false)
  const [childBanner, setChildBanner] = useState<string | null>(null)

  const accountsBasePath = `/${siteId}/${popId}/accounts`

  const rows = useMemo(
    () =>
      listRows.map((row) => mergeTreasuryAccountRow(row, balances[row.id])),
    [balances, listRows],
  )

  const loadList = useCallback(async () => {
    if (!popId) return
    const res = await fetchTreasuryAccounts(popId)
    if (!res.success) {
      setError(res.error || "Error")
      setListRows([])
      return
    }
    setListRows(res.rows)
    setError(null)
  }, [popId])

  const loadBalances = useCallback(async () => {
    if (!popId) return
    const res = await fetchTreasuryAccountBalances(popId)
    if (!res.success) {
      setBalances({})
      return
    }
    setBalances(res.balances)
  }, [popId])

  const reload = useCallback(async () => {
    await loadList()
    void loadBalances()
  }, [loadBalances, loadList])

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
    void loadBalances()
  }, [loadBalances, popId, siteId])

  const pageLoading = bootstrapLoading || loading
  const popName = bootstrap?.popName ?? ""
  const headerError = bootstrapError
  const visibleAccounts = useMemo(
    () => rows.filter((row) => accountMatchesFilter(row, ws.filter)),
    [rows, ws.filter],
  )

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
    await reload()
  }

  const openEdit = (row: TreasuryAccountTableRow) => {
    setEditBanner(null)
    setEditRow(row)
    setEditForm({
      name: row.name,
      kind: row.kind,
    })
  }

  const submitEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !editRow) return
    setEditSaving(true)
    setEditBanner(null)
    const res = await updateTreasuryAccount(popId, editRow.id, editForm.name)
    setEditSaving(false)
    if (!res.success) {
      setEditBanner(res.error)
      return
    }
    setEditRow(null)
    await reload()
  }

  const submitDelete = async () => {
    if (!popId || !deleteRow) return
    setDeleteBusy(true)
    setDeleteBanner(null)
    const res = await deleteTreasuryAccount(popId, deleteRow.id)
    setDeleteBusy(false)
    if (!res.success) {
      setDeleteBanner(res.error)
      return
    }
    setDeleteRow(null)
    setDeleteConfirmValue("")
    await reload()
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
    await reload()
  }

  const submitDeactivate = async () => {
    if (!popId || !deactivateRow) return
    setDeactivateBusy(true)
    setDeactivateBanner(null)
    const res = await setTreasuryAccountActive(popId, deactivateRow.id, false)
    setDeactivateBusy(false)
    if (!res.success) {
      setDeactivateBanner(res.error)
      return
    }
    setDeactivateRow(null)
    await reload()
  }

  const submitActivate = async (row: TreasuryAccountTableRow) => {
    if (!popId) return
    const res = await setTreasuryAccountActive(popId, row.id, true)
    if (!res.success) {
      setError(res.error)
      return
    }
    await reload()
  }

  const handleAccountMenuAction = (
    row: TreasuryAccountTableRow,
    actionId: TreasuryAccountMenuActionId,
  ) => {
    switch (actionId) {
      case "edit":
        openEdit(row)
        break
      case "deactivate":
        setDeactivateBanner(null)
        setDeactivateRow(row)
        break
      case "activate":
        void submitActivate(row)
        break
      case "delete":
        setDeleteConfirmValue("")
        setDeleteBanner(null)
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
        title="Dinero"
        headerVariant={dataWorkspaceModuleHeaderVariant}
        loading={pageLoading}
        userName={bootstrap?.userFullName}
        userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
        userRoleLabel={bootstrap?.roleLabel}
        headerActions={
          canCreate ? (
            <RootsIconButton
              label="Nueva cuenta"
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
            <TreasuryAccountsGridSkeleton />
          ) : error ? (
            <RootsBanner intent="danger" layout="message" message={error} />
          ) : (
            <DataWorkspaceBlocksSection>
              <RootsFormSegmentField
                label="Ver cuentas"
                aria-label="Filtrar cuentas"
                layout="inline"
                className="[&>span:first-child]:sr-only"
                groupClassName="border-0"
                value={ws.filter}
                onValueChange={(value) =>
                  pushFilter(value as AccountFilter)
                }
                options={ACCOUNT_FILTER_OPTIONS}
              />

              {visibleAccounts.length === 0 ? (
                <p className={dataWorkspaceBlocksEmptyStateClass}>
                  {accountFilterEmptyCopy(ws.filter, canCreate)}
                </p>
              ) : (
                <div className={dataWorkspaceEntityCardsGridClass}>
                  {visibleAccounts.map((r) => (
                    <TreasuryAccountCard
                      key={r.id}
                      row={r}
                      canCreate={canCreate}
                      canUpdate={canUpdate}
                      canDelete={canDelete}
                      detailHref={`${accountsBasePath}/${r.id}?kind=${r.kind}`}
                      onMenuAction={(actionId) =>
                        handleAccountMenuAction(r, actionId)
                      }
                    />
                  ))}
                </div>
              )}
            </DataWorkspaceBlocksSection>
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

      <RootsConfirmDialog
        open={deactivateRow !== null}
        onOpenChange={(open) => {
          if (!open && !deactivateBusy) {
            setDeactivateRow(null)
            setDeactivateBanner(null)
          }
        }}
        title={`Inactivar ${deactivateRow?.name.trim() || "esta cuenta"}`}
        description="Deja de aparecer como medio de cobro o pago. Los movimientos ya registrados se conservan. Podés volver a activarla cuando quieras."
        confirmLabel="Inactivar"
        busyConfirmLabel="Inactivando…"
        busy={deactivateBusy}
        error={deactivateBanner}
        onConfirm={() => void submitDeactivate()}
      />

      <TreasuryAccountDeleteDialog
        open={deleteRow !== null}
        accountName={deleteRow?.name ?? null}
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
