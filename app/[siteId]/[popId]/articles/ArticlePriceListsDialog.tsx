"use client"

import { ArticlePriceListDeleteDialog } from "@/app/[siteId]/[popId]/articles/ArticlePriceListDeleteDialog"
import { usePopPriceLists } from "@/hooks/usePopPriceLists"
import { popPriceListsQueryKey } from "@/lib/queryKeys"
import {
  createPopPriceList,
  deletePopPriceList,
  updatePopPriceList,
} from "@/lib/rootsyApi/priceListsClient"
import {
  RootsIconButton,
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
import { RootsFormControlInput, RootsFormTextField } from "@/components/rootsy-form"
import { RootsSpinner } from "@/components/rootsy-spinner"
import {
  rootsSortableListRowClass,
  rootsSortableListRowLabelClass,
} from "@/components/rootsy-list/rootsListStyles"
import { saleOpDialogPrimaryBtn } from "@/components/sale-operation/saleOperationStyles"
import { Dialog } from "@/components/ui/dialog"
import type { SalePriceList } from "@/lib/salePriceLists"
import { cn } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import { Check, Pencil, Trash2, X } from "lucide-react"
import { useEffect, useState } from "react"

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
  const queryClient = useQueryClient()
  const listsQuery = usePopPriceLists(popId, { enabled: open })
  const lists = listsQuery.data ?? []
  const loading = listsQuery.isPending && !listsQuery.data
  const [banner, setBanner] = useState<string | null>(null)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)
  const [pendingCreate, setPendingCreate] = useState<{ name: string } | null>(
    null,
  )
  const pendingCreateVisible =
    pendingCreate != null &&
    !lists.some((list) => list.name === pendingCreate.name)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    name: string
  } | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteBanner, setDeleteBanner] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const refreshLists = async () => {
    await queryClient.invalidateQueries({
      queryKey: popPriceListsQueryKey(popId),
    })
    onChanged?.()
  }

  useEffect(() => {
    if (!open) {
      setDeleteTarget(null)
      setDeleteBanner(null)
      setPendingCreate(null)
      setPendingDeleteId(null)
      setCreating(false)
      return
    }
    setBanner(null)
    setNewName("")
    setEditingId(null)
    setDeleteTarget(null)
    setDeleteBanner(null)
    setPendingCreate(null)
    setPendingDeleteId(null)
    setCreating(false)
  }, [open])

  useEffect(() => {
    if (!open || !listsQuery.error) return
    setBanner(
      listsQuery.error instanceof Error
        ? listsQuery.error.message
        : "No se pudieron cargar las listas de precios",
    )
  }, [listsQuery.error, open])

  const submitNew = async () => {
    const name = newName.trim()
    if (!name || creating) return
    setBanner(null)
    setCreating(true)
    setPendingCreate({ name })
    setNewName("")
    const res = await createPopPriceList(popId, name)
    if (!res.success) {
      setPendingCreate(null)
      setCreating(false)
      setNewName(name)
      setBanner(res.error)
      return
    }
    await refreshLists()
    setCreating(false)
    setPendingCreate(null)
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
    await refreshLists()
  }

  const closeDelete = () => {
    if (deleteBusy) return
    setDeleteTarget(null)
    setDeleteBanner(null)
  }

  const askRemoveList = (list: SalePriceList) => {
    if (list.isDefault) return
    setDeleteBanner(null)
    setDeleteTarget({ id: list.id, name: list.name })
  }

  const confirmRemoveList = async () => {
    if (!deleteTarget) return
    const target = deleteTarget
    setDeleteBusy(true)
    setDeleteBanner(null)
    setPendingDeleteId(target.id)
    if (editingId === target.id) setEditingId(null)
    setDeleteTarget(null)
    setDeleteBusy(false)
    setBanner(null)
    const res = await deletePopPriceList(popId, target.id)
    if (!res.success) {
      setPendingDeleteId(null)
      setBanner(res.error)
      return
    }
    await refreshLists()
    setPendingDeleteId(null)
  }

  return (
    <>
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
                disabled={creating}
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
                const isDeleting = pendingDeleteId === list.id
                const hasChanges = editingName.trim() !== list.name.trim()
                const canSaveEdit =
                  !saving && Boolean(editingName.trim()) && hasChanges
                const showActions =
                  !isDeleting &&
                  (canUpdate || (canDelete && !list.isDefault))

                return (
                  <li
                    key={list.id}
                    className={cn(
                      rootsSortableListRowClass,
                      isEditing ? "h-14" : "h-auto min-h-14 py-2",
                      isDeleting && "pointer-events-none opacity-50",
                    )}
                    aria-busy={isDeleting || undefined}
                    aria-disabled={isDeleting || undefined}
                  >
                    <div className="min-w-0 flex-1 basis-0">
                      {isEditing && !isDeleting ? (
                        <RootsFormControlInput
                          id={`price-list-edit-${list.id}`}
                          value={editingName}
                          onChange={(event) =>
                            setEditingName(event.target.value)
                          }
                          className="w-full"
                          autoFocus
                          aria-label={`Nombre de ${list.name}`}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault()
                              if (canSaveEdit) void saveEdit()
                            }
                            if (event.key === "Escape") {
                              event.preventDefault()
                              setEditingId(null)
                            }
                          }}
                        />
                      ) : (
                        <div className="min-w-0">
                          <p className={rootsSortableListRowLabelClass}>
                            {list.name}
                          </p>
                          <p className="truncate text-xs text-rootsy-bruma-500">
                            {list.isDefault
                              ? "Lista principal · precio de venta del producto"
                              : "Precio opcional por producto"}
                          </p>
                        </div>
                      )}
                    </div>
                    {isDeleting ? (
                      <RootsSpinner
                        size="sm"
                        className="shrink-0"
                        label={`Eliminando ${list.name}`}
                      />
                    ) : null}
                    {!isDeleting && (showActions || isEditing) ? (
                      <div className="flex shrink-0 items-center justify-end gap-0.5">
                        {canUpdate ? (
                          isEditing ? (
                            <RootsIconButton
                              label={`Guardar ${list.name}`}
                              rowIntent="edit"
                              size="compact"
                              disabled={!canSaveEdit}
                              loading={saving}
                              onClick={() => void saveEdit()}
                            >
                              <Check aria-hidden />
                            </RootsIconButton>
                          ) : (
                            <RootsIconButton
                              label={`Editar ${list.name}`}
                              rowIntent="edit"
                              size="compact"
                              onClick={() => {
                                setEditingId(list.id)
                                setEditingName(list.name)
                              }}
                            >
                              <Pencil aria-hidden />
                            </RootsIconButton>
                          )
                        ) : null}
                        {(canDelete && !list.isDefault) || isEditing ? (
                          isEditing ? (
                            <RootsIconButton
                              label="Cancelar edición"
                              rowIntent="neutral"
                              size="compact"
                              disabled={saving}
                              onClick={() => setEditingId(null)}
                            >
                              <X aria-hidden />
                            </RootsIconButton>
                          ) : (
                            <RootsIconButton
                              label={`Eliminar ${list.name}`}
                              rowIntent="destructive"
                              size="compact"
                              onClick={() => askRemoveList(list)}
                            >
                              <Trash2 aria-hidden />
                            </RootsIconButton>
                          )
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                )
              })}
              {pendingCreateVisible && pendingCreate ? (
                <li
                  className={cn(
                    rootsSortableListRowClass,
                    "pointer-events-none h-auto min-h-14 py-2 opacity-50",
                  )}
                  aria-busy="true"
                  aria-disabled="true"
                >
                  <div className="min-w-0 flex-1 basis-0">
                    <p className={rootsSortableListRowLabelClass}>
                      {pendingCreate.name}
                    </p>
                    <p className="truncate text-xs text-rootsy-bruma-500">
                      Precio opcional por producto
                    </p>
                  </div>
                  <RootsSpinner
                    size="sm"
                    className="shrink-0"
                    label={`Creando ${pendingCreate.name}`}
                  />
                </li>
              ) : null}
            </ul>
          )}
        </RootsDialogBody>
      </RootsDialogContent>
    </Dialog>
    <ArticlePriceListDeleteDialog
      open={deleteTarget !== null}
      target={deleteTarget}
      banner={deleteBanner}
      busy={deleteBusy}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeDelete()
      }}
      onClose={closeDelete}
      onConfirmDelete={() => void confirmRemoveList()}
    />
    </>
  )
}
