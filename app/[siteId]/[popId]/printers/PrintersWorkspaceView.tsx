"use client"

import type {
  PopPrinterTableRow,
  UpsertPopPrinterInput,
} from "@/app/[siteId]/[popId]/printers/actions"
import { PrintersPageSkeleton } from "@/app/[siteId]/[popId]/printers/PrintersPageSkeleton"
import { PrinterUpsertDialog } from "@/app/[siteId]/[popId]/printers/PrinterUpsertDialog"
import { DataWorkspaceBlocksSection } from "@/components/data-workspace/DataWorkspaceBlocksSection"
import {
  dataWorkspaceBlocksEmptyStateClass,
  dataWorkspaceBlocksPageContentClass,
  dataWorkspaceBlocksPageMainClass,
  workspaceTableBodyCellClass,
  workspaceTableHeaderCellClass,
  workspaceTableHeaderRowClass,
  workspaceTableRowBorderClass,
  workspaceTableRowHoverClass,
  workspaceTableSurfaceClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspaceHeaderTooltipIconButton } from "@/components/layouts/DataWorkspaceHeaderTooltipIconButton"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { RootsBanner } from "@/components/rootsy-banner"
import {
  RootsDangerSubtleButton,
  RootsLinkButton,
} from "@/components/rootsy-button"
import { RootsConfirmDialog } from "@/components/rootsy-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { useAfterHydration } from "@/hooks/useIsHydrated"
import { usePopMenuCache } from "@/hooks/usePopMenuCache"
import { hasPopAccessPermission } from "@/lib/popAccessPermissions"
import { POP_PERMS } from "@/lib/popPermissionConstants"
import {
  createPopPrinter,
  deletePopPrinter,
  fetchPopPrinters,
  updatePopPrinter,
} from "@/lib/rootsyApi/printersClient"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import { useParams } from "@/lib/pop-spa/navigation"
import { useCallback, useEffect, useState } from "react"

export function PrintersWorkspaceView() {
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
  const canCreate = checkPerm(POP_PERMS.PRINTER_CREATE)
  const canUpdate = checkPerm(POP_PERMS.PRINTER_UPDATE)
  const canDelete = checkPerm(POP_PERMS.PRINTER_DELETE)

  const [rows, setRows] = useState<PopPrinterTableRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [createBanner, setCreateBanner] = useState<string | null>(null)

  const [editRow, setEditRow] = useState<PopPrinterTableRow | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editBanner, setEditBanner] = useState<string | null>(null)

  const [deleteRow, setDeleteRow] = useState<PopPrinterTableRow | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteBanner, setDeleteBanner] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!popId) return
    const res = await fetchPopPrinters(popId)
    if (!res.success) {
      setError(res.error || "Error")
      setRows([])
      return
    }
    setRows(res.rows)
    setError(null)
  }, [popId])

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

  const openCreate = () => {
    setCreateBanner(null)
    setCreateOpen(true)
  }

  const submitCreate = async (input: UpsertPopPrinterInput) => {
    if (!popId) return
    setCreateSaving(true)
    setCreateBanner(null)
    const res = await createPopPrinter(popId, input)
    setCreateSaving(false)
    if (!res.success) {
      setCreateBanner(res.error)
      return
    }
    setCreateOpen(false)
    await load()
  }

  const openEdit = (row: PopPrinterTableRow) => {
    setEditBanner(null)
    setEditRow(row)
  }

  const submitEdit = async (input: UpsertPopPrinterInput) => {
    if (!popId || !editRow) return
    setEditSaving(true)
    setEditBanner(null)
    const res = await updatePopPrinter(popId, editRow.id, input)
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
    setDeleteBanner(null)
    const res = await deletePopPrinter(popId, deleteRow.id)
    setDeleteBusy(false)
    if (!res.success) {
      setDeleteBanner(res.error)
      return
    }
    setDeleteRow(null)
    await load()
  }

  const popName = bootstrap?.popName ?? ""
  const showActions = canUpdate || canDelete

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
        title="Impresoras"
        headerVariant={dataWorkspaceModuleHeaderVariant}
        loading={bootstrapLoading}
        userName={bootstrap?.userFullName}
        userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
        userRoleLabel={bootstrap?.roleLabel}
        headerActions={
          canCreate ? (
            <DataWorkspaceHeaderTooltipIconButton
              label="Nueva impresora"
              headerVariant={dataWorkspaceModuleHeaderVariant}
              primary
              onClick={() => openCreate()}
            >
              <Plus className="size-5" aria-hidden />
            </DataWorkspaceHeaderTooltipIconButton>
          ) : null
        }
        contentFlush
        mainMaxWidthClass="max-w-none"
        mainClassName={dataWorkspaceBlocksPageMainClass}
      >
        <div className={dataWorkspaceBlocksPageContentClass}>
          {bootstrapError ? (
            <RootsBanner
              intent="danger"
              layout="message"
              message={`Cabecera: ${bootstrapError}`}
            />
          ) : null}

          {loading ? (
            <PrintersPageSkeleton />
          ) : error ? (
            <RootsBanner intent="danger" layout="message" message={error} />
          ) : (
            <DataWorkspaceBlocksSection
              title="Punto de venta"
              description="Listado de impresoras para este local. La conexión con extensión o app se definirá después; podés dejar tipo y datos de conexión como referencia."
            >
              {rows.length === 0 ? (
                <p className={dataWorkspaceBlocksEmptyStateClass}>
                  {canCreate
                    ? "Todavía no hay impresoras. Cargá la primera."
                    : "Todavía no hay impresoras configuradas."}
                </p>
              ) : (
                <div
                  className={cn(
                    "overflow-hidden rounded-[1.375rem] border border-rootsy-bruma-200",
                    workspaceTableSurfaceClass,
                  )}
                >
                  <Table>
                    <TableHeader>
                      <TableRow className={workspaceTableHeaderRowClass}>
                        <TableHead className={workspaceTableHeaderCellClass}>
                          Nombre
                        </TableHead>
                        <TableHead className={workspaceTableHeaderCellClass}>
                          Activa
                        </TableHead>
                        <TableHead className={workspaceTableHeaderCellClass}>
                          Orden
                        </TableHead>
                        <TableHead className={workspaceTableHeaderCellClass}>
                          Integración
                        </TableHead>
                        <TableHead className={workspaceTableHeaderCellClass}>
                          Conexión
                        </TableHead>
                        {showActions ? (
                          <TableHead
                            className={cn(
                              workspaceTableHeaderCellClass,
                              "text-right",
                            )}
                          >
                            <span className="sr-only">Acciones</span>
                          </TableHead>
                        ) : null}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow
                          key={row.id}
                          className={cn(
                            workspaceTableRowBorderClass,
                            workspaceTableRowHoverClass,
                            !row.isActive && "opacity-[0.78]",
                          )}
                        >
                          <TableCell
                            className={cn(
                              workspaceTableBodyCellClass,
                              "font-medium text-rootsy-bruma-900",
                            )}
                          >
                            {row.name || "—"}
                          </TableCell>
                          <TableCell
                            className={cn(
                              workspaceTableBodyCellClass,
                              "text-rootsy-bruma-500",
                            )}
                          >
                            {row.isActive ? "Sí" : "No"}
                          </TableCell>
                          <TableCell
                            className={cn(
                              workspaceTableBodyCellClass,
                              "tabular-nums text-rootsy-bruma-500",
                            )}
                          >
                            {row.sortOrder}
                          </TableCell>
                          <TableCell
                            className={cn(
                              workspaceTableBodyCellClass,
                              "max-w-[140px] truncate text-rootsy-bruma-500",
                            )}
                          >
                            {row.integrationKind ?? "—"}
                          </TableCell>
                          <TableCell
                            className={cn(
                              workspaceTableBodyCellClass,
                              "max-w-[180px] truncate text-rootsy-bruma-500",
                            )}
                          >
                            {row.connectionHint ?? "—"}
                          </TableCell>
                          {showActions ? (
                            <TableCell
                              className={cn(
                                workspaceTableBodyCellClass,
                                "text-right",
                              )}
                            >
                              <div className="flex justify-end gap-1">
                                {canUpdate ? (
                                  <RootsLinkButton
                                    type="button"
                                    size="compact"
                                    onClick={() => openEdit(row)}
                                  >
                                    Editar
                                  </RootsLinkButton>
                                ) : null}
                                {canDelete ? (
                                  <RootsDangerSubtleButton
                                    type="button"
                                    size="compact"
                                    onClick={() => {
                                      setDeleteBanner(null)
                                      setDeleteRow(row)
                                    }}
                                  >
                                    Eliminar
                                  </RootsDangerSubtleButton>
                                ) : null}
                              </div>
                            </TableCell>
                          ) : null}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </DataWorkspaceBlocksSection>
          )}
        </div>
      </DataWorkspaceModuleLayout>

      <PrinterUpsertDialog
        open={createOpen}
        mode="create"
        saving={createSaving}
        banner={createBanner}
        onOpenChange={setCreateOpen}
        onSubmit={submitCreate}
      />

      <PrinterUpsertDialog
        key={editRow?.id ?? "printer-edit"}
        open={editRow !== null}
        mode="edit"
        saving={editSaving}
        banner={editBanner}
        initialValue={
          editRow
            ? {
                name: editRow.name,
                isActive: editRow.isActive,
                sortOrder: editRow.sortOrder,
                integrationKind: editRow.integrationKind ?? "",
                connectionHint: editRow.connectionHint ?? "",
              }
            : null
        }
        onOpenChange={(open) => {
          if (!open) setEditRow(null)
        }}
        onSubmit={submitEdit}
      />

      <RootsConfirmDialog
        open={deleteRow !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteRow(null)
            setDeleteBanner(null)
          }
        }}
        title="¿Eliminar impresora?"
        description={
          <>
            Se va a eliminar{" "}
            <strong>{deleteRow?.name || "esta impresora"}</strong> de este
            punto de venta.
          </>
        }
        confirmLabel="Eliminar"
        busyConfirmLabel="Eliminando…"
        busy={deleteBusy}
        destructive
        error={deleteBanner}
        onConfirm={() => void submitDelete()}
      />
    </>
  )
}
