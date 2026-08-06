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
  dataWorkspaceEntityCardBodyClass,
  dataWorkspaceEntityCardClass,
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardFooterClass,
  dataWorkspaceEntityCardHeaderClass,
  dataWorkspaceEntityCardIsotypeClass,
  dataWorkspaceEntityCardMenuTriggerClass,
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

function CashRegisterPrimaryStat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className={dataWorkspaceEntityCardStatLabelClass}>{label}</p>
      <p className={cn("mt-1.5", dataWorkspaceEntityCardStatValueLargeClass)}>
        {value}
      </p>
    </div>
  )
}

function CashRegisterSecondaryStat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="min-w-0">
      <p className={dataWorkspaceEntityCardStatLabelClass}>{label}</p>
      <p className={cn("mt-1 truncate text-base sm:text-lg", dataWorkspaceEntityCardStatValueClass)}>
        {value}
      </p>
    </div>
  )
}

function CashRegisterStatusPill({
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

  return (
    <span
      className={
        isOpen
          ? dataWorkspaceEntityCardStatusOpenClass
          : dataWorkspaceEntityCardStatusClosedClass
      }
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

  return (
    <article className={dataWorkspaceEntityCardClass}>
      {menuSections.length > 0 ? (
        <div
          className="absolute right-3 top-3 z-20"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          <RootsDropdownMenu>
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

      <div className="flex h-full min-h-0 flex-1 flex-col">
        <Link
          href={detailHref}
          className="flex min-h-0 flex-1 flex-col text-left"
        >
          <div className={dataWorkspaceEntityCardHeaderClass}>
            <div className="flex items-start gap-3">
              <span className={dataWorkspaceEntityCardIsotypeClass} aria-hidden>
                <Calculator className="size-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={dataWorkspaceEntityCardEyebrowClass}>
                    Caja registradora
                  </p>
                  <CashRegisterStatusPill
                    isOpen={isOpen}
                    isActive={row.isActive}
                  />
                </div>
                <h3 className={cn("mt-1 truncate", dataWorkspaceEntityCardTitleClass)}>
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
            </div>
          </div>

          <div className={dataWorkspaceEntityCardBodyClass}>
            <CashRegisterPrimaryStat
              label="Cobrado en el turno"
              value={moneyOrDash(isOpen ? totalTurno : null)}
            />

            {isOpen ? (
              <div className={cn("mt-auto min-h-[4.75rem] pt-4", dataWorkspaceEntityCardFooterClass)}>
                <CashRegisterSecondaryStat
                  label="Efectivo en caja"
                  value={moneyOrDash(efectivoEnCajon)}
                />
              </div>
            ) : null}
          </div>
        </Link>

        {!isOpen ? (
          <div className={cn("flex min-h-[4.75rem] items-center justify-between gap-3 px-4 py-4", dataWorkspaceEntityCardFooterClass)}>
            <p className="font-canopy text-xs leading-snug text-[var(--rootsy-bruma-500)]">
              {row.isActive ? "Sin turno abierto" : "Caja desactivada"}
            </p>
            {canCreate && row.isActive ? (
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
        ) : null}
      </div>
    </article>
  )
}
