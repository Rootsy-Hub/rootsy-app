"use client"

import type { TreasuryAccountTableRow } from "@/app/[siteId]/[popId]/accounts/actions"
import {
  TreasuryBrandIsotype,
  TreasuryBrandName,
} from "@/app/[siteId]/[popId]/accounts/TreasuryBrandMark"
import {
  dataWorkspaceHeaderDropdownItemClass,
  dataWorkspaceHeaderDropdownLogoutItemClass,
  dataWorkspaceHeaderDropdownSeparatorClass,
  dataWorkspaceHeaderUserDropdownContentClass,
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
          "mt-1 font-mono font-bold tabular-nums tracking-tight text-foreground",
          large ? "mt-2 text-3xl" : "text-lg",
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
  branded,
}: {
  hasPos: boolean
  hasCard: boolean
  branded: boolean
}) {
  if (!hasPos && !hasCard) return null

  const badgeClass = branded
    ? "border-white/20 bg-white/12 text-white/90 [&_svg]:text-white/80"
    : "border-foreground/10 bg-background/70 text-foreground/75 shadow-sm [&_svg]:text-foreground/55"

  return (
    <div
      className="inline-flex flex-wrap items-center gap-1.5"
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
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold leading-none tracking-wide",
            badgeClass,
          )}
        >
          <ScanLine className="size-3 shrink-0" aria-hidden />
          POS
        </span>
      ) : null}
      {hasCard ? (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold leading-none tracking-wide",
            badgeClass,
          )}
        >
          <CreditCard className="size-3 shrink-0" aria-hidden />
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
  branded,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  label: string
  branded: boolean
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-lg transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-1",
        branded
          ? "text-white/75 hover:bg-white/12 hover:text-white"
          : "text-foreground/40 hover:bg-foreground/5 hover:text-foreground/70",
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
  onMenuAction,
  onOpenDetail,
}: {
  row: TreasuryAccountTableRow
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  onMenuAction: (actionId: TreasuryAccountMenuActionId) => void
  onOpenDetail: () => void
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

  const headerGradient =
    brand?.headerGradient ?? "from-muted via-muted/80 to-muted/60"
  const headerText = brand?.headerTextClass ?? "text-foreground"
  const isBrandedHeader = Boolean(brand)
  const showSettlementStats = row.kind === "bank" || row.kind === "wallet"

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card transition-colors hover:border-border",
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
                branded={isBrandedHeader}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="bottom"
              sideOffset={8}
              collisionPadding={{ right: 16 }}
              className={cn(dataWorkspaceHeaderUserDropdownContentClass, "z-[120]")}
            >
              {menuActions.map((action) => {
                const Icon = treasuryAccountMenuActionIcon(action.id)
                const isDelete = action.variant === "destructive"

                return (
                  <div key={action.id}>
                    {action.separatorBefore ? (
                      <DropdownMenuSeparator
                        className={dataWorkspaceHeaderDropdownSeparatorClass}
                      />
                    ) : null}
                    <DropdownMenuItem
                      variant={isDelete ? "default" : undefined}
                      className={cn(
                        "gap-2",
                        isDelete
                          ? dataWorkspaceHeaderDropdownLogoutItemClass
                          : dataWorkspaceHeaderDropdownItemClass,
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

      <button
        type="button"
        onClick={onOpenDetail}
        className="w-full text-left"
      >
        <div
          className={cn(
            "bg-linear-to-br px-4 pb-6 pt-4",
            headerGradient,
          )}
        >
          <div className="flex items-start justify-between gap-3 pr-7">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pr-8">
                <p
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-[0.16em] opacity-85",
                    headerText,
                  )}
                >
                  {treasuryKindLabel(row.kind)}
                  {!row.isActive ? " · Inactiva" : ""}
                </p>
                {row.kind !== "cash" ? (
                  <TreasuryIntegrationBadges
                    hasPos={row.hasPosIntegration}
                    hasCard={row.hasCardIntegration}
                    branded={isBrandedHeader}
                  />
                ) : null}
              </div>
              <div className="mt-2.5 flex items-center gap-3">
                <TreasuryBrandIsotype
                  brandKey={brand?.key}
                  monogram={
                    brand?.monogram ??
                    (row.name.slice(0, 2).toUpperCase() || "—")
                  }
                  headerTextClass={headerText}
                  onColoredHeader={isBrandedHeader}
                  size="md"
                />
                <TreasuryBrandName
                  preset={brand}
                  name={row.name}
                  textClass={headerText}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="-mt-4 px-4 pb-4">
          <div className="flex min-h-[10.75rem] flex-col rounded-xl border border-border/60 bg-background px-4 py-3 shadow-sm">
            <TreasuryStat
              label="Saldo real"
              value={moneyOrDash(row.ledgerBalance)}
              large
            />
            <div className="mt-auto border-t border-border/60 pt-4">
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
              ) : (
                <p className="text-[11px] font-medium leading-snug text-muted-foreground">
                  Efectivo directo
                  <span className="mt-0.5 block text-[10px] font-normal normal-case tracking-normal opacity-80">
                    Sin liquidaciones ni tarjetas vinculadas
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </button>
    </article>
  )
}
