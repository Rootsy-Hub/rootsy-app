"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { tdMoneyClass, tdMoneyMutedClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import { Package } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

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
  size?: "sm" | "md"
  className?: string
}) {
  const box =
    size === "sm"
      ? "size-9"
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
      <Package className="size-[1.125rem] opacity-45" />
    </div>
  )
}

export function DataWorkspaceTableIconAction({
  label,
  onClick,
  icon: Icon,
  destructive,
  disabled,
}: {
  label: string
  onClick: () => void
  icon: LucideIcon
  destructive?: boolean
  disabled?: boolean
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={disabled}
      className={cn(
        "size-8 shrink-0",
        destructive
          ? "text-muted-foreground hover:text-destructive"
          : "text-muted-foreground hover:text-foreground",
      )}
      aria-label={label}
      onClick={onClick}
    >
      <Icon className="size-4" />
    </Button>
  )
}
