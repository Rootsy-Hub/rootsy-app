"use client"

import { ManufacturingDialog } from "@/app/[siteId]/[popId]/manufacturing/ManufacturingDialog"
import {
  formatInventoryMoney,
  formatInventoryQtyWithUnit,
} from "@/app/[siteId]/[popId]/inventory/inventoryFormat"
import { DataWorkspacePeriodFilter } from "@/components/data-workspace/DataWorkspacePeriodFilter"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import {
  dataWorkspaceBlocksPageContentClass,
  dataWorkspaceBlocksPageMainClass,
  dataWorkspaceDetailFlushBottomCardClass,
  dataWorkspaceDetailToolbarClass,
  workspaceTableLayoutClassName,
  workspaceTableNatureMoneyClass,
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  workspaceTableLayoutBodyCellClass,
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
import { DataWorkspaceHeaderTooltipIconButton } from "@/components/layouts/DataWorkspaceHeaderTooltipIconButton"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { RootsBanner } from "@/components/rootsy-banner"
import { Table, TableBody, TableCell } from "@/components/ui/table"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import {
  computeDataWorkspaceDateBounds,
  type DataWorkspaceDatePreset,
} from "@/lib/dataWorkspaceDateFilter"
import { entryDateIsoInTimezone, formatPopDateShort } from "@/lib/popTimezone"
import { POP_PERMS } from "@/lib/popPermissionConstants"
import {
  popManufacturingQueryKey,
  popManufacturingQueryRoot,
} from "@/lib/queryKeys"
import {
  createManufacturingRun,
  fetchManufacturingWorkspace,
} from "@/lib/rootsyApi/manufacturingClient"
import { cn } from "@/lib/utils"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Factory, Plus } from "lucide-react"
import { useParams } from "next/navigation"
import { useMemo, useState } from "react"
import type { DateRange } from "react-day-picker"
import "@/components/layouts-tables/rootsLayoutsTablesScope.css"

export function ManufacturingWorkspaceView() {
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : ""
  const queryClient = useQueryClient()
  const tz = usePopTimeZone()
  const { bootstrap, loading: bootstrapLoading, error: bootstrapError, hasPermission } =
    usePopWorkspace()

  const [datePreset, setDatePreset] =
    useState<DataWorkspaceDatePreset>("this_month")
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>()
  const dateBounds = useMemo(
    () => computeDataWorkspaceDateBounds(datePreset, customDateRange),
    [customDateRange, datePreset],
  )

  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dialogError, setDialogError] = useState<string | null>(null)
  const [banner, setBanner] = useState<
    { type: "ok" | "err"; text: string } | null
  >(null)

  const canCreate = hasPermission(
    POP_PERMS.MANUFACTURING_CREATE.resource,
    POP_PERMS.MANUFACTURING_CREATE.action,
  )

  const query = useQuery({
    queryKey: popManufacturingQueryKey(popId, dateBounds.from, dateBounds.to),
    queryFn: async () => {
      const res = await fetchManufacturingWorkspace(popId, dateBounds)
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    enabled: Boolean(popId && siteId),
  })

  const runs = query.data?.runs ?? []
  const recipes = query.data?.recipes ?? []
  const canCreateFromApi = query.data?.canCreate ?? canCreate

  const today = entryDateIsoInTimezone(tz)

  const handleCreate = async (input: {
    recipeId: string
    quantity: number
    producedAt: string
    expiresAt: string | null
  }) => {
    if (!popId) return
    setSaving(true)
    setDialogError(null)
    const res = await createManufacturingRun(popId, input)
    setSaving(false)
    if (!res.success) {
      setDialogError(res.error)
      return
    }
    setDialogOpen(false)
    setBanner({ type: "ok", text: "Producción registrada." })
    await queryClient.invalidateQueries({
      queryKey: popManufacturingQueryRoot(popId),
    })
  }

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">ID de POP no encontrado</p>
      </div>
    )
  }

  return (
    <>
      <DataWorkspaceModuleLayout
        siteId={siteId}
        popId={popId}
        popName={bootstrap?.popName ?? ""}
        title="Fabricar"
        headerVariant={dataWorkspaceModuleHeaderVariant}
        contentFlush
        loading={bootstrapLoading || query.isLoading}
        userName={bootstrap?.userFullName}
        userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
        userRoleLabel={bootstrap?.roleLabel || undefined}
        headerActions={
          canCreateFromApi ? (
            <DataWorkspaceHeaderTooltipIconButton
              label="Fabricar"
              headerVariant={dataWorkspaceModuleHeaderVariant}
              primary
              onClick={() => {
                setDialogError(null)
                setDialogOpen(true)
              }}
            >
              <Plus className="size-5" aria-hidden />
            </DataWorkspaceHeaderTooltipIconButton>
          ) : null
        }
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
          {query.error ? (
            <RootsBanner
              intent="danger"
              layout="message"
              message={
                query.error instanceof Error
                  ? query.error.message
                  : "No se pudo cargar Fabricar."
              }
            />
          ) : null}
          {banner ? (
            <RootsBanner
              intent={banner.type === "ok" ? "success" : "danger"}
              layout="message"
              message={banner.text}
              onDismiss={() => setBanner(null)}
            />
          ) : null}

          <article className={dataWorkspaceDetailFlushBottomCardClass}>
            <div className={dataWorkspaceDetailToolbarClass}>
              <DataWorkspacePeriodFilter
                variant="compact"
                showActiveState={false}
                preset={datePreset}
                customRange={customDateRange}
                onPresetChange={setDatePreset}
                onCustomRangeChange={setCustomDateRange}
                bounds={dateBounds}
              />
            </div>

            {runs.length === 0 ? (
              <DataWorkspaceDetailEmptyState
                icon={Factory}
                title="Sin producciones en este período"
              />
            ) : (
              <div
                className={cn(
                  "min-h-0 flex-1 overflow-x-auto",
                  workspaceLayoutsTablesScopeClass,
                  workspaceTableLayoutListSurfaceClass,
                  workspaceTableLayoutListBodyScopeClass,
                )}
              >
                <Table className={cn(workspaceTableLayoutClassName, "min-w-[44rem]")}>
                  <WorkspaceTableHeader>
                    <WorkspaceTableHeaderRow>
                      <WorkspaceTableHead
                        tone="nature"
                        className={cn("min-w-28", workspaceTableLayoutHeaderHeadClass)}
                      >
                        Día
                      </WorkspaceTableHead>
                      <WorkspaceTableHead
                        tone="nature"
                        className={cn("min-w-40", workspaceTableLayoutHeaderHeadClass)}
                      >
                        Qué
                      </WorkspaceTableHead>
                      <WorkspaceTableHead
                        tone="nature"
                        className={cn("w-28", workspaceTableLayoutHeaderHeadClass)}
                      >
                        Cuántas
                      </WorkspaceTableHead>
                      <WorkspaceTableHead
                        tone="nature"
                        className={cn("min-w-28", workspaceTableLayoutHeaderHeadClass)}
                      >
                        Vence
                      </WorkspaceTableHead>
                      <WorkspaceTableHead
                        tone="nature"
                        className={cn("w-28", workspaceTableLayoutHeaderHeadClass)}
                      >
                        Costo
                      </WorkspaceTableHead>
                      <WorkspaceTableHead
                        tone="nature"
                        className={cn("min-w-32", workspaceTableLayoutHeaderHeadClass)}
                      >
                        Quién
                      </WorkspaceTableHead>
                    </WorkspaceTableHeaderRow>
                  </WorkspaceTableHeader>
                  <TableBody>
                    {runs.map((run, index) => (
                      <WorkspaceTableBodyRow key={run.id} index={index}>
                        <TableCell
                          className={cn(
                            workspaceTableLayoutBodyCellClass,
                            workspaceTableNatureTextPrimaryClass,
                          )}
                        >
                          {formatPopDateShort(run.producedAt, tz)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            workspaceTableLayoutBodyCellClass,
                            workspaceTableNatureTextPrimaryClass,
                          )}
                        >
                          <span className="block">{run.outputArticleName || run.recipeName}</span>
                          {run.outputArticleName && run.recipeName !== run.outputArticleName ? (
                            <span
                              className={cn(
                                "block text-xs",
                                workspaceTableNatureTextSecondaryClass,
                              )}
                            >
                              {run.recipeName}
                            </span>
                          ) : null}
                        </TableCell>
                        <TableCell
                          className={cn(
                            workspaceTableLayoutBodyCellClass,
                            workspaceTableNatureTextPrimaryClass,
                          )}
                        >
                          {formatInventoryQtyWithUnit(
                            run.quantity,
                            run.outputUnitOfMeasure,
                          )}
                        </TableCell>
                        <TableCell
                          className={cn(
                            workspaceTableLayoutBodyCellClass,
                            workspaceTableNatureTextSecondaryClass,
                          )}
                        >
                          {run.expiresAt
                            ? formatPopDateShort(run.expiresAt, tz)
                            : "—"}
                        </TableCell>
                        <TableCell
                          className={cn(
                            workspaceTableLayoutBodyCellClass,
                            workspaceTableNatureMoneyClass,
                          )}
                        >
                          {formatInventoryMoney(run.totalCost)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            workspaceTableLayoutBodyCellClass,
                            workspaceTableNatureTextSecondaryClass,
                          )}
                        >
                          {run.producedByName}
                        </TableCell>
                      </WorkspaceTableBodyRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </article>
        </div>
      </DataWorkspaceModuleLayout>

      <ManufacturingDialog
        open={dialogOpen}
        recipes={recipes}
        defaultDay={today}
        saving={saving}
        error={dialogError}
        onOpenChange={(open) => {
          if (saving) return
          setDialogOpen(open)
          if (!open) setDialogError(null)
        }}
        onSubmit={handleCreate}
      />
    </>
  )
}
