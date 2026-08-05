"use client"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { RefreshCw } from "lucide-react"
import type { ReactNode } from "react"

type BackofficeSectionProps = {
  title: string
  description?: string
  loading: boolean
  error: string | null
  onRefresh: () => void
  children: ReactNode
}

export function BackofficeSection({
  title,
  description,
  loading,
  error,
  onRefresh,
  children,
}: BackofficeSectionProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw
            className={loading ? "size-4 animate-spin" : "size-4"}
            aria-hidden
          />
          Actualizar
        </Button>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div
          className="flex min-h-40 flex-col items-center justify-center gap-3 text-muted-foreground"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <Spinner className="size-8" />
          <span className="text-sm">Cargando…</span>
        </div>
      ) : (
        children
      )}
    </section>
  )
}

export function BackofficeEmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground">
      {message}
    </p>
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
          ? "inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-700"
          : "inline-flex rounded-full bg-zinc-500/15 px-2 py-0.5 text-xs font-semibold text-zinc-600"
      }
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  )
}
