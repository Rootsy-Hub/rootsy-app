"use client"

import type { TreasuryAccountTableRow } from "@/app/[siteId]/[popId]/accounts/actions"
import {
  TreasuryBrandIsotype,
  TreasuryBrandName,
} from "@/app/[siteId]/[popId]/accounts/TreasuryBrandMark"
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
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardHeaderClass,
  dataWorkspaceEntityCardLosetaClass,
  dataWorkspaceEntityCardLosetaGridClass,
  dataWorkspaceEntityCardMenuTriggerClass,
  dataWorkspaceEntityCardSaldoSectionClass,
  dataWorkspaceEntityCardSettlementFooterClass,
  dataWorkspaceEntityCardStatLabelClass,
  dataWorkspaceEntityCardStatValueClass,
  dataWorkspaceEntityCardStatValueLargeClass,
  dataWorkspaceEntityCardTitleClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
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

function integrationBalanceOrDash(
  hasIntegration: boolean,
  amount: number | null | undefined,
): string {
  if (!hasIntegration) return "—"
  return moneyOrDash(amount)
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
    <div className="min-w-0">
      <p className={dataWorkspaceEntityCardStatLabelClass}>{label}</p>
      <p
        className={cn(
          large ? dataWorkspaceEntityCardStatValueLargeClass : dataWorkspaceEntityCardStatValueClass,
          !large && "text-base sm:text-lg",
          large ? "mt-1.5" : "mt-1",
        )}
        title={value}
      >
        {value}
      </p>
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
      className={cn(dataWorkspaceEntityCardMenuTriggerClass, className)}
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

  return (
    <article className={dataWorkspaceEntityCardLosetaClass}>
      <Link
        href={detailHref}
        className={cn(
          dataWorkspaceEntityCardLosetaGridClass,
          "text-left outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-600)_35%,transparent)] focus-visible:ring-offset-2",
        )}
      >
        <div className={cn(dataWorkspaceEntityCardHeaderClass, "pr-4")}>
          <div className="flex min-w-0 items-start gap-2">
            <TreasuryBrandIsotype
              brandKey={brand?.key}
              monogram={
                brand?.monogram ??
                (row.name.slice(0, 2).toUpperCase() || "—")
              }
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className={dataWorkspaceEntityCardEyebrowClass}>
                {treasuryKindLabel(row.kind)}
                {!row.isActive ? " · Inactiva" : ""}
              </p>
              <TreasuryBrandName
                preset={brand}
                name={row.name}
                textClass="text-[var(--rootsy-bruma-900)]"
                className={cn("mt-0.5", dataWorkspaceEntityCardTitleClass)}
              />
            </div>
            {menuActions.length > 0 ? (
              <div
                className="-mr-1 shrink-0"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}
              >
                <RootsDropdownMenu modal={false}>
                  <RootsDropdownTrigger asChild>
                    <TreasuryAccountCardMenuTrigger
                      label={`Opciones de ${row.name || "cuenta"}`}
                    />
                  </RootsDropdownTrigger>
                  <RootsDropdownContent
                    theme="light"
                    align="start"
                    side="left"
                    sideOffset={6}
                    collisionPadding={12}
                    className={cn(dataWorkspaceLightDropdownContentClass, "z-[500]")}
                  >
                    {menuActions.map((action) => {
                      const Icon = treasuryAccountMenuActionIcon(action.id)
                      const isDelete = action.variant === "destructive"

                      return (
                        <div key={action.id}>
                          {action.separatorBefore ? (
                            <RootsDropdownSeparator
                              theme="light"
                              className={dataWorkspaceLightDropdownSeparatorClass}
                            />
                          ) : null}
                          <RootsDropdownItem
                            theme="light"
                            variant={isDelete ? "destructive" : "default"}
                            onSelect={() => onMenuAction(action.id)}
                          >
                            <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
                            <span className="min-w-0 flex-1 truncate">
                              {action.label}
                            </span>
                          </RootsDropdownItem>
                        </div>
                      )
                    })}
                  </RootsDropdownContent>
                </RootsDropdownMenu>
              </div>
            ) : null}
          </div>
        </div>

        <div className={dataWorkspaceEntityCardSaldoSectionClass}>
          <TreasuryStat
            label="Saldo real"
            value={moneyOrDash(row.ledgerBalance)}
            large
          />
        </div>

        {showSettlementStats ? (
          <div className={dataWorkspaceEntityCardSettlementFooterClass}>
            <TreasuryStat
              label="A liquidar"
              value={integrationBalanceOrDash(
                row.hasPosIntegration,
                row.toLiquidateBalance,
              )}
            />
            <TreasuryStat
              label="A pagar"
              value={integrationBalanceOrDash(
                row.hasCardIntegration,
                row.toPayBalance,
              )}
            />
          </div>
        ) : row.kind === "cash" ? (
          <div className={cn(dataWorkspaceEntityCardSettlementFooterClass, "grid-cols-1")}>
            <p className={cn(dataWorkspaceEntityCardStatLabelClass, "normal-case leading-snug")}>
              Efectivo directo
              <span className="mt-0.5 block text-[10px] font-normal normal-case tracking-normal text-[var(--rootsy-bruma-500)] opacity-90">
                Sin liquidaciones ni tarjetas vinculadas
              </span>
            </p>
          </div>
        ) : (
          <div className={dataWorkspaceEntityCardSettlementFooterClass} aria-hidden />
        )}
      </Link>
    </article>
  )
}
