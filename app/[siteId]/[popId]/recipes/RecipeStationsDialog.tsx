"use client"

import type { ComandaStationOption } from "@/app/[siteId]/[popId]/recipes/actions"
import { recipeFormFieldClass } from "@/app/[siteId]/[popId]/recipes/recipeConstants"
import { DataWorkspaceTableIconAction } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { dataWorkspaceBlocksEmptyStateClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { RootsFormTextField } from "@/components/rootsy-form"
import { RootsPrimaryButton } from "@/components/rootsy-button"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Check, Pencil, Trash2, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  stations: ComandaStationOption[]
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  newStationName: string
  onNewStationNameChange: (value: string) => void
  onCreateStation: () => void
  stationBusy: boolean
  editingStationId: string | null
  editingStationName: string
  onEditingStationNameChange: (value: string) => void
  onStartEdit: (station: ComandaStationOption) => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  onDeleteStation: (id: string, name: string) => void
  onAfterClose?: () => void
}

export function RecipeStationsDialog({
  open,
  onOpenChange,
  stations,
  canCreate,
  canUpdate,
  canDelete,
  newStationName,
  onNewStationNameChange,
  onCreateStation,
  stationBusy,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="default">
        <RootsDialogHeader
          title="Estaciones"
          description="Destino de las comandas. Cada categoría elige a cuál mandar."
        />
        <RootsDialogBody>
          {canCreate ? (
            <div className="mb-4 flex flex-wrap items-end gap-2">
              <div className="min-w-[12rem] flex-1">
                <RootsFormTextField
                  label="Nueva estación"
                  id="recipe-new-station"
                  value={newStationName}
                  onChange={(e) => onNewStationNameChange(e.target.value)}
                  placeholder="Cocina, Barra, Parrilla…"
                  disabled={stationBusy}
                />
              </div>
              <RootsPrimaryButton
                type="button"
                className="shrink-0"
                disabled={stationBusy || !newStationName.trim()}
                onClick={onCreateStation}
              >
                Agregar
              </RootsPrimaryButton>
            </div>
          ) : null}
          {stations.length === 0 ? (
            <p className={dataWorkspaceBlocksEmptyStateClass}>
              Todavía no hay estaciones. Agregá Cocina, Barra u otra.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {stations.map((station) => {
                const isEditing = editingStationId === station.id
                return (
                  <li
                    key={station.id}
                    className="flex items-center gap-2 rounded-lg border border-[var(--rootsy-bruma-200)] bg-white px-2 py-2"
                  >
                    {isEditing ? (
                      <>
                        <Input
                          value={editingStationName}
                          onChange={(e) =>
                            onEditingStationNameChange(e.target.value)
                          }
                          className={cn("h-8 flex-1", recipeFormFieldClass)}
                          autoFocus
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault()
                              onSaveEdit()
                            }
                            if (event.key === "Escape") {
                              event.preventDefault()
                              onCancelEdit()
                            }
                          }}
                        />
                        <DataWorkspaceTableIconAction
                          label="Guardar"
                          icon={Check}
                          variant="edit"
                          onClick={onSaveEdit}
                          disabled={stationBusy}
                        />
                        <DataWorkspaceTableIconAction
                          label="Cancelar"
                          icon={X}
                          variant="neutral"
                          onClick={onCancelEdit}
                          disabled={stationBusy}
                        />
                      </>
                    ) : (
                      <>
                        <span className="min-w-0 flex-1 truncate text-sm text-[var(--rootsy-bruma-900)]">
                          {station.name}
                        </span>
                        {canUpdate ? (
                          <DataWorkspaceTableIconAction
                            label={`Editar ${station.name || "estación"}`}
                            icon={Pencil}
                            variant="edit"
                            onClick={() => onStartEdit(station)}
                          />
                        ) : null}
                        {canDelete ? (
                          <DataWorkspaceTableIconAction
                            label={`Eliminar ${station.name || "estación"}`}
                            icon={Trash2}
                            variant="destructive"
                            onClick={() =>
                              onDeleteStation(station.id, station.name)
                            }
                          />
                        ) : null}
                      </>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </RootsDialogBody>
      </RootsDialogContent>
    </Dialog>
  )
}
