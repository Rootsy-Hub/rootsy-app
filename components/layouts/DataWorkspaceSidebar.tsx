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
  /** Estilo oscuro alineado al sidebar de ventas. */
  variant?: "default" | "dark"
  className?: string
}

const darkSectionLabelClass =
  "mb-2.5 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500"

const darkItemButtonBaseClass =
  "relative flex min-h-11 w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2027]"

const darkItemSelectedClass =
  "bg-white/10 text-white before:absolute before:top-1/2 before:left-0 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-emerald-400 before:content-['']"

const darkItemIdleClass =
  "text-slate-400 hover:bg-white/6 hover:text-slate-100"

function SidebarItemButton({
  selected,
  label,
  icon: Icon,
  fallbackIcon: FallbackIcon,
  variant,
  onClick,
}: {
  selected: boolean
  label: string
  icon?: LucideIcon
  fallbackIcon?: LucideIcon
  variant: "default" | "dark"
  onClick: () => void
}) {
  const ResolvedIcon = Icon ?? FallbackIcon

  if (variant === "dark") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-current={selected ? "page" : undefined}
        className={cn(
          darkItemButtonBaseClass,
          selected ? darkItemSelectedClass : darkItemIdleClass,
        )}
      >
        {ResolvedIcon ? (
          <ResolvedIcon className="size-4 shrink-0 opacity-80" aria-hidden />
        ) : null}
        <span className="min-w-0 flex-1 truncate">{label}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={selected ? "page" : undefined}
      className={cn(
        "relative flex w-full items-center gap-2.5 rounded-r-xl py-2.5 pl-3 pr-2 text-left text-sm transition-colors",
        selected
          ? "bg-primary/12 font-semibold text-foreground shadow-sm before:absolute before:inset-y-1 before:left-[-14px] before:w-1 before:rounded-full before:bg-primary"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      {ResolvedIcon ? (
        <ResolvedIcon
          className={cn(
            "size-4 shrink-0",
            selected ? "text-primary" : "opacity-70",
          )}
          aria-hidden
        />
      ) : null}
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  )
}

export function DataWorkspaceSidebar({
  creationItems = [],
  viewItems,
  activeId,
  onSelect,
  creationSectionLabel = "Nuevo",
  viewsSectionLabel = "En esta sección",
  footer,
  variant = "default",
  className,
}: DataWorkspaceSidebarProps) {
  const hasCreation = creationItems.length > 0
  const isDark = variant === "dark"

  return (
    <nav
      className={cn(
        isDark
          ? "game-scroll flex h-full min-h-0 w-[280px] shrink-0 flex-col self-stretch gap-6 overflow-y-auto border-r border-white/10 bg-[#1a2027] px-3 py-4"
          : "flex h-full min-h-0 w-[min(100%,15.5rem)] shrink-0 flex-col self-stretch overflow-y-auto border-r border-border/80 bg-linear-to-b from-card/90 via-card/70 to-muted/30 py-5 pl-4 pr-3 backdrop-blur-sm",
        className,
      )}
      aria-label="Navegación de la sección"
    >
      {hasCreation ? (
        <div className={isDark ? undefined : "mb-5 space-y-1"}>
          <p
            className={
              isDark
                ? darkSectionLabelClass
                : "mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/90"
            }
          >
            {creationSectionLabel}
          </p>
          <ul
            className={cn(
              isDark
                ? "flex flex-col gap-0.5 p-0"
                : "relative space-y-0.5 border-l-2 border-border/70 pl-3",
            )}
            role="list"
          >
            {!isDark ? (
              <span
                className="pointer-events-none absolute bottom-0 left-[-2px] top-0 w-0.5 rounded-full bg-linear-to-b from-primary/0 via-primary/40 to-primary/0 opacity-40"
                aria-hidden
              />
            ) : null}
            {creationItems.map((item) => (
              <li key={item.id}>
                <SidebarItemButton
                  selected={activeId === item.id}
                  label={item.label}
                  icon={item.icon}
                  fallbackIcon={Sparkles}
                  variant={variant}
                  onClick={() => onSelect(item.id)}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasCreation && viewItems.length > 0 && !isDark ? (
        <div className="mb-4 flex items-center gap-2 px-1" aria-hidden>
          <div className="h-px flex-1 bg-linear-to-r from-border via-primary/25 to-transparent" />
          <span className="shrink-0 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            {viewsSectionLabel}
          </span>
          <div className="h-px flex-1 bg-linear-to-l from-border via-primary/25 to-transparent" />
        </div>
      ) : null}

      {viewItems.length > 0 ? (
        <div className={isDark ? undefined : "min-h-0 flex-1 space-y-1"}>
          {(!hasCreation || isDark) ? (
            <p
              className={
                isDark
                  ? darkSectionLabelClass
                  : "mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/90"
              }
            >
              {viewsSectionLabel}
            </p>
          ) : null}
          <ul
            className={cn(
              isDark
                ? "flex flex-col gap-0.5 p-0"
                : "relative min-h-0 flex-1 space-y-0.5 border-l-2 border-border/70 pl-3",
            )}
            role="list"
          >
            {!isDark ? (
              <span
                className="pointer-events-none absolute bottom-0 left-[-2px] top-0 w-0.5 rounded-full bg-linear-to-b from-primary/0 via-primary/40 to-primary/0 opacity-40"
                aria-hidden
              />
            ) : null}
            {viewItems.map((item) => (
              <li key={item.id}>
                <SidebarItemButton
                  selected={activeId === item.id}
                  label={item.label}
                  icon={item.icon}
                  variant={variant}
                  onClick={() => onSelect(item.id)}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {footer ? (
        <div
          className={cn(
            "mt-auto shrink-0 border-t pt-4",
            isDark ? "border-white/10" : "border-border/70",
          )}
        >
          {footer}
        </div>
      ) : null}
    </nav>
  )
}
