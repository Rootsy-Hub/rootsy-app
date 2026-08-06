"use client"

import { rootsDialogLoadingBodyClass } from "@/components/rootsy-dialog/rootsDialogStyles"
import { RootsBanner } from "@/components/rootsy-banner"
import { RootsSpinner } from "@/components/rootsy-spinner"
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

type BannerProps = Omit<ComponentProps<typeof RootsBanner>, "intent" | "layout" | "message">

export function RootsDialogErrorBanner({ className, children, ...props }: BannerProps) {
  return (
    <RootsBanner
      intent="danger"
      layout="message"
      className={cn("mb-4", className)}
      message={children}
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
      <RootsSpinner size="default" />
      <span className="sr-only">{message ?? "Cargando"}</span>
    </div>
  )
}
