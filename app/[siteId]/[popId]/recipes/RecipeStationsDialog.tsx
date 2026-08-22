"use client"

import type { ComandaStationOption } from "@/app/[siteId]/[popId]/recipes/actions"
import {
  RootsProgressButton,
  rootsButtonClassForVariant,
  rootsButtonVariant,
} from "@/components/rootsy-button"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogErrorBanner,
  RootsDialogHeader,
  RootsDialogLoadingState,
} from "@/components/rootsy-dialog"
import { RootsFormTextField } from "@/components/rootsy-form"
import {
  RootsSortableActionList,
  rootsSortableListRowClass,
  rootsSortableListRowLabelClass,
  type RootsSortableActionListItem,
} from "@/components/rootsy-list"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { saleOpDialogPrimaryBtn } from "@/components/sale-operation/saleOperationStyles"
import { Dialog } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  banner: string | null
  loading?: boolean
  stations: ComandaStationOption[]
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  newStationName: string
  onNewStationNameChange: (value: string) => void
  onCreateStation: () => void
  newStationSaving: boolean
  pendingCreateName: string | null
  pendingDeleteId: string | null
  stationSaveBusy: boolean
  editingStationId: string | null
  editingStationName: string
  onEditingStationNameChange: (value: string) => void
  onStartEdit: (station: ComandaStationOption) => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  onDeleteStation: (id: string, name: string) => void
  onAfterClose?: () => void
}

function toListItems(
  stations: ComandaStationOption[],
): RootsSortableActionListItem[] {
  return stations.map((station) => ({
    id: station.id,
    label: station.name,
  }))
}

export function RecipeStationsDialog({
  open,
  onOpenChange,
  banner,
  loading = false,
  stations,
  canCreate,
  canUpdate,
  canDelete,
  newStationName,
  onNewStationNameChange,
  onCreateStation,
  newStationSaving,
  pendingCreateName,
  pendingDeleteId,
  stationSaveBusy,
  editingStationId,
  editingStationName,
  onEditingStationNameChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDeleteStation,
  onAfterClose,
}: Props) {
  const wasOpenRef = useRef(false)
  const [mounted, setMounted] = useState(open)

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true
      setMounted(true)
      return
    }
    if (!wasOpenRef.current) return
    const timer = window.setTimeout(() => {
      wasOpenRef.current = false
      setMounted(false)
      onAfterClose?.()
    }, 220)
    return () => window.clearTimeout(timer)
  }, [open, onAfterClose])

  if (!mounted) return null

  const editingStation = editingStationId
    ? stations.find((station) => station.id === editingStationId)
    : null
  const editHasChanges =
    editingStation != null &&
    editingStationName.trim() !== editingStation.name.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent
        size="wide"
        className="max-h-[min(90vh,720px)] sm:max-w-2xl"
      >
        <RootsDialogHeader
          title="Estaciones"
          description="Destino de las comandas. Cada categoría elige a cuál mandar."
        />
        <RootsDialogBody>
          {banner ? <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner> : null}
          {canCreate ? (
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <RootsFormTextField
                label="Nueva estación"
                id="recipe-new-station"
                value={newStationName}
                onChange={(event) => onNewStationNameChange(event.target.value)}
                placeholder="Cocina, Barra, Parrilla…"
                className="min-w-0 flex-1"
                disabled={newStationSaving}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    onCreateStation()
                  }
                }}
              />
              <RootsProgressButton
                type="button"
                variant={rootsButtonVariant.primary}
                className={cn(
                  saleOpDialogPrimaryBtn,
                  rootsButtonClassForVariant("primary"),
                  "h-11 shrink-0",
                )}
                disabled={newStationSaving || !newStationName.trim()}
                onClick={onCreateStation}
              >
                Agregar
              </RootsProgressButton>
            </div>
          ) : null}
          {loading && stations.length === 0 ? (
            <RootsDialogLoadingState message="Cargando estaciones" />
          ) : (
            <div className="flex flex-col gap-2">
              {stations.length === 0 && pendingCreateName ? null : (
                <RootsSortableActionList
                  listId="recipe-stations"
                  rowSize="comfortable"
                  items={toListItems(stations)}
                  onReorder={() => {}}
                  emptyMessage="Todavía no hay estaciones. Agregá Cocina, Barra u otra."
                  canReorder={false}
                  canToggleVisibility={false}
                  canEdit={canUpdate}
                  canDelete={canDelete}
                  editingId={editingStationId}
                  editingValue={editingStationName}
                  editSaveBusy={stationSaveBusy}
                  editHasChanges={editHasChanges}
                  busyId={pendingDeleteId}
                  onStartEdit={(item) => {
                    const station = stations.find((row) => row.id === item.id)
                    if (station) onStartEdit(station)
                  }}
                  onCancelEdit={onCancelEdit}
                  onEditingValueChange={onEditingStationNameChange}
                  onSaveEdit={onSaveEdit}
                  onDelete={(item) => onDeleteStation(item.id, item.label)}
                  onToggleVisibility={() => {}}
                />
              )}
              {pendingCreateName ? (
                <div
                  className={cn(
                    rootsSortableListRowClass,
                    "pointer-events-none h-14 opacity-50",
                  )}
                  aria-busy="true"
                  aria-disabled="true"
                >
                  <p className={cn(rootsSortableListRowLabelClass, "min-w-0 flex-1")}>
                    {pendingCreateName}
                  </p>
                  <RootsSpinner
                    size="sm"
                    className="shrink-0"
                    label={`Creando ${pendingCreateName}`}
                  />
                </div>
              ) : null}
            </div>
          )}
        </RootsDialogBody>
      </RootsDialogContent>
    </Dialog>
  )
}
