"use client"

import {
  deleteMesasSalon,
  getMesasLayout,
  reorderMesasSalons,
  upsertMesasSalon,
  type MesasSalonRow,
  type UpsertMesasSalonInput,
} from "@/app/[siteId]/[popId]/mesas/actions"
import { MesasLayoutSortableList } from "@/app/[siteId]/[popId]/mesas/components/MesasLayoutSortableList"
import {
  MesasLayoutDeleteConfirmDialog,
  MesasLayoutDialogFormActions,
  MesasLayoutDialogFormSection,
  MesasLayoutDialogListColumn,
  MesasLayoutDialogTwoColumnLayout,
  mesasLayoutDialogContentClass,
} from "@/app/[siteId]/[popId]/mesas/components/mesasLayoutDialogShared"
import {
  defaultSalonForm,
  mesasSortOrderUpdatesFromIds,
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
import { RootsFormTextField } from "@/components/rootsy-form"
import type { RootsSortableActionListItem } from "@/components/rootsy-list"
import { Dialog } from "@/components/ui/dialog"
import { useCallback, useEffect, useMemo, useState } from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  popId: string
  siteId: string
  onLayoutChanged: () => Promise<void>
}

function toListItems(rows: MesasSalonRow[]): RootsSortableActionListItem[] {
  return rows.map((row) => ({
    id: row.id,
    label: row.name,
    visible: row.isActive,
  }))
}

function mergeSalonOrder(
  rows: MesasSalonRow[],
  orderedIds: string[],
): MesasSalonRow[] {
  const byId = new Map(rows.map((row) => [row.id, row]))
  return orderedIds
    .map((id) => byId.get(id))
    .filter((row): row is MesasSalonRow => row != null)
    .map((row, sortOrder) => ({ ...row, sortOrder }))
}

export function MesasSalonsDialog({
  open,
  onOpenChange,
  popId,
  siteId,
  onLayoutChanged,
}: Props) {
  const [rows, setRows] = useState<MesasSalonRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<UpsertMesasSalonInput>(defaultSalonForm(0))
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<MesasSalonRow | null>(null)

  const sortedRows = useMemo(
    () => sortMesasByOrder(rows, (row) => row.name),
    [rows],
  )

  const loadRows = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await getMesasLayout(popId, siteId)
    setLoading(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    setRows(res.data.salons)
    setForm(defaultSalonForm(res.data.salons.length))
  }, [popId, siteId])

  useDeferredDialogReset(open, () => {
    setError(null)
    setForm(defaultSalonForm(0))
    setDeleteTarget(null)
  })

  useEffect(() => {
    if (!open) return
    void loadRows()
  }, [open, loadRows])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    const res = await upsertMesasSalon(popId, siteId, form)
    setSaving(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    setForm(defaultSalonForm(rows.length + (form.id ? 0 : 1)))
    await loadRows()
    await onLayoutChanged()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSaving(true)
    setError(null)
    const res = await deleteMesasSalon(popId, siteId, deleteTarget.id)
    setSaving(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    if (form.id === deleteTarget.id) setForm(defaultSalonForm(rows.length - 1))
    setDeleteTarget(null)
    await loadRows()
    await onLayoutChanged()
  }

  const handleReorder = useCallback(
    async (ordered: RootsSortableActionListItem[]) => {
      const nextRows = mergeSalonOrder(sortedRows, ordered.map((item) => item.id))
      setRows(nextRows)
      setError(null)
      const res = await reorderMesasSalons(
        popId,
        siteId,
        mesasSortOrderUpdatesFromIds(ordered.map((item) => item.id)),
      )
      if (!res.success) {
        setError(res.error)
        await loadRows()
        return
      }
      await onLayoutChanged()
    },
    [loadRows, onLayoutChanged, popId, siteId, sortedRows],
  )

  const handleToggleActive = useCallback(
    async (id: string) => {
      const row = sortedRows.find((item) => item.id === id)
      if (!row) return
      setSaving(true)
      setError(null)
      const res = await upsertMesasSalon(popId, siteId, {
        id: row.id,
        name: row.name,
        sortOrder: row.sortOrder,
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
    [loadRows, onLayoutChanged, popId, siteId, sortedRows],
  )

  const salonById = useCallback(
    (id: string) => sortedRows.find((row) => row.id === id) ?? null,
    [sortedRows],
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
            title="Salones"
            description="Sectores del local que aparecen como pestañas en el plano."
          />
          <RootsDialogBody className="space-y-4">
            {error && !deleteTarget ? (
              <RootsDialogErrorBanner>{error}</RootsDialogErrorBanner>
            ) : null}

            <MesasLayoutDialogTwoColumnLayout
              form={
                <MesasLayoutDialogFormSection
                  title={form.id ? "Editar salón" : "Nuevo salón"}
                  footer={
                    <MesasLayoutDialogFormActions
                      editing={Boolean(form.id)}
                      saving={saving}
                      canSave={Boolean(form.name.trim())}
                      onCancelEdit={() => setForm(defaultSalonForm(rows.length))}
                      onSave={() => void handleSave()}
                      createLabel="Agregar salón"
                    />
                  }
                >
                  <RootsFormTextField
                    label="Nombre"
                    id="mesas-salon-name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Interior, Patio, Frente…"
                  />
                </MesasLayoutDialogFormSection>
              }
              list={
                <MesasLayoutDialogListColumn title="Salones existentes">
                  {loading && sortedRows.length === 0 ? (
                    <RootsDialogLoadingState message="Cargando salones" />
                  ) : (
                    <MesasLayoutSortableList
                      listId="mesas-salons"
                      items={toListItems(sortedRows)}
                      canReorder={!saving}
                      canToggleVisibility
                      emptyMessage="Todavía no hay salones."
                      reorderHint="Arrastrá para ordenar las pestañas del plano. El ojo activa o desactiva el salón."
                      onReorder={(ordered) => void handleReorder(ordered)}
                      onEdit={(item) => {
                        const row = salonById(item.id)
                        if (row) {
                          setForm({
                            id: row.id,
                            name: row.name,
                            sortOrder: row.sortOrder,
                            isActive: row.isActive,
                          })
                        }
                      }}
                      onDelete={(item) => {
                        const row = salonById(item.id)
                        if (row) setDeleteTarget(row)
                      }}
                      onToggleVisibility={(id) => void handleToggleActive(id)}
                    />
                  )}
                </MesasLayoutDialogListColumn>
              }
            />
          </RootsDialogBody>
        </RootsDialogContent>
      </Dialog>

      <MesasLayoutDeleteConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null)
        }}
        title={deleteTarget ? `¿Eliminar ${deleteTarget.name}?` : "¿Eliminar salón?"}
        description="Se quitará el salón del plano. Las mesas y elementos asociados pueden quedar sin salón válido."
        busy={saving}
        error={deleteTarget ? error : null}
        onConfirm={() => void handleDelete()}
      />
    </>
  )
}
