"use client"

import {
  rootsSortableListDragHandleClass,
  rootsSortableListRowClass,
  rootsSortableListRowLabelClass,
  rootsSortableListRowLabelMutedClass,
  type RootsSortableRowSize,
} from "@/components/rootsy-list/rootsListStyles"
import { RootsIconButton } from "@/components/rootsy-button/RootsIconButton"
import { RootsFormControlInput } from "@/components/rootsy-form"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { cn } from "@/lib/utils"
import type { DraggableAttributes } from "@dnd-kit/core"
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities"
import { Check, Eye, EyeOff, GripVertical, Pencil, Trash2, X } from "lucide-react"
import type { ReactNode } from "react"

export type RootsSortableActionListItem = {
  id: string
  label: string
  /** false = fila atenuada (p. ej. oculto en ventas). */
  visible?: boolean
}

type DragHandleProps = {
  attributes: DraggableAttributes
  listeners: SyntheticListenerMap | undefined
  disabled?: boolean
}

type Props = {
  item: RootsSortableActionListItem
  isEditing: boolean
  editingValue: string
  editSaveBusy: boolean
  editHasChanges?: boolean
  canReorder: boolean
  canToggleVisibility: boolean
  canEdit: boolean
  canDelete: boolean
  dragHandleProps?: DragHandleProps
  onStartEdit: () => void
  onCancelEdit: () => void
  onEditingValueChange: (value: string) => void
  onSaveEdit: () => void
  onDelete: () => void
  onToggleVisibility: () => void
  accessory?: ReactNode
  rowSize?: RootsSortableRowSize
  isBusy?: boolean
}

export function RootsSortableActionListRow({
  item,
  isEditing,
  editingValue,
  editSaveBusy,
  editHasChanges,
  canReorder,
  canToggleVisibility,
  canEdit,
  canDelete,
  dragHandleProps,
  onStartEdit,
  onCancelEdit,
  onEditingValueChange,
  onSaveEdit,
  onDelete,
  onToggleVisibility,
  accessory,
  rowSize = "default",
  isBusy = false,
}: Props) {
  const visible = item.visible !== false
  const label = item.label || "—"
  const showActions = !isBusy && (canEdit || canDelete || canToggleVisibility)
  const hasChanges =
    editHasChanges ?? editingValue.trim() !== item.label.trim()
  const canSaveEdit =
    !editSaveBusy && Boolean(editingValue.trim()) && hasChanges

  return (
    <div
      className={cn(
        rootsSortableListRowClass,
        rowSize === "comfortable" && "h-14",
        isBusy && "pointer-events-none opacity-50",
      )}
      aria-busy={isBusy || undefined}
      aria-disabled={isBusy || undefined}
    >
      {canReorder ? (
        <button
          type="button"
          className={rootsSortableListDragHandleClass}
          aria-label={`Reordenar ${label}`}
          disabled={Boolean(dragHandleProps?.disabled)}
          {...(dragHandleProps && !dragHandleProps.disabled
            ? { ...dragHandleProps.attributes, ...dragHandleProps.listeners }
            : {})}
        >
          <GripVertical className="size-4" aria-hidden />
        </button>
      ) : null}

      <div className="min-w-0 flex-1 basis-0">
        {isEditing && !isBusy ? (
          <RootsFormControlInput
            value={editingValue}
            onChange={(event) => onEditingValueChange(event.target.value)}
            className="w-full"
            autoFocus
            aria-label={`Nombre de ${label}`}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                if (canSaveEdit) onSaveEdit()
              }
              if (event.key === "Escape") {
                event.preventDefault()
                onCancelEdit()
              }
            }}
          />
        ) : (
          <p
            className={cn(
              rootsSortableListRowLabelClass,
              !visible && rootsSortableListRowLabelMutedClass,
            )}
          >
            {label}
          </p>
        )}
      </div>

      {accessory ? (
        <div
          className="shrink-0"
          onPointerDown={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
        >
          {accessory}
        </div>
      ) : null}

      {isBusy ? (
        <RootsSpinner
          size="sm"
          className="shrink-0"
          label={`Eliminando ${label}`}
        />
      ) : null}
      {showActions ? (
        <div className="flex shrink-0 items-center justify-end gap-0.5">
          {canToggleVisibility ? (
            <RootsIconButton
              label={visible ? `Ocultar ${label}` : `Mostrar ${label}`}
              rowIntent="neutral"
              size="compact"
              disabled={isEditing}
              onClick={onToggleVisibility}
            >
              {visible ? <Eye aria-hidden /> : <EyeOff aria-hidden />}
            </RootsIconButton>
          ) : null}
          {canEdit ? (
            isEditing ? (
              <RootsIconButton
                label={`Guardar ${label}`}
                rowIntent="edit"
                size="compact"
                disabled={!canSaveEdit}
                onClick={onSaveEdit}
              >
                <Check aria-hidden />
              </RootsIconButton>
            ) : (
              <RootsIconButton
                label={`Editar ${label}`}
                rowIntent="edit"
                size="compact"
                onClick={onStartEdit}
              >
                <Pencil aria-hidden />
              </RootsIconButton>
            )
          ) : null}
          {canDelete || isEditing ? (
            isEditing ? (
              <RootsIconButton
                label="Cancelar edición"
                rowIntent="neutral"
                size="compact"
                onClick={onCancelEdit}
              >
                <X aria-hidden />
              </RootsIconButton>
            ) : (
              <RootsIconButton
                label={`Eliminar ${label}`}
                rowIntent="destructive"
                size="compact"
                onClick={onDelete}
              >
                <Trash2 aria-hidden />
              </RootsIconButton>
            )
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
