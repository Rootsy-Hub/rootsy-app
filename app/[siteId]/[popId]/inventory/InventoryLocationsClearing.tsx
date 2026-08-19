"use client"

import type { InventoryLocationRow } from "@/lib/inventory/inventoryLocations"
import { formatInventoryMoney } from "@/app/[siteId]/[popId]/inventory/inventoryFormat"
import {
  dataWorkspaceBlocksEmptyStateClass,
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardLosetaSurfaceClass,
  dataWorkspaceEntityCardTitleClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { RootsDangerSubtleButton, RootsSubtleButton } from "@/components/rootsy-button"
import { RootsFormTextField } from "@/components/rootsy-form"
import { cn } from "@/lib/utils"
import { useState } from "react"

type Props = {
  locations: InventoryLocationRow[]
  canCreate: boolean
  canUpdate: boolean
  saving: boolean
  banner: string | null
  newName: string
  onNewNameChange: (value: string) => void
  onCreate: () => void
  onRename: (locationId: string, name: string) => void
  onArchive: (locationId: string) => void
}

export function InventoryLocationsClearing({
  locations,
  canCreate,
  canUpdate,
  saving,
  banner,
  newName,
  onNewNameChange,
  onCreate,
  onRename,
  onArchive,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  return (
    <div className="space-y-6">
      {banner ? (
        <p className="font-canopy text-sm text-destructive">{banner}</p>
      ) : null}

      {canCreate ? (
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(event) => {
            event.preventDefault()
            onCreate()
          }}
        >
          <RootsFormTextField
            label="Nuevo depósito"
            id="inventory-new-location"
            value={newName}
            onChange={(event) => onNewNameChange(event.target.value)}
            placeholder="Cámara, depósito, trastienda…"
            disabled={saving}
            autoComplete="off"
            className="sm:min-w-64 sm:flex-1"
          />
          <RootsSubtleButton
            type="submit"
            size="compact"
            disabled={saving || newName.trim().length < 1}
          >
            Agregar
          </RootsSubtleButton>
        </form>
      ) : null}

      {locations.length === 0 ? (
        <p className={dataWorkspaceBlocksEmptyStateClass}>
          Todavía no hay depósitos en este punto.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {locations.map((location) => (
            <article
              key={location.id}
              className={cn(dataWorkspaceEntityCardLosetaSurfaceClass, "p-5")}
            >
              {editingId === location.id ? (
                <form
                  className="space-y-3"
                  onSubmit={(event) => {
                    event.preventDefault()
                    onRename(location.id, editName)
                    setEditingId(null)
                  }}
                >
                  <RootsFormTextField
                    label="Nombre"
                    id={`inventory-rename-${location.id}`}
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    disabled={saving}
                    autoComplete="off"
                  />
                  <div className="flex flex-wrap gap-2">
                    <RootsSubtleButton type="submit" size="compact" disabled={saving}>
                      Guardar
                    </RootsSubtleButton>
                    <RootsSubtleButton
                      type="button"
                      size="compact"
                      disabled={saving}
                      onClick={() => setEditingId(null)}
                    >
                      Cancelar
                    </RootsSubtleButton>
                  </div>
                </form>
              ) : (
                <>
                  <p className={dataWorkspaceEntityCardEyebrowClass}>
                    {location.isDefault
                      ? "Principal · se vende desde acá"
                      : "Depósito"}
                  </p>
                  <h3 className={cn(dataWorkspaceEntityCardTitleClass, "mt-2")}>
                    {location.name}
                  </h3>
                  <p className="mt-2 font-canopy text-xs leading-relaxed text-rootsy-bruma-500">
                    {location.articleCount === 0
                      ? "Sin stock"
                      : location.articleCount === 1
                        ? "1 artículo"
                        : `${location.articleCount} artículos`}
                    {" · "}
                    {formatInventoryMoney(location.inventoryValue)}
                  </p>
                  {canUpdate ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <RootsSubtleButton
                        type="button"
                        size="compact"
                        disabled={saving}
                        onClick={() => {
                          setEditingId(location.id)
                          setEditName(location.name)
                        }}
                      >
                        Renombrar
                      </RootsSubtleButton>
                      {location.canArchive ? (
                        <RootsDangerSubtleButton
                          type="button"
                          size="compact"
                          disabled={saving}
                          onClick={() => onArchive(location.id)}
                        >
                          Archivar
                        </RootsDangerSubtleButton>
                      ) : null}
                    </div>
                  ) : null}
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
