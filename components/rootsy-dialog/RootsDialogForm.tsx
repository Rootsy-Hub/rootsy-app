"use client"

import { cn } from "@/lib/utils"
import type { ComponentProps, FormEventHandler, ReactNode } from "react"

type Props = {
  onSubmit: FormEventHandler<HTMLFormElement>
  children: ReactNode
  className?: string
}

export function RootsDialogForm({ onSubmit, children, className }: Props) {
  return (
    <form
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden",
        className,
      )}
      onSubmit={onSubmit}
    >
      {children}
    </form>
  )
}

type BannerProps = ComponentProps<"p">

export function RootsDialogErrorBanner({ className, ...props }: BannerProps) {
  return (
    <p
      role="alert"
      className={cn(
        "mb-4 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive",
        className,
      )}
      {...props}
    />
  )
}

export function RootsDialogLoadingState({
  message = "Cargando…",
  className,
}: {
  message?: string
  className?: string
}) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {message}
    </p>
  )
}
