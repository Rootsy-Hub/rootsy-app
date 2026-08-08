"use client"

import {
  rootsSortableListDragHandleClass,
  rootsSortableListDragHandleIconClass,
  rootsSortableListInlineEditInputClass,
  rootsSortableListRowClass,
  rootsSortableListRowLabelClass,
  rootsSortableListRowLabelMutedClass,
} from "@/components/rootsy-list/rootsListStyles"
import { RootsIconButton } from "@/components/rootsy-button/RootsIconButton"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { DraggableAttributes } from "@dnd-kit/core"
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities"
import { Check, Eye, EyeOff, GripVertical, Pencil, Trash2, X } from "lucide-react"

export type RootsSortableActionListItem = {
  id: string
  label: string
  /** false = fila atenuada (p. ej. oculto en ventas). */
  visible?: boolean
}

type DragHandleProps = {
  attributes: DraggableAttributes
  listeners: SyntheticListenerMap | undefined
}

type Props = {
  item: RootsSortableActionListItem
  isEditing: boolean
  editingValue: string
  editSaveBusy: boolean
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
}

export function RootsSortableActionListRow({
  item,
  isEditing,
  editingValue,
  editSaveBusy,
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
}: Props) {
  const visible = item.visible !== false
  const label = item.label || "—"
  const showActions = canEdit || canDelete || canToggleVisibility

  return (
    <div className={rootsSortableListRowClass}>
      {canReorder && dragHandleProps ? (
        <button
          type="button"
          className={rootsSortableListDragHandleClass}
          aria-label={`Reordenar ${label}`}
          {...dragHandleProps.attributes}
          {...dragHandleProps.listeners}
        >
          <GripVertical className="size-4" aria-hidden />
        </button>
      ) : canReorder ? (
        <GripVertical
          className={cn("size-4 shrink-0", rootsSortableListDragHandleIconClass)}
          aria-hidden
        />
      ) : null}

      <div className="min-w-0 flex-1">
        {isEditing ? (
          <Input
            value={editingValue}
            onChange={(event) => onEditingValueChange(event.target.value)}
            className={rootsSortableListInlineEditInputClass}
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

      {showActions ? (
        <div className="flex shrink-0 items-center justify-end gap-0.5">
          {isEditing ? (
            <>
              <RootsIconButton
                label="Cancelar edición"
                rowIntent="neutral"
                size="compact"
                onClick={onCancelEdit}
              >
                <X aria-hidden />
              </RootsIconButton>
              <RootsIconButton
                label={`Guardar ${label}`}
                rowIntent="edit"
                size="compact"
                disabled={editSaveBusy || !editingValue.trim()}
                onClick={onSaveEdit}
              >
                <Check aria-hidden />
              </RootsIconButton>
            </>
          ) : (
            <>
              {canToggleVisibility ? (
                <RootsIconButton
                  label={visible ? `Ocultar ${label}` : `Mostrar ${label}`}
                  rowIntent="neutral"
                  size="compact"
                  onClick={onToggleVisibility}
                >
                  {visible ? <Eye aria-hidden /> : <EyeOff aria-hidden />}
                </RootsIconButton>
              ) : null}
              {canEdit ? (
                <RootsIconButton
                  label={`Editar ${label}`}
                  rowIntent="edit"
                  size="compact"
                  onClick={onStartEdit}
                >
                  <Pencil aria-hidden />
                </RootsIconButton>
              ) : null}
              {canDelete ? (
                <RootsIconButton
                  label={`Eliminar ${label}`}
                  rowIntent="destructive"
                  size="compact"
                  onClick={onDelete}
                >
                  <Trash2 aria-hidden />
                </RootsIconButton>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}
