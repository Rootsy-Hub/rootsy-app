"use client"

import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { Sparkles } from "lucide-react"
import type { ReactNode } from "react"

export type DataWorkspaceSidebarCreationItem = {
  id: string
  label: string
  icon?: LucideIcon
}

export type DataWorkspaceSidebarViewItem = {
  id: string
  label: string
  icon?: LucideIcon
}

export function getDefaultWorkspaceViewId(
  creation: readonly DataWorkspaceSidebarCreationItem[],
  views: readonly DataWorkspaceSidebarViewItem[],
): string {
  if (views.length > 0) return views[0].id
  return creation[0]?.id ?? ""
}

export type DataWorkspaceSidebarProps = {
  creationItems?: readonly DataWorkspaceSidebarCreationItem[]
  viewItems: readonly DataWorkspaceSidebarViewItem[]
  activeId: string
  onSelect: (id: string) => void
  /** Etiqueta sobre los accesos de creación (opcional). */
  creationSectionLabel?: string
  /** Etiqueta sobre las vistas (opcional). */
  viewsSectionLabel?: string
  /** Contenido opcional al pie de la barra (p. ej. acciones secundarias). */
  footer?: ReactNode
  className?: string
}

export function DataWorkspaceSidebar({
  creationItems = [],
  viewItems,
  activeId,
  onSelect,
  creationSectionLabel = "Nuevo",
  viewsSectionLabel = "En esta sección",
  footer,
  className,
}: DataWorkspaceSidebarProps) {
  const hasCreation = creationItems.length > 0

  return (
    <nav
      className={cn(
        "flex h-full min-h-0 w-[min(100%,15.5rem)] shrink-0 flex-col self-stretch overflow-y-auto border-r border-border/80 bg-linear-to-b from-card/90 via-card/70 to-muted/30 py-5 pl-4 pr-3 backdrop-blur-sm",
        className,
      )}
      aria-label="Navegación de la sección"
    >
      {hasCreation ? (
        <div className="mb-5 space-y-1">
          <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/90">
            {creationSectionLabel}
          </p>
          <ul
            className="relative space-y-0.5 border-l-2 border-border/70 pl-3"
            role="list"
          >
            <span
              className="pointer-events-none absolute bottom-0 left-[-2px] top-0 w-0.5 rounded-full bg-linear-to-b from-primary/0 via-primary/40 to-primary/0 opacity-40"
              aria-hidden
            />
            {creationItems.map((item) => {
              const CIcon = item.icon
              const selected = activeId === item.id
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    aria-current={selected ? "page" : undefined}
                    className={cn(
                      "relative flex w-full items-center gap-2.5 rounded-r-xl py-2.5 pl-3 pr-2 text-left text-sm transition-colors",
                      selected
                        ? "bg-primary/12 font-semibold text-foreground shadow-sm before:absolute before:inset-y-1 before:left-[-14px] before:w-1 before:rounded-full before:bg-primary"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    {CIcon ? (
                      <CIcon
                        className={cn(
                          "size-4 shrink-0",
                          selected ? "text-primary" : "opacity-70",
                        )}
                        aria-hidden
                      />
                    ) : (
                      <Sparkles
                        className={cn(
                          "size-4 shrink-0",
                          selected ? "text-primary" : "opacity-70",
                        )}
                        aria-hidden
                      />
                    )}
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      {hasCreation && viewItems.length > 0 ? (
        <div
          className="mb-4 flex items-center gap-2 px-1"
          aria-hidden
        >
          <div className="h-px flex-1 bg-linear-to-r from-border via-primary/25 to-transparent" />
          <span className="shrink-0 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            {viewsSectionLabel}
          </span>
          <div className="h-px flex-1 bg-linear-to-l from-border via-primary/25 to-transparent" />
        </div>
      ) : null}

      {viewItems.length > 0 ? (
        <div className="min-h-0 flex-1 space-y-1">
          {!hasCreation ? (
            <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/90">
              {viewsSectionLabel}
            </p>
          ) : null}
          <ul
            className="relative space-y-0.5 border-l-2 border-border/70 pl-3"
            role="list"
          >
            <span
              className="pointer-events-none absolute bottom-0 left-[-2px] top-0 w-0.5 rounded-full bg-linear-to-b from-primary/0 via-primary/40 to-primary/0 opacity-40"
              aria-hidden
            />
            {viewItems.map((item) => {
              const VIcon = item.icon
              const selected = activeId === item.id
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    aria-current={selected ? "page" : undefined}
                    className={cn(
                      "relative flex w-full items-center gap-2.5 rounded-r-xl py-2.5 pl-3 pr-2 text-left text-sm transition-colors",
                      selected
                        ? "bg-primary/12 font-semibold text-foreground shadow-sm before:absolute before:inset-y-1 before:left-[-14px] before:w-1 before:rounded-full before:bg-primary"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    {VIcon ? (
                      <VIcon
                        className={cn(
                          "size-4 shrink-0",
                          selected ? "text-primary" : "opacity-70",
                        )}
                        aria-hidden
                      />
                    ) : null}
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
      {footer ? (
        <div className="mt-auto shrink-0 border-t border-border/70 pt-4">{footer}</div>
      ) : null}
    </nav>
  )
}
