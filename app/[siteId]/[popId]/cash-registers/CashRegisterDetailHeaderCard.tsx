"use client"

import type { CashRegisterSummarySession } from "@/app/[siteId]/[popId]/cash-registers/actions"
import {
  arqueoDifferenceToneClass,
  cashRegisterEntityEyebrowLabel,
  formatArqueoDifferenceDisplay,
  formatCashRegisterMoney,
} from "@/app/[siteId]/[popId]/cash-registers/cashRegisterFormatters"
import {
  dataWorkspaceDetailCardClass,
  dataWorkspaceDetailCardHeaderClass,
  dataWorkspaceDetailCardStatsClass,
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardIsotypeClass,
  dataWorkspaceEntityCardStatLabelClass,
  dataWorkspaceEntityCardStatValueLargeClass,
  dataWorkspaceEntityCardStatusClosedClass,
  dataWorkspaceEntityCardStatusInactiveClass,
  dataWorkspaceEntityCardStatusOpenClass,
  dataWorkspaceEntityCardTitleClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { RootsDefaultButton, RootsIconButton, rootsButtonCompactSizeClass } from "@/components/rootsy-button"
import { cn } from "@/lib/utils"
import { ArrowLeft, Calculator, History } from "lucide-react"

function SessionStatusPill({ isOpen }: { isOpen: boolean }) {
  if (isOpen) {
    return (
      <span className={dataWorkspaceEntityCardStatusOpenClass}>
        <span
          className="size-1.5 rounded-full bg-[var(--rootsy-savia-600)]"
          aria-hidden
        />
        Turno abierto
      </span>
    )
  }

  return (
    <span className={dataWorkspaceEntityCardStatusClosedClass}>
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
      <span className={dataWorkspaceEntityCardStatusInactiveClass}>
        Inactiva
      </span>
    )
  }

  if (isOpen) {
    return (
      <span className={dataWorkspaceEntityCardStatusOpenClass}>
        <span
          className="size-1.5 rounded-full bg-[var(--rootsy-savia-600)]"
          aria-hidden
        />
        Abierta
      </span>
    )
  }

  return (
    <span className={dataWorkspaceEntityCardStatusClosedClass}>Cerrada</span>
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
  const differenceTone =
    tone === "positive" || tone === "negative" || tone === "neutral" || tone === "muted"
      ? tone
      : null

  return (
    <div className="min-w-[8.5rem]">
      <p className={dataWorkspaceEntityCardStatLabelClass}>{label}</p>
      <p
        className={cn(
          "mt-1.5",
          tone === "default"
            ? dataWorkspaceEntityCardStatValueLargeClass
            : cn(
                dataWorkspaceEntityCardStatValueLargeClass,
                differenceTone && arqueoDifferenceToneClass(differenceTone),
              ),
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
    <article className={dataWorkspaceDetailCardClass}>
      <div className={dataWorkspaceDetailCardHeaderClass}>
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <RootsIconButton
            theme="workspace"
            emphasis="ghost"
            size="default"
            label="Volver a cajas"
            href={cashRegistersBasePath}
            className="shrink-0"
          >
            <ArrowLeft aria-hidden />
          </RootsIconButton>

          <span className={dataWorkspaceEntityCardIsotypeClass} aria-hidden>
            <Calculator className="size-5" strokeWidth={1.75} />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className={cn(dataWorkspaceEntityCardEyebrowClass, "truncate")}>
                  {cashRegisterEntityEyebrowLabel}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  <h2 className={cn(dataWorkspaceEntityCardTitleClass, "truncate text-lg sm:text-xl")}>
                    {registerName}
                  </h2>
                  {viewingArqueo ? (
                    <>
                      <span className="hidden text-[var(--rootsy-bruma-400)] sm:inline">
                        ·
                      </span>
                      <span className="font-canopy text-sm font-medium text-[var(--rootsy-bruma-500)]">
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
                    <RootsDefaultButton
                      type="button"
                      className={cn(rootsButtonCompactSizeClass, "gap-1.5 px-3 text-xs")}
                      onClick={onBack}
                    >
                      <ArrowLeft className="size-3.5" aria-hidden />
                      Volver al historial
                    </RootsDefaultButton>
                  ) : null}
                  {showHistorialAction && onShowHistory ? (
                    <RootsDefaultButton
                      type="button"
                      className={cn(rootsButtonCompactSizeClass, "gap-1.5 px-3 text-xs")}
                      onClick={onShowHistory}
                    >
                      <History className="size-3.5" aria-hidden />
                      Historial de arqueos
                    </RootsDefaultButton>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {viewingArqueo && activeSession ? (
        <div className={cn(dataWorkspaceDetailCardStatsClass, "sm:grid-cols-3")}>
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
