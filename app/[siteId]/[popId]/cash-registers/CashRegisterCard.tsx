"use client"

import type { CashRegisterRow } from "@/app/[siteId]/[popId]/cash-registers/actions"
import {
  dataWorkspaceLightDropdownContentClass,
  dataWorkspaceLightDropdownItemClass,
  dataWorkspaceLightDropdownLogoutItemClass,
  dataWorkspaceLightDropdownSeparatorClass,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d)
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
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 font-mono text-2xl font-bold tabular-nums tracking-tight text-foreground">
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
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 truncate font-mono text-base font-bold tabular-nums tracking-tight text-foreground sm:text-lg">
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
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none",
        "hover:bg-muted/60 hover:text-foreground",
        "data-[state=open]:bg-muted/60 data-[state=open]:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring/30",
        className,
      )}
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
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all",
        "hover:border-border hover:shadow-md",
      )}
    >
      {menuSections.length > 0 ? (
        <div
          className="absolute right-3 top-3 z-20"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <CashRegisterCardMenuTrigger
                label={`Opciones de ${row.name}`}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="bottom"
              sideOffset={8}
              collisionPadding={{ right: 16 }}
              className={cn(dataWorkspaceLightDropdownContentClass, "z-[120]")}
            >
              {menuSections.map((section, sectionIndex) => (
                <div key={section[0]?.id ?? sectionIndex}>
                  {sectionIndex > 0 ? (
                    <DropdownMenuSeparator
                      className={dataWorkspaceLightDropdownSeparatorClass}
                    />
                  ) : null}
                  {section.map((action) => {
                    const Icon = action.icon
                    return (
                      <DropdownMenuItem
                        key={action.id}
                        variant={action.destructive ? "destructive" : undefined}
                        className={cn(
                          "gap-2",
                          action.destructive
                            ? dataWorkspaceLightDropdownLogoutItemClass
                            : dataWorkspaceLightDropdownItemClass,
                        )}
                        onSelect={action.onSelect}
                      >
                        <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
                        <span className="min-w-0 flex-1 truncate">
                          {action.label}
                        </span>
                      </DropdownMenuItem>
                    )
                  })}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}

      <div className="flex h-full min-h-0 flex-1 flex-col">
        <Link
          href={detailHref}
          className="flex min-h-0 flex-1 flex-col text-left"
        >
          <div className="border-b border-border/60 px-4 py-4 pr-11">
            <div className="flex items-start gap-3">
              <span
                className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background text-muted-foreground shadow-xs"
                aria-hidden
              >
                <Calculator className="size-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Caja registradora
                  </p>
                  <CashRegisterStatusPill
                    isOpen={isOpen}
                    isActive={row.isActive}
                  />
                </div>
                <h3 className="mt-1 truncate text-base font-semibold text-foreground">
                  {row.name}
                </h3>
                {isOpen && openedLabel ? (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
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

          <div className="flex min-h-0 flex-1 flex-col bg-muted/20 px-4 py-4">
            <CashRegisterPrimaryStat
              label="Cobrado en el turno"
              value={moneyOrDash(isOpen ? totalTurno : null)}
            />

            {isOpen ? (
              <div className="mt-auto min-h-[4.75rem] border-t border-border/40 pt-4">
                <CashRegisterSecondaryStat
                  label="Efectivo en caja"
                  value={moneyOrDash(efectivoEnCajon)}
                />
              </div>
            ) : null}
          </div>
        </Link>

        {!isOpen ? (
          <div className="flex min-h-[4.75rem] items-center justify-between gap-3 border-t border-border/40 bg-muted/20 px-4 py-4">
            <p className="text-xs leading-snug text-muted-foreground">
              {row.isActive ? "Sin turno abierto" : "Caja desactivada"}
            </p>
            {canCreate && row.isActive ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 shrink-0 gap-1.5 px-3 text-xs shadow-xs"
                onClick={onOpen}
              >
                <DoorOpen className="size-3.5" aria-hidden />
                Abrir turno
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  )
}
