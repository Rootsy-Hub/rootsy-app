"use client"

import "@/app/library/layouts/layoutsOperarTheme.css"
import "@/app/library/libraryColorTheme.css"
import "@/app/library/mundos/mundosHerramientas.css"
import "@/app/library/radius/rootsyRadiusSystem.css"
import "@/components/data-workspace/dataWorkspaceBlocksAtmosphere.css"
import "@/components/data-workspace/dataWorkspaceBlocksAtmosphereBrumaOscura.css"
import { MundosHerramientasCards } from "@/app/library/mundos/MundosHerramientasCard"
import { HomeWorkspaceBackdrop } from "@/components/layouts/HomeWorkspaceBackdrop"
import { HomeSubtleButton } from "@/app/home/HomeSubtleButton"
import {
  LayoutsOperarProductCardDemoCanvas,
  LayoutsOperarProductCardProposalGrid,
  LAYOUTS_OPERAR_DEMO_ARTICLE,
  LAYOUTS_OPERAR_DEMO_ARTICLE_OFFER,
} from "@/app/library/layouts/LayoutsOperarProductCardProposalPrimitives"
import { LayoutsOperarToolboxProposalBand } from "@/app/library/layouts/LayoutsOperarToolboxProposalPrimitives"
import { LAYOUTS_OPERAR_DEFAULT_TOOLBOX_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import { layoutsOperarBodyScopeClass } from "@/app/library/layouts/layoutsOperarStyles"
import {
  libraryNavItemActiveClass,
  libraryNavItemClass,
  libraryNavItemIconClass,
  libraryNavItemLabelClass,
  libraryNavSurfaceDarkClass,
  librarySidebarClass,
} from "@/app/library/libraryColorTheme"
import {
  LibraryDocLead,
  LibraryDocSection,
} from "@/app/library/libraryDocPrimitives"
import {
  eterHeaderBodyClass,
  eterHeaderMutedClass,
  eterHeaderTitleClass,
} from "@/lib/eter/eterChrome"
import {
  rootsyLayoutsEarthFloorBandClass,
  rootsyLayoutsEarthFloorBorderClass,
  rootsyLayoutsEarthFloorShadowClass,
  rootsyLayoutsEarthFloorSurfaceClass,
} from "@/app/library/layouts/rootsyLayoutsEarthFloor"
import {
  layoutsTablesChromeIconButtonClass,
  layoutsTablesFooterCountStrongClass,
  layoutsTablesFooterCountTextClass,
  layoutsTablesFooterNavClusterClass,
  layoutsTablesFooterPageLabelClass,
} from "@/components/layouts-tables/rootsLayoutsTablesProductStyles"
import {
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardHeaderClass,
  dataWorkspaceEntityCardIsotypeClass,
  dataWorkspaceEntityCardLosetaSurfaceClass,
  dataWorkspaceEntityCardSaldoSectionClass,
  dataWorkspaceEntityCardStatLabelClass,
  dataWorkspaceEntityCardStatValueLargeClass,
  dataWorkspaceEntityCardStatusOpenClass,
  dataWorkspaceEntityCardTitleClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { getRootsModuleIcon } from "@/lib/rootsyModuleIcons"
import { STATISTICS_SECTIONS } from "@/lib/statisticsCatalog"
import {
  menuRealmLightMutedClass,
  menuRealmTitleClass,
} from "@/lib/menu/menuHoloStyles"
import { cn } from "@/lib/utils"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Landmark,
  Wallet,
} from "lucide-react"
import type { ReactNode } from "react"

export {
  LibraryDocLead as MundosDocLead,
  LibraryDocSection as MundosDocSection,
}

export function MundosWorldStage({
  children,
  className,
  label,
}: {
  children: ReactNode
  className?: string
  label: string
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "h-[26rem] sm:h-[28rem]",
        className,
      )}
      aria-label={label}
    >
      {children}
    </div>
  )
}

function MundosEterStage() {
  return (
    <MundosWorldStage label="Mundo Éter — home y header">
      <HomeWorkspaceBackdrop />

      <div className="relative z-10 flex h-full flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between px-4 sm:h-16 sm:px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/rootsy-logo.svg"
            alt=""
            className="h-7 w-auto sm:h-8"
          />
          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p
                className={cn(
                  "font-canopy text-[length:var(--rootsy-text-body-size)] leading-[var(--rootsy-text-body-lh)]",
                  eterHeaderBodyClass,
                )}
              >
                Ana
              </p>
              <p
                className={cn(
                  "font-canopy text-[length:var(--rootsy-text-body-small-size)] leading-[var(--rootsy-text-body-small-lh)]",
                  eterHeaderMutedClass,
                )}
              >
                Cuenta
              </p>
            </div>
            <span
              className="flex size-8 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--rootsy-eter-100)_14%,transparent)] ring-1 ring-[color-mix(in_srgb,var(--rootsy-eter-100)_16%,transparent)]"
              aria-hidden
            >
              <span
                className={cn(
                  "font-canopy text-[length:var(--rootsy-text-body-small-size)]",
                  eterHeaderTitleClass,
                )}
              >
                A
              </span>
            </span>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-4">
          <p
            className={cn(
              "font-canopy text-[length:var(--rootsy-text-heading-medium-size)] leading-[var(--rootsy-text-heading-medium-lh)] sm:text-[length:var(--rootsy-text-heading-large-size)] sm:leading-[var(--rootsy-text-heading-large-lh)]",
              menuRealmTitleClass,
            )}
          >
            Hola, Ana
          </p>
          <p
            className={cn(
              "mt-1 font-canopy text-[length:var(--rootsy-text-body-size)] leading-[var(--rootsy-text-body-lh)]",
              menuRealmLightMutedClass,
            )}
          >
            A qué punto de venta querés ingresar?
          </p>

          <ul className="mt-6 flex list-none items-start justify-center gap-6">
            {[
              { name: "Narciso", initials: "NA", lit: true },
              { name: "Café del Parque", initials: "CF", lit: false },
            ].map((pop) => (
              <li key={pop.name} className="flex w-[6.5rem] flex-col items-center">
                <span
                  className={cn(
                    "flex size-16 items-center justify-center rounded-full bg-linear-to-br from-amber-400 via-yellow-500 to-orange-600 shadow-xl ring-2 ring-white/14",
                    !pop.lit && "opacity-70",
                  )}
                  aria-hidden
                >
                  <span className="font-canopy text-[length:var(--rootsy-text-heading-small-size)] tracking-tight text-white">
                    {pop.initials}
                  </span>
                </span>
                <span
                  className={cn(
                    "mt-3 text-center font-canopy text-[length:var(--rootsy-text-body-small-size)] leading-snug",
                    pop.lit ? "text-white/78" : "text-white/50",
                  )}
                >
                  {pop.name}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <footer className="flex shrink-0 justify-center px-4 pb-4">
          <HomeSubtleButton withIcon tabIndex={-1} aria-hidden>
            <Download className="size-4" aria-hidden />
            Descargar app
          </HomeSubtleButton>
        </footer>
      </div>
    </MundosWorldStage>
  )
}

function MundosBrumaAccountCard({
  eyebrow,
  title,
  amount,
  open,
}: {
  eyebrow: string
  title: string
  amount: string
  open?: boolean
}) {
  return (
    <article className={dataWorkspaceEntityCardLosetaSurfaceClass}>
      <div className={dataWorkspaceEntityCardHeaderClass}>
        <div className="flex items-start gap-3">
          <span className={dataWorkspaceEntityCardIsotypeClass} aria-hidden>
            {open ? (
              <Wallet className="size-5" />
            ) : (
              <Landmark className="size-5" />
            )}
          </span>
          <div className="min-w-0">
            <p className={dataWorkspaceEntityCardEyebrowClass}>{eyebrow}</p>
            <p className={dataWorkspaceEntityCardTitleClass}>{title}</p>
          </div>
        </div>
      </div>
      <div className={dataWorkspaceEntityCardSaldoSectionClass}>
        <p className={dataWorkspaceEntityCardStatLabelClass}>Saldo</p>
        <p className={dataWorkspaceEntityCardStatValueLargeClass}>{amount}</p>
        {open ? (
          <p className={cn("mt-2", dataWorkspaceEntityCardStatusOpenClass)}>
            Abierta
          </p>
        ) : (
          <p
            className={cn(
              "mt-2 font-canopy text-[length:var(--rootsy-text-body-small-size)] text-[var(--rootsy-bruma-500)]",
            )}
          >
            Banco
          </p>
        )}
      </div>
    </article>
  )
}

function MundosBrumaStage() {
  return (
    <MundosWorldStage label="Mundo Bruma — cuentas y cajas">
      <div className="data-workspace-blocks-atmosphere flex h-full flex-col">
        <div className="relative z-1 flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-4 py-5 sm:px-6">
          <p className="font-canopy text-[length:var(--rootsy-text-heading-small-size)] leading-[var(--rootsy-text-heading-small-lh)] text-[var(--rootsy-bruma-900)]">
            Cuentas
          </p>
          <div className="grid min-h-0 grid-cols-1 gap-4 sm:grid-cols-2">
            <MundosBrumaAccountCard
              eyebrow="Caja"
              title="Caja mostrador"
              amount="$ 48.320"
              open
            />
            <MundosBrumaAccountCard
              eyebrow="Banco"
              title="Galicia · operativa"
              amount="$ 1.284.500"
            />
          </div>
        </div>
      </div>
    </MundosWorldStage>
  )
}

function MundosBrumaOscuraAccountCard({
  eyebrow,
  title,
  amount,
  open,
}: {
  eyebrow: string
  title: string
  amount: string
  open?: boolean
}) {
  return (
    <article className="relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[1.375rem] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_1px_0_color-mix(in_srgb,var(--rootsy-bruma-50)_7%,transparent)]">
      <div className="border-b border-[var(--color-border)] px-4 py-4">
        <div className="flex items-start gap-3">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-elevated)] text-[var(--color-text-secondary)]"
            aria-hidden
          >
            {open ? <Wallet className="size-5" /> : <Landmark className="size-5" />}
          </span>
          <div className="min-w-0">
            <p className="font-canopy text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
              {eyebrow}
            </p>
            <p className="font-canopy text-base font-semibold text-[var(--color-text-primary)]">
              {title}
            </p>
          </div>
        </div>
      </div>
      <div className="px-4 py-4">
        <p className="font-canopy text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
          Saldo
        </p>
        <p className="block min-w-0 truncate font-numeric text-2xl font-bold tabular-nums tracking-tight text-[var(--color-text-primary)]">
          {amount}
        </p>
        {open ? (
          <p className="mt-2 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--rootsy-savia-400)_28%,var(--color-border))] bg-[color-mix(in_srgb,var(--rootsy-savia-600)_16%,var(--color-surface))] px-2.5 py-1 font-canopy text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--rootsy-savia-300)]">
            Abierta
          </p>
        ) : (
          <p className="mt-2 font-canopy text-[length:var(--rootsy-text-body-small-size)] text-[var(--color-text-secondary)]">
            Banco
          </p>
        )}
      </div>
    </article>
  )
}

function MundosBrumaOscuraStage() {
  return (
    <MundosWorldStage label="Mundo Bruma oscura — cuentas y cajas">
      <div className="rootsy-theme-bruma-oscura data-workspace-blocks-atmosphere-bruma-oscura flex h-full flex-col">
        <div className="relative z-1 flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-4 py-5 sm:px-6">
          <p className="font-canopy text-[length:var(--rootsy-text-heading-small-size)] leading-[var(--rootsy-text-heading-small-lh)] text-[var(--color-text-primary)]">
            Cuentas
          </p>
          <div className="grid min-h-0 grid-cols-1 gap-4 sm:grid-cols-2">
            <MundosBrumaOscuraAccountCard
              eyebrow="Caja"
              title="Caja mostrador"
              amount="$ 48.320"
              open
            />
            <MundosBrumaOscuraAccountCard
              eyebrow="Banco"
              title="Galicia · operativa"
              amount="$ 1.284.500"
            />
          </div>
        </div>
      </div>
    </MundosWorldStage>
  )
}

function MundosSueloStage() {
  return (
    <MundosWorldStage label="Mundo Suelo — toolbox y pie de tablas">
      <div
        className={cn(
          "rootsy-theme-pos rootsy-radius-system flex h-full flex-col bg-[var(--rootsy-sombra-800)]",
          layoutsOperarBodyScopeClass,
        )}
      >
        <div className="flex min-h-0 flex-1 items-end px-4 pb-3">
          <p className="font-canopy text-[length:var(--rootsy-text-body-small-size)] leading-[var(--rootsy-text-body-small-lh)] text-[color-mix(in_srgb,var(--rootsy-sombra-300)_72%,transparent)]">
            Catálogo · sombra arriba · el suelo sostiene
          </p>
        </div>

        <LayoutsOperarToolboxProposalBand
          proposalId={LAYOUTS_OPERAR_DEFAULT_TOOLBOX_PROPOSAL}
        />

        <div
          className={cn(
            "flex h-14 shrink-0 items-center",
            rootsyLayoutsEarthFloorBandClass,
            rootsyLayoutsEarthFloorSurfaceClass,
            rootsyLayoutsEarthFloorBorderClass,
            rootsyLayoutsEarthFloorShadowClass,
          )}
        >
          <div className="grid h-full w-full grid-cols-[1fr_auto_1fr] items-center gap-3 px-4">
            <p className={layoutsTablesFooterCountTextClass}>
              <span className={layoutsTablesFooterCountStrongClass}>24</span>{" "}
              artículos
            </p>
            <div className={layoutsTablesFooterNavClusterClass}>
              <span className={layoutsTablesChromeIconButtonClass} aria-hidden>
                <ChevronLeft className="size-4" />
              </span>
              <span className={layoutsTablesFooterPageLabelClass}>1 / 3</span>
              <span className={layoutsTablesChromeIconButtonClass} aria-hidden>
                <ChevronRight className="size-4" />
              </span>
            </div>
            <span className="hidden justify-self-end sm:inline" />
          </div>
        </div>
      </div>
    </MundosWorldStage>
  )
}

const MUNDOS_STATS_NAV_DEMO = STATISTICS_SECTIONS.slice(0, 5)

function MundosSombraStage() {
  return (
    <MundosWorldStage label="Mundo Sombra — catálogo y rail de estadísticas">
      <div className="flex h-full min-w-0">
        <aside
          className={cn(
            "flex w-[11.5rem] shrink-0 flex-col overflow-hidden border-r sm:w-56",
            librarySidebarClass,
            libraryNavSurfaceDarkClass,
          )}
        >
          <nav className="library-nav min-h-0 flex-1 overflow-hidden p-3" aria-hidden>
            <p className="library-nav-group-label px-2">Estadísticas</p>
            <ul className="library-nav-list" role="presentation">
              {MUNDOS_STATS_NAV_DEMO.map((section, index) => {
                const Icon = getRootsModuleIcon(section.iconModuleKey)
                return (
                  <li key={section.id}>
                    <span
                      className={cn(
                        libraryNavItemClass,
                        index === 0 && libraryNavItemActiveClass,
                      )}
                    >
                      <Icon className={libraryNavItemIconClass} />
                      <span className={libraryNavItemLabelClass}>{section.label}</span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <LayoutsOperarProductCardDemoCanvas className="flex h-full flex-col rounded-none border-0 p-4">
            <p className="mb-3 font-canopy text-[length:var(--rootsy-text-body-small-size)] leading-[var(--rootsy-text-body-small-lh)] text-[color-mix(in_srgb,var(--rootsy-sombra-300)_80%,transparent)]">
              Catálogo · Operar
            </p>
            <div className="grid min-h-0 grid-cols-2 gap-3">
              <LayoutsOperarProductCardProposalGrid
                product={LAYOUTS_OPERAR_DEMO_ARTICLE}
              />
              <LayoutsOperarProductCardProposalGrid
                product={LAYOUTS_OPERAR_DEMO_ARTICLE_OFFER}
              />
            </div>
          </LayoutsOperarProductCardDemoCanvas>
        </div>
      </div>
    </MundosWorldStage>
  )
}

function MundosHerramientasStage() {
  return (
    <MundosWorldStage
      label="Mundo Herramientas de Rootsy — paisaje, cristal y flat"
      className="h-[42rem] sm:h-[44rem]"
    >
      <div className="mundos-herramientas-stage absolute inset-0" />
      <div className="relative z-10 flex h-full flex-wrap items-center gap-4 overflow-visible px-4 py-6 sm:gap-6 sm:px-6">
        <MundosHerramientasCards />
      </div>
    </MundosWorldStage>
  )
}

const WORLD_STAGES: Record<
  "eter" | "bruma" | "bruma-oscura" | "suelo" | "sombra" | "herramientas",
  () => ReactNode
> = {
  eter: MundosEterStage,
  bruma: MundosBrumaStage,
  "bruma-oscura": MundosBrumaOscuraStage,
  suelo: MundosSueloStage,
  sombra: MundosSombraStage,
  herramientas: MundosHerramientasStage,
}

export function MundosWorldGallery({
  worldId,
}: {
  worldId: keyof typeof WORLD_STAGES
}) {
  const Stage = WORLD_STAGES[worldId]
  return <Stage />
}
