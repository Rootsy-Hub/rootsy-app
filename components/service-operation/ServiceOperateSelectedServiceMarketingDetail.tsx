"use client"

import type {
  ServiceTypeChargeAddonOption,
  ServiceTypeChargeDetail,
  ServiceTypeChargeDetailArticle,
  ServiceTypeChargeOption,
} from "@/app/[siteId]/[popId]/active-services/actions"
import { LayoutsOperarProductCardMediaEmptyState } from "@/app/library/layouts/LayoutsOperarProductCardProposalPrimitives"
import {
  layoutsOperarFormDarkMutedTextClass,
  layoutsOperarFormDarkSecondaryButtonClass,
  layoutsOperarFormDarkSectionLabelClass,
  layoutsOperarProductCardDescClass,
  layoutsOperarProductCardPriceClass,
  layoutsOperarProductCardTitleClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { ServiceOperateSelectedServiceDetailSkeleton } from "@/components/service-operation/ServiceOperateSelectedServiceDetailSkeleton"
import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"
import {
  SERVICE_LATE_INTEREST_TYPE_LABELS,
  SERVICE_PAYMENT_TIMING_LABELS,
  billingPeriodDisplayLabel,
  isServiceBillingPeriod,
  serviceDetailsGridHasContent,
} from "@/lib/serviceCatalogTypes"
import { cn } from "@/lib/utils"
import { Check, FileText, Plus } from "lucide-react"

type Props = {
  service: ServiceTypeChargeOption
  detail?: ServiceTypeChargeDetail | null
  loadingDetail?: boolean
  onOpenContract?: () => void
  className?: string
}

const catalogPanelClass = cn(
  "rounded-2xl border border-[var(--layouts-operar-border-dark-card)] bg-[var(--rootsy-sombra-600)]",
)

const catalogRowDividerClass =
  "border-b border-[var(--layouts-operar-border-dark-hairline)] last:border-b-0"

function formatCatalogDiscount(detail: ServiceTypeChargeDetail): string | null {
  if (detail.discountMode === "porcentaje") {
    return `${detail.discountValue ?? 0}% off`
  }
  if (detail.discountMode === "fijo") {
    return `${saleOpFmt.format(detail.discountValue ?? 0)} off`
  }
  return null
}

function formatLateInterest(detail: ServiceTypeChargeDetail): string | null {
  if (detail.lateInterestType === "simple_percent") {
    const value = detail.lateInterestValue ?? 0
    if (value <= 0) return null
    return `${value}% mora`
  }
  if (detail.lateInterestType !== "none") {
    return SERVICE_LATE_INTEREST_TYPE_LABELS[detail.lateInterestType]
  }
  return null
}

function SectionHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <h3 className={layoutsOperarFormDarkSectionLabelClass}>
      {title}
      {hint ? (
        <span
          className={cn(
            "ml-1 font-normal normal-case tracking-normal",
            layoutsOperarFormDarkMutedTextClass,
          )}
        >
          ({hint})
        </span>
      ) : null}
    </h3>
  )
}

function CatalogPanel({
  title,
  hint,
  children,
  className,
}: {
  title?: string
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("flex min-h-0 flex-col gap-3", className)}>
      {title ? <SectionHeader title={title} hint={hint} /> : null}
      <div className={cn(catalogPanelClass, "overflow-hidden")}>{children}</div>
    </section>
  )
}

function PlanHeroMedia({
  serviceId,
  name,
  imageUrl,
}: {
  serviceId: string
  name: string
  imageUrl: string | null
}) {
  return (
    <div className="relative size-[7.5rem] shrink-0 overflow-hidden rounded-2xl border border-[var(--layouts-operar-border-dark-card)] bg-[var(--rootsy-sombra-700)]">
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="size-full object-cover" loading="lazy" />
      ) : (
        <LayoutsOperarProductCardMediaEmptyState
          seed={serviceId}
          className="size-full rounded-none"
        />
      )}
    </div>
  )
}

function PlanHeroPanel({
  serviceId,
  name,
  category,
  description,
  imageUrl,
  displayPrice,
  billingLabel,
  discountLabel,
  lateInterestLabel,
  hasContract,
  onOpenContract,
}: {
  serviceId: string
  name: string
  category: string
  description: string | null
  imageUrl: string | null
  displayPrice: number
  billingLabel: string
  discountLabel: string | null
  lateInterestLabel: string | null
  hasContract: boolean
  onOpenContract?: () => void
}) {
  const whisper = [discountLabel, lateInterestLabel].filter(Boolean).join(" · ")

  return (
    <section className={cn(catalogPanelClass, "p-4")}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <PlanHeroMedia serviceId={serviceId} name={name} imageUrl={imageUrl} />

        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className={layoutsOperarFormDarkSectionLabelClass}>{category}</p>
            <h2
              className={cn(
                layoutsOperarProductCardTitleClass,
                "line-clamp-none text-xl font-bold tracking-tight",
              )}
              title={name}
            >
              {name}
            </h2>
            {description ? (
              <p className={cn(layoutsOperarProductCardDescClass, "line-clamp-3 max-w-prose")}>
                {description}
              </p>
            ) : null}
            {whisper ? (
              <p className={cn("text-xs leading-snug", layoutsOperarFormDarkMutedTextClass)}>
                {whisper}
              </p>
            ) : null}
            {hasContract && onOpenContract ? (
              <button
                type="button"
                className={cn(layoutsOperarFormDarkSecondaryButtonClass, "mt-1 h-8 text-xs")}
                onClick={onOpenContract}
              >
                <FileText className="size-3.5 shrink-0 opacity-80" aria-hidden />
                Ver contrato
              </button>
            ) : null}
          </div>

          <div className="shrink-0 text-left sm:pt-5 sm:text-right">
            <p className={cn(layoutsOperarFormDarkSectionLabelClass, "mb-1")}>
              Precio base
            </p>
            <p className={cn(layoutsOperarProductCardPriceClass, "text-2xl")}>
              {saleOpFmt.format(displayPrice)}
            </p>
            <p className={cn("mt-0.5 text-xs", layoutsOperarFormDarkMutedTextClass)}>
              / {billingLabel.toLowerCase()}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function PlanFacts({
  period,
  payment,
  due,
}: {
  period: string
  payment: string
  due: string
}) {
  const facts = [
    { label: "Período", value: period },
    { label: "Pago", value: payment },
    { label: "Vence", value: due },
  ]

  return (
    <dl className={cn(catalogPanelClass, "grid grid-cols-1 sm:grid-cols-3")}>
      {facts.map((fact, index) => (
        <div
          key={fact.label}
          className={cn(
            "flex items-baseline justify-between gap-3 px-4 py-3 sm:flex-col sm:items-start sm:justify-center sm:gap-1",
            index > 0 &&
              "border-t border-[var(--layouts-operar-border-dark-hairline)] sm:border-l sm:border-t-0",
          )}
        >
          <dt className={layoutsOperarFormDarkSectionLabelClass}>{fact.label}</dt>
          <dd className="text-sm font-medium leading-snug text-[var(--layouts-operar-product-card-title)]">
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function AddonRow({ addon }: { addon: ServiceTypeChargeAddonOption }) {
  return (
    <li className={cn("flex items-center justify-between gap-3 px-4 py-3", catalogRowDividerClass)}>
      <div className="flex min-w-0 items-center gap-2.5">
        <Plus
          className="size-3.5 shrink-0 text-[var(--layouts-operar-product-card-price)]"
          aria-hidden
        />
        <span className="truncate text-sm text-[var(--layouts-operar-product-card-title)]">
          {addon.name}
        </span>
      </div>
      <span className={cn(layoutsOperarProductCardPriceClass, "shrink-0 text-sm")}>
        +{saleOpFmt.format(addon.price)}
      </span>
    </li>
  )
}

function ArticleRow({ line }: { line: ServiceTypeChargeDetailArticle }) {
  return (
    <li className={cn("flex items-center justify-between gap-3 px-4 py-3", catalogRowDividerClass)}>
      <div className="flex min-w-0 items-center gap-2.5">
        <Check
          className="size-3.5 shrink-0 text-[var(--layouts-operar-product-card-price)]"
          strokeWidth={2.5}
          aria-hidden
        />
        <span className="truncate text-sm font-medium text-[var(--layouts-operar-product-card-title)]">
          {line.articleName}
        </span>
      </div>
      <span className={cn("shrink-0 text-sm tabular-nums", layoutsOperarFormDarkMutedTextClass)}>
        {line.quantity} {line.unitOfMeasure}
      </span>
    </li>
  )
}

function PlanDetailTable({ detail }: { detail: ServiceTypeChargeDetail }) {
  const { columns, rows } = detail.detailsGrid

  return (
    <div className={cn(catalogPanelClass, "overflow-hidden")}>
      <table className="w-full border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={`${column}-${index}`}
                className={cn(
                  "px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em]",
                  layoutsOperarFormDarkMutedTextClass,
                  index > 0 && "border-l border-[var(--layouts-operar-border-dark-hairline)]",
                )}
              >
                {column || `Col ${index + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-t border-[var(--layouts-operar-border-dark-hairline)]"
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={cn(
                    "px-4 py-3",
                    rowIndex === 0 ? "border-t border-[var(--layouts-operar-border-dark-hairline)]" : null,
                    cellIndex > 0 && "border-l border-[var(--layouts-operar-border-dark-hairline)]",
                    cellIndex === 0
                      ? "font-medium text-[var(--layouts-operar-product-card-title)]"
                      : layoutsOperarFormDarkMutedTextClass,
                  )}
                >
                  {cell || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ServiceOperateSelectedServiceMarketingDetail({
  service,
  detail = null,
  loadingDetail = false,
  onOpenContract,
  className,
}: Props) {
  const name = (detail?.name ?? service.name).trim() || "Sin nombre"
  const description = (detail?.description ?? service.description)?.trim() || null
  const category = (detail?.categoryName ?? service.categoryName)?.trim() || "Servicio"
  const imageUrl = (detail?.imageUrl ?? service.imageUrl)?.trim() || null
  const displayPrice = detail?.defaultPrice ?? service.defaultPrice
  const billingLabel = isServiceBillingPeriod(
    detail?.billingPeriod ?? service.billingPeriod,
  )
    ? billingPeriodDisplayLabel(
        detail?.billingPeriod ?? service.billingPeriod,
        detail?.billingPeriodLabel ?? service.billingPeriodLabel,
      )
    : detail?.billingPeriodDisplay ?? service.billingPeriodDisplay
  const paymentTiming = detail?.paymentTiming ?? service.paymentTiming
  const dueDaysAfter = detail?.dueDaysAfter ?? service.dueDaysAfter
  const addons = detail?.addons ?? service.addons
  const hasGrid = detail ? serviceDetailsGridHasContent(detail.detailsGrid) : false
  const discountLabel = detail ? formatCatalogDiscount(detail) : null
  const lateInterestLabel = detail ? formatLateInterest(detail) : null
  const hasContract = detail ? Boolean(detail.contractText.trim()) : false
  const hasArticles = Boolean(detail && detail.articles.length > 0)
  const hasAddons = addons.length > 0
  const showRow2 = hasAddons || hasArticles
  const row2TwoCols = hasAddons && hasArticles

  const dueLabel =
    dueDaysAfter === 0
      ? "Sin días extra"
      : `${dueDaysAfter} día${dueDaysAfter === 1 ? "" : "s"} después`

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <PlanHeroPanel
        serviceId={service.id}
        name={name}
        category={category}
        description={description}
        imageUrl={imageUrl}
        displayPrice={displayPrice}
        billingLabel={billingLabel}
        discountLabel={discountLabel}
        lateInterestLabel={lateInterestLabel}
        hasContract={hasContract}
        onOpenContract={onOpenContract}
      />

      <PlanFacts
        period={billingLabel}
        payment={SERVICE_PAYMENT_TIMING_LABELS[paymentTiming]}
        due={dueLabel}
      />

      {loadingDetail ? (
        <ServiceOperateSelectedServiceDetailSkeleton
          showRow2={showRow2 || loadingDetail}
          row2TwoCols={hasAddons}
        />
      ) : (
        <>
          {showRow2 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              {hasAddons ? (
                <CatalogPanel
                  title="Adicionales"
                  hint="En Configuración"
                  className={row2TwoCols ? "md:col-span-6" : "md:col-span-12"}
                >
                  <ul>
                    {addons.map((addon) => (
                      <AddonRow key={addon.id} addon={addon} />
                    ))}
                  </ul>
                </CatalogPanel>
              ) : null}

              {hasArticles ? (
                <CatalogPanel
                  title="Qué incluye"
                  className={row2TwoCols ? "md:col-span-6" : "md:col-span-12"}
                >
                  <ul>
                    {detail!.articles.map((line, index) => (
                      <ArticleRow key={`${line.articleName}-${index}`} line={line} />
                    ))}
                  </ul>
                </CatalogPanel>
              ) : null}
            </div>
          ) : null}

          {detail && hasGrid ? (
            <section className="flex flex-col gap-3">
              <SectionHeader title="Detalle del plan" />
              <PlanDetailTable detail={detail} />
            </section>
          ) : null}
        </>
      )}
    </div>
  )
}
