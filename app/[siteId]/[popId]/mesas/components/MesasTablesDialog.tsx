"use client"

import {
  deleteMesasTable,
  getMesasLayout,
  reorderMesasTables,
  upsertMesasTable,
  type MesasLayoutData,
  type MesasTableRow,
  type UpsertMesasTableInput,
} from "@/app/[siteId]/[popId]/mesas/actions"
import { MesasLayoutSortableList } from "@/app/[siteId]/[popId]/mesas/components/MesasLayoutSortableList"
import {
  MesasLayoutDeleteConfirmDialog,
  MesasLayoutDialogFormActions,
  MesasLayoutDialogFormSection,
  MesasLayoutDialogListColumn,
  MesasLayoutDialogSalonFilterBar,
  MesasLayoutDialogTwoColumnLayout,
  mesasLayoutDialogContentClass,
  mesasLayoutDialogEmptyHintClass,
  mesasLayoutDialogFormFieldFullClass,
  mesasLayoutDialogFormFieldsClass,
} from "@/app/[siteId]/[popId]/mesas/components/mesasLayoutDialogShared"
import { MesasTableFormPreview } from "@/app/[siteId]/[popId]/mesas/components/MesasTableFormPreview"
import type { MesaSalon, MesaTableShape } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import {
  applyLayoutSalons,
  defaultTableForm,
  mesasSortOrderUpdatesFromIds,
  resolveFormSalonId,
  shapeOptions,
  sortMesasByOrder,
  tableRowToForm,
} from "@/app/[siteId]/[popId]/mesas/mesasLayoutDialogUtils"
import {
  mesaShapeSizeOptions,
  mesaSeatsLabel,
  mesaSizeDisplayLabel,
} from "@/app/[siteId]/[popId]/mesas/mesasTableStyles"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogErrorBanner,
  RootsDialogHeader,
  RootsDialogLoadingState,
  useDeferredDialogReset,
} from "@/components/rootsy-dialog"
import {
  RootsFormIntegerField,
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormTextField,
} from "@/components/rootsy-form"
import { parseNonNegativeIntegerInput } from "@/lib/integerInput"
import type { RootsSortableActionListItem } from "@/components/rootsy-list"
import { Dialog } from "@/components/ui/dialog"
import { useCallback, useEffect, useMemo, useState } from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  popId: string
  siteId: string
  salons: MesaSalon[]
  getLayoutData?: () => MesasLayoutData | null
  onLayoutChanged: () => Promise<void>
}

function tableListLabel(
  row: MesasTableRow,
  salonName: string | undefined,
  showSalon: boolean,
): string {
  const shape = `${row.shape.kind} / ${mesaSizeDisplayLabel(row.shape.size)} · ${mesaSeatsLabel(row.seats)}`
  if (showSalon && salonName) {
    return `${row.label} · ${salonName} · ${shape}`
  }
  return `${row.label} · ${shape}`
}

function mergeTableOrder(
  rows: MesasTableRow[],
  orderedIds: string[],
): MesasTableRow[] {
  const byId = new Map(rows.map((row) => [row.id, row]))
  return orderedIds
    .map((id) => byId.get(id))
    .filter((row): row is MesasTableRow => row != null)
    .map((row, sortOrder) => ({ ...row, sortOrder }))
}

export function MesasTablesDialog({
  open,
  onOpenChange,
  popId,
  siteId,
  salons,
  getLayoutData,
  onLayoutChanged,
}: Props) {
  const [rows, setRows] = useState<MesasTableRow[]>([])
  const [dialogSalons, setDialogSalons] = useState<MesaSalon[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterSalonId, setFilterSalonId] = useState("all")
  const [form, setForm] = useState<UpsertMesasTableInput>(defaultTableForm("", 0))
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<MesasTableRow | null>(null)

  const salonOptions = dialogSalons.length > 0 ? dialogSalons : salons
  const canReorderList = filterSalonId !== "all"
  const reorderSalonId = canReorderList ? filterSalonId : ""

  const filteredRows = useMemo(() => {
    const base =
      filterSalonId && filterSalonId !== "all"
        ? rows.filter((r) => r.salonId === filterSalonId)
        : rows
    return sortMesasByOrder(base, (row) => row.label)
  }, [rows, filterSalonId])

  const applyLayout = useCallback((data: MesasLayoutData) => {
    const activeSalons = applyLayoutSalons(data)
    const defaultSalonId = activeSalons[0]?.id ?? ""
    setDialogSalons(activeSalons)
    setRows(data.tables)
    setFilterSalonId("all")
    setForm((prev) =>
      prev.id ? prev : defaultTableForm(defaultSalonId, data.tables.length),
    )
  }, [])

  const loadRows = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await getMesasLayout(popId, siteId)
    setLoading(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    applyLayout(res.data)
  }, [applyLayout, popId, siteId])

  useDeferredDialogReset(open, () => {
    setError(null)
    setFilterSalonId("all")
    setForm(defaultTableForm("", 0))
    setDeleteTarget(null)
  })

  useEffect(() => {
    if (!open) return

    setFilterSalonId("all")
    const snapshot = getLayoutData?.()
    if (snapshot) {
      applyLayout(snapshot)
      setLoading(false)
      setError(null)
    }
    void loadRows()
  }, [open, applyLayout, getLayoutData, loadRows])

  const listItems = useMemo(
    (): RootsSortableActionListItem[] =>
      filteredRows.map((row) => ({
        id: row.id,
        label: tableListLabel(
          row,
          salonOptions.find((s) => s.id === row.salonId)?.name,
          !canReorderList,
        ),
        visible: row.isActive,
      })),
    [canReorderList, filteredRows, salonOptions],
  )

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    const res = await upsertMesasTable(popId, siteId, form)
    setSaving(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    setForm(defaultTableForm(form.salonId, rows.length + (form.id ? 0 : 1)))
    await loadRows()
    await onLayoutChanged()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSaving(true)
    setError(null)
    const res = await deleteMesasTable(popId, siteId, deleteTarget.id)
    setSaving(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    if (form.id === deleteTarget.id) {
      setForm(
        defaultTableForm(
          resolveFormSalonId(filterSalonId, form.salonId || salonOptions[0]?.id || ""),
          rows.length - 1,
        ),
      )
    }
    setDeleteTarget(null)
    await loadRows()
    await onLayoutChanged()
  }

  const handleReorder = useCallback(
    async (ordered: RootsSortableActionListItem[]) => {
      if (!reorderSalonId) return
      const nextFiltered = mergeTableOrder(
        filteredRows,
        ordered.map((item) => item.id),
      )
      setRows((prev) => {
        const others = prev.filter((row) => row.salonId !== reorderSalonId)
        return [...others, ...nextFiltered]
      })
      setError(null)
      const res = await reorderMesasTables(
        popId,
        siteId,
        reorderSalonId,
        mesasSortOrderUpdatesFromIds(ordered.map((item) => item.id)),
      )
      if (!res.success) {
        setError(res.error)
        await loadRows()
        return
      }
      await onLayoutChanged()
    },
    [filteredRows, loadRows, onLayoutChanged, popId, reorderSalonId, siteId],
  )

  const handleToggleActive = useCallback(
    async (id: string) => {
      const row = rows.find((item) => item.id === id)
      if (!row) return
      setSaving(true)
      setError(null)
      const res = await upsertMesasTable(popId, siteId, {
        ...tableRowToForm(row),
        isActive: !row.isActive,
      })
      setSaving(false)
      if (!res.success) {
        setError(res.error)
        return
      }
      await loadRows()
      await onLayoutChanged()
    },
    [loadRows, onLayoutChanged, popId, rows, siteId],
  )

  const shapeSizeOptions = useMemo(
    () => mesaShapeSizeOptions(form.shape.kind),
    [form.shape.kind],
  )

  const tableById = useCallback(
    (id: string) => filteredRows.find((row) => row.id === id) ?? null,
    [filteredRows],
  )

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <RootsDialogContent
          size="twoCol"
          showCloseButton={!saving}
          className={mesasLayoutDialogContentClass}
        >
          <RootsDialogHeader
            open={open}
            title="Mesas"
            description="Número, forma y capacidad. La posición en el plano se ajusta con el lápiz de edición."
          />
          <RootsDialogBody className="space-y-4">
            {error && !deleteTarget ? (
              <RootsDialogErrorBanner>{error}</RootsDialogErrorBanner>
            ) : null}

            {salonOptions.length === 0 && !loading && rows.length === 0 ? (
              <p className={mesasLayoutDialogEmptyHintClass}>
                Creá al menos un salón antes de agregar mesas.
              </p>
            ) : (
              <MesasLayoutDialogTwoColumnLayout
                wideForm
                form={
                  salonOptions.length > 0 ? (
                    <MesasLayoutDialogFormSection
                      title={form.id ? "Editar mesa" : "Nueva mesa"}
                      footer={
                        <MesasLayoutDialogFormActions
                          editing={Boolean(form.id)}
                          saving={saving}
                          canSave={Boolean(form.salonId && form.label.trim())}
                          onCancelEdit={() =>
                            setForm(
                              defaultTableForm(
                                resolveFormSalonId(
                                  filterSalonId,
                                  form.salonId || salonOptions[0]?.id || "",
                                ),
                                rows.length,
                              ),
                            )
                          }
                          onSave={() => void handleSave()}
                          createLabel="Agregar mesa"
                        />
                      }
                    >
                      <div className={mesasLayoutDialogFormFieldsClass}>
                        <RootsFormSelectField
                          label="Salón"
                          value={form.salonId}
                          onValueChange={(salonId) =>
                            setForm((f) => ({ ...f, salonId }))
                          }
                        >
                          {salonOptions.map((s) => (
                            <RootsFormSelectItem key={s.id} value={s.id}>
                              {s.name}
                            </RootsFormSelectItem>
                          ))}
                        </RootsFormSelectField>
                        <RootsFormTextField
                          label="Número / nombre"
                          id="mesas-table-label"
                          value={form.label}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, label: e.target.value }))
                          }
                          placeholder="6, P1, F2…"
                        />
                        <RootsFormSelectField
                          label="Forma"
                          value={form.shape.kind}
                          onValueChange={(kind) =>
                            setForm((f) => ({
                              ...f,
                              shape: {
                                kind: kind as MesaTableShape["kind"],
                                size: "m",
                              } as MesaTableShape,
                            }))
                          }
                        >
                          {shapeOptions.map((o) => (
                            <RootsFormSelectItem key={o.value} value={o.value}>
                              {o.label}
                            </RootsFormSelectItem>
                          ))}
                        </RootsFormSelectField>
                        <RootsFormSelectField
                          label="Tamaño"
                          value={form.shape.size}
                          onValueChange={(size) =>
                            setForm((f) => ({
                              ...f,
                              shape: { ...f.shape, size } as MesaTableShape,
                            }))
                          }
                        >
                          {shapeSizeOptions.map((size) => (
                            <RootsFormSelectItem key={size} value={size}>
                              {mesaSizeDisplayLabel(size)}
                            </RootsFormSelectItem>
                          ))}
                        </RootsFormSelectField>
                        <RootsFormIntegerField
                          label="Asientos"
                          id="mesas-table-seats"
                          min={1}
                          max={99}
                          value={String(form.seats)}
                          onChange={(value) =>
                            setForm((f) => ({
                              ...f,
                              seats:
                                value === ""
                                  ? 1
                                  : parseNonNegativeIntegerInput(value, f.seats) ||
                                    1,
                            }))
                          }
                        />
                        <div className={mesasLayoutDialogFormFieldFullClass}>
                          <MesasTableFormPreview
                            label={form.label}
                            shape={form.shape}
                            seats={form.seats}
                          />
                        </div>
                      </div>
                    </MesasLayoutDialogFormSection>
                  ) : null
                }
                list={
                  <MesasLayoutDialogListColumn title="Mesas existentes">
                    <MesasLayoutDialogSalonFilterBar
                      label="Filtrar salón"
                      value={filterSalonId}
                      onValueChange={setFilterSalonId}
                      salons={salonOptions}
                      showAll
                      totalCount={rows.length}
                      filteredCount={filteredRows.length}
                    />
                    {loading && rows.length === 0 ? (
                      <RootsDialogLoadingState message="Cargando mesas" />
                    ) : (
                      <MesasLayoutSortableList
                        listId="mesas-tables"
                        items={listItems}
                        canReorder={canReorderList && !saving}
                        canToggleVisibility
                        emptyMessage={
                          rows.length === 0
                            ? "Todavía no hay mesas."
                            : "No hay mesas en este salón."
                        }
                        reorderHint={
                          canReorderList
                            ? "Arrastrá para ordenar las mesas de este salón. El ojo activa o desactiva la mesa."
                            : "Elegí un salón en el filtro para reordenar mesas."
                        }
                        onReorder={(ordered) => void handleReorder(ordered)}
                        onEdit={(item) => {
                          const row = tableById(item.id)
                          if (row) setForm(tableRowToForm(row))
                        }}
                        onDelete={(item) => {
                          const row = tableById(item.id)
                          if (row) setDeleteTarget(row)
                        }}
                        onToggleVisibility={(id) => void handleToggleActive(id)}
                      />
                    )}
                  </MesasLayoutDialogListColumn>
                }
              />
            )}
          </RootsDialogBody>
        </RootsDialogContent>
      </Dialog>

      <MesasLayoutDeleteConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null)
        }}
        title={deleteTarget ? `¿Eliminar mesa ${deleteTarget.label}?` : "¿Eliminar mesa?"}
        description="La mesa se quitará del plano. Si tiene una sesión abierta, puede fallar la eliminación."
        busy={saving}
        error={deleteTarget ? error : null}
        onConfirm={() => void handleDelete()}
      />
    </>
  )
}
