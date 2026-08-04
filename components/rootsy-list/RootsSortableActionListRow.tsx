"use client"

import {
  rootsSortableListDragHandleClass,
  rootsSortableListDragHandleIconClass,
  rootsSortableListInlineEditInputClass,
  rootsSortableListRowClass,
  rootsSortableListRowLabelClass,
  rootsSortableListRowLabelMutedClass,
} from "@/components/rootsy-list/rootsListStyles"
import { DataWorkspaceTableIconAction } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
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
              <DataWorkspaceTableIconAction
                label="Cancelar edición"
                icon={X}
                variant="neutral"
                onClick={onCancelEdit}
              />
              <DataWorkspaceTableIconAction
                label={`Guardar ${label}`}
                icon={Check}
                variant="edit"
                disabled={editSaveBusy || !editingValue.trim()}
                onClick={onSaveEdit}
              />
            </>
          ) : (
            <>
              {canToggleVisibility ? (
                <DataWorkspaceTableIconAction
                  label={
                    visible
                      ? `Ocultar ${label}`
                      : `Mostrar ${label}`
                  }
                  icon={visible ? Eye : EyeOff}
                  variant="neutral"
                  onClick={onToggleVisibility}
                />
              ) : null}
              {canEdit ? (
                <DataWorkspaceTableIconAction
                  label={`Editar ${label}`}
                  icon={Pencil}
                  onClick={onStartEdit}
                />
              ) : null}
              {canDelete ? (
                <DataWorkspaceTableIconAction
                  label={`Eliminar ${label}`}
                  icon={Trash2}
                  variant="destructive"
                  onClick={onDelete}
                />
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}
