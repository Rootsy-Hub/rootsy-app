"use client"

import type { TreasuryAccountTableRow } from "@/app/[siteId]/[popId]/accounts/actions"
import {
  TreasuryBrandIsotype,
  TreasuryBrandName,
} from "@/app/[siteId]/[popId]/accounts/TreasuryBrandMark"
import {
  dataWorkspaceLightDropdownContentClass,
  dataWorkspaceLightDropdownItemClass,
  dataWorkspaceLightDropdownLogoutItemClass,
  dataWorkspaceLightDropdownSeparatorClass,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  getTreasuryAccountMenuActions,
  type TreasuryAccountMenuActionId,
} from "@/lib/treasuryAccountMenuActions"
import { resolveTreasuryAccountBrand } from "@/lib/treasuryAccountBrands"
import { treasuryKindLabel } from "@/lib/treasuryAccountKinds"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  CreditCard,
  MoreVertical,
  Pencil,
  ScanLine,
  Trash2,
} from "lucide-react"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

function moneyOrDash(amount: number | null | undefined): string {
  if (amount == null) return "—"
  return fmt.format(amount)
}

function TreasuryStat({
  label,
  value,
  large,
}: {
  label: string
  value: string
  large?: boolean
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-numeric font-bold tabular-nums tracking-tight text-foreground",
          large ? "mt-1.5 text-2xl" : "text-base sm:text-lg",
        )}
      >
        {value}
      </p>
    </div>
  )
}

function TreasuryIntegrationBadges({
  hasPos,
  hasCard,
}: {
  hasPos: boolean
  hasCard: boolean
}) {
  if (!hasPos && !hasCard) return null

  const badgeClass =
    "inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground shadow-xs [&_svg]:size-3.5 [&_svg]:text-muted-foreground"

  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      aria-label={
        [
          hasPos ? "Terminal POS" : null,
          hasCard ? "Tarjeta corporativa" : null,
        ]
          .filter(Boolean)
          .join(" y ")
      }
    >
      {hasPos ? (
        <span className={badgeClass}>
          <ScanLine aria-hidden />
          POS
        </span>
      ) : null}
      {hasCard ? (
        <span className={badgeClass}>
          <CreditCard aria-hidden />
          Tarjeta
        </span>
      ) : null}
    </div>
  )
}

function treasuryAccountMenuActionIcon(actionId: TreasuryAccountMenuActionId) {
  switch (actionId) {
    case "add_pos":
      return ScanLine
    case "add_corporate_card":
      return CreditCard
    case "edit":
      return Pencil
    case "delete":
      return Trash2
  }
}

function TreasuryAccountCardMenuTrigger({
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
        "inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors",
        "hover:bg-muted/50 hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-1",
        className,
      )}
      aria-label={label}
      {...props}
    >
      <MoreVertical className="size-4" aria-hidden />
    </button>
  )
}

export function TreasuryAccountCard({
  row,
  canCreate,
  canUpdate,
  canDelete,
  detailHref,
  onMenuAction,
}: {
  row: TreasuryAccountTableRow
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  detailHref: string
  onMenuAction: (actionId: TreasuryAccountMenuActionId) => void
}) {
  const menuActions = getTreasuryAccountMenuActions(
    row.kind,
    {
      canCreate,
      canUpdate,
      canDelete,
    },
    {
      hasPos: row.hasPosIntegration,
      hasCard: row.hasCardIntegration,
    },
  )

  const brand = resolveTreasuryAccountBrand({
    kind: row.kind,
    brandKey: row.brandKey,
    name: row.name,
  })

  const showSettlementStats = row.kind === "bank" || row.kind === "wallet"
  const showIntegrationBadges =
    row.kind !== "cash" &&
    (row.hasPosIntegration || row.hasCardIntegration)

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all",
        "hover:border-border hover:shadow-md",
      )}
    >
      {menuActions.length > 0 ? (
        <div
          className="absolute right-3 top-3 z-20"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <TreasuryAccountCardMenuTrigger
                label={`Opciones de ${row.name || "cuenta"}`}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="bottom"
              sideOffset={8}
              collisionPadding={{ right: 16 }}
              className={cn(dataWorkspaceLightDropdownContentClass, "z-[120]")}
            >
              {menuActions.map((action) => {
                const Icon = treasuryAccountMenuActionIcon(action.id)
                const isDelete = action.variant === "destructive"

                return (
                  <div key={action.id}>
                    {action.separatorBefore ? (
                      <DropdownMenuSeparator
                        className={dataWorkspaceLightDropdownSeparatorClass}
                      />
                    ) : null}
                    <DropdownMenuItem
                      variant={isDelete ? "destructive" : undefined}
                      className={cn(
                        "gap-2",
                        isDelete
                          ? dataWorkspaceLightDropdownLogoutItemClass
                          : dataWorkspaceLightDropdownItemClass,
                      )}
                      onSelect={() => onMenuAction(action.id)}
                    >
                      <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
                      <span className="min-w-0 flex-1 truncate">
                        {action.label}
                      </span>
                    </DropdownMenuItem>
                  </div>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}

      <Link href={detailHref} className="flex h-full min-h-0 flex-1 flex-col text-left">
        <div className="border-b border-border/60 px-4 py-4 pr-11">
          <div className="flex flex-col gap-2.5">
            <div className="flex min-w-0 items-center gap-3">
              <TreasuryBrandIsotype
                brandKey={brand?.key}
                monogram={
                  brand?.monogram ??
                  (row.name.slice(0, 2).toUpperCase() || "—")
                }
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  {treasuryKindLabel(row.kind)}
                  {!row.isActive ? " · Inactiva" : ""}
                </p>
                <TreasuryBrandName
                  preset={brand}
                  name={row.name}
                  textClass="text-foreground"
                  className="mt-0.5 text-base font-semibold"
                />
              </div>
            </div>

            <div className="min-h-7">
              {showIntegrationBadges ? (
                <TreasuryIntegrationBadges
                  hasPos={row.hasPosIntegration}
                  hasCard={row.hasCardIntegration}
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col bg-muted/20 px-4 py-4">
          <TreasuryStat
            label="Saldo real"
            value={moneyOrDash(row.ledgerBalance)}
            large
          />
          <div className="mt-auto min-h-[4.75rem] border-t border-border/40 pt-4">
            {showSettlementStats ? (
              <div className="grid grid-cols-2 gap-4">
                <TreasuryStat
                  label="A liquidar"
                  value={moneyOrDash(row.toLiquidateBalance)}
                />
                <TreasuryStat
                  label="A pagar"
                  value={moneyOrDash(row.toPayBalance)}
                />
              </div>
            ) : row.kind === "cash" ? (
              <p className="text-[11px] font-medium leading-snug text-muted-foreground">
                Efectivo directo
                <span className="mt-0.5 block text-[10px] font-normal normal-case tracking-normal opacity-80">
                  Sin liquidaciones ni tarjetas vinculadas
                </span>
              </p>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  )
}
