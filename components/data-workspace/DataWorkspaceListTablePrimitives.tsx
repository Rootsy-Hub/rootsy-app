"use client"

import { rootsIconButtonActionClass } from "@/components/rootsy-button/rootsButtonStyles"
import { cn } from "@/lib/utils"
import { tdMoneyClass, tdMoneyMutedClass, workspaceTableFrameSelectableScopeClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import { Package } from "lucide-react"
import Image from "next/image"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

/** Contenedor relativo para tabla + mascota en estado vacío. */
export function DataWorkspaceListTableFrame({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-full min-w-0 flex-1 flex-col",
        workspaceTableFrameSelectableScopeClass,
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Mascota abajo a la derecha; el recorte queda en el borde de pantalla, no en la tabla. */
export function DataWorkspaceTableEmptyMascot() {
  return (
    <div
      aria-hidden
      className="rootsy-hero-slide-in-right pointer-events-none fixed right-0 z-30 translate-x-[20%] translate-y-[8%]"
      style={{ bottom: "var(--dw-table-footer-height, 4rem)" }}
    >
      <Image
        src="/empty-products-mascot.png"
        alt=""
        width={280}
        height={280}
        className="h-auto w-[min(280px,42vw)] max-w-[280px] object-contain object-right-bottom opacity-95"
      />
    </div>
  )
}

export function DataWorkspaceTableMoney({
  children,
  muted,
  className,
}: {
  children: ReactNode
  muted?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        muted ? tdMoneyMutedClass : tdMoneyClass,
        className,
      )}
    >
      {children}
    </span>
  )
}

export function DataWorkspaceTableThumbnail({
  src,
  alt,
  size = "md",
  className,
}: {
  src: string | null | undefined
  alt: string
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const box =
    size === "sm"
      ? "size-9"
      : size === "lg"
        ? "size-20"
        : "size-10"
  const trimmed = typeof src === "string" ? src.trim() : ""
  if (trimmed) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-lg border border-border/80 bg-muted",
          box,
          className,
        )}
      >
        <img
          src={trimmed}
          alt={alt}
          className="size-full object-cover"
          loading="lazy"
        />
      </div>
    )
  }
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/50 text-muted-foreground",
        box,
        className,
      )}
      aria-hidden
    >
      <Package
        className={cn(
          "opacity-45",
          size === "lg" ? "size-5" : "size-[1.125rem]",
        )}
      />
    </div>
  )
}

export function DataWorkspaceTableIconAction({
  label,
  onClick,
  icon: Icon,
  destructive,
  variant,
  disabled,
}: {
  label: string
  onClick: () => void
  icon: LucideIcon
  /** @deprecated Preferí `variant="destructive"`. */
  destructive?: boolean
  /** neutral = ver/abrir; edit = modificar; destructive = eliminar. */
  variant?: "neutral" | "edit" | "destructive"
  disabled?: boolean
}) {
  const resolvedVariant = destructive
    ? "destructive"
    : (variant ?? "edit")

  return (
    <button
      type="button"
      disabled={disabled}
      className={rootsIconButtonActionClass({
        intent: resolvedVariant,
        size: "compact",
      })}
      aria-label={label}
      onClick={onClick}
    >
      <Icon className="size-4" />
    </button>
  )
}
