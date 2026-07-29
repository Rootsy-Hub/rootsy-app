"use client"

import type { TreasuryAccountTableRow } from "@/app/[siteId]/[popId]/accounts/actions"
import {
  TreasuryBrandIsotype,
  TreasuryBrandName,
} from "@/app/[siteId]/[popId]/accounts/TreasuryBrandMark"
import { Button } from "@/components/ui/button"
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
import { CreditCard, MoreVertical, Wifi } from "lucide-react"

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

function TreasuryIntegrationIcons({
  hasPos,
  hasCard,
  className,
}: {
  hasPos: boolean
  hasCard: boolean
  className?: string
}) {
  if (!hasPos && !hasCard) return null

  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
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
        <Wifi className="size-3.5 shrink-0 opacity-90" aria-hidden />
      ) : null}
      {hasCard ? (
        <CreditCard className="size-3.5 shrink-0 opacity-90" aria-hidden />
      ) : null}
    </span>
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
  const menuActions = getTreasuryAccountMenuActions(row.kind, {
    canCreate,
    canUpdate,
    canDelete,
  })

  const brand = resolveTreasuryAccountBrand({
    kind: row.kind,
    brandKey: row.brandKey,
    name: row.name,
  })

  const headerGradient =
    brand?.headerGradient ?? "from-muted via-muted/80 to-muted/60"
  const headerText = brand?.headerTextClass ?? "text-foreground"

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/60 bg-card transition-colors hover:border-border",
      )}
    >
      {menuActions.length > 0 ? (
        <div className="absolute right-2 top-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "size-8 backdrop-blur-sm",
                  brand
                    ? "text-white/90 hover:bg-white/15 hover:text-white"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
                aria-label={`Opciones de ${row.name || "cuenta"}`}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="size-4" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {menuActions.map((action) => (
                <div key={action.id}>
                  {action.separatorBefore ? <DropdownMenuSeparator /> : null}
                  <DropdownMenuItem
                    variant={action.variant}
                    onSelect={() => onMenuAction(action.id)}
                  >
                    {action.label}
                  </DropdownMenuItem>
                </div>
              ))}
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
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
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
                  <TreasuryIntegrationIcons
                    hasPos={row.hasPosIntegration}
                    hasCard={row.hasCardIntegration}
                    className={headerText}
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
          <div className="rounded-xl border border-border/60 bg-background px-4 py-3 shadow-sm">
            <TreasuryStat
              label="Saldo real"
              value={moneyOrDash(row.ledgerBalance)}
              large
            />
            {row.kind !== "cash" ? (
              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border/60 pt-4">
                <TreasuryStat
                  label="A liquidar"
                  value={moneyOrDash(row.toLiquidateBalance)}
                />
                <TreasuryStat
                  label="A pagar"
                  value={moneyOrDash(row.toPayBalance)}
                />
              </div>
            ) : null}
          </div>
        </div>
      </button>
    </article>
  )
}
