"use client"

import { mesasLayoutDialogSortableListScrollClass } from "@/app/[siteId]/[popId]/mesas/components/mesasLayoutDialogShared"
import {
  RootsSortableActionList,
  rootsSortableListFooterHintClass,
  rootsSortableListRowClass,
  rootsSortableListRowLabelClass,
  type RootsSortableActionListItem,
} from "@/components/rootsy-list"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  listId: string
  items: RootsSortableActionListItem[]
  canReorder?: boolean
  canEdit?: boolean
  canDelete?: boolean
  canToggleVisibility?: boolean
  emptyMessage?: string
  reorderHint?: string
  className?: string
  pendingCreateName?: string | null
  pendingDeleteId?: string | null
  onReorder: (items: RootsSortableActionListItem[]) => void
  onEdit: (item: RootsSortableActionListItem) => void
  onDelete: (item: RootsSortableActionListItem) => void
  onToggleVisibility?: (id: string) => void
  footer?: ReactNode
}

export function MesasLayoutSortableList({
  listId,
  items,
  canReorder = true,
  canEdit = true,
  canDelete = true,
  canToggleVisibility = false,
  emptyMessage = "Todavía no hay ítems.",
  reorderHint,
  className,
  pendingCreateName = null,
  pendingDeleteId = null,
  onReorder,
  onEdit,
  onDelete,
  onToggleVisibility,
  footer,
}: Props) {
  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className={mesasLayoutDialogSortableListScrollClass}>
        <div className="flex flex-col gap-1.5">
          {items.length === 0 && pendingCreateName ? null : (
            <RootsSortableActionList
              listId={listId}
              items={items}
              className="w-full"
              onReorder={onReorder}
              emptyMessage={emptyMessage}
              canReorder={canReorder}
              canToggleVisibility={canToggleVisibility}
              canEdit={canEdit}
              canDelete={canDelete}
              editingId={null}
              editingValue=""
              editSaveBusy={false}
              busyId={pendingDeleteId}
              onStartEdit={onEdit}
              onCancelEdit={() => {}}
              onEditingValueChange={() => {}}
              onSaveEdit={() => {}}
              onDelete={onDelete}
              onToggleVisibility={onToggleVisibility ?? (() => {})}
            />
          )}
          {pendingCreateName ? (
            <div
              className={cn(
                rootsSortableListRowClass,
                "pointer-events-none opacity-50",
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
      </div>
      {reorderHint ? (
        <p className={rootsSortableListFooterHintClass}>{reorderHint}</p>
      ) : null}
      {footer}
    </div>
  )
}
