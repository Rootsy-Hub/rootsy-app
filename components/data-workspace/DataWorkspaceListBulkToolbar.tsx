"use client"

import {
  listBulkToolbarActionButtonClass,
  listBulkToolbarBarClass,
  listBulkToolbarClearButtonClass,
  listBulkToolbarCountClass,
  listBulkToolbarCountMutedClass,
  listTableChromeBarStackedSurfaceClass,
  workspaceTableNatureBulkBarClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  RootsDangerButton,
  RootsDefaultButton,
  RootsSubtleButton,
} from "@/components/rootsy-button"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export type DataWorkspaceListBulkAction = {
  label: string
  onClick: () => void
  semantic?: "secondary" | "destructive"
}

type Props = {
  selectedCount: number
  onClear: () => void
  actions?: DataWorkspaceListBulkAction[]
  /** Acciones custom — si se pasa, ignora `actions`. */
  children?: ReactNode
  tone?: "nature" | "default"
  /** Dentro del stack de filtros activos — sin borde inferior propio. */
  placement?: "standalone" | "stacked"
  disabled?: boolean
  className?: string
}

export function DataWorkspaceListBulkToolbar({
  selectedCount,
  onClear,
  actions = [],
  children,
  tone = "nature",
  placement = "standalone",
  disabled = false,
  className,
}: Props) {
  const isStacked = placement === "stacked"

  return (
    <div
      className={cn(
        isStacked
          ? listTableChromeBarStackedSurfaceClass
          : listBulkToolbarBarClass,
        !isStacked &&
          (tone === "nature"
            ? workspaceTableNatureBulkBarClass
            : "border-b border-border/80 bg-muted/35"),
        disabled && "pointer-events-none opacity-60",
        className,
      )}
      role="region"
      aria-label="Acciones sobre selección"
    >
      <span className={listBulkToolbarCountClass}>
        <span className="font-semibold">{selectedCount}</span>{" "}
        <span className={listBulkToolbarCountMutedClass}>seleccionados</span>
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {children ??
          actions.map((action) => (
            <BulkToolbarActionButton key={action.label} action={action} />
          ))}
        <RootsSubtleButton
          type="button"
          size="sm"
          className={listBulkToolbarClearButtonClass}
          onClick={onClear}
        >
          Limpiar
        </RootsSubtleButton>
      </div>
    </div>
  )
}

function BulkToolbarActionButton({ action }: { action: DataWorkspaceListBulkAction }) {
  const shared = {
    type: "button" as const,
    size: "sm" as const,
    className: listBulkToolbarActionButtonClass,
    onClick: action.onClick,
    children: action.label,
  }

  if (action.semantic === "destructive") {
    return <RootsDangerButton {...shared} />
  }

  return <RootsDefaultButton {...shared} />
}
