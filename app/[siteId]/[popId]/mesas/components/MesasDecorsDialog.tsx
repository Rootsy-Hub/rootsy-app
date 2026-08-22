"use client"

import {
  deleteMesasFloorDecor,
  getMesasLayout,
  reorderMesasDecors,
  upsertMesasFloorDecor,
  type MesasFloorDecorRow,
  type MesasLayoutData,
  type UpsertMesasFloorDecorInput,
} from "@/app/[siteId]/[popId]/mesas/actions"
import { MesaFloorDecorPreview } from "@/app/[siteId]/[popId]/mesas/components/MesaFloorDecorNode"
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
import type { MesaFloorDecorKind, MesaSalon } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import {
  applyLayoutSalons,
  decorKindLabel,
  decorKindOptions,
  defaultDecorForm,
  defaultDecorSize,
  decorLabelPlaceholder,
  decorRowToForm,
  mesasSortOrderUpdatesFromIds,
  resolveFormSalonId,
  sortMesasByOrder,
} from "@/app/[siteId]/[popId]/mesas/mesasLayoutDialogUtils"
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

function decorListLabel(
  row: MesasFloorDecorRow,
  salonName: string | undefined,
  showSalon: boolean,
): string {
  const kind = decorKindLabel(row.kind)
  const text = row.label?.trim() || kind
  if (showSalon && salonName) {
    return `${text} · ${salonName} · ${kind}`
  }
  return `${text} · ${kind}`
}

function mergeDecorOrder(
  rows: MesasFloorDecorRow[],
  orderedIds: string[],
): MesasFloorDecorRow[] {
  const byId = new Map(rows.map((row) => [row.id, row]))
  return orderedIds
    .map((id) => byId.get(id))
    .filter((row): row is MesasFloorDecorRow => row != null)
    .map((row, sortOrder) => ({ ...row, sortOrder }))
}

export function MesasDecorsDialog({
  open,
  onOpenChange,
  popId,
  siteId,
  salons,
  getLayoutData,
  onLayoutChanged,
}: Props) {
  const [rows, setRows] = useState<MesasFloorDecorRow[]>([])
  const [dialogSalons, setDialogSalons] = useState<MesaSalon[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterSalonId, setFilterSalonId] = useState("all")
  const [form, setForm] = useState<UpsertMesasFloorDecorInput>(
    defaultDecorForm("", 0),
  )
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<MesasFloorDecorRow | null>(null)
  const [pendingCreate, setPendingCreate] = useState<{
    name: string
    salonId: string
  } | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const salonOptions = dialogSalons.length > 0 ? dialogSalons : salons
  const canReorderList = filterSalonId !== "all"
  const reorderSalonId = canReorderList ? filterSalonId : ""

  const filteredRows = useMemo(() => {
    const base =
      filterSalonId && filterSalonId !== "all"
        ? rows.filter((r) => r.salonId === filterSalonId)
        : rows
    return sortMesasByOrder(base, (row) => row.label || decorKindLabel(row.kind))
  }, [rows, filterSalonId])

  const applyLayout = useCallback((data: MesasLayoutData) => {
    const activeSalons = applyLayoutSalons(data)
    const defaultSalonId = activeSalons[0]?.id ?? ""
    setDialogSalons(activeSalons)
    setRows(data.decors)
    setFilterSalonId("all")
    setForm((prev) =>
      prev.id ? prev : defaultDecorForm(defaultSalonId, data.decors.length),
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
    setForm(defaultDecorForm("", 0))
    setDeleteTarget(null)
    setPendingCreate(null)
    setPendingDeleteId(null)
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
        label: decorListLabel(
          row,
          salonOptions.find((s) => s.id === row.salonId)?.name,
          !canReorderList,
        ),
        visible: row.isActive,
      })),
    [canReorderList, filteredRows, salonOptions],
  )

  const visiblePendingCreateName =
    pendingCreate &&
    (filterSalonId === "all" || filterSalonId === pendingCreate.salonId) &&
    !rows.some((row) => {
      const text = row.label?.trim() || decorKindLabel(row.kind)
      return (
        text === pendingCreate.name && row.salonId === pendingCreate.salonId
      )
    })
      ? pendingCreate.name
      : null

  const handleSave = async () => {
    const payload = form
    const isCreate = !payload.id
    const createdName = payload.label.trim() || decorKindLabel(payload.kind)
    setSaving(true)
    setError(null)
    if (isCreate) {
      setPendingCreate({ name: createdName, salonId: payload.salonId })
      setForm(defaultDecorForm(payload.salonId, rows.length + 1))
    }
    const res = await upsertMesasFloorDecor(popId, siteId, payload)
    if (!res.success) {
      if (isCreate) {
        setPendingCreate(null)
        setForm((current) => ({
          ...current,
          label: payload.label,
          kind: payload.kind,
        }))
      }
      setSaving(false)
      setError(res.error)
      return
    }
    await loadRows()
    await onLayoutChanged()
    setPendingCreate(null)
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const target = deleteTarget
    setSaving(true)
    setError(null)
    setPendingDeleteId(target.id)
    if (form.id === target.id) {
      setForm(
        defaultDecorForm(
          resolveFormSalonId(filterSalonId, form.salonId || salonOptions[0]?.id || ""),
          rows.length - 1,
        ),
      )
    }
    setDeleteTarget(null)
    const res = await deleteMesasFloorDecor(popId, siteId, target.id)
    if (!res.success) {
      setPendingDeleteId(null)
      setSaving(false)
      setError(res.error)
      return
    }
    await loadRows()
    await onLayoutChanged()
    setPendingDeleteId(null)
    setSaving(false)
  }

  const handleReorder = useCallback(
    async (ordered: RootsSortableActionListItem[]) => {
      if (!reorderSalonId) return
      const nextFiltered = mergeDecorOrder(
        filteredRows,
        ordered.map((item) => item.id),
      )
      setRows((prev) => {
        const others = prev.filter((row) => row.salonId !== reorderSalonId)
        return [...others, ...nextFiltered]
      })
      setError(null)
      const res = await reorderMesasDecors(
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
      const res = await upsertMesasFloorDecor(popId, siteId, {
        ...decorRowToForm(row),
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

  const decorById = useCallback(
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
            title="Elementos del plano"
            description="Paredes, accesos, amenidades y zonas. Quedan en un segundo plano para no tapar las mesas."
          />
          <RootsDialogBody className="space-y-4">
            {error && !deleteTarget ? (
              <RootsDialogErrorBanner>{error}</RootsDialogErrorBanner>
            ) : null}

            {salonOptions.length === 0 && !loading && rows.length === 0 ? (
              <p className={mesasLayoutDialogEmptyHintClass}>
                Creá al menos un salón antes de agregar elementos.
              </p>
            ) : (
              <MesasLayoutDialogTwoColumnLayout
                wideForm
                form={
                  salonOptions.length > 0 ? (
                    <MesasLayoutDialogFormSection
                      title={form.id ? "Editar elemento" : "Nuevo elemento"}
                      footer={
                        <MesasLayoutDialogFormActions
                          editing={Boolean(form.id)}
                          saving={saving && Boolean(form.id)}
                          canSave={Boolean(form.salonId) && !saving}
                          onCancelEdit={() =>
                            setForm(
                              defaultDecorForm(
                                resolveFormSalonId(
                                  filterSalonId,
                                  form.salonId || salonOptions[0]?.id || "",
                                ),
                                rows.length,
                              ),
                            )
                          }
                          onSave={() => void handleSave()}
                          createLabel="Agregar elemento"
                        />
                      }
                    >
                      <div className={mesasLayoutDialogFormFieldsClass}>
                        <RootsFormSelectField
                          label="Salón"
                          value={form.salonId}
                          disabled={saving}
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
                        <RootsFormSelectField
                          label="Tipo"
                          value={form.kind}
                          disabled={saving}
                          onValueChange={(kind) => {
                            const k = kind as MesaFloorDecorKind
                            const size = defaultDecorSize(k)
                            setForm((f) => ({
                              ...f,
                              kind: k,
                              width: size.width,
                              height: size.height,
                            }))
                          }}
                        >
                          {decorKindOptions.map((o) => (
                            <RootsFormSelectItem key={o.value} value={o.value}>
                              {o.label}
                            </RootsFormSelectItem>
                          ))}
                        </RootsFormSelectField>
                        <RootsFormTextField
                          label="Texto visible"
                          id="mesas-decor-label"
                          value={form.label}
                          disabled={saving}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, label: e.target.value }))
                          }
                          placeholder={decorLabelPlaceholder(form.kind)}
                          className={mesasLayoutDialogFormFieldFullClass}
                        />
                        <RootsFormIntegerField
                          label="Ancho (px)"
                          id="mesas-decor-w"
                          min={4}
                          max={9999}
                          value={String(form.width)}
                          disabled={saving}
                          onChange={(value) =>
                            setForm((f) => ({
                              ...f,
                              width:
                                value === ""
                                  ? 4
                                  : parseNonNegativeIntegerInput(value, f.width) ||
                                    4,
                            }))
                          }
                        />
                        <RootsFormIntegerField
                          label="Alto (px)"
                          id="mesas-decor-h"
                          min={4}
                          max={9999}
                          value={String(form.height)}
                          disabled={saving}
                          onChange={(value) =>
                            setForm((f) => ({
                              ...f,
                              height:
                                value === ""
                                  ? 4
                                  : parseNonNegativeIntegerInput(value, f.height) ||
                                    4,
                            }))
                          }
                        />
                        <div className={mesasLayoutDialogFormFieldFullClass}>
                          <MesaFloorDecorPreview
                            kind={form.kind}
                            label={form.label}
                            width={form.width}
                            height={form.height}
                            kindLabel={decorKindLabel(form.kind)}
                          />
                        </div>
                      </div>
                    </MesasLayoutDialogFormSection>
                  ) : null
                }
                list={
                  <MesasLayoutDialogListColumn title="Elementos existentes">
                    <MesasLayoutDialogSalonFilterBar
                      label="Filtrar salón"
                      value={filterSalonId}
                      onValueChange={setFilterSalonId}
                      salons={salonOptions}
                      showAll
                      disabled={saving}
                      totalCount={rows.length}
                      filteredCount={filteredRows.length}
                    />
                    {loading && rows.length === 0 && !visiblePendingCreateName ? (
                      <RootsDialogLoadingState message="Cargando elementos" />
                    ) : (
                      <MesasLayoutSortableList
                        listId="mesas-decors"
                        items={listItems}
                        canReorder={canReorderList && !saving}
                        canEdit={!saving}
                        canDelete={!saving}
                        canToggleVisibility={!saving}
                        pendingCreateName={visiblePendingCreateName}
                        pendingDeleteId={pendingDeleteId}
                        emptyMessage={
                          rows.length === 0
                            ? "Todavía no hay elementos."
                            : "No hay elementos en este salón."
                        }
                        reorderHint={
                          canReorderList
                            ? "Arrastrá para ordenar los elementos de este salón. El ojo activa o desactiva el elemento."
                            : "Elegí un salón en el filtro para reordenar elementos."
                        }
                        onReorder={(ordered) => void handleReorder(ordered)}
                        onEdit={(item) => {
                          const row = decorById(item.id)
                          if (row) setForm(decorRowToForm(row))
                        }}
                        onDelete={(item) => {
                          const row = decorById(item.id)
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
        title={
          deleteTarget
            ? `¿Eliminar ${deleteTarget.label || decorKindLabel(deleteTarget.kind)}?`
            : "¿Eliminar elemento?"
        }
        description="El elemento se quitará del plano del salón."
        busy={saving}
        error={deleteTarget ? error : null}
        onConfirm={() => void handleDelete()}
      />
    </>
  )
}
