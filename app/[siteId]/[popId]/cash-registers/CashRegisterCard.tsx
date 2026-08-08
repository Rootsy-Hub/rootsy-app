"use client"

import type { CashRegisterRow } from "@/app/[siteId]/[popId]/cash-registers/actions"
import {
  dataWorkspaceLightDropdownContentClass,
  dataWorkspaceLightDropdownSeparatorClass,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import {
  RootsDropdownContent,
  RootsDropdownItem,
  RootsDropdownMenu,
  RootsDropdownSeparator,
  RootsDropdownTrigger,
} from "@/components/rootsy-dropdown"
import {
  dataWorkspaceEntityCardActionFooterClass,
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardHeaderClass,
  dataWorkspaceEntityCardIsotypeClass,
  dataWorkspaceEntityCardLosetaClass,
  dataWorkspaceEntityCardMenuTriggerClass,
  dataWorkspaceEntityCardSaldoSectionClass,
  dataWorkspaceEntityCardStatLabelClass,
  dataWorkspaceEntityCardStatValueClass,
  dataWorkspaceEntityCardStatValueLargeClass,
  dataWorkspaceEntityCardStatusClosedClass,
  dataWorkspaceEntityCardStatusInactiveClass,
  dataWorkspaceEntityCardStatusOpenClass,
  dataWorkspaceEntityCardTitleClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { RootsDefaultButton, rootsButtonCompactSizeClass } from "@/components/rootsy-button"
import { cn } from "@/lib/utils"
import {
  Calculator,
  DoorClosed,
  DoorOpen,
  MinusCircle,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { formatLocaleDateTime } from "@/lib/popTimezone"
import Link from "next/link"
import { cashRegisterEntityEyebrowLabel } from "@/app/[siteId]/[popId]/cash-registers/cashRegisterFormatters"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

function moneyOrDash(amount: number | null | undefined): string {
  if (amount == null) return "—"
  return fmt.format(amount)
}

function formatOpenedAt(iso: string | null): string | null {
  if (!iso) return null
  const formatted = formatLocaleDateTime(iso)
  return formatted === "—" ? null : formatted
}

function CashRegisterStatusPill({
  isOpen,
  isActive,
  className,
}: {
  isOpen: boolean
  isActive: boolean
  className?: string
}) {
  if (!isActive) {
    return (
      <span className={cn(dataWorkspaceEntityCardStatusInactiveClass, className)}>
        Inactiva
      </span>
    )
  }

  return (
    <span
      className={cn(
        isOpen ? dataWorkspaceEntityCardStatusOpenClass : dataWorkspaceEntityCardStatusClosedClass,
        className,
      )}
    >
      {isOpen ? (
        <span
          className="size-1.5 rounded-full bg-[var(--rootsy-savia-600)]"
          aria-hidden
        />
      ) : null}
      {isOpen ? "Abierta" : "Cerrada"}
    </span>
  )
}

function CashRegisterCardMenuTrigger({
  label,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  label: string
}) {
  return (
    <button
      type="button"
      className={cn(dataWorkspaceEntityCardMenuTriggerClass, className)}
      aria-label={label}
      {...props}
    >
      <MoreVertical className="size-4" aria-hidden />
    </button>
  )
}

type Props = {
  row: CashRegisterRow
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  detailHref: string
  onEdit: () => void
  onDelete: () => void
  onOpen: () => void
  onClose: () => void
  onDeposit: () => void
  onWithdraw: () => void
}

export function CashRegisterCard({
  row,
  canCreate,
  canUpdate,
  canDelete,
  detailHref,
  onEdit,
  onDelete,
  onOpen,
  onClose,
  onDeposit,
  onWithdraw,
}: Props) {
  const isOpen = Boolean(row.openSessionId)
  const totals = row.openSessionTotals
  const openedLabel = formatOpenedAt(row.openedAt)
  const efectivoEnCajon =
    totals?.efectivoTeoricoEnCajon ?? row.cashBalance ?? null
  const totalTurno = totals?.totalCobradoTurno ?? null

  type MenuItem = {
    id: string
    label: string
    icon: typeof DoorClosed
    onSelect: () => void
    destructive?: boolean
  }

  const sessionActions: MenuItem[] = []
  const adminActions: MenuItem[] = []

  if (isOpen && row.canCloseOpenSession) {
    sessionActions.push({
      id: "close",
      label: "Cerrar caja",
      icon: DoorClosed,
      onSelect: onClose,
    })
  }
  if (isOpen && canCreate) {
    sessionActions.push(
      {
        id: "deposit",
        label: "Ingreso al cajón",
        icon: Plus,
        onSelect: onDeposit,
      },
      {
        id: "withdraw",
        label: "Retiro del cajón",
        icon: MinusCircle,
        onSelect: onWithdraw,
      },
    )
  }

  if (canUpdate) {
    adminActions.push({
      id: "edit",
      label: "Editar caja",
      icon: Pencil,
      onSelect: onEdit,
    })
  }
  if (canDelete) {
    adminActions.push({
      id: "delete",
      label: "Eliminar caja",
      icon: Trash2,
      onSelect: onDelete,
      destructive: true,
    })
  }

  const menuSections = [
    sessionActions.length > 0 ? sessionActions : null,
    adminActions.length > 0 ? adminActions : null,
  ].filter((section): section is MenuItem[] => section != null)

  const showCloseAction = isOpen && row.canCloseOpenSession

  return (
    <article className={dataWorkspaceEntityCardLosetaClass}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className={cn(dataWorkspaceEntityCardHeaderClass, "pr-4")}>
          <div className="flex min-w-0 items-start gap-3">
            <span className={dataWorkspaceEntityCardIsotypeClass} aria-hidden>
              <Calculator className="size-5" strokeWidth={1.75} />
            </span>
            <div className="relative min-w-0 flex-1">
              <CashRegisterStatusPill
                isOpen={isOpen}
                isActive={row.isActive}
                className="absolute right-0 top-0"
              />
              <p
                className={cn(
                  dataWorkspaceEntityCardEyebrowClass,
                  "truncate pr-24",
                )}
              >
                {cashRegisterEntityEyebrowLabel}
              </p>
              <h3 className={cn("mt-0.5 truncate pr-24", dataWorkspaceEntityCardTitleClass)}>
                {row.name}
              </h3>
              {isOpen && openedLabel ? (
                <p className="mt-0.5 truncate font-canopy text-xs text-[var(--rootsy-bruma-500)]">
                  Desde {openedLabel}
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-transparent" aria-hidden>
                  &nbsp;
                </p>
              )}
            </div>
            {menuSections.length > 0 ? (
              <div
                className="-mr-1 shrink-0"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
              >
                <RootsDropdownMenu modal={false}>
                  <RootsDropdownTrigger asChild>
                    <CashRegisterCardMenuTrigger
                      label={`Opciones de ${row.name}`}
                    />
                  </RootsDropdownTrigger>
                  <RootsDropdownContent
                    theme="light"
                    align="end"
                    side="bottom"
                    sideOffset={8}
                    collisionPadding={{ right: 16 }}
                    className={cn(dataWorkspaceLightDropdownContentClass, "z-[120]")}
                  >
                    {menuSections.map((section, sectionIndex) => (
                      <div key={section[0]?.id ?? sectionIndex}>
                        {sectionIndex > 0 ? (
                          <RootsDropdownSeparator
                            theme="light"
                            className={dataWorkspaceLightDropdownSeparatorClass}
                          />
                        ) : null}
                        {section.map((action) => {
                          const Icon = action.icon
                          return (
                            <RootsDropdownItem
                              key={action.id}
                              theme="light"
                              variant={action.destructive ? "destructive" : "default"}
                              onSelect={action.onSelect}
                            >
                              <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
                              <span className="min-w-0 flex-1 truncate">
                                {action.label}
                              </span>
                            </RootsDropdownItem>
                          )
                        })}
                      </div>
                    ))}
                  </RootsDropdownContent>
                </RootsDropdownMenu>
              </div>
            ) : null}
          </div>
        </div>

        <Link
          href={detailHref}
          className={cn(
            "text-left outline-none",
            "focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-600)_35%,transparent)] focus-visible:ring-offset-2",
          )}
        >
          <div className={dataWorkspaceEntityCardSaldoSectionClass}>
            <p className={dataWorkspaceEntityCardStatLabelClass}>Cobrado en el turno</p>
            <p className={cn("mt-1.5", dataWorkspaceEntityCardStatValueLargeClass)}>
              {moneyOrDash(isOpen ? totalTurno : null)}
            </p>
          </div>
        </Link>

        <div className="mt-auto">
          {!row.isActive ? (
            <div className={dataWorkspaceEntityCardActionFooterClass}>
              <p className="font-canopy text-xs leading-snug text-[var(--rootsy-bruma-500)]">
                Caja desactivada
              </p>
            </div>
          ) : isOpen ? (
            <div className={dataWorkspaceEntityCardActionFooterClass}>
              <div className="min-w-0">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Efectivo en caja</p>
                <p className={cn("mt-1 text-base sm:text-lg", dataWorkspaceEntityCardStatValueClass)}>
                  {moneyOrDash(efectivoEnCajon)}
                </p>
              </div>
              {showCloseAction ? (
                <RootsDefaultButton
                  type="button"
                  size="sm"
                  className={cn(rootsButtonCompactSizeClass, "shrink-0 px-3 text-xs")}
                  onClick={onClose}
                >
                  Cerrar
                </RootsDefaultButton>
              ) : null}
            </div>
          ) : (
            <div className={dataWorkspaceEntityCardActionFooterClass}>
              <div className="min-w-0">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Efectivo en caja</p>
                <p className={cn("mt-1 text-base sm:text-lg", dataWorkspaceEntityCardStatValueClass)}>
                  —
                </p>
              </div>
              {canCreate ? (
                <RootsDefaultButton
                  type="button"
                  size="sm"
                  className={cn(rootsButtonCompactSizeClass, "shrink-0 gap-1.5 px-3 text-xs")}
                  onClick={onOpen}
                >
                  <DoorOpen className="size-3.5" aria-hidden />
                  Abrir turno
                </RootsDefaultButton>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
