"use client"

import {
  createPopPriceList,
  deletePopPriceList,
  getPopPriceLists,
  updatePopPriceList,
} from "@/app/[siteId]/[popId]/articles/priceListActions"
import {
  RootsProgressButton,
  RootsSubtleButton,
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
import { saleOpDialogPrimaryBtn } from "@/components/sale-operation/saleOperationStyles"
import { Dialog } from "@/components/ui/dialog"
import type { SalePriceList } from "@/lib/salePriceLists"
import { cn } from "@/lib/utils"
import { Pencil, Trash2 } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  popId: string
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  onChanged?: () => void
}

export function ArticlePriceListsDialog({
  open,
  onOpenChange,
  popId,
  canCreate,
  canUpdate,
  canDelete,
  onChanged,
}: Props) {
  const [lists, setLists] = useState<SalePriceList[]>([])
  const [loading, setLoading] = useState(false)
  const [banner, setBanner] = useState<string | null>(null)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadLists = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      const res = await getPopPriceLists(popId)
      if (!silent) setLoading(false)
      if (!res.success) {
        setBanner(res.error)
        setLists([])
        return
      }
      setLists(res.lists)
    },
    [popId],
  )

  useEffect(() => {
    if (!open) return
    setBanner(null)
    setNewName("")
    setEditingId(null)
    void loadLists()
  }, [loadLists, open])

  const submitNew = async () => {
    if (!newName.trim()) return
    setCreating(true)
    setBanner(null)
    const res = await createPopPriceList(popId, newName)
    setCreating(false)
    if (!res.success) {
      setBanner(res.error)
      return
    }
    setNewName("")
    await loadLists(true)
    onChanged?.()
  }

  const saveEdit = async () => {
    if (!editingId) return
    setSaving(true)
    setBanner(null)
    const res = await updatePopPriceList(popId, editingId, editingName)
    setSaving(false)
    if (!res.success) {
      setBanner(res.error)
      return
    }
    setEditingId(null)
    await loadLists(true)
    onChanged?.()
  }

  const removeList = async (list: SalePriceList) => {
    if (list.isDefault) return
    setDeletingId(list.id)
    setBanner(null)
    const res = await deletePopPriceList(popId, list.id)
    setDeletingId(null)
    if (!res.success) {
      setBanner(res.error)
      return
    }
    if (editingId === list.id) setEditingId(null)
    await loadLists(true)
    onChanged?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="wide">
        <RootsDialogHeader
          title="Listas de precios"
          description="Principal se puede renombrar, no eliminar. Un artículo o receta sin precio en una lista usa Principal."
        />
        <RootsDialogBody>
          {banner ? <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner> : null}
          {canCreate ? (
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <RootsFormTextField
                label="Nueva lista"
                id="new-price-list-name"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Mayorista, Delivery…"
                className="min-w-0 flex-1"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    void submitNew()
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
                disabled={creating || !newName.trim()}
                loading={creating}
                loadingLabel="Agregando…"
                onClick={() => void submitNew()}
              >
                Agregar
              </RootsProgressButton>
            </div>
          ) : null}

          {loading && lists.length === 0 ? (
            <RootsDialogLoadingState message="Cargando listas" />
          ) : (
            <ul className="flex flex-col gap-2">
              {lists.map((list) => {
                const isEditing = editingId === list.id
                return (
                  <li
                    key={list.id}
                    className="flex flex-col gap-2 rounded-xl border border-[var(--rootsy-bruma-200)] bg-white/70 px-3 py-2.5 sm:flex-row sm:items-center"
                  >
                    {isEditing ? (
                      <RootsFormTextField
                        label="Nombre"
                        id={`price-list-edit-${list.id}`}
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        className="min-w-0 flex-1"
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault()
                            void saveEdit()
                          }
                        }}
                      />
                    ) : (
                      <div className="min-w-0 flex-1">
                        <p className="font-canopy text-sm font-semibold text-[var(--rootsy-bruma-900)]">
                          {list.name}
                        </p>
                        {list.isDefault ? (
                          <p className="text-xs text-[var(--rootsy-bruma-500)]">
                            Lista principal · precio de venta del producto
                          </p>
                        ) : (
                          <p className="text-xs text-[var(--rootsy-bruma-500)]">
                            Precio opcional por producto
                          </p>
                        )}
                      </div>
                    )}
                    <div className="flex shrink-0 items-center justify-end gap-1.5">
                      {isEditing ? (
                        <>
                          <RootsSubtleButton
                            type="button"
                            onClick={() => setEditingId(null)}
                            disabled={saving}
                          >
                            Cancelar
                          </RootsSubtleButton>
                          <RootsProgressButton
                            type="button"
                            variant={rootsButtonVariant.primary}
                            className={cn(
                              saleOpDialogPrimaryBtn,
                              rootsButtonClassForVariant("primary"),
                              "h-10",
                            )}
                            disabled={saving || !editingName.trim()}
                            loading={saving}
                            loadingLabel="Guardando…"
                            onClick={() => void saveEdit()}
                          >
                            Guardar
                          </RootsProgressButton>
                        </>
                      ) : (
                        <>
                          {canUpdate ? (
                            <button
                              type="button"
                              className="inline-flex size-9 items-center justify-center rounded-full text-[var(--rootsy-bruma-500)] hover:bg-[var(--rootsy-bruma-100)] hover:text-[var(--rootsy-bruma-800)]"
                              aria-label={`Renombrar ${list.name}`}
                              onClick={() => {
                                setEditingId(list.id)
                                setEditingName(list.name)
                              }}
                            >
                              <Pencil className="size-4" aria-hidden />
                            </button>
                          ) : null}
                          {canDelete && !list.isDefault ? (
                            <button
                              type="button"
                              className="inline-flex size-9 items-center justify-center rounded-full text-[var(--rootsy-bruma-500)] hover:bg-[var(--rootsy-bruma-100)] hover:text-[var(--rootsy-status-danger)] disabled:opacity-50"
                              aria-label={`Eliminar ${list.name}`}
                              disabled={deletingId === list.id}
                              onClick={() => void removeList(list)}
                            >
                              <Trash2 className="size-4" aria-hidden />
                            </button>
                          ) : null}
                        </>
                      )}
                    </div>
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
