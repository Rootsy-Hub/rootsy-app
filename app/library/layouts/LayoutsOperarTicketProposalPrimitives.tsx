"use client"

import "@/app/library/layouts/layoutsOperarTheme.css"
import "@/app/library/radius/rootsyRadiusSystem.css"
import {
  layoutsOperarSummaryActionConfirmColClass,
  layoutsOperarSummaryActionDiscardColClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  getLayoutsOperarGridCssVariables,
  getLayoutsOperarTicketProposal,
  layoutsOperarTicketProposalActionDiscardClass,
  layoutsOperarTicketProposalActionSellClass,
  layoutsOperarTicketProposalActionsClass,
  layoutsOperarTicketProposalCartListClass,
  layoutsOperarTicketProposalCartRowClass,
  layoutsOperarTicketProposalHeaderClass,
  layoutsOperarTicketProposalLineAmountClass,
  layoutsOperarTicketProposalLineCommentClass,
  layoutsOperarTicketProposalLineGridClass,
  layoutsOperarTicketProposalLineNameClass,
  layoutsOperarTicketProposalLineThumbClass,
  layoutsOperarTicketProposalPanelClass,
  layoutsOperarTicketProposalPromoBadgeClass,
  layoutsOperarTicketProposalPromoBannerClass,
  layoutsOperarTicketProposalQtyClass,
  layoutsOperarTicketProposalTotalsBreakdownAmountClass,
  layoutsOperarTicketProposalTotalsBreakdownLabelClass,
  layoutsOperarTicketProposalTotalsDividerClass,
  layoutsOperarTicketProposalTotalsGridClass,
  layoutsOperarTicketProposalTotalsHeadingClass,
  layoutsOperarTicketProposalTotalsMainAmountClass,
  layoutsOperarTicketProposalTotalsMainLabelClass,
  layoutsOperarTicketProposalTotalsShellClass,
  type LayoutsOperarTicketProposalId,
} from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import {
  layoutsOperarBodyScopeClass,
  layoutsOperarSummaryCartTitleClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL,
  ROOTSY_LAYOUTS_OPERAR_TICKET_PROPOSALS,
  type LayoutsOperarTicketProposal,
} from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import { formatOperarTicketQuantity } from "@/components/sale-operation/CartLineQuantityLabel"
import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"
import { Banknote, MessageSquare, Percent, Tag } from "lucide-react"

type DemoTicketLine = {
  id: string
  cantidad: number
  nombre: string
  descripcion?: string
  precio: number
  hidePrice?: boolean
  comment?: string
}

type DemoTicketGroup = {
  id: string
  variant: "promotion" | "discount"
  label: string
  discountMode?: "porcentaje" | "fijo"
  discountAmount: number
  finalTotal: number
  lines: DemoTicketLine[]
}

type DemoTicketEntry =
  | { kind: "line"; line: DemoTicketLine }
  | { kind: "group"; group: DemoTicketGroup }

export const LAYOUTS_OPERAR_DEMO_TICKET_ENTRIES: DemoTicketEntry[] = [
  {
    kind: "line",
    line: {
      id: "cafe",
      cantidad: 1,
      nombre: "Café en grano 250 g",
      precio: 4500,
    },
  },
  {
    kind: "line",
    line: {
      id: "leche",
      cantidad: 2,
      nombre: "Leche entera 1 L",
      descripcion: "La Serenísima",
      precio: 1850,
      comment: "Fría de heladera",
    },
  },
  {
    kind: "group",
    group: {
      id: "desc-panaderia",
      variant: "discount",
      label: "15% off panadería",
      discountMode: "porcentaje",
      discountAmount: 560,
      finalTotal: 3200,
      lines: [
        {
          id: "medialunas",
          cantidad: 6,
          nombre: "Medialunas",
          precio: 626.67,
          hidePrice: true,
        },
      ],
    },
  },
  {
    kind: "group",
    group: {
      id: "promo-bebidas",
      variant: "promotion",
      label: "2×1 bebidas",
      discountAmount: 800,
      finalTotal: 2400,
      lines: [
        {
          id: "agua",
          cantidad: 2,
          nombre: "Agua sin gas 500 ml",
          precio: 800,
          hidePrice: true,
        },
        {
          id: "gaseosa",
          cantidad: 2,
          nombre: "Gaseosa cola 500 ml",
          precio: 800,
          hidePrice: true,
        },
      ],
    },
  },
  {
    kind: "line",
    line: {
      id: "pan",
      cantidad: 1,
      nombre: "Pan lactal",
      precio: 2800,
    },
  },
]

export const LAYOUTS_OPERAR_DEMO_TICKET_TOTALS = {
  subtotalOriginal: 17960,
  descuentoItemsMonto: 560,
  promocionesAplicadasMonto: 800,
  promocionesAplicadasCount: 1,
  descuentoGeneralMonto: 500,
  total: 16100,
} as const

function countDemoTicketLines(entries: DemoTicketEntry[]) {
  return entries.reduce((count, entry) => {
    if (entry.kind === "line") return count + 1
    return count + entry.group.lines.length
  }, 0)
}

export function LayoutsOperarTicketDemoShell({
  children,
  heightClass = "h-[32rem]",
  className,
}: {
  children: React.ReactNode
  heightClass?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "library-doc-table-shell overflow-hidden rounded-2xl",
        heightClass,
        className,
      )}
    >
      <div
        className={cn("rootsy-theme-pos rootsy-radius-system h-full", layoutsOperarBodyScopeClass)}
        style={getLayoutsOperarGridCssVariables()}
      >
        {children}
      </div>
    </div>
  )
}

export function LayoutsOperarTicketProposalMeta({
  proposal,
}: {
  proposal: LayoutsOperarTicketProposal
}) {
  return (
    <div className="space-y-2 rounded-xl border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex size-7 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--rootsy-savia-600)_10%,transparent)] font-mono text-xs font-bold text-[var(--rootsy-savia-600)]">
          {proposal.letter}
        </span>
        <h5 className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">{proposal.title}</h5>
        {proposal.recommended ? (
          <span className="rounded-full bg-[color-mix(in_srgb,var(--rootsy-savia-600)_10%,transparent)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--rootsy-savia-600)]">
            Recomendada
          </span>
        ) : null}
      </div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--rootsy-bruma-500)]">
        {proposal.pairingLabel}
      </p>
      <p className="text-sm text-[var(--rootsy-bruma-500)]">{proposal.summary}</p>
      <p className="text-xs leading-relaxed text-[var(--rootsy-bruma-500)]/90">{proposal.uxNote}</p>
    </div>
  )
}

function LayoutsOperarTicketProposalLine({
  proposalId,
  line,
  omitHiddenPricePlaceholder = false,
}: {
  proposalId: LayoutsOperarTicketProposalId
  line: DemoTicketLine
  omitHiddenPricePlaceholder?: boolean
}) {
  const lineTotal = line.precio * line.cantidad
  const comment = line.comment?.trim() ?? ""

  return (
    <div className="w-full">
      <div className={layoutsOperarTicketProposalLineGridClass(proposalId)}>
        <span
          className={layoutsOperarTicketProposalLineThumbClass(proposalId)}
          aria-hidden
        />
        <span className="min-w-0">
          <span className={layoutsOperarTicketProposalLineNameClass(proposalId)}>{line.nombre}</span>
          {!line.hidePrice ? (
            <span
              className={cn(
                "mt-0.5 block",
                layoutsOperarTicketProposalLineAmountClass(proposalId),
              )}
            >
              {saleOpFmt.format(lineTotal)}
            </span>
          ) : omitHiddenPricePlaceholder ? null : (
            <span className="mt-0.5 block text-sm font-medium text-[var(--layouts-operar-light-cart-line-meta)]">
              —
            </span>
          )}
        </span>
        <span className={layoutsOperarTicketProposalQtyClass(proposalId)}>
          {formatOperarTicketQuantity(line.cantidad, "unidad")}
        </span>
      </div>
      {comment ? (
        <div className={layoutsOperarTicketProposalLineCommentClass(proposalId)}>
          <MessageSquare
            className="mr-1 inline size-3 -translate-y-px text-[var(--layouts-operar-light-cart-line-meta)]"
            aria-hidden
          />
          {comment}
        </div>
      ) : null}
    </div>
  )
}

function LayoutsOperarTicketProposalGroupBanner({
  proposalId,
  group,
}: {
  proposalId: LayoutsOperarTicketProposalId
  group: DemoTicketGroup
}) {
  const isDiscount = group.variant === "discount"
  const isFixedDiscount = isDiscount && group.discountMode === "fijo"

  return (
    <div className={layoutsOperarTicketProposalPromoBannerClass(proposalId, group.variant)}>
      <div className="col-span-2 flex min-w-0 items-center gap-1.5">
        {isDiscount ? (
          isFixedDiscount ? (
            <Banknote className="size-3 shrink-0 opacity-80" aria-hidden />
          ) : (
            <Percent className="size-3 shrink-0 opacity-80" aria-hidden />
          )
        ) : (
          <Tag className="size-3 shrink-0 opacity-80" aria-hidden />
        )}
        <span className="truncate text-[10px] font-semibold uppercase tracking-[0.1em]">
          {group.label}
        </span>
        {group.discountAmount > 0 ? (
          <span className={layoutsOperarTicketProposalPromoBadgeClass(proposalId, group.variant)}>
            −{saleOpFmt.format(group.discountAmount)}
          </span>
        ) : null}
      </div>
      <span className={cn(layoutsOperarTicketProposalLineAmountClass(proposalId), "pt-0.5 text-right")}>
        {saleOpFmt.format(group.finalTotal)}
      </span>
    </div>
  )
}

function LayoutsOperarTicketProposalTotalsBar({
  proposalId,
}: {
  proposalId: LayoutsOperarTicketProposalId
}) {
  const totals = LAYOUTS_OPERAR_DEMO_TICKET_TOTALS
  const showItemsDiscount = totals.descuentoItemsMonto > 0
  const showPromociones = totals.promocionesAplicadasMonto > 0
  const showGeneralDiscount = totals.descuentoGeneralMonto > 0
  return (
    <div
      role="region"
      aria-label="Por cobrar"
      className={layoutsOperarTicketProposalTotalsShellClass(proposalId)}
    >
      <h3 className={layoutsOperarTicketProposalTotalsHeadingClass(proposalId)}>
        Por cobrar
      </h3>
      <div className={layoutsOperarTicketProposalTotalsGridClass(proposalId)}>
        <span className={layoutsOperarTicketProposalTotalsBreakdownLabelClass(proposalId)}>
          Subtotal
        </span>
        <p className={layoutsOperarTicketProposalTotalsBreakdownAmountClass(proposalId)}>
          {saleOpFmt.format(totals.subtotalOriginal)}
        </p>
        {showItemsDiscount ? (
          <>
            <span className={layoutsOperarTicketProposalTotalsBreakdownLabelClass(proposalId)}>
              Descuento ítems
            </span>
            <p
              className={layoutsOperarTicketProposalTotalsBreakdownAmountClass(
                proposalId,
                "discount",
              )}
            >
              −{saleOpFmt.format(totals.descuentoItemsMonto)}
            </p>
          </>
        ) : null}
        {showPromociones ? (
          <>
            <span className={layoutsOperarTicketProposalTotalsBreakdownLabelClass(proposalId)}>
              Promociones aplicadas ({totals.promocionesAplicadasCount})
            </span>
            <p
              className={layoutsOperarTicketProposalTotalsBreakdownAmountClass(
                proposalId,
                "discount",
              )}
            >
              −{saleOpFmt.format(totals.promocionesAplicadasMonto)}
            </p>
          </>
        ) : null}
        {showGeneralDiscount ? (
          <>
            <span className={layoutsOperarTicketProposalTotalsBreakdownLabelClass(proposalId)}>
              Descuento general
            </span>
            <p
              className={layoutsOperarTicketProposalTotalsBreakdownAmountClass(
                proposalId,
                "discount",
              )}
            >
              −{saleOpFmt.format(totals.descuentoGeneralMonto)}
            </p>
          </>
        ) : null}
        <div className={layoutsOperarTicketProposalTotalsDividerClass(proposalId)} aria-hidden />
        <p className={layoutsOperarTicketProposalTotalsMainLabelClass(proposalId)}>
          Total
        </p>
        <p
          className={layoutsOperarTicketProposalTotalsMainAmountClass(proposalId)}
          aria-live="polite"
          aria-atomic="true"
        >
          {saleOpFmt.format(totals.total)}
        </p>
      </div>
    </div>
  )
}

/** Ticket completo — ítems demo + acciones + totales con desglose. */
export function LayoutsOperarTicketProposalPanel({
  proposalId = LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL,
  placement = "standalone",
  measureBadge,
}: {
  proposalId?: LayoutsOperarTicketProposalId
  placement?: "grid" | "standalone"
  measureBadge?: React.ReactNode
}) {
  const proposal = getLayoutsOperarTicketProposal(proposalId)
  const lineCount = countDemoTicketLines(LAYOUTS_OPERAR_DEMO_TICKET_ENTRIES)

  return (
    <aside
      className={layoutsOperarTicketProposalPanelClass(proposalId, placement)}
      aria-label="Carrito de la venta"
    >
      {measureBadge}
      <div className="layouts-operar-scroll-minimal row-start-1 min-h-0 overflow-y-auto">
        <div className={layoutsOperarTicketProposalHeaderClass(proposalId)}>
          <h2 className={layoutsOperarSummaryCartTitleClass}>Pedido</h2>
        </div>

        <div
          className={cn(
            layoutsOperarTicketProposalCartRowClass(proposalId),
            layoutsOperarTicketProposalCartListClass(proposalId),
          )}
        >
          {LAYOUTS_OPERAR_DEMO_TICKET_ENTRIES.map((entry) => {
            if (entry.kind === "line") {
              return (
                <LayoutsOperarTicketProposalLine
                  key={entry.line.id}
                  proposalId={proposalId}
                  line={entry.line}
                />
              )
            }

            return (
              <div key={entry.group.id}>
                <LayoutsOperarTicketProposalGroupBanner
                  proposalId={proposalId}
                  group={entry.group}
                />
                {entry.group.lines.map((line) => (
                  <LayoutsOperarTicketProposalLine
                    key={line.id}
                    proposalId={proposalId}
                    line={line}
                    omitHiddenPricePlaceholder
                  />
                ))}
              </div>
            )
          })}
        </div>
        <LayoutsOperarTicketProposalTotalsBar proposalId={proposalId} />
      </div>

      <div className={layoutsOperarTicketProposalActionsClass(proposalId)}>
        <div className={layoutsOperarSummaryActionDiscardColClass}>
          <div
            className={cn(
              layoutsOperarTicketProposalActionDiscardClass(proposalId),
              "h-full w-full",
            )}
          >
            Descartar
          </div>
        </div>
        <div className={layoutsOperarSummaryActionConfirmColClass}>
          <div
            className={cn(
              layoutsOperarTicketProposalActionSellClass(proposalId),
              "h-full w-full",
            )}
          >
            Vender
          </div>
        </div>
      </div>

      <p className="sr-only">
        Propuesta {proposal.letter} · totales {proposal.totalsLayout} · {lineCount} líneas demo
      </p>
    </aside>
  )
}

/** Demo §4.1 — tres propuestas lado a lado. */
export function LayoutsOperarTicketProposalsDemo() {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      {ROOTSY_LAYOUTS_OPERAR_TICKET_PROPOSALS.map((proposal) => (
        <div key={proposal.id} className="space-y-3">
          <LayoutsOperarTicketProposalMeta proposal={proposal} />
          <LayoutsOperarTicketDemoShell>
            <LayoutsOperarTicketProposalPanel proposalId={proposal.id} />
          </LayoutsOperarTicketDemoShell>
        </div>
      ))}
    </div>
  )
}
