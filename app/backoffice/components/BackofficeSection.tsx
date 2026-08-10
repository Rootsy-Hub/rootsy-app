"use client"

import { FoundationSpecCard } from "@/app/library/libraryFoundationDocShared"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type BackofficeSectionProps = {
  title: string
  loading: boolean
  error: string | null
  children: ReactNode
}

export function BackofficeSection({
  title,
  loading,
  error,
  children,
}: BackofficeSectionProps) {
  return (
    <section className="space-y-6">
      <h1 className="font-canopy text-2xl font-semibold tracking-tight text-[var(--rootsy-bruma-900)] sm:text-3xl">
        {title}
      </h1>

      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {loading ? (
        <FoundationSpecCard>
          <div
            className="flex min-h-40 flex-col items-center justify-center gap-3 text-[var(--rootsy-bruma-500)]"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <Spinner className="size-8" />
            <span className="text-sm">Cargando…</span>
          </div>
        </FoundationSpecCard>
      ) : (
        children
      )}
    </section>
  )
}

export function BackofficePanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <FoundationSpecCard className={cn("overflow-hidden p-0", className)}>
      {children}
    </FoundationSpecCard>
  )
}

export function BackofficeEmptyState({ message }: { message: string }) {
  return (
    <FoundationSpecCard>
      <p className="px-2 py-8 text-center text-sm text-[var(--rootsy-bruma-600)]">
        {message}
      </p>
    </FoundationSpecCard>
  )
}

export function formatBackofficeMoney(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatBackofficeDate(value: string): string {
  if (!value.trim()) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

export function BackofficeStatusBadge({
  active,
  activeLabel = "Activo",
  inactiveLabel = "Inactivo",
}: {
  active: boolean
  activeLabel?: string
  inactiveLabel?: string
}) {
  return (
    <span
      className={
        active
          ? "inline-flex rounded-full bg-[color-mix(in_srgb,var(--rootsy-savia-500)_14%,transparent)] px-2 py-0.5 text-xs font-semibold text-[var(--rootsy-savia-600)]"
          : "inline-flex rounded-full bg-[var(--rootsy-bruma-200)] px-2 py-0.5 text-xs font-semibold text-[var(--rootsy-bruma-600)]"
      }
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  )
}
