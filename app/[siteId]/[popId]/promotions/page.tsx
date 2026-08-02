"use client"

import {
  createPopPromotion,
  deletePopPromotion,
  getPopPromotionDetail,
  getPopPromotionsTable,
  getPromotionCatalogOptions,
  updatePopPromotion,
  type PromotionCatalogOption,
  type PromotionDetail,
  type PromotionTableRow,
} from "@/app/[siteId]/[popId]/promotions/actions"
import {
  PromotionSlotEditor,
  createEmptySlotLine,
  slotLinesFromDetail,
  slotLinesToInput,
  type PromotionSlotFormLine,
} from "@/app/[siteId]/[popId]/promotions/components/PromotionSlotEditor"
import {
  PROMOTION_DELETE_CONFIRM_PHRASE,
  PROMOTION_TABLE_PAGE_SIZES,
  QUANTITY_DEAL_SLOT_LABEL,
  DEFAULT_PROMOTION_TABLE_PAGE_SIZE,
  promotionDialogBodyClass,
  promotionDialogFooterClass,
  promotionDialogHeaderClass,
  promotionDialogSurfaceWideClass,
  promotionFormFieldClass,
} from "@/app/[siteId]/[popId]/promotions/promotionConstants"
import { buildPaginationItems } from "@/app/[siteId]/[popId]/layout/layoutPreviewPagination"
import { DataWorkspaceListPaginationFooter } from "@/components/data-workspace/DataWorkspaceListPaginationFooter"
import { DataWorkspaceListTableShell } from "@/components/data-workspace/DataWorkspaceListTableShell"
import {
  DataWorkspaceListTableFrame,
  DataWorkspaceTableEmptyMascot,
  DataWorkspaceTableIconAction,
  DataWorkspaceTableThumbnail,
} from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  lightFilterChipClass,
  lightTableThClass,
  lightToolbarButtonClass,
  lightToolbarControlActiveClass,
  lightToolbarInputClass,
  lightToolbarClearButtonClass,
  lightToolbarPanelClass,
  lightToolbarPanelLastClass,
  lightToolbarShellClass,
  tdTruncatedNameCellClass,
  tdTruncatedTextCellClass,
  toolbarBlockLabelClass,
  workspaceDataTableClassName,
  workspaceTableBodyRowClassNames,
  workspaceTableHeaderRowClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { WorkspaceTableSkeletonRows } from "@/components/data-workspace/WorkspaceTableSkeleton"
import { promotionsSkeletonColumns } from "@/components/data-workspace/workspaceTableSkeletonPresets"
import { DataWorkspaceLayout } from "@/components/layouts/DataWorkspaceLayout"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import { Badge } from "@/components/ui/badge"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import withAuth from "@/hoc/withAuth"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import {
  ALL_PROMOTION_WEEKDAYS,
  PROMOTION_BENEFIT_TARGET_LABEL,
  PROMOTION_PRICING_MODE_LABEL,
  PROMOTION_TYPE_LABEL,
  PROMOTION_WEEKDAY_OPTIONS,
  type PromotionBenefitTarget,
  type PromotionPricingMode,
  type PromotionType,
} from "@/lib/promotionTypes"
import { cn } from "@/lib/utils"
import { Filter, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react"

type PromotionFormState = {
  name: string
  description: string
  imageUrl: string
  promotionType: PromotionType
  pricingMode: PromotionPricingMode
  fixedPrice: string
  discountMode: "porcentaje" | "fijo"
  discountValue: string
  buyQuantity: string
  benefitQuantity: string
  benefitDiscountPct: string
  applyBenefitTo: PromotionBenefitTarget
  autoApply: boolean
  showInMenu: boolean
  isActive: boolean
  validFrom: string
  validUntil: string
  validTimeStart: string
  validTimeEnd: string
  scheduleDays: number[]
  slots: PromotionSlotFormLine[]
}

function defaultFormState(): PromotionFormState {
  return {
    name: "",
    description: "",
    imageUrl: "",
    promotionType: "combo",
    pricingMode: "fixed_total",
    fixedPrice: "",
    discountMode: "porcentaje",
    discountValue: "",
    buyQuantity: "2",
    benefitQuantity: "1",
    benefitDiscountPct: "100",
    applyBenefitTo: "cheapest",
    autoApply: true,
    showInMenu: true,
    isActive: true,
    validFrom: "",
    validUntil: "",
    validTimeStart: "",
    validTimeEnd: "",
    scheduleDays: [...ALL_PROMOTION_WEEKDAYS],
    slots: [createEmptySlotLine()],
  }
}

function formFromDetail(promotion: PromotionDetail): PromotionFormState {
  return {
    name: promotion.name,
    description: promotion.description,
    imageUrl: promotion.imageUrl ?? "",
    promotionType: promotion.promotionType,
    pricingMode: promotion.pricingMode,
    fixedPrice:
      promotion.fixedPrice != null ? String(promotion.fixedPrice) : "",
    discountMode: promotion.discountMode ?? "porcentaje",
    discountValue:
      promotion.discountValue != null ? String(promotion.discountValue) : "",
    buyQuantity:
      promotion.buyQuantity != null ? String(promotion.buyQuantity) : "2",
    benefitQuantity:
      promotion.benefitQuantity != null
        ? String(promotion.benefitQuantity)
        : "1",
    benefitDiscountPct:
      promotion.benefitDiscountPct != null
        ? String(promotion.benefitDiscountPct)
        : "100",
    applyBenefitTo: promotion.applyBenefitTo ?? "cheapest",
    autoApply: promotion.autoApply,
    showInMenu: promotion.showInMenu,
    isActive: promotion.isActive,
    validFrom: promotion.validFrom ?? "",
    validUntil: promotion.validUntil ?? "",
    validTimeStart: promotion.validTimeStart ?? "",
    validTimeEnd: promotion.validTimeEnd ?? "",
    scheduleDays: promotion.scheduleDays,
    slots: slotLinesFromDetail(promotion.promotionType, promotion.slots),
  }
}

function formToPayload(form: PromotionFormState) {
  const slots =
    form.promotionType === "quantity_deal"
      ? [
          {
            label: QUANTITY_DEAL_SLOT_LABEL,
            quantity: 1,
            options: slotLinesToInput(form.slots)[0]?.options ?? [],
          },
        ]
      : slotLinesToInput(form.slots)

  return {
    name: form.name,
    description: form.description,
    imageUrl: form.imageUrl,
    promotionType: form.promotionType,
    pricingMode: form.pricingMode,
    fixedPrice:
      form.pricingMode === "fixed_total"
        ? Number(form.fixedPrice.replace(",", "."))
        : null,
    discountMode:
      form.pricingMode === "fixed_total" ? null : form.discountMode,
    discountValue:
      form.pricingMode === "fixed_total"
        ? null
        : Number(form.discountValue.replace(",", ".")),
    buyQuantity:
      form.promotionType === "quantity_deal"
        ? Number(form.buyQuantity.replace(",", "."))
        : null,
    benefitQuantity:
      form.promotionType === "quantity_deal"
        ? Number(form.benefitQuantity.replace(",", "."))
        : null,
    benefitDiscountPct:
      form.promotionType === "quantity_deal"
        ? Number(form.benefitDiscountPct.replace(",", "."))
        : null,
    applyBenefitTo:
      form.promotionType === "quantity_deal" ? form.applyBenefitTo : null,
    autoApply: form.autoApply,
    showInMenu: form.showInMenu,
    isActive: form.isActive,
    validFrom: form.validFrom.trim() || null,
    validUntil: form.validUntil.trim() || null,
    validTimeStart: form.validTimeStart.trim() || null,
    validTimeEnd: form.validTimeEnd.trim() || null,
    scheduleDays: form.scheduleDays,
    slots,
  }
}

function PromotionsPage() {
  const params = useParams()
  const router = useRouter()
  const siteId = String(params.siteId ?? "")
  const popId = String(params.popId ?? "")
  const searchInputId = useId()
  const pageSizeLabelId = useId()

  const { bootstrap, loading: bootstrapLoading } = usePopWorkspace()

  const [promotions, setPromotions] = useState<PromotionTableRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PROMOTION_TABLE_PAGE_SIZE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [canCreate, setCanCreate] = useState(false)
  const [canUpdate, setCanUpdate] = useState(false)
  const [canDelete, setCanDelete] = useState(false)

  const [searchInput, setSearchInput] = useState("")
  const [q, setQ] = useState("")
  const [soloActivos, setSoloActivos] = useState(false)
  const [promotionTypeFilter, setPromotionTypeFilter] = useState<
    PromotionType | ""
  >("")
  const [filtersModalOpen, setFiltersModalOpen] = useState(false)
  const [draftSoloActivos, setDraftSoloActivos] = useState(false)
  const [draftTypeFilter, setDraftTypeFilter] = useState<PromotionType | "">("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [catalogOptions, setCatalogOptions] = useState<PromotionCatalogOption[]>(
    [],
  )

  const [formOpen, setFormOpen] = useState(false)
  const [formBusy, setFormBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PromotionFormState>(defaultFormState())

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PromotionTableRow | null>(
    null,
  )
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [deleteBusy, setDeleteBusy] = useState(false)

  const loadTable = useCallback(async () => {
    if (!popId) return
    setLoading(true)
    const res = await getPopPromotionsTable(popId, {
      q,
      page,
      pageSize,
      soloActivos,
      promotionType: promotionTypeFilter,
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
    setTotalCount(res.totalCount)
    setCanCreate(res.canCreate)
    setCanUpdate(res.canUpdate)
    setCanDelete(res.canDelete)
  }, [popId, q, page, pageSize, soloActivos, promotionTypeFilter, router])

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
    const t = window.setTimeout(() => {
      setQ(searchInput.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(t)
  }, [searchInput])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const rangeStart =
    totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, totalCount)

  const skeletonRowCount = Math.min(12, Math.max(5, pageSize))
  const paginationItems = useMemo(
    () => buildPaginationItems(totalPages, page),
    [totalPages, page],
  )

  const modalFiltersActiveCount =
    (soloActivos ? 1 : 0) + (promotionTypeFilter ? 1 : 0)

  const openCreate = () => {
    setEditingId(null)
    setForm(defaultFormState())
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = async (row: PromotionTableRow) => {
    setFormError(null)
    setFormBusy(true)
    setFormOpen(true)
    setEditingId(row.id)
    const res = await getPopPromotionDetail(popId, row.id)
    setFormBusy(false)
    if (!res.success) {
      setFormError(res.error)
      return
    }
    setForm(formFromDetail(res.promotion))
  }

  const closeForm = () => {
    if (formBusy) return
    setFormOpen(false)
    setEditingId(null)
    setFormError(null)
  }

  const submitForm = async (e: FormEvent) => {
    e.preventDefault()
    if (formBusy) return
    setFormBusy(true)
    setFormError(null)
    const payload = formToPayload(form)
    const res = editingId
      ? await updatePopPromotion(popId, editingId, payload)
      : await createPopPromotion(popId, payload)
    setFormBusy(false)
    if (!res.success) {
      setFormError(res.error)
      return
    }
    setFormOpen(false)
    setEditingId(null)
    await loadTable()
  }

  const confirmDelete = async () => {
    if (!deleteTarget || deleteBusy) return
    setDeleteBusy(true)
    const res = await deletePopPromotion(popId, deleteTarget.id, deleteConfirm)
    setDeleteBusy(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    setDeleteOpen(false)
    setDeleteTarget(null)
    setDeleteConfirm("")
    await loadTable()
  }

  const toggleWeekday = (day: number) => {
    setForm((prev) => {
      const set = new Set(prev.scheduleDays)
      if (set.has(day)) set.delete(day)
      else set.add(day)
      return { ...prev, scheduleDays: [...set].sort((a, b) => a - b) }
    })
  }

  const setPromotionType = (type: PromotionType) => {
    setForm((prev) => ({
      ...prev,
      promotionType: type,
      slots:
        type === "quantity_deal"
          ? [
              {
                ...createEmptySlotLine(QUANTITY_DEAL_SLOT_LABEL),
                options: prev.slots[0]?.options ?? [],
              },
            ]
          : prev.slots.length > 0 && prev.slots[0].label !== QUANTITY_DEAL_SLOT_LABEL
            ? prev.slots
            : [createEmptySlotLine()],
    }))
  }

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado</p>
      </div>
    )
  }

  return (
    <DataWorkspaceLayout
      siteId={siteId}
      popId={popId}
      popName={bootstrap?.popName ?? ""}
      title="Promociones"
      headerVariant="dark"
      contentFlush
      sidebarCollapsible={false}
      loading={bootstrapLoading || loading}
      userName={bootstrap?.userFullName}
      userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
      userRoleLabel={bootstrap?.roleLabel ?? undefined}
      pillLabel="Menú"
      mainClassName="min-h-0 overflow-hidden"
      headerActions={
        canCreate ? (
          <DataWorkspaceHeaderIconButton
            label="Nueva promoción"
            headerVariant="dark"
            primary
            onClick={openCreate}
          >
            <Plus className="size-5" aria-hidden />
          </DataWorkspaceHeaderIconButton>
        ) : null
      }
    >
      <div className="relative flex min-h-0 w-full flex-1 flex-col">
        {error ? (
          <div
            role="alert"
            className="relative shrink-0 border-b border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        ) : null}

        <div className={lightToolbarShellClass} role="toolbar">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12">
            <div
              className={cn(
                lightToolbarPanelClass,
                "order-2 md:col-span-1 xl:order-1 xl:col-span-3",
              )}
            >
              <div className="mb-2 flex items-baseline justify-between">
                <span className={toolbarBlockLabelClass}>Filtros</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  lightToolbarButtonClass,
                  modalFiltersActiveCount > 0 && lightToolbarControlActiveClass,
                )}
                onClick={() => {
                  setDraftSoloActivos(soloActivos)
                  setDraftTypeFilter(promotionTypeFilter)
                  setFiltersModalOpen(true)
                }}
              >
                <Filter className="size-4 shrink-0 opacity-80" />
                <span className="truncate">Tipo y estado</span>
              </Button>
            </div>
            <div
              className={cn(
                lightToolbarPanelLastClass,
                "order-1 md:col-span-2 xl:order-2 xl:col-span-9",
              )}
            >
              <label htmlFor={searchInputId} className={toolbarBlockLabelClass}>
                Buscar
              </label>
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  id={searchInputId}
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Nombre, descripción…"
                  className={cn(lightToolbarInputClass, searchInput && "pr-10")}
                />
                {searchInput ? (
                  <button
                    type="button"
                    className={lightToolbarClearButtonClass}
                    onClick={() => setSearchInput("")}
                  >
                    <X className="size-3.5" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <DataWorkspaceListTableShell
          variant="flush"
          overlay={
            !loading && totalCount === 0 ? (
              <DataWorkspaceTableEmptyMascot />
            ) : null
          }
          footer={
            <DataWorkspaceListPaginationFooter
              variant="dark"
              listFetching={loading}
              totalCount={totalCount}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              currentPage={page}
              totalPages={totalPages}
              pageSize={pageSize}
              pageSizeOptions={PROMOTION_TABLE_PAGE_SIZES}
              paginationItems={paginationItems}
              onPageChange={setPage}
              onPageSizeChange={(ps) => {
                setPageSize(ps)
                setPage(1)
              }}
              pageSizeLabelId={pageSizeLabelId}
            />
          }
        >
          <DataWorkspaceListTableFrame>
            <table className={workspaceDataTableClassName} aria-busy={loading}>
            <TableHeader>
              <TableRow className={workspaceTableHeaderRowClass}>
                <TableHead className={cn(lightTableThClass, "w-24 px-3 text-left")}>
                  <span className="sr-only">Imagen</span>
                </TableHead>
                <TableHead
                  className={cn(
                    lightTableThClass,
                    "w-[14rem] min-w-0 max-w-[14rem] px-3 text-left",
                  )}
                >
                  Promoción
                </TableHead>
                <TableHead className={cn(lightTableThClass, "w-[7rem] px-3 text-left")}>
                  Tipo
                </TableHead>
                <TableHead className={cn(lightTableThClass, "min-w-[9rem] px-3 text-left")}>
                  Precio / regla
                </TableHead>
                <TableHead className={cn(lightTableThClass, "min-w-[10rem] px-3 text-left")}>
                  Vigencia
                </TableHead>
                <TableHead className={cn(lightTableThClass, "w-[8rem] px-3 text-left")}>
                  Ítems
                </TableHead>
                <TableHead className={cn(lightTableThClass, "w-[7.5rem] px-3 text-left")}>
                  Estado
                </TableHead>
                {(canUpdate || canDelete) ? (
                  <TableHead className={cn(lightTableThClass, "w-[6.5rem] px-3 text-right")}>
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <WorkspaceTableSkeletonRows
                  rowCount={skeletonRowCount}
                  rowKeyPrefix="promotions-sk"
                  columns={promotionsSkeletonColumns({
                    hasActionsColumn: Boolean(canUpdate || canDelete),
                  })}
                />
              ) : (
                promotions.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className={workspaceTableBodyRowClassNames(index)}
                  >
                    <TableCell className="w-24 px-3 py-2.5 align-middle">
                      <DataWorkspaceTableThumbnail
                        src={
                          row.imageUrl ??
                          `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(row.id)}`
                        }
                        alt={row.name}
                        size="lg"
                      />
                    </TableCell>
                    <TableCell className={tdTruncatedNameCellClass}>
                      <div className="flex min-w-0 flex-col gap-1">
                        <span
                          className="block min-w-0 truncate font-medium leading-snug text-foreground"
                          title={row.name}
                        >
                          {row.name}
                        </span>
                        {row.description ? (
                          <span
                            className="block min-w-0 truncate text-xs leading-tight text-muted-foreground"
                            title={row.description}
                          >
                            {row.description}
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className={tdTruncatedTextCellClass}>
                      {PROMOTION_TYPE_LABEL[row.promotionType]}
                    </TableCell>
                    <TableCell className={tdTruncatedTextCellClass}>
                      <span className="block truncate" title={row.pricingSummary}>
                        {row.pricingSummary}
                      </span>
                    </TableCell>
                    <TableCell className={tdTruncatedTextCellClass}>
                      <span className="block truncate text-xs" title={row.scheduleSummary}>
                        {row.scheduleSummary}
                      </span>
                    </TableCell>
                    <TableCell className={tdTruncatedTextCellClass}>
                      {row.promotionType === "combo"
                        ? `${row.slotCount} ítems · ${row.optionCount} opc.`
                        : `${row.optionCount} elegibles`}
                    </TableCell>
                    <TableCell className="w-[7.5rem] px-3 py-2.5 align-middle">
                      <div className="flex flex-wrap gap-1">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-normal",
                            row.isActive
                              ? "border-emerald-200/90 bg-emerald-50/90 text-emerald-700"
                              : "text-muted-foreground",
                          )}
                        >
                          {row.isActive ? "Activa" : "Inactiva"}
                        </Badge>
                        {row.showInMenu ? (
                          <Badge variant="secondary" className="font-normal">
                            Menú
                          </Badge>
                        ) : null}
                        {row.autoApply ? (
                          <Badge variant="secondary" className="font-normal">
                            Auto
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    {canUpdate || canDelete ? (
                      <TableCell className="w-[6.5rem] px-3 py-2.5 text-right align-middle">
                        <div className="flex items-center justify-end gap-1">
                          {canUpdate ? (
                            <DataWorkspaceTableIconAction
                              label={`Editar ${row.name}`}
                              icon={Pencil}
                              variant="edit"
                              onClick={() => void openEdit(row)}
                            />
                          ) : null}
                          {canDelete ? (
                            <DataWorkspaceTableIconAction
                              label={`Eliminar ${row.name}`}
                              variant="destructive"
                              icon={Trash2}
                              onClick={() => {
                                setDeleteTarget(row)
                                setDeleteConfirm("")
                                setDeleteOpen(true)
                              }}
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
        </DataWorkspaceListTableShell>
      </div>

      <Dialog open={filtersModalOpen} onOpenChange={setFiltersModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filtros</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="filter-solo-activos"
                checked={draftSoloActivos}
                onCheckedChange={(v) => setDraftSoloActivos(Boolean(v))}
              />
              <Label htmlFor="filter-solo-activos">Solo activas</Label>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={draftTypeFilter || "all"}
                onValueChange={(v) =>
                  setDraftTypeFilter(
                    v === "all" ? "" : (v as PromotionType),
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="combo">Combo</SelectItem>
                  <SelectItem value="quantity_deal">Por cantidad</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                setSoloActivos(draftSoloActivos)
                setPromotionTypeFilter(draftTypeFilter)
                setPage(1)
                setFiltersModalOpen(false)
              }}
            >
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={(o) => !o && closeForm()}>
        <DialogContent
          showCloseButton
          className={promotionDialogSurfaceWideClass}
        >
          <DialogHeader className={promotionDialogHeaderClass}>
            <DialogTitle>
              {editingId ? "Editar promoción" : "Nueva promoción"}
            </DialogTitle>
            <DialogDescription>
              Combos con ítems configurables u ofertas por cantidad (2x1, etc.).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => void submitForm(e)} className="flex min-h-0 flex-1 flex-col">
            <div className={promotionDialogBodyClass}>
              {formError ? (
                <p className="mb-4 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {formError}
                </p>
              ) : null}
              {formBusy && editingId ? (
                <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Cargando promoción…
                </div>
              ) : null}

              <div className="space-y-6">
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold">General</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="promo-name">Nombre</Label>
                      <Input
                        id="promo-name"
                        required
                        value={form.name}
                        disabled={formBusy}
                        className={promotionFormFieldClass}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, name: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="promo-desc">Descripción</Label>
                      <Textarea
                        id="promo-desc"
                        value={form.description}
                        disabled={formBusy}
                        className={promotionFormFieldClass}
                        rows={2}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, description: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="promo-image">Imagen (URL)</Label>
                      <Input
                        id="promo-image"
                        value={form.imageUrl}
                        disabled={formBusy}
                        className={promotionFormFieldClass}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, imageUrl: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tipo</Label>
                      <Select
                        value={form.promotionType}
                        disabled={formBusy}
                        onValueChange={(v) => setPromotionType(v as PromotionType)}
                      >
                        <SelectTrigger className={promotionFormFieldClass}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="combo">Combo</SelectItem>
                          <SelectItem value="quantity_deal">Por cantidad</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col justify-end gap-3 sm:col-span-1">
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={form.isActive}
                          disabled={formBusy}
                          onCheckedChange={(v) =>
                            setForm((p) => ({ ...p, isActive: Boolean(v) }))
                          }
                        />
                        Activa
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={form.showInMenu}
                          disabled={formBusy}
                          onCheckedChange={(v) =>
                            setForm((p) => ({ ...p, showInMenu: Boolean(v) }))
                          }
                        />
                        Visible en menú
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={form.autoApply}
                          disabled={formBusy}
                          onCheckedChange={(v) =>
                            setForm((p) => ({ ...p, autoApply: Boolean(v) }))
                          }
                        />
                        Aplicar automáticamente
                      </label>
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold">
                    {form.promotionType === "combo"
                      ? "Precio del combo"
                      : "Regla por cantidad"}
                  </h3>
                  {form.promotionType === "combo" ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Modo de precio</Label>
                        <Select
                          value={form.pricingMode}
                          disabled={formBusy}
                          onValueChange={(v) =>
                            setForm((p) => ({
                              ...p,
                              pricingMode: v as PromotionPricingMode,
                            }))
                          }
                        >
                          <SelectTrigger className={promotionFormFieldClass}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(
                              Object.entries(PROMOTION_PRICING_MODE_LABEL) as [
                                PromotionPricingMode,
                                string,
                              ][]
                            ).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {form.pricingMode === "fixed_total" ? (
                        <div className="space-y-1.5">
                          <Label htmlFor="promo-fixed">Precio fijo total</Label>
                          <Input
                            id="promo-fixed"
                            required
                            value={form.fixedPrice}
                            disabled={formBusy}
                            className={promotionFormFieldClass}
                            inputMode="decimal"
                            onChange={(e) =>
                              setForm((p) => ({ ...p, fixedPrice: e.target.value }))
                            }
                          />
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <Label htmlFor="promo-discount">
                            {form.pricingMode === "percent_off"
                              ? "Porcentaje (%)"
                              : "Monto de descuento ($)"}
                          </Label>
                          <Input
                            id="promo-discount"
                            required
                            value={form.discountValue}
                            disabled={formBusy}
                            className={promotionFormFieldClass}
                            inputMode="decimal"
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                discountValue: e.target.value,
                                discountMode:
                                  form.pricingMode === "percent_off"
                                    ? "porcentaje"
                                    : "fijo",
                              }))
                            }
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="promo-buy">Cantidad a comprar</Label>
                        <Input
                          id="promo-buy"
                          required
                          value={form.buyQuantity}
                          disabled={formBusy}
                          className={promotionFormFieldClass}
                          inputMode="numeric"
                          onChange={(e) =>
                            setForm((p) => ({ ...p, buyQuantity: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="promo-benefit">Unidades bonificadas</Label>
                        <Input
                          id="promo-benefit"
                          required
                          value={form.benefitQuantity}
                          disabled={formBusy}
                          className={promotionFormFieldClass}
                          inputMode="numeric"
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              benefitQuantity: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="promo-benefit-pct">Descuento (%)</Label>
                        <Input
                          id="promo-benefit-pct"
                          required
                          value={form.benefitDiscountPct}
                          disabled={formBusy}
                          className={promotionFormFieldClass}
                          inputMode="decimal"
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              benefitDiscountPct: e.target.value,
                            }))
                          }
                        />
                        <p className="text-[11px] text-muted-foreground">
                          100% = gratis (ej. 2x1), 50% = mitad de precio.
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Aplicar beneficio a</Label>
                        <Select
                          value={form.applyBenefitTo}
                          disabled={formBusy}
                          onValueChange={(v) =>
                            setForm((p) => ({
                              ...p,
                              applyBenefitTo: v as PromotionBenefitTarget,
                            }))
                          }
                        >
                          <SelectTrigger className={promotionFormFieldClass}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(
                              Object.entries(PROMOTION_BENEFIT_TARGET_LABEL) as [
                                PromotionBenefitTarget,
                                string,
                              ][]
                            ).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold">Vigencia</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="promo-from">Desde (fecha)</Label>
                      <Input
                        id="promo-from"
                        type="date"
                        value={form.validFrom}
                        disabled={formBusy}
                        className={promotionFormFieldClass}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, validFrom: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="promo-until">Hasta (fecha)</Label>
                      <Input
                        id="promo-until"
                        type="date"
                        value={form.validUntil}
                        disabled={formBusy}
                        className={promotionFormFieldClass}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, validUntil: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="promo-time-start">Hora inicio</Label>
                      <Input
                        id="promo-time-start"
                        type="time"
                        value={form.validTimeStart}
                        disabled={formBusy}
                        className={promotionFormFieldClass}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            validTimeStart: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="promo-time-end">Hora fin</Label>
                      <Input
                        id="promo-time-end"
                        type="time"
                        value={form.validTimeEnd}
                        disabled={formBusy}
                        className={promotionFormFieldClass}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, validTimeEnd: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Días de la semana</Label>
                    <div className="flex flex-wrap gap-2">
                      {PROMOTION_WEEKDAY_OPTIONS.map(({ value, label }) => (
                        <label
                          key={value}
                          className={cn(
                            "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs",
                            form.scheduleDays.includes(value)
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground",
                          )}
                        >
                          <Checkbox
                            className="sr-only"
                            checked={form.scheduleDays.includes(value)}
                            disabled={formBusy}
                            onCheckedChange={() => toggleWeekday(value)}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                </section>

                <section>
                  <PromotionSlotEditor
                    promotionType={form.promotionType}
                    lines={form.slots}
                    catalogOptions={catalogOptions}
                    disabled={formBusy}
                    onChange={(slots) => setForm((p) => ({ ...p, slots }))}
                  />
                </section>
              </div>
            </div>

            <DialogFooter className={promotionDialogFooterClass}>
              <Button type="button" variant="outline" disabled={formBusy} onClick={closeForm}>
                Cancelar
              </Button>
              <Button type="submit" disabled={formBusy}>
                {formBusy ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Guardando…
                  </>
                ) : editingId ? (
                  "Guardar cambios"
                ) : (
                  "Crear promoción"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar promoción</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Escribí{" "}
              <strong>{PROMOTION_DELETE_CONFIRM_PHRASE}</strong> para confirmar.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder={PROMOTION_DELETE_CONFIRM_PHRASE}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteBusy || deleteConfirm !== PROMOTION_DELETE_CONFIRM_PHRASE}
              onClick={() => void confirmDelete()}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DataWorkspaceLayout>
  )
}

export default withAuth(PromotionsPage)
