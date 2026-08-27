"use client"

import {
  workspaceTableLayoutThumbnailClass,
  workspaceTableLayoutThumbnailInteractiveClass,
  workspaceTableLayoutThumbnailLgClass,
  workspaceTableLayoutThumbnailPlaceholderClass,
  workspaceTableLayoutThumbnailSmClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { RootsImageLightbox } from "@/components/rootsy-lightbox/RootsImageLightbox"
import {
  tdMoneyClass,
  tdMoneyMutedClass,
  workspaceTableFrameSelectableScopeClass,
  workspaceTableNatureStatusBadgeClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { RootsIconButton } from "@/components/rootsy-button"
import type { RootsIconButtonActionIntent } from "@/components/rootsy-button/rootsButtonStyles"
import { cn } from "@/lib/utils"
import { ImagePlus } from "lucide-react"
import Image from "next/image"
import type { LucideIcon } from "lucide-react"
import { useState } from "react"
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
        "relative inline-flex min-h-full min-w-full flex-col",
        "bg-[var(--wt-surface-stripe)]",
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

export function WorkspaceTableStatusBadge({
  status,
  children,
  className,
}: {
  status: keyof typeof workspaceTableNatureStatusBadgeClass
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded px-1.5 py-px text-[10px] font-semibold leading-4",
        workspaceTableNatureStatusBadgeClass[status],
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
  preview = true,
}: {
  src: string | null | undefined
  alt: string
  size?: "sm" | "md" | "lg"
  className?: string
  preview?: boolean
}) {
  const [open, setOpen] = useState(false)
  const box =
    size === "lg"
      ? workspaceTableLayoutThumbnailLgClass
      : workspaceTableLayoutThumbnailSmClass
  const trimmed = typeof src === "string" ? src.trim() : ""
  if (trimmed) {
    const tile = (
      <div className={cn(workspaceTableLayoutThumbnailClass, box, className)}>
        <img
          src={trimmed}
          alt={alt}
          className="size-full object-cover"
          loading="lazy"
        />
      </div>
    )
    if (!preview) return tile
    return (
      <>
        <button
          type="button"
          className={workspaceTableLayoutThumbnailInteractiveClass}
          onClick={() => setOpen(true)}
          aria-label={`Ver imagen de ${alt}`}
        >
          {tile}
        </button>
        <RootsImageLightbox
          open={open}
          onOpenChange={setOpen}
          src={trimmed}
          title={alt}
          frameClassName="rounded-lg bg-[var(--color-superficie)]"
          imageClassName="object-contain"
        />
      </>
    )
  }
  return (
    <div
      className={cn(workspaceTableLayoutThumbnailPlaceholderClass, box, className)}
      aria-hidden
    >
      <ImagePlus
        className={cn(size === "lg" ? "size-5" : "size-3.5")}
        strokeWidth={1.75}
      />
    </div>
  )
}

/** Acciones de fila (ver / editar / eliminar). Reposo bruma; hover según intent. */
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
  variant?: RootsIconButtonActionIntent
  disabled?: boolean
}) {
  const intent: RootsIconButtonActionIntent = destructive
    ? "destructive"
    : (variant ?? "edit")

  return (
    <RootsIconButton
      type="button"
      label={label}
      tone="action"
      intent={intent}
      size="compact"
      disabled={disabled}
      onClick={onClick}
    >
      <Icon />
    </RootsIconButton>
  )
}
