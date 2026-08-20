"use client"

import {
  dataWorkspaceDetailCardClass,
  dataWorkspaceDetailCardHeaderClass,
  dataWorkspaceDetailCardStatsClass,
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardIsotypeClass,
  dataWorkspaceEntityCardStatLabelClass,
  dataWorkspaceEntityCardStatValueLargeClass,
  dataWorkspaceEntityCardStatusClosedClass,
  dataWorkspaceEntityCardStatusOpenClass,
  dataWorkspaceEntityCardTitleClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  RootsDefaultButton,
  RootsIconButton,
  RootsPrimaryButton,
} from "@/components/rootsy-button"
import { cn } from "@/lib/utils"
import type { CurrentAccountDirection } from "@/lib/currentAccounts"
import { ArrowLeft, Banknote, CreditCard, Link2 } from "lucide-react"

const moneyFmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

const vencidoStatusClass =
  "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--color-status-danger)_25%,var(--rootsy-bruma-200))] bg-[color-mix(in_srgb,var(--color-status-danger)_8%,white)] px-2.5 py-1 font-canopy text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-status-danger)]"

function formatMoney(value: number) {
  return moneyFmt.format(value)
}

function currentAccountEntityEyebrow(direction: CurrentAccountDirection) {
  return direction === "payable"
    ? "Cuenta corriente · Proveedor"
    : "Cuenta corriente · Cliente"
}

function HeaderKpiStat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="min-w-[8.5rem]">
      <p className={dataWorkspaceEntityCardStatLabelClass}>{label}</p>
      <p className={cn("mt-1.5", dataWorkspaceEntityCardStatValueLargeClass)}>
        {value}
      </p>
    </div>
  )
}

function AccountStatusPill({
  overdueAmount,
  openCount,
  balance,
}: {
  overdueAmount: number
  openCount: number
  balance: number
}) {
  if (overdueAmount > 0.009) {
    return (
      <span className={vencidoStatusClass}>
        <span
          className="size-1.5 rounded-full bg-[var(--color-status-danger)]"
          aria-hidden
        />
        Vencida
      </span>
    )
  }

  if (openCount > 0) {
    return (
      <span className={dataWorkspaceEntityCardStatusOpenClass}>
        <span
          className="size-1.5 rounded-full bg-[var(--rootsy-savia-600)]"
          aria-hidden
        />
        Al día
      </span>
    )
  }

  if (Math.abs(balance) > 0.009) {
    return (
      <span className={dataWorkspaceEntityCardStatusClosedClass}>
        Con saldo
      </span>
    )
  }

  return (
    <span className={dataWorkspaceEntityCardStatusClosedClass}>Saldada</span>
  )
}

type Props = {
  partyName: string
  direction: CurrentAccountDirection
  listBackHref: string
  balance: number
  openCount: number
  overdueAmount: number
  unappliedCredit: number
  canCreate: boolean
  enrolled: boolean
  enrollmentBusy?: boolean
  creditLimit: number | null
  availableCredit: number | null
  termDays: number
  onSettle: () => void
  onApply: () => void
  onToggleEnrollment: () => void
  onEditTerms: () => void
}

export function CurrentAccountDetailHeaderCard({
  partyName,
  direction,
  listBackHref,
  balance,
  openCount,
  overdueAmount,
  unappliedCredit,
  canCreate,
  enrolled,
  enrollmentBusy = false,
  creditLimit,
  availableCredit,
  termDays,
  onSettle,
  onApply,
  onToggleEnrollment,
  onEditTerms,
}: Props) {
  const settleLabel = direction === "payable" ? "Pagar" : "Cobrar"
  const showApply = canCreate && unappliedCredit > 0.009
  const showUnapplied = unappliedCredit > 0.009
  const showLimit = enrolled && creditLimit != null
  const statsCols =
    showUnapplied && showLimit
      ? "sm:grid-cols-5"
      : showUnapplied || showLimit
        ? "sm:grid-cols-4"
        : "sm:grid-cols-3"

  return (
    <article className={dataWorkspaceDetailCardClass}>
      <div className={dataWorkspaceDetailCardHeaderClass}>
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <RootsIconButton
            theme="workspace"
            emphasis="ghost"
            size="default"
            label="Volver a cuentas corrientes"
            href={listBackHref}
            className="shrink-0"
          >
            <ArrowLeft aria-hidden />
          </RootsIconButton>

          <span className={dataWorkspaceEntityCardIsotypeClass} aria-hidden>
            <CreditCard className="size-5" strokeWidth={1.75} />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className={cn(dataWorkspaceEntityCardEyebrowClass, "truncate")}>
                  {currentAccountEntityEyebrow(direction)}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  <h2
                    className={cn(
                      dataWorkspaceEntityCardTitleClass,
                      "truncate text-lg sm:text-xl",
                    )}
                  >
                    {partyName || "Cuenta corriente"}
                  </h2>
                  <AccountStatusPill
                    overdueAmount={overdueAmount}
                    openCount={openCount}
                    balance={balance}
                  />
                  {!enrolled ? (
                    <span className={dataWorkspaceEntityCardStatusClosedClass}>
                      Sin alta
                    </span>
                  ) : (
                    <span className={dataWorkspaceEntityCardStatusClosedClass}>
                      {showLimit
                        ? `${formatMoney(creditLimit ?? 0)} · ${termDays} días`
                        : `Sin tope · ${termDays} días`}
                    </span>
                  )}
                </div>
              </div>

              {canCreate ? (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {enrolled ? (
                    <RootsDefaultButton
                      type="button"
                      disabled={enrollmentBusy}
                      onClick={onEditTerms}
                    >
                      Condiciones
                    </RootsDefaultButton>
                  ) : null}
                  <RootsDefaultButton
                    type="button"
                    disabled={enrollmentBusy}
                    onClick={onToggleEnrollment}
                  >
                    {enrolled ? "Deshabilitar" : "Dar de alta"}
                  </RootsDefaultButton>
                  {showApply ? (
                    <RootsDefaultButton
                      type="button"
                      withIcon
                      onClick={onApply}
                    >
                      <Link2 className="size-4" aria-hidden />
                      Imputar
                    </RootsDefaultButton>
                  ) : null}
                  <RootsPrimaryButton
                    type="button"
                    withIcon
                    onClick={onSettle}
                  >
                    <Banknote className="size-4" aria-hidden />
                    {settleLabel}
                  </RootsPrimaryButton>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(dataWorkspaceDetailCardStatsClass, statsCols)}
      >
        <HeaderKpiStat label="Saldo" value={formatMoney(balance)} />
        <HeaderKpiStat
          label="Abiertos"
          value={openCount.toLocaleString("es-AR")}
        />
        <HeaderKpiStat label="Vencido" value={formatMoney(overdueAmount)} />
        {showUnapplied ? (
          <HeaderKpiStat label="A cuenta" value={formatMoney(unappliedCredit)} />
        ) : null}
        {showLimit ? (
          <HeaderKpiStat
            label="Disponible"
            value={formatMoney(availableCredit ?? 0)}
          />
        ) : null}
      </div>
    </article>
  )
}
