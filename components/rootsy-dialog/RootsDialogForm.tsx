"use client"

import { rootsDialogLoadingBodyClass } from "@/components/rootsy-dialog/rootsDialogStyles"
import { saleOpChannelErrorBanner } from "@/components/sale-operation/saleOperationStyles"
import { Spinner } from "@/components/ui/spinner"
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
  message,
  className,
}: {
  /** Solo lectores de pantalla; no se muestra texto visible. */
  message?: string
  className?: string
}) {
  return (
    <div
      className={cn(rootsDialogLoadingBodyClass, className)}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <Spinner className="size-10 text-[#78716c]" />
      <span className="sr-only">{message ?? "Cargando"}</span>
    </div>
  )
}
