"use client"

import {
  libraryContentEyebrowClass,
  libraryPageHeaderClass,
} from "@/app/[siteId]/[popId]/library/libraryColorTheme"
import { FoundationSpecCard } from "@/app/[siteId]/[popId]/library/libraryFoundationDocShared"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { RefreshCw } from "lucide-react"
import type { ReactNode } from "react"

type BackofficeSectionProps = {
  title: string
  description?: string
  eyebrow?: string
  loading: boolean
  error: string | null
  onRefresh: () => void
  children: ReactNode
}

export function BackofficeSection({
  title,
  description,
  eyebrow = "Backoffice",
  loading,
  error,
  onRefresh,
  children,
}: BackofficeSectionProps) {
  return (
    <section className="space-y-8">
      <header
        className={cn(
          "flex flex-wrap items-start justify-between gap-4 rounded-2xl border p-6 sm:p-8",
          libraryPageHeaderClass,
        )}
      >
        <div className="min-w-0 space-y-2">
          <p className={libraryContentEyebrowClass}>{eyebrow}</p>
          <h1 className="font-canopy text-2xl font-semibold tracking-tight text-[var(--rootsy-bruma-900)] sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--rootsy-bruma-600)]">
              {description}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 border-[var(--rootsy-bruma-200)] bg-white"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw
            className={loading ? "size-4 animate-spin" : "size-4"}
            aria-hidden
          />
          Actualizar
        </Button>
      </header>

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
