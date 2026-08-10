"use client"

import { mesasLayoutDialogSortableListScrollClass } from "@/app/[siteId]/[popId]/mesas/components/mesasLayoutDialogShared"
import {
  RootsSortableActionList,
  rootsSortableListFooterHintClass,
  type RootsSortableActionListItem,
} from "@/components/rootsy-list"
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
  onReorder,
  onEdit,
  onDelete,
  onToggleVisibility,
  footer,
}: Props) {
  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className={mesasLayoutDialogSortableListScrollClass}>
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
          onStartEdit={onEdit}
          onCancelEdit={() => {}}
          onEditingValueChange={() => {}}
          onSaveEdit={() => {}}
          onDelete={onDelete}
          onToggleVisibility={onToggleVisibility ?? (() => {})}
        />
      </div>
      {reorderHint ? (
        <p className={rootsSortableListFooterHintClass}>{reorderHint}</p>
      ) : null}
      {footer}
    </div>
  )
}
