"use client"

import { saleOpChannelErrorBanner } from "@/components/sale-operation/saleOperationStyles"
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
      className={cn(saleOpChannelErrorBanner, "mb-4", className)}
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
