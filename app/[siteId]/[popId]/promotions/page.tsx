"use client"

import {
  createPopPromotion,
  deletePopPromotion,
  getPopPromotionDetail,
  getPopPromotionsTable,
  getPromotionCatalogOptions,
  updatePopPromotion,
  type PromotionCatalogOption,
  type PromotionTableRow,
} from "@/app/[siteId]/[popId]/promotions/actions"
import { PromotionDeleteDialog } from "@/app/[siteId]/[popId]/promotions/PromotionDeleteDialog"
import { PromotionUpsertDialog } from "@/app/[siteId]/[popId]/promotions/PromotionUpsertDialog"
import {
  defaultPromotionFormState,
  promotionFormFromDetail,
  promotionFormToPayload,
  type PromotionFormState,
} from "@/app/[siteId]/[popId]/promotions/promotionFormState"
import {
  PROMOTION_TABLE_PAGE_SIZES,
  promotionDialogBodyClass,
  promotionDialogFooterClass,
  promotionDialogHeaderClass,
  promotionDialogSurfaceClass,
} from "@/app/[siteId]/[popId]/promotions/promotionConstants"
import {
  PromotionTypeToolbarFilter,
  promotionTypeFilterToQuery,
  resolvePromotionTypeFilterId,
} from "@/app/[siteId]/[popId]/promotions/PromotionTypeToolbarFilter"
import {
  PromotionTableImageCell,
  PromotionTableItemsCell,
  PromotionTableNameCell,
  PromotionTablePricingCell,
  PromotionTableScheduleCell,
  PromotionTableSelectCell,
  PromotionTableStatusCell,
  PromotionTableTypeCell,
} from "@/app/[siteId]/[popId]/promotions/promotionsTableCells"
import {
  promotionTableActionsColumnClass,
  promotionTableImageColumnClass,
  promotionTableItemsColumnClass,
  promotionTableNameColumnClass,
  promotionTablePricingColumnClass,
  promotionTableScheduleColumnClass,
  promotionTableStatusColumnClass,
  promotionTableTypeColumnClass,
} from "@/app/[siteId]/[popId]/promotions/promotionsTableLayout"
import {
  mergePromotionsWorkspaceUrl,
  parsePromotionsWorkspaceUrl,
} from "@/app/[siteId]/[popId]/promotions/workspaceUrl"
import { buildPaginationItems } from "@/app/[siteId]/[popId]/layout/layoutPreviewPagination"
import { DataWorkspaceListActiveFiltersBar } from "@/components/data-workspace/DataWorkspaceListActiveFiltersBar"
import { DataWorkspaceListFilterChip } from "@/components/data-workspace/DataWorkspaceListFilterChip"
import {
  DataWorkspaceListFiltersDialogTrigger,
  DataWorkspaceListSearchField,
} from "@/components/data-workspace/DataWorkspaceListFilterFields"
import {
  DataWorkspaceTableListFiltersBar,
  DataWorkspaceTableListNatureShell,
  DataWorkspaceTableListPage,
  DataWorkspaceTableListPaginationFooter,
  DataWorkspaceTableListShell,
  dataWorkspaceTableListHeaderVariant,
} from "@/components/data-workspace/DataWorkspaceTableListLayout"
import {
  DataWorkspaceListTableFrame,
  DataWorkspaceTableEmptyMascot,
  DataWorkspaceTableIconAction,
} from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  workspaceTableLayoutClassName,
  workspaceTableNatureBodyRowClassNames,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  dataWorkspaceListFiltersGridClass,
  dataWorkspaceListFiltersPanelClass,
  dataWorkspaceListFiltersPanelLastClass,
  workspaceTableLayoutActionsBodyCellClass,
  workspaceTableLayoutBodyRowClass,
  workspaceTableLayoutHeaderHeadClass,
  workspaceTableLayoutImageColumnClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import {
  WorkspaceTableHead,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
  WorkspaceTableSelectHead,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { WorkspaceTableSkeletonRows } from "@/components/data-workspace/WorkspaceTableSkeleton"
import { promotionsSkeletonColumns } from "@/components/data-workspace/workspaceTableSkeletonPresets"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import withAuth from "@/hoc/withAuth"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import {
  PROMOTION_TYPE_LABEL,
} from "@/lib/promotionTypes"
import { cn } from "@/lib/utils"
import { Pencil, Plus, Trash2 } from "lucide-react"
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react"

function PromotionsPage() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const siteId = String(params.siteId ?? "")
  const popId = String(params.popId ?? "")
  const ws = useMemo(
    () => parsePromotionsWorkspaceUrl(searchParams),
    [searchParams],
  )
  const searchInputId = useId()
  const filtersButtonId = useId()
  const pageSizeLabelId = useId()

  const { bootstrap, loading: bootstrapLoading } = usePopWorkspace()

  const [promotions, setPromotions] = useState<PromotionTableRow[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [canCreate, setCanCreate] = useState(false)
  const [canUpdate, setCanUpdate] = useState(false)
  const [canDelete, setCanDelete] = useState(false)

  const [searchInput, setSearchInput] = useState(ws.q)
  const [filtersModalOpen, setFiltersModalOpen] = useState(false)
  const [draftSoloActivos, setDraftSoloActivos] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const pushWs = useCallback(
    (patch: Parameters<typeof mergePromotionsWorkspaceUrl>[1]) => {
      const next = mergePromotionsWorkspaceUrl(searchParams, patch)
      router.replace(`${pathname}?${next.toString()}`)
    },
    [pathname, router, searchParams],
  )

  const activePromotionTypeFilterId = useMemo(
    () => resolvePromotionTypeFilterId(ws.promotionType),
    [ws.promotionType],
  )

  const [catalogOptions, setCatalogOptions] = useState<PromotionCatalogOption[]>(
    [],
  )

  const [formOpen, setFormOpen] = useState(false)
  const [formDetailLoading, setFormDetailLoading] = useState(false)
  const [formSaving, setFormSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PromotionFormState>(defaultPromotionFormState())

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PromotionTableRow | null>(
    null,
  )
  const [deleteTyped, setDeleteTyped] = useState("")
  const [deleteBanner, setDeleteBanner] = useState<string | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const loadTable = useCallback(async () => {
    if (!popId) return
    setLoading(true)
    const res = await getPopPromotionsTable(popId, {
      q: ws.q,
      page: ws.page,
      pageSize: ws.pageSize,
      soloActivos: ws.soloActivos,
      promotionType: ws.promotionType,
    })
    setLoading(false)
    if (!res.success) {
      setError(res.error)
      if (res.redirect) router.replace(res.redirect)
      setPromotions(res.promotions)
      setTotalCount(res.totalCount)
      setCanCreate(res.canCreate)
      setCanUpdate(res.canUpdate)
      setCanDelete(res.canDelete)
      return
    }
    setError(null)
    setPromotions(res.promotions)
    setSelected(new Set())
    setTotalCount(res.totalCount)
    setCanCreate(res.canCreate)
    setCanUpdate(res.canUpdate)
    setCanDelete(res.canDelete)
  }, [popId, ws, router])

  useEffect(() => {
    void loadTable()
  }, [loadTable])

  useEffect(() => {
    if (!popId) return
    void getPromotionCatalogOptions(popId).then((res) => {
      if (res.success) setCatalogOptions(res.options)
    })
  }, [popId])

  useEffect(() => {
    setSearchInput(ws.q)
  }, [ws.q])

  useEffect(() => {
    const t = window.setTimeout(() => {
      const next = searchInput.trim()
      if (next === ws.q.trim()) return
      pushWs({ q: next, page: 1 })
    }, 400)
    return () => window.clearTimeout(t)
  }, [searchInput, ws.q, pushWs])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target
      if (!(target instanceof HTMLElement)) return
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return
      }
      e.preventDefault()
      searchInputRef.current?.focus()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const totalPages = Math.max(1, Math.ceil(totalCount / ws.pageSize))
  const rangeStart =
    totalCount === 0 ? 0 : (ws.page - 1) * ws.pageSize + 1
  const rangeEnd = Math.min(ws.page * ws.pageSize, totalCount)

  const skeletonRowCount = Math.min(12, Math.max(5, ws.pageSize))
  const paginationItems = useMemo(
    () => buildPaginationItems(totalPages, ws.page),
    [totalPages, ws.page],
  )

  const visibleIds = useMemo(() => promotions.map((row) => row.id), [promotions])
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))
  const someVisibleSelected = visibleIds.some((id) => selected.has(id))

  const modalFiltersActiveCount = ws.soloActivos ? 1 : 0

  const hasFilterChips =
    ws.q.trim() !== "" || ws.soloActivos || ws.promotionType !== ""

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (ws.q.trim()) count++
    if (ws.soloActivos) count++
    if (ws.promotionType) count++
    return count
  }, [ws.q, ws.soloActivos, ws.promotionType])

  const resultsSummary = useMemo(() => {
    if (loading && totalCount === 0) return "…"
    if (totalCount === 0) return "Sin resultados"
    const noun = totalCount === 1 ? "promoción" : "promociones"
    return `${totalCount.toLocaleString("es-AR")} ${noun}`
  }, [loading, totalCount])

  const clearAllFilters = useCallback(() => {
    setSearchInput("")
    pushWs({
      q: "",
      soloActivos: false,
      promotionType: "",
      page: 1,
    })
    searchInputRef.current?.focus()
  }, [pushWs])

  const openCreate = () => {
    setEditingId(null)
    setForm(defaultPromotionFormState())
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = async (row: PromotionTableRow) => {
    setFormError(null)
    setFormDetailLoading(true)
    setFormOpen(true)
    setEditingId(row.id)
    const res = await getPopPromotionDetail(popId, row.id)
    setFormDetailLoading(false)
    if (!res.success) {
      setFormError(res.error)
      return
    }
    setForm(promotionFormFromDetail(res.promotion))
  }

  const closeForm = () => {
    setFormOpen(false)
  }

  const finalizeFormClose = () => {
    setEditingId(null)
    setFormError(null)
    setFormDetailLoading(false)
    setFormSaving(false)
    setForm(defaultPromotionFormState())
  }

  const submitForm = async (e: FormEvent) => {
    e.preventDefault()
    if (formSaving || formDetailLoading) return
    setFormSaving(true)
    setFormError(null)
    const payload = promotionFormToPayload(form)
    const res = editingId
      ? await updatePopPromotion(popId, editingId, payload)
      : await createPopPromotion(popId, payload)
    setFormSaving(false)
    if (!res.success) {
      setFormError(res.error)
      return
    }
    setFormOpen(false)
    await loadTable()
  }

  const submitDelete = async () => {
    if (!deleteTarget || deleteBusy) return
    setDeleteBusy(true)
    setDeleteBanner(null)
    const res = await deletePopPromotion(popId, deleteTarget.id, deleteTyped)
    setDeleteBusy(false)
    if (!res.success) {
      setDeleteBanner(res.error)
      return
    }
    requestCloseDelete()
    await loadTable()
  }

  const requestCloseDelete = () => {
    setDeleteOpen(false)
  }

  const finalizeDeleteClose = () => {
    setDeleteTarget(null)
    setDeleteTyped("")
    setDeleteBanner(null)
  }

  const openDelete = (row: PromotionTableRow) => {
    setDeleteTarget(row)
    setDeleteTyped("")
    setDeleteBanner(null)
    setDeleteOpen(true)
  }

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado</p>
      </div>
    )
  }

  return (
    <DataWorkspaceTableListPage
      layout={{
        siteId,
        popId,
        popName: bootstrap?.popName ?? "",
        title: "Promociones",
        loading: bootstrapLoading || loading,
        userName: bootstrap?.userFullName,
        userAvatarSrc: bootstrap?.userImageUrl ?? undefined,
        userRoleLabel: bootstrap?.roleLabel ?? undefined,
        pillLabel: "Menú",
        headerActions: canCreate ? (
          <DataWorkspaceHeaderIconButton
            label="Nueva promoción"
            headerVariant={dataWorkspaceTableListHeaderVariant}
            primary
            onClick={openCreate}
          >
            <Plus className="size-5" aria-hidden />
          </DataWorkspaceHeaderIconButton>
        ) : null,
      }}
      error={error}
    >
      <DataWorkspaceTableListNatureShell>
        <DataWorkspaceTableListFiltersBar>
              <div className={dataWorkspaceListFiltersGridClass}>
                <div className={dataWorkspaceListFiltersPanelClass}>
                  <PromotionTypeToolbarFilter
                    value={activePromotionTypeFilterId}
                    onChange={(id) =>
                      pushWs({
                        promotionType: promotionTypeFilterToQuery(id),
                        page: 1,
                      })
                    }
                  />
                </div>

                <div className={dataWorkspaceListFiltersPanelClass}>
                  <DataWorkspaceListFiltersDialogTrigger
                    id={filtersButtonId}
                    placeholder="Estado"
                    activeCount={modalFiltersActiveCount}
                    expanded={filtersModalOpen}
                    onClick={() => {
                      setDraftSoloActivos(ws.soloActivos)
                      setFiltersModalOpen(true)
                    }}
                  />
                </div>

                <div className={dataWorkspaceListFiltersPanelLastClass}>
                  <DataWorkspaceListSearchField
                    id={searchInputId}
                    inputRef={searchInputRef}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onClear={() => {
                      setSearchInput("")
                      searchInputRef.current?.focus()
                    }}
                    placeholder="Nombre, descripción… ( / )"
                    resultsSummary={resultsSummary}
                  />
                </div>
              </div>
        </DataWorkspaceTableListFiltersBar>

        <DataWorkspaceTableListShell
          activeFiltersBar={
            hasFilterChips ? (
              <DataWorkspaceListActiveFiltersBar
                activeCount={activeFilterCount}
                onClearAll={clearAllFilters}
              >
                {ws.q.trim() ? (
                  <DataWorkspaceListFilterChip
                    label={`Buscar: «${ws.q.trim()}»`}
                    onRemove={() => pushWs({ q: "", page: 1 })}
                    removeAriaLabel="Quitar búsqueda"
                  />
                ) : null}
                {ws.soloActivos ? (
                  <DataWorkspaceListFilterChip
                    label="Solo activas"
                    onRemove={() => pushWs({ soloActivos: false, page: 1 })}
                    removeAriaLabel="Quitar filtro solo activas"
                  />
                ) : null}
                {ws.promotionType ? (
                  <DataWorkspaceListFilterChip
                    label={`Tipo: ${PROMOTION_TYPE_LABEL[ws.promotionType]}`}
                    onRemove={() => pushWs({ promotionType: "", page: 1 })}
                    removeAriaLabel="Quitar filtro de tipo"
                  />
                ) : null}
              </DataWorkspaceListActiveFiltersBar>
            ) : null
          }
          overlay={
            !loading && totalCount === 0 ? (
              <DataWorkspaceTableEmptyMascot />
            ) : null
          }
          footer={
            <DataWorkspaceTableListPaginationFooter
              listFetching={loading}
              totalCount={totalCount}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              currentPage={ws.page}
              totalPages={totalPages}
              pageSize={ws.pageSize}
              pageSizeOptions={PROMOTION_TABLE_PAGE_SIZES}
              paginationItems={paginationItems}
              onPageChange={(p) => pushWs({ page: p })}
              onPageSizeChange={(ps) =>
                pushWs({
                  pageSize: ps as typeof ws.pageSize,
                  page: 1,
                })
              }
              pageSizeLabelId={pageSizeLabelId}
            />
          }
        >
          <DataWorkspaceListTableFrame>
            <table
              className={cn(workspaceTableLayoutClassName, "min-w-[80rem]")}
              aria-busy={loading}
            >
              <WorkspaceTableHeader>
                <WorkspaceTableHeaderRow>
                  <WorkspaceTableSelectHead
                    tone="nature"
                    className={workspaceTableLayoutHeaderHeadClass}
                    checked={
                      allVisibleSelected
                        ? true
                        : someVisibleSelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={(checked) => {
                      setSelected((prev) => {
                        const next = new Set(prev)
                        if (checked === true) {
                          visibleIds.forEach((id) => next.add(id))
                        } else {
                          visibleIds.forEach((id) => next.delete(id))
                        }
                        return next
                      })
                    }}
                    disabled={
                      loading || totalCount === 0 || promotions.length === 0
                    }
                    ariaLabel="Seleccionar filas visibles"
                  />
                  <WorkspaceTableHead
                    tone="nature"
                    className={cn(
                      workspaceTableLayoutImageColumnClass,
                      promotionTableImageColumnClass,
                      "px-3",
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                    srOnly
                  >
                    Imagen
                  </WorkspaceTableHead>
                  <WorkspaceTableHead
                    tone="nature"
                    className={cn(
                      promotionTableNameColumnClass,
                      "px-3",
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                  >
                    Promoción
                  </WorkspaceTableHead>
                  <WorkspaceTableHead
                    tone="nature"
                    className={cn(
                      promotionTableTypeColumnClass,
                      "px-3",
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                  >
                    Tipo
                  </WorkspaceTableHead>
                  <WorkspaceTableHead
                    tone="nature"
                    className={cn(
                      promotionTablePricingColumnClass,
                      "px-3",
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                  >
                    Precio / regla
                  </WorkspaceTableHead>
                  <WorkspaceTableHead
                    tone="nature"
                    className={cn(
                      promotionTableScheduleColumnClass,
                      "px-3",
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                  >
                    Vigencia
                  </WorkspaceTableHead>
                  <WorkspaceTableHead
                    tone="nature"
                    className={cn(
                      promotionTableItemsColumnClass,
                      "px-3",
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                  >
                    Ítems
                  </WorkspaceTableHead>
                  <WorkspaceTableHead
                    tone="nature"
                    className={cn(
                      promotionTableStatusColumnClass,
                      "px-3",
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                  >
                    Estado
                  </WorkspaceTableHead>
                  {canUpdate || canDelete ? (
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        promotionTableActionsColumnClass,
                        "px-3 text-right",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                      srOnly
                    >
                      Acciones
                    </WorkspaceTableHead>
                  ) : null}
                </WorkspaceTableHeaderRow>
              </WorkspaceTableHeader>
              <TableBody>
                {loading ? (
                  <WorkspaceTableSkeletonRows
                    rowCount={skeletonRowCount}
                    rowKeyPrefix="promotions-sk"
                    columns={promotionsSkeletonColumns({
                      hasActionsColumn: Boolean(canUpdate || canDelete),
                    })}
                    tone="nature"
                  />
                ) : totalCount === 0 ? null : (
                  promotions.map((row, index) => (
                    <TableRow
                      key={row.id}
                      className={cn(
                        workspaceTableLayoutBodyRowClass,
                        workspaceTableNatureBodyRowClassNames(index, {
                          selected: selected.has(row.id),
                          noHover: true,
                          inactive: !row.isActive,
                        }),
                      )}
                    >
                      <PromotionTableSelectCell
                        checked={selected.has(row.id)}
                        onCheckedChange={(checked) => {
                          setSelected((prev) => {
                            const next = new Set(prev)
                            if (checked) next.add(row.id)
                            else next.delete(row.id)
                            return next
                          })
                        }}
                        label={`Seleccionar ${row.name || "promoción"}`}
                      />
                      <PromotionTableImageCell row={row} />
                      <PromotionTableNameCell row={row} />
                      <PromotionTableTypeCell row={row} />
                      <PromotionTablePricingCell row={row} />
                      <PromotionTableScheduleCell row={row} />
                      <PromotionTableItemsCell row={row} />
                      <PromotionTableStatusCell row={row} />
                      {canUpdate || canDelete ? (
                        <TableCell className={workspaceTableLayoutActionsBodyCellClass}>
                          <div className="flex items-center justify-end gap-0.5">
                            {canUpdate ? (
                              <DataWorkspaceTableIconAction
                                label={`Editar ${row.name}`}
                                icon={Pencil}
                                onClick={() => void openEdit(row)}
                              />
                            ) : null}
                            {canDelete ? (
                              <DataWorkspaceTableIconAction
                                label={`Eliminar ${row.name}`}
                                variant="destructive"
                                icon={Trash2}
                              onClick={() => openDelete(row)}
                              />
                            ) : null}
                          </div>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </table>
          </DataWorkspaceListTableFrame>
        </DataWorkspaceTableListShell>
      </DataWorkspaceTableListNatureShell>

      <Dialog
        open={filtersModalOpen}
        onOpenChange={(open) => {
          if (open) setDraftSoloActivos(ws.soloActivos)
          setFiltersModalOpen(open)
        }}
      >
        <DialogContent
          className={promotionDialogSurfaceClass}
          showCloseButton
          data-rootsy-light-shell="true"
        >
          <DialogHeader className={promotionDialogHeaderClass}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Filtros
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Combinan con la búsqueda y el tipo. El listado se pagina en el
              servidor.
            </DialogDescription>
          </DialogHeader>
          <div className={promotionDialogBodyClass}>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-transparent px-1 py-0.5 hover:bg-muted/50">
              <Checkbox
                id="filter-solo-activos"
                checked={draftSoloActivos}
                onCheckedChange={(v) => setDraftSoloActivos(Boolean(v))}
                aria-label="Solo promociones activas"
              />
              <span className="text-sm text-foreground">Solo promociones activas</span>
            </label>
          </div>
          <DialogFooter className={promotionDialogFooterClass}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDraftSoloActivos(false)}
            >
              Restablecer
            </Button>
            <Button
              type="button"
              onClick={() => {
                pushWs({ soloActivos: draftSoloActivos, page: 1 })
                setFiltersModalOpen(false)
              }}
            >
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PromotionUpsertDialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open && !formSaving) closeForm()
        }}
        mode={editingId ? "edit" : "create"}
        idPrefix={editingId ? "promo-edit" : "promo-create"}
        title={editingId ? "Editar promoción" : "Nueva promoción"}
        description="Combos con ítems configurables u ofertas por cantidad (2x1, etc.)."
        loading={formDetailLoading}
        saving={formSaving}
        banner={formError}
        onSubmit={(e) => void submitForm(e)}
        onCancel={closeForm}
        onAfterClose={finalizeFormClose}
        form={form}
        setForm={setForm}
        catalogOptions={catalogOptions}
        disabled={formDetailLoading || formSaving}
      />

      {deleteTarget ? (
        <PromotionDeleteDialog
          open={deleteOpen}
          promotionName={deleteTarget.name}
          confirmValue={deleteTyped}
          banner={deleteBanner}
          busy={deleteBusy}
          onOpenChange={(open) => {
            if (!open && !deleteBusy) requestCloseDelete()
          }}
          onClose={requestCloseDelete}
          onAfterClose={finalizeDeleteClose}
          onConfirmValueChange={setDeleteTyped}
          onConfirmDelete={() => void submitDelete()}
        />
      ) : null}
    </DataWorkspaceTableListPage>
  )
}

export default withAuth(PromotionsPage)
