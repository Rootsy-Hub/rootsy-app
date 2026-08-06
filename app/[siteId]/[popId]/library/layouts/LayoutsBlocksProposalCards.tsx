"use client"

import {
  TreasuryBrandIsotype,
  TreasuryBrandName,
} from "@/app/[siteId]/[popId]/accounts/TreasuryBrandMark"
import {
  LAYOUTS_BLOCKS_ACCOUNT_PROPOSAL_ROWS,
  LAYOUTS_BLOCKS_CASH_PROPOSAL_ROWS,
  LAYOUTS_BLOCKS_PROPOSAL_FOUNDATIONS,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsBlocksProposalSpec"
import { LayoutsBlocksDocSubsection } from "@/app/[siteId]/[popId]/library/layouts/LayoutsBlocksDocPrimitives"
import "@/app/[siteId]/[popId]/library/elevation/rootsyElevationSystem.css"
import "@/app/[siteId]/[popId]/library/radius/rootsyRadiusSystem.css"
import { FoundationSpecCard } from "@/app/[siteId]/[popId]/library/libraryFoundationDocShared"
import {
  dataWorkspaceLightDropdownContentClass,
  dataWorkspaceLightDropdownSeparatorClass,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import { layoutsModuleContentShellClass } from "@/components/layouts-module/rootsLayoutsModuleProductStyles"
import {
  RootsDropdownContent,
  RootsDropdownItem,
  RootsDropdownMenu,
  RootsDropdownSeparator,
  RootsDropdownTrigger,
} from "@/components/rootsy-dropdown"
import {
  dataWorkspaceBlocksContentInnerClass,
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardFooterClass,
  dataWorkspaceEntityCardMenuTriggerClass,
  dataWorkspaceEntityCardSaldoSectionClass,
  dataWorkspaceEntityCardStatLabelClass,
  dataWorkspaceEntityCardStatValueClass,
  dataWorkspaceEntityCardStatValueLargeClass,
  dataWorkspaceEntityCardStatusClosedClass,
  dataWorkspaceEntityCardStatusOpenClass,
  dataWorkspaceEntityCardTitleClass,
  dataWorkspaceEntityCardsGridClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { getTreasuryBrandPreset } from "@/lib/treasuryAccountBrands"
import { treasuryKindLabel } from "@/lib/treasuryAccountKinds"
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
import type { LayoutsBlocksProposalSpecRow } from "@/app/[siteId]/[popId]/library/layouts/layoutsBlocksProposalSpec"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

function moneyOrDash(amount: number | null | undefined): string {
  if (amount == null) return "—"
  return fmt.format(amount)
}

/** Menú ⋮ — paridad con tarjeta de producto (demo estático en librería). */
function ProposalAccountOptionsMenu({
  accountName,
  onColoredHeader = false,
}: {
  accountName: string
  onColoredHeader?: boolean
}) {
  return (
    <div
      className="absolute right-3 top-3 z-20"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <RootsDropdownMenu>
        <RootsDropdownTrigger asChild>
          <button
            type="button"
            aria-label={`Opciones de ${accountName}`}
            className={cn(
              onColoredHeader
                ? cn(
                    "inline-flex size-8 items-center justify-center rounded-lg outline-none transition-colors",
                    "text-white/90 hover:bg-white/15 hover:text-white",
                    "data-[state=open]:bg-white/15",
                    "focus-visible:ring-2 focus-visible:ring-white/35",
                  )
                : dataWorkspaceEntityCardMenuTriggerClass,
            )}
          >
            <MoreVertical className="size-4" aria-hidden />
          </button>
        </RootsDropdownTrigger>
        <RootsDropdownContent
          theme="light"
          align="end"
          side="bottom"
          sideOffset={8}
          collisionPadding={{ right: 16 }}
          className={cn(dataWorkspaceLightDropdownContentClass, "z-[120]")}
        >
          <RootsDropdownItem theme="light">
            <Pencil className="size-4 shrink-0 opacity-70" aria-hidden />
            Editar cuenta
          </RootsDropdownItem>
          <RootsDropdownItem theme="light" variant="destructive">
            <Trash2 className="size-4 shrink-0 opacity-70" aria-hidden />
            Eliminar cuenta
          </RootsDropdownItem>
        </RootsDropdownContent>
      </RootsDropdownMenu>
    </div>
  )
}

function ProposalAccountSettlementFooter({ data }: { data: ProposalAccountDemo }) {
  return (
    <div className={cn("grid grid-cols-2 gap-4 px-4 py-4", dataWorkspaceEntityCardFooterClass)}>
      <div>
        <p className={dataWorkspaceEntityCardStatLabelClass}>A liquidar</p>
        <p className={cn("mt-1 text-base sm:text-lg", dataWorkspaceEntityCardStatValueClass)}>
          {moneyOrDash(data.toLiquidateBalance)}
        </p>
      </div>
      <div>
        <p className={dataWorkspaceEntityCardStatLabelClass}>A pagar</p>
        <p className={cn("mt-1 text-base sm:text-lg", dataWorkspaceEntityCardStatValueClass)}>
          {moneyOrDash(data.toPayBalance)}
        </p>
      </div>
    </div>
  )
}

function ProposalAccountSaldoBody({ balance }: { balance: number }) {
  return (
    <div className="px-4 py-4">
      <p className={dataWorkspaceEntityCardStatLabelClass}>Saldo real</p>
      <p className={cn("mt-1.5", dataWorkspaceEntityCardStatValueLargeClass)}>
        {moneyOrDash(balance)}
      </p>
    </div>
  )
}

type ProposalAccountDemo = {
  brandKey: string
  kind: "bank" | "wallet"
  ledgerBalance: number
  toLiquidateBalance: number
  toPayBalance: number
}

const PROPOSAL_ACCOUNTS: Record<
  (typeof LAYOUTS_BLOCKS_ACCOUNT_PROPOSAL_ROWS)[number]["id"],
  ProposalAccountDemo
> = {
  "cuenta-loseta-marca": {
    brandKey: "santander",
    kind: "bank",
    ledgerBalance: 892_450.25,
    toLiquidateBalance: 98_320,
    toPayBalance: 12_400,
  },
  "cuenta-cabecera-marca": {
    brandKey: "mercadopago",
    kind: "wallet",
    ledgerBalance: 328_640,
    toLiquidateBalance: 32_400,
    toPayBalance: 0,
  },
  "cuenta-elevada-marca": {
    brandKey: "galicia",
    kind: "bank",
    ledgerBalance: 1_245_890.75,
    toLiquidateBalance: 124_580.5,
    toPayBalance: 18_200,
  },
}

type ProposalCashDemo = {
  name: string
  isOpen: boolean
  openedAtLabel?: string
  totalTurno?: number
  efectivoEnCaja?: number
  isActive?: boolean
}

const PROPOSAL_CASH_NAMES: Record<
  (typeof LAYOUTS_BLOCKS_CASH_PROPOSAL_ROWS)[number]["id"],
  string
> = {
  "caja-banda-turno": "Caja principal",
  "caja-loseta-cerrada": "Mostrador sur",
  "caja-kpi-compacto": "Caja express",
}

const PROPOSAL_CASH_OPEN_DEMO = {
  isOpen: true,
  openedAtLabel: "09:14",
  totalTurno: 128_450,
  efectivoEnCaja: 48_920.5,
  isActive: true,
} as const

const PROPOSAL_CASH_CLOSED_DEMO = {
  isOpen: false,
  isActive: true,
} as const

/** Altura fija del pie — paridad entre abierta y cerrada. */
const cashProposalFooterClass = cn(
  "flex h-[4.75rem] shrink-0 items-center justify-between gap-3 px-4",
  dataWorkspaceEntityCardFooterClass,
)

const cashProposalCardShellClass = "relative grid h-full w-full min-h-[19rem] overflow-hidden"

/** Menú ⋮ caja — paridad con CashRegisterCard de producto. */
function ProposalCashOptionsMenu({
  registerName,
  isOpen,
  className,
}: {
  registerName: string
  isOpen: boolean
  className?: string
}) {
  return (
    <div
      className={cn("absolute z-20", className)}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <RootsDropdownMenu>
        <RootsDropdownTrigger asChild>
          <button
            type="button"
            aria-label={`Opciones de ${registerName}`}
            className={dataWorkspaceEntityCardMenuTriggerClass}
          >
            <MoreVertical className="size-4" aria-hidden />
          </button>
        </RootsDropdownTrigger>
        <RootsDropdownContent
          theme="light"
          align="end"
          side="bottom"
          sideOffset={8}
          collisionPadding={{ right: 16 }}
          className={cn(dataWorkspaceLightDropdownContentClass, "z-[120]")}
        >
          {isOpen ? (
            <>
              <RootsDropdownItem theme="light">
                <DoorClosed className="size-4 shrink-0 opacity-70" aria-hidden />
                Cerrar caja
              </RootsDropdownItem>
              <RootsDropdownItem theme="light">
                <Plus className="size-4 shrink-0 opacity-70" aria-hidden />
                Ingreso al cajón
              </RootsDropdownItem>
              <RootsDropdownItem theme="light">
                <MinusCircle className="size-4 shrink-0 opacity-70" aria-hidden />
                Retiro del cajón
              </RootsDropdownItem>
              <RootsDropdownSeparator
                theme="light"
                className={dataWorkspaceLightDropdownSeparatorClass}
              />
            </>
          ) : null}
          <RootsDropdownItem theme="light">
            <Pencil className="size-4 shrink-0 opacity-70" aria-hidden />
            Editar caja
          </RootsDropdownItem>
          <RootsDropdownItem theme="light" variant="destructive">
            <Trash2 className="size-4 shrink-0 opacity-70" aria-hidden />
            Eliminar caja
          </RootsDropdownItem>
        </RootsDropdownContent>
      </RootsDropdownMenu>
    </div>
  )
}

function ProposalCashStatusPill({
  isOpen,
  className,
}: {
  isOpen: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        isOpen ? dataWorkspaceEntityCardStatusOpenClass : dataWorkspaceEntityCardStatusClosedClass,
        className,
      )}
    >
      {isOpen ? (
        <span className="size-1.5 rounded-full bg-[var(--rootsy-savia-600)]" aria-hidden />
      ) : null}
      {isOpen ? "Abierta" : "Cerrada"}
    </span>
  )
}

/** Cabecera caja A/B — eyebrow + nombre apilados; pill no estira la fila del meta. */
function ProposalCashHeaderIdentity({
  data,
  menuClassName = "right-0 top-3",
}: {
  data: ProposalCashDemo
  menuClassName?: string
}) {
  return (
    <div className="relative border-b border-[var(--rootsy-bruma-200)] px-4 py-3.5 pr-11">
      <ProposalCashOptionsMenu
        registerName={data.name}
        isOpen={data.isOpen}
        className={menuClassName}
      />

      <div className="flex items-start gap-3">
        <ProposalCashIsotype />
        <div className="relative min-w-0 flex-1">
          <ProposalCashStatusPill isOpen={data.isOpen} className="absolute right-0 top-0" />
          <p className={cn(dataWorkspaceEntityCardEyebrowClass, "pr-24")}>
            Caja registradora
          </p>
          <h3 className={cn("mt-0.5 truncate pr-24", dataWorkspaceEntityCardTitleClass)}>
            {data.name}
          </h3>
          {data.isOpen && data.openedAtLabel ? (
            <p className="mt-0.5 truncate font-canopy text-xs text-[var(--rootsy-bruma-500)]">
              Desde {data.openedAtLabel}
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-transparent" aria-hidden>
              &nbsp;
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function ProposalCashIsotype({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[var(--radius-medium)] border border-[var(--rootsy-bruma-200)] bg-white text-[var(--rootsy-bruma-500)]",
        compact ? "size-9" : "size-10",
      )}
      aria-hidden
    >
      <Calculator className={compact ? "size-4" : "size-[1.125rem]"} strokeWidth={1.75} />
    </span>
  )
}

function ProposalCashOpenFooter({
  efectivoEnCaja,
  showCloseAction = false,
}: {
  efectivoEnCaja?: number
  showCloseAction?: boolean
}) {
  return (
    <div className={cashProposalFooterClass}>
      <div className="min-w-0">
        <p className={dataWorkspaceEntityCardStatLabelClass}>Efectivo en caja</p>
        <p className={cn("mt-1 text-base sm:text-lg", dataWorkspaceEntityCardStatValueClass)}>
          {moneyOrDash(efectivoEnCaja ?? null)}
        </p>
      </div>
      {showCloseAction ? (
        <button
          type="button"
          className={cn(
            "shrink-0 rounded-[var(--radius-large)] px-3 py-2 font-canopy text-xs font-semibold",
            "bg-[var(--rootsy-savia-600)] text-white transition-colors hover:bg-[var(--rootsy-savia-700)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rootsy-savia-400)] focus-visible:ring-offset-2",
          )}
        >
          Cerrar
        </button>
      ) : null}
    </div>
  )
}

function ProposalCashOpenFooterMinimal({ message }: { message: string }) {
  return (
    <div className={cashProposalFooterClass}>
      <p className="font-canopy text-xs leading-snug text-[var(--rootsy-bruma-500)]">{message}</p>
    </div>
  )
}

function ProposalCashClosedFooter() {
  return (
    <div className={cashProposalFooterClass}>
      <div className="min-w-0">
        <p className={dataWorkspaceEntityCardStatLabelClass}>Efectivo en caja</p>
        <p className={cn("mt-1 text-base sm:text-lg", dataWorkspaceEntityCardStatValueClass)}>—</p>
      </div>
      <button
        type="button"
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-large)] px-3 py-2 font-canopy text-xs font-semibold",
          "bg-[var(--rootsy-savia-600)] text-white transition-colors hover:bg-[var(--rootsy-savia-700)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rootsy-savia-400)] focus-visible:ring-offset-2",
        )}
      >
        <DoorOpen className="size-3.5" aria-hidden />
        Abrir turno
      </button>
    </div>
  )
}

function ProposalScope({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rootsy-app-light rootsy-elevation-system rootsy-radius-system text-[var(--rootsy-bruma-900)]",
        layoutsModuleContentShellClass,
      )}
    >
      <div className={dataWorkspaceBlocksContentInnerClass}>{children}</div>
    </div>
  )
}

function ProposalCardCaption({ spec }: { spec: LayoutsBlocksProposalSpecRow }) {
  return (
    <p className="px-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--rootsy-bruma-500)]">
      {spec.label} · {spec.sample}
    </p>
  )
}

function ProposalGrid({ children }: { children: React.ReactNode }) {
  return <div className={dataWorkspaceEntityCardsGridClass}>{children}</div>
}

/** A · Santander — loseta plana · isotipo + métricas en panel hundido. */
function BlocksProposalAccountLosetaMarcaCard({ data }: { data: ProposalAccountDemo }) {
  const preset = getTreasuryBrandPreset(data.brandKey)
  if (!preset) return null

  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden",
        "rootsy-elevation-default-bordered rootsy-radius-xxlarge",
        "transition-[border-color] duration-200 hover:border-[var(--rootsy-bruma-300)]",
      )}
    >
      <ProposalAccountOptionsMenu accountName={preset.defaultName} />

      <div className="border-b border-[var(--rootsy-bruma-200)] px-4 py-4 pr-11">
        <div className="flex min-w-0 items-center gap-3">
          <TreasuryBrandIsotype brandKey={preset.key} monogram={preset.monogram} size="md" />
          <div className="min-w-0 flex-1">
            <p className={dataWorkspaceEntityCardEyebrowClass}>{treasuryKindLabel(data.kind)}</p>
            <TreasuryBrandName
              preset={preset}
              name={preset.defaultName}
              textClass="text-[var(--rootsy-bruma-900)]"
              className={cn("mt-0.5", dataWorkspaceEntityCardTitleClass)}
            />
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <ProposalAccountSaldoBody balance={data.ledgerBalance} />
        <div className="mt-auto">
          <ProposalAccountSettlementFooter data={data} />
        </div>
      </div>
    </article>
  )
}

/** B · Mercado Pago — cabecera de marca + cuerpo blanco. */
function BlocksProposalAccountCabeceraMarcaCard({ data }: { data: ProposalAccountDemo }) {
  const preset = getTreasuryBrandPreset(data.brandKey)
  if (!preset) return null

  return (
    <article className="relative flex flex-col overflow-hidden rootsy-elevation-raised rootsy-radius-xxlarge">
      <div
        className={cn(
          "relative border-b border-black/5 bg-gradient-to-br px-4 py-4 pr-11",
          preset.headerGradient,
        )}
      >
        <ProposalAccountOptionsMenu accountName={preset.defaultName} onColoredHeader />

        <div className="flex min-w-0 items-center gap-3">
          <TreasuryBrandIsotype
            brandKey={preset.key}
            monogram={preset.monogram}
            size="md"
            onColoredHeader
            headerTextClass={preset.headerTextClass}
          />
          <div className="min-w-0 flex-1">
            <p className={cn("font-canopy text-[11px] font-medium uppercase tracking-[0.12em] opacity-90", preset.headerTextClass)}>
              {treasuryKindLabel(data.kind)}
            </p>
            <TreasuryBrandName
              preset={preset}
              name={preset.defaultName}
              textClass={preset.headerTextClass}
              className={cn("mt-0.5", dataWorkspaceEntityCardTitleClass, preset.headerTextClass)}
            />
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col bg-white">
        <ProposalAccountSaldoBody balance={data.ledgerBalance} />
        <div className="mt-auto">
          <ProposalAccountSettlementFooter data={data} />
        </div>
      </div>
    </article>
  )
}

/** C · Galicia — tarjeta elevada · marca solo en isotipo (sin columna lateral). */
function BlocksProposalAccountElevadaMarcaCard({ data }: { data: ProposalAccountDemo }) {
  const preset = getTreasuryBrandPreset(data.brandKey)
  if (!preset) return null

  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden bg-white",
        "rootsy-elevation-raised rootsy-radius-xxlarge",
        "ring-1 ring-[var(--rootsy-bruma-200)]",
        "transition-[box-shadow] duration-200 hover:shadow-md",
      )}
    >
      <ProposalAccountOptionsMenu accountName={preset.defaultName} />

      <div className="border-b border-[var(--rootsy-bruma-200)] px-4 py-4 pr-11">
        <div className="flex min-w-0 items-center gap-3">
          <TreasuryBrandIsotype brandKey={preset.key} monogram={preset.monogram} size="md" />
          <div className="min-w-0 flex-1">
            <p className={dataWorkspaceEntityCardEyebrowClass}>{treasuryKindLabel(data.kind)}</p>
            <TreasuryBrandName
              preset={preset}
              name={preset.defaultName}
              textClass="text-[var(--rootsy-bruma-900)]"
              className={cn("mt-0.5", dataWorkspaceEntityCardTitleClass)}
            />
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <ProposalAccountSaldoBody balance={data.ledgerBalance} />
        <div className="mt-auto">
          <ProposalAccountSettlementFooter data={data} />
        </div>
      </div>
    </article>
  )
}

const ACCOUNT_PROPOSAL_CARDS = {
  "cuenta-loseta-marca": BlocksProposalAccountLosetaMarcaCard,
  "cuenta-cabecera-marca": BlocksProposalAccountCabeceraMarcaCard,
  "cuenta-elevada-marca": BlocksProposalAccountElevadaMarcaCard,
} as const

/** Meta / títulos — reutilizado en propuestas de cajas. */
const metaLabelClass =
  "font-canopy text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--rootsy-bruma-500)]"

const entityTitleClass =
  "font-canopy text-[15px] font-semibold leading-snug text-[var(--rootsy-bruma-900)]"

const metricLgClass =
  "font-numeric text-[1.625rem] font-bold leading-none tabular-nums tracking-tight text-[var(--rootsy-bruma-900)]"

const metricMdClass =
  "font-numeric text-lg font-bold tabular-nums tracking-tight text-[var(--rootsy-bruma-900)]"

/** A · Banda de turno — misma proporción que loseta de cuentas (flex · saldo + pie). */
function BlocksProposalCashBandaTurnoCard({ data }: { data: ProposalCashDemo }) {
  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden",
        "rootsy-elevation-raised rootsy-radius-xlarge",
      )}
    >
      <ProposalCashHeaderIdentity data={data} />

      <div className="flex min-h-0 flex-1 flex-col">
        <div className={dataWorkspaceEntityCardSaldoSectionClass}>
          <p className={dataWorkspaceEntityCardStatLabelClass}>Cobrado en el turno</p>
          <p className={cn("mt-1.5", dataWorkspaceEntityCardStatValueLargeClass)}>
            {moneyOrDash(data.isOpen ? data.totalTurno : null)}
          </p>
        </div>

        <div className="mt-auto">
          {data.isOpen ? (
            <ProposalCashOpenFooter efectivoEnCaja={data.efectivoEnCaja} showCloseAction />
          ) : (
            <ProposalCashClosedFooter />
          )}
        </div>
      </div>
    </article>
  )
}

/** B · Loseta — abierta y cerrada · misma altura. */
function BlocksProposalCashLosetaCerradaCard({ data }: { data: ProposalCashDemo }) {
  return (
    <article
      className={cn(
        cashProposalCardShellClass,
        "grid-rows-[auto_minmax(0,1fr)_4.75rem]",
        "rootsy-elevation-default-bordered rootsy-radius-large",
        "transition-[border-color] duration-200 hover:border-[var(--rootsy-bruma-300)]",
      )}
    >
      <ProposalCashHeaderIdentity data={data} />

      <div className="flex min-h-0 flex-col px-3 py-3">
        <div className="flex min-h-0 flex-1 flex-col justify-center rounded-[var(--radius-medium)] bg-[var(--rootsy-bruma-50)] px-3.5 py-4">
          <p className={metaLabelClass}>Cobrado en el turno</p>
          <p className={cn("mt-1.5", metricLgClass)}>
            {moneyOrDash(data.isOpen ? data.totalTurno : null)}
          </p>
          <p className="mt-2 font-canopy text-xs text-[var(--rootsy-bruma-500)]">
            {data.isOpen ? (
              <>
                Efectivo en caja ·{" "}
                <span className="font-numeric font-semibold tabular-nums text-[var(--rootsy-bruma-900)]">
                  {moneyOrDash(data.efectivoEnCaja ?? null)}
                </span>
              </>
            ) : (
              "Sin turno abierto"
            )}
          </p>
        </div>
      </div>

      {data.isOpen ? (
        <ProposalCashOpenFooterMinimal message="Turno en curso · métricas arriba" />
      ) : (
        <ProposalCashClosedFooter />
      )}
    </article>
  )
}

/** C · KPI compacto — abierta y cerrada · misma altura. */
function BlocksProposalCashKpiCompactoCard({ data }: { data: ProposalCashDemo }) {
  return (
    <article
      className={cn(
        cashProposalCardShellClass,
        "grid-rows-[auto_minmax(0,1fr)_4.75rem]",
        "rootsy-elevation-raised rootsy-radius-xlarge",
      )}
    >
      <div className="relative px-4 pb-2 pt-4 pr-11">
        <ProposalCashOptionsMenu registerName={data.name} isOpen={data.isOpen} className="right-0 top-3" />

        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2.5">
            <ProposalCashIsotype compact />
            <div className="min-w-0">
              <h3 className={cn("truncate", entityTitleClass)}>{data.name}</h3>
              {data.isOpen && data.openedAtLabel ? (
                <p className="mt-0.5 font-canopy text-[11px] text-[var(--rootsy-bruma-500)]">
                  Desde {data.openedAtLabel}
                </p>
              ) : (
                <p className="mt-0.5 text-[11px] text-transparent" aria-hidden>
                  &nbsp;
                </p>
              )}
            </div>
          </div>
          <ProposalCashStatusPill isOpen={data.isOpen} />
        </div>
      </div>

      <div className="flex min-h-0 flex-col justify-center px-3 py-2">
        <div className="grid h-[5.5rem] shrink-0 grid-cols-2 divide-x divide-[var(--rootsy-bruma-200)] overflow-hidden rounded-[var(--radius-medium)] border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)]">
          <div className="flex flex-col justify-center px-3 py-3">
            <p className={metaLabelClass}>Turno</p>
            <p className={cn("mt-1 text-base", metricMdClass)}>
              {moneyOrDash(data.isOpen ? data.totalTurno : null)}
            </p>
          </div>
          <div className="flex flex-col justify-center px-3 py-3">
            <p className={metaLabelClass}>Efectivo</p>
            <p className={cn("mt-1 text-base", metricMdClass)}>
              {moneyOrDash(data.isOpen ? data.efectivoEnCaja : null)}
            </p>
          </div>
        </div>
      </div>

      {data.isOpen ? (
        <ProposalCashOpenFooterMinimal message="Turno en curso" />
      ) : (
        <ProposalCashClosedFooter />
      )}
    </article>
  )
}

const CASH_PROPOSAL_CARDS = {
  "caja-banda-turno": BlocksProposalCashBandaTurnoCard,
  "caja-loseta-cerrada": BlocksProposalCashLosetaCerradaCard,
  "caja-kpi-compacto": BlocksProposalCashKpiCompactoCard,
} as const

function LayoutsBlocksProposalSpecTable({
  title,
  rows,
}: {
  title: string
  rows: readonly LayoutsBlocksProposalSpecRow[]
}) {
  return (
    <FoundationSpecCard className="space-y-3">
      <p className="font-canopy text-xs font-semibold text-[var(--rootsy-bruma-900)]">{title}</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--rootsy-bruma-200)]">
              {["Propuesta", "Muestra", "Elevación", "Idea"].map((heading) => (
                <th
                  key={heading}
                  className="px-2 py-2 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--rootsy-bruma-500)] first:pl-0"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-[var(--rootsy-bruma-200)]/70 align-top">
                <td className="py-2.5 pr-3 font-canopy text-xs font-semibold text-[var(--rootsy-bruma-900)]">
                  {row.label}
                </td>
                <td className="py-2.5 pr-3 font-canopy text-xs text-[var(--rootsy-bruma-500)]">
                  {row.sample}
                </td>
                <td className="max-w-[10rem] py-2.5 pr-3 font-mono text-[10px] leading-relaxed text-[var(--rootsy-bruma-900)]">
                  {row.elevationToken}
                </td>
                <td className="py-2.5 font-canopy text-[11px] leading-relaxed text-[var(--rootsy-bruma-500)]">
                  {row.layoutIdea}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FoundationSpecCard>
  )
}

/** 3 · Nuevas propuestas — 3 cuentas + 3 cajas · fundamentos Rootsy. */
export function LayoutsBlocksProposalsSectionDemo() {
  return (
    <div className="space-y-8">
      <FoundationSpecCard className="space-y-2">
        <p className="font-canopy text-xs leading-relaxed text-[var(--rootsy-bruma-500)]">
          Seis exploraciones estáticas — tres para cuentas (con isotipo y gradiente de marca real) y
          tres para cajas. Sin componentes de producto ni tokens legacy.
        </p>
        <p className="font-mono text-[10px] text-[var(--rootsy-bruma-500)]">
          Fondo · {LAYOUTS_BLOCKS_PROPOSAL_FOUNDATIONS.contentBackgroundToken} · gap{" "}
          {LAYOUTS_BLOCKS_PROPOSAL_FOUNDATIONS.gridGapToken} ({LAYOUTS_BLOCKS_PROPOSAL_FOUNDATIONS.gridGapPx}px)
        </p>
      </FoundationSpecCard>

      <LayoutsBlocksDocSubsection
        title="Cuentas · tres propuestas"
        description="Paridad con producto: isotipo de marca · tipo · nombre · menú de opciones · saldo real · a liquidar · a pagar. Sin pills POS/tarjeta. Tres lecturas de elevación — loseta · cabecera de marca · elevada."
      >
        <LayoutsBlocksProposalSpecTable title="Spec · cuentas" rows={LAYOUTS_BLOCKS_ACCOUNT_PROPOSAL_ROWS} />
        <div className="overflow-hidden rounded-[var(--radius-xlarge)] border border-[var(--rootsy-bruma-200)]">
          <ProposalScope>
            <ProposalGrid>
              {LAYOUTS_BLOCKS_ACCOUNT_PROPOSAL_ROWS.map((spec) => {
                const Card = ACCOUNT_PROPOSAL_CARDS[spec.id]
                const data = PROPOSAL_ACCOUNTS[spec.id]
                return (
                  <div key={spec.id} className="flex flex-col gap-2">
                    <Card data={data} />
                    <ProposalCardCaption spec={spec} />
                  </div>
                )
              })}
            </ProposalGrid>
          </ProposalScope>
        </div>
      </LayoutsBlocksDocSubsection>

      <LayoutsBlocksDocSubsection
        title="Cajas · tres propuestas"
        description="Cada propuesta en variante abierta y cerrada — menú ⋮ con acciones de turno y administración · pie fijo 4.75rem para igualar altura entre estados."
      >
        <LayoutsBlocksProposalSpecTable title="Spec · cajas" rows={LAYOUTS_BLOCKS_CASH_PROPOSAL_ROWS} />
        <div className="space-y-8">
          {LAYOUTS_BLOCKS_CASH_PROPOSAL_ROWS.map((spec) => {
            const Card = CASH_PROPOSAL_CARDS[spec.id]
            const baseName = PROPOSAL_CASH_NAMES[spec.id]
            const variants = [
              {
                key: "abierta",
                data: { ...PROPOSAL_CASH_OPEN_DEMO, name: baseName },
              },
              {
                key: "cerrada",
                data: { ...PROPOSAL_CASH_CLOSED_DEMO, name: baseName },
              },
            ] as const

            return (
              <div key={spec.id} className="space-y-3">
                <p className="font-canopy text-sm font-semibold text-[var(--rootsy-bruma-900)]">
                  {spec.label}
                </p>
                <div className="overflow-hidden rounded-[var(--radius-xlarge)] border border-[var(--rootsy-bruma-200)]">
                  <ProposalScope>
                    <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
                      {variants.map(({ key, data }) => (
                        <div key={key} className="flex flex-col gap-2">
                          <Card data={data} />
                          <ProposalCardCaption
                            spec={{
                              ...spec,
                              sample: `${baseName} · ${key}`,
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </ProposalScope>
                </div>
              </div>
            )
          })}
        </div>
      </LayoutsBlocksDocSubsection>
    </div>
  )
}
