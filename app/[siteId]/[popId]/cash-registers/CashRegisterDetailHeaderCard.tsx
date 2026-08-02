"use client"

import type { CashRegisterSummarySession } from "@/app/[siteId]/[popId]/cash-registers/actions"
import {
  formatArqueoDifferenceDisplay,
  formatCashRegisterMoney,
} from "@/app/[siteId]/[popId]/cash-registers/cashRegisterFormatters"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowLeft, Calculator, History } from "lucide-react"
import Link from "next/link"

const eyebrowClass =
  "text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground"

function SessionStatusPill({ isOpen }: { isOpen: boolean }) {
  if (isOpen) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200/90 bg-emerald-50/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-emerald-800">
        <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
        Turno abierto
      </span>
    )
  }

  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-border/70 bg-muted/30 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
      Arqueo cerrado
    </span>
  )
}

function RegisterStatusPill({
  isOpen,
  isActive,
}: {
  isOpen: boolean
  isActive: boolean
}) {
  if (!isActive) {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full border border-border/70 bg-muted/30 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        Inactiva
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em]",
        isOpen
          ? "border-emerald-200/90 bg-emerald-50/80 text-emerald-800"
          : "border-border/70 bg-background text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          isOpen ? "bg-emerald-500" : "bg-muted-foreground/35",
        )}
        aria-hidden
      />
      {isOpen ? "Abierta" : "Cerrada"}
    </span>
  )
}

function HeaderKpiStat({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: string
  tone?: "default" | "positive" | "negative" | "neutral" | "muted"
}) {
  return (
    <div className="min-w-[8.5rem]">
      <p className={eyebrowClass}>{label}</p>
      <p
        className={cn(
          "mt-1.5 font-mono text-2xl font-bold tabular-nums tracking-tight",
          tone === "positive" && "text-emerald-700",
          tone === "negative" && "text-destructive",
          tone === "neutral" && "text-muted-foreground",
          tone === "muted" && "text-muted-foreground",
          tone === "default" && "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  )
}

type Props = {
  registerName: string
  isRegisterOpen: boolean
  isRegisterActive: boolean
  cashRegistersBasePath: string
  activeSession: CashRegisterSummarySession | null
  showHistorialAction?: boolean
  onShowHistory?: () => void
  onBack?: () => void
}

export function CashRegisterDetailHeaderCard({
  registerName,
  isRegisterOpen,
  isRegisterActive,
  cashRegistersBasePath,
  activeSession,
  showHistorialAction = false,
  onShowHistory,
  onBack,
}: Props) {
  const viewingArqueo = activeSession != null
  const showBack = Boolean(onBack) && !showHistorialAction
  const sessionIsOpen = activeSession?.status === "open"
  const efectivoEnCaja =
    activeSession == null
      ? null
      : sessionIsOpen
        ? activeSession.efectivoTeorico
        : (activeSession.closingSnapshot?.cash ?? activeSession.efectivoTeorico)
  const differenceDisplay = formatArqueoDifferenceDisplay(
    sessionIsOpen ? null : (activeSession?.cashArqueoDifference ?? null),
  )

  return (
    <article className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <Button
            asChild
            variant="ghost-neutral"
            size="icon"
            className="size-9 shrink-0"
          >
            <Link href={cashRegistersBasePath} aria-label="Volver a cajas">
              <ArrowLeft className="size-5" aria-hidden />
            </Link>
          </Button>

          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background text-muted-foreground shadow-xs"
            aria-hidden
          >
            <Calculator className="size-5" strokeWidth={1.75} />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className={eyebrowClass}>Caja registradora</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  <h2 className="truncate text-lg font-semibold text-foreground sm:text-xl">
                    {registerName}
                  </h2>
                  {viewingArqueo ? (
                    <>
                      <span className="hidden text-muted-foreground/60 sm:inline">
                        ·
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">
                        Arqueo #{activeSession.arqueoNumber || "—"}
                      </span>
                      <SessionStatusPill
                        isOpen={activeSession.status === "open"}
                      />
                    </>
                  ) : (
                    <RegisterStatusPill
                      isOpen={isRegisterOpen}
                      isActive={isRegisterActive}
                    />
                  )}
                </div>
              </div>

              {viewingArqueo && (showHistorialAction || showBack) ? (
                <div className="flex shrink-0 items-center gap-2">
                  {showBack ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-border/80 bg-background font-medium shadow-sm"
                      onClick={onBack}
                    >
                      <ArrowLeft className="size-3.5" aria-hidden />
                      Volver al historial
                    </Button>
                  ) : null}
                  {showHistorialAction && onShowHistory ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-border/80 bg-background font-medium shadow-sm"
                      onClick={onShowHistory}
                    >
                      <History className="size-3.5" aria-hidden />
                      Historial de arqueos
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {viewingArqueo && activeSession ? (
        <div className="grid gap-4 border-t border-border/60 bg-muted/20 px-4 py-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          <HeaderKpiStat
            label="Total cobrado"
            value={formatCashRegisterMoney(activeSession.totalCobrado)}
          />
          <HeaderKpiStat
            label="Efectivo en caja"
            value={formatCashRegisterMoney(efectivoEnCaja ?? 0)}
          />
          <HeaderKpiStat
            label="Diferencia"
            value={differenceDisplay.text}
            tone={differenceDisplay.tone}
          />
        </div>
      ) : null}
    </article>
  )
}
