"use client"

import type { ServiceCategoryOption } from "@/app/[siteId]/[popId]/services/actions"
import {
  serviceDialogEmptyHintClass,
  serviceDialogListItemTitleClass,
  serviceDialogListShellClass,
} from "@/app/[siteId]/[popId]/services/serviceDialogShared"
import { RootsIconButton, RootsPrimaryButton } from "@/components/rootsy-button"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogHeader,
  RootsDialogSingleActionFooter,
} from "@/components/rootsy-dialog"
import { RootsFormTextField } from "@/components/rootsy-form"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { Dialog } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Check, Pencil, Trash2, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: ServiceCategoryOption[]
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  newCategoryName: string
  onNewCategoryNameChange: (value: string) => void
  onCreateCategory: () => void
  categoryBusy: boolean
  pendingCreateName: string | null
  pendingDeleteId: string | null
  editingCategoryId: string | null
  editingCategoryName: string
  onEditingCategoryNameChange: (value: string) => void
  onStartEdit: (category: ServiceCategoryOption) => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  onDeleteCategory: (id: string, name: string) => void
  onAfterClose?: () => void
}

export function ServiceCategoriesDialog({
  open,
  onOpenChange,
  categories,
  canCreate,
  canUpdate,
  canDelete,
  newCategoryName,
  onNewCategoryNameChange,
  onCreateCategory,
  categoryBusy,
  pendingCreateName,
  pendingDeleteId,
  editingCategoryId,
  editingCategoryName,
  onEditingCategoryNameChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDeleteCategory,
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
      <RootsDialogContent size="wide">
        <RootsDialogHeader
          title="Categorías de servicios"
          description="Agrupá tu catálogo por tipo de oferta o rubro interno."
        />
        <RootsDialogBody>
          {canCreate ? (
            <div className="mb-4 flex flex-wrap items-end gap-2">
              <div className="min-w-[12rem] flex-1">
                <RootsFormTextField
                  label="Nueva categoría"
                  id="service-new-category"
                  value={newCategoryName}
                  onChange={(e) => onNewCategoryNameChange(e.target.value)}
                  placeholder="Nombre de la categoría"
                  disabled={categoryBusy}
                />
              </div>
              <RootsPrimaryButton
                type="button"
                className="shrink-0"
                disabled={categoryBusy || !newCategoryName.trim()}
                onClick={onCreateCategory}
              >
                Agregar
              </RootsPrimaryButton>
            </div>
          ) : null}

          <div className={serviceDialogListShellClass}>
            {categories.length === 0 && !pendingCreateName ? (
              <p className={serviceDialogEmptyHintClass}>
                Todavía no hay categorías cargadas.
              </p>
            ) : (
              categories.map((category) => {
                const editing = editingCategoryId === category.id
                const isDeleting = pendingDeleteId === category.id
                return (
                  <div
                    key={category.id}
                    className={cn(
                      "flex flex-wrap items-center gap-2 p-3",
                      isDeleting && "pointer-events-none opacity-50",
                    )}
                    aria-busy={isDeleting || undefined}
                    aria-disabled={isDeleting || undefined}
                  >
                    {isDeleting ? (
                      <>
                        <div className="min-w-0 flex-1">
                          <p className={serviceDialogListItemTitleClass}>
                            {category.name}
                          </p>
                        </div>
                        <RootsSpinner
                          size="sm"
                          className="shrink-0"
                          label={`Eliminando ${category.name}`}
                        />
                      </>
                    ) : editing ? (
                      <>
                        <div className="min-w-[12rem] flex-1">
                          <RootsFormTextField
                            label="Nombre"
                            id={`service-category-edit-${category.id}`}
                            value={editingCategoryName}
                            onChange={(e) =>
                              onEditingCategoryNameChange(e.target.value)
                            }
                            disabled={categoryBusy}
                          />
                        </div>
                        <RootsIconButton
                          type="button"
                          label="Guardar"
                          disabled={categoryBusy || !editingCategoryName.trim()}
                          onClick={onSaveEdit}
                        >
                          <Check className="size-4" aria-hidden />
                        </RootsIconButton>
                        <RootsIconButton
                          type="button"
                          label="Cancelar"
                          tone="ghost"
                          disabled={categoryBusy}
                          onClick={onCancelEdit}
                        >
                          <X className="size-4" aria-hidden />
                        </RootsIconButton>
                      </>
                    ) : (
                      <>
                        <div className="min-w-0 flex-1">
                          <p className={serviceDialogListItemTitleClass}>
                            {category.name}
                          </p>
                        </div>
                        {canUpdate ? (
                          <RootsIconButton
                            type="button"
                            label={`Editar ${category.name}`}
                            tone="ghost"
                            disabled={categoryBusy}
                            onClick={() => onStartEdit(category)}
                          >
                            <Pencil className="size-4" aria-hidden />
                          </RootsIconButton>
                        ) : null}
                        {canDelete ? (
                          <RootsIconButton
                            type="button"
                            label={`Eliminar ${category.name}`}
                            tone="ghost"
                            intent="destructive"
                            disabled={categoryBusy}
                            onClick={() =>
                              onDeleteCategory(category.id, category.name)
                            }
                          >
                            <Trash2 className="size-4 text-destructive" aria-hidden />
                          </RootsIconButton>
                        ) : null}
                      </>
                    )}
                  </div>
                )
              })
            )}
            {pendingCreateName ? (
              <div
                className="flex items-center gap-2 p-3 opacity-50"
                aria-busy="true"
                aria-disabled="true"
              >
                <div className="min-w-0 flex-1">
                  <p className={serviceDialogListItemTitleClass}>
                    {pendingCreateName}
                  </p>
                </div>
                <RootsSpinner
                  size="sm"
                  className="shrink-0"
                  label={`Creando ${pendingCreateName}`}
                />
              </div>
            ) : null}
          </div>
        </RootsDialogBody>
        <RootsDialogSingleActionFooter
          label="Cerrar"
          onAction={() => onOpenChange(false)}
        />
      </RootsDialogContent>
    </Dialog>
  )
}
