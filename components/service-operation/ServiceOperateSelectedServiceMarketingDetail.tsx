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
  layoutsOperarFormDarkSurfaceClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { ServiceOperateSelectedServiceDetailSkeleton } from "@/components/service-operation/ServiceOperateSelectedServiceDetailSkeleton"
import {
  SERVICE_LATE_INTEREST_TYPE_LABELS,
  SERVICE_PAYMENT_TIMING_LABELS,
  billingPeriodDisplayLabel,
  isServiceBillingPeriod,
  serviceDetailsGridHasContent,
} from "@/lib/serviceCatalogTypes"
import { cn } from "@/lib/utils"
import {
  Check,
  FileText,
  Percent,
  Plus,
} from "lucide-react"

const priceFmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

type Props = {
  service: ServiceTypeChargeOption
  detail?: ServiceTypeChargeDetail | null
  loadingDetail?: boolean
  onOpenContract?: () => void
  className?: string
}

function formatCatalogDiscount(detail: ServiceTypeChargeDetail): string | null {
  if (detail.discountMode === "porcentaje") {
    return `${detail.discountValue ?? 0} % de descuento en el plan`
  }
  if (detail.discountMode === "fijo") {
    return `${priceFmt.format(detail.discountValue ?? 0)} de descuento en el plan`
  }
  return null
}

function formatLateInterest(detail: ServiceTypeChargeDetail): string | null {
  if (detail.lateInterestType === "simple_percent") {
    const value = detail.lateInterestValue ?? 0
    if (value <= 0) return null
    return `${value} % de interés por mora`
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
        <span className={cn("ml-1 font-normal normal-case", layoutsOperarFormDarkMutedTextClass)}>
          ({hint})
        </span>
      ) : null}
    </h3>
  )
}

function GridPanel({
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
    <section
      className={cn(
        "flex h-full min-h-0 flex-col gap-3 rounded-2xl p-4",
        layoutsOperarFormDarkSurfaceClass,
        className,
      )}
    >
      {title ? <SectionHeader title={title} hint={hint} /> : null}
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  )
}

function LooseSection({
  title,
  hint,
  children,
  className,
}: {
  title: string
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("flex flex-col gap-2.5", className)}>
      <SectionHeader title={title} hint={hint} />
      {children}
    </section>
  )
}

function PlanPriceColumn({
  displayPrice,
  billingLabel,
  className,
}: {
  displayPrice: number
  billingLabel: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-col items-end justify-center gap-0.5 text-right",
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/38">
        Precio base
      </p>
      <p className="font-canopy text-2xl font-bold tabular-nums leading-none tracking-tight text-[color-mix(in_srgb,var(--rootsy-savia-300)_96%,white)] sm:text-[1.75rem]">
        {priceFmt.format(displayPrice)}
      </p>
      <p className="text-[11px] text-white/45">/ {billingLabel.toLowerCase()}</p>
    </div>
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
    <div className="relative shrink-0">
      <div
        className="pointer-events-none absolute -inset-3 rounded-full opacity-70 blur-2xl"
        style={{
          background:
            "radial-gradient(ellipse at center, color-mix(in srgb, var(--rootsy-savia-400) 24%, transparent), transparent 72%)",
        }}
        aria-hidden
      />
      <div className="relative size-16 overflow-hidden rounded-2xl sm:size-[5.25rem]">
        <div
          className="pointer-events-none absolute -inset-px rounded-[inherit] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--rootsy-savia-400)_32%,transparent),color-mix(in_srgb,var(--rootsy-savia-700)_6%,transparent))]"
          aria-hidden
        />
        <div className="relative size-full overflow-hidden rounded-2xl">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="size-full object-cover" loading="lazy" />
          ) : (
            <LayoutsOperarProductCardMediaEmptyState
              seed={serviceId}
              className="size-full rounded-none"
            />
          )}
        </div>
      </div>
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
  loadingDetail,
  className,
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
  loadingDetail: boolean
  className?: string
}) {
  const showMeta = !loadingDetail && (discountLabel || lateInterestLabel || hasContract)

  return (
    <section
      className={cn(
        "relative flex h-full min-h-0 items-center overflow-hidden rounded-2xl p-4 sm:p-[1.125rem]",
        layoutsOperarFormDarkSurfaceClass,
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,color-mix(in_srgb,var(--rootsy-savia-400)_10%,transparent)_0%,transparent_42%,color-mix(in_srgb,var(--rootsy-savia-400)_6%,transparent)_100%)]"
        aria-hidden
      />

      <div className="relative flex w-full flex-col gap-3.5 sm:flex-row sm:items-center sm:gap-5">
        <PlanHeroMedia serviceId={serviceId} name={name} imageUrl={imageUrl} />

        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="inline-flex w-fit rounded-full bg-[color-mix(in_srgb,var(--rootsy-savia-400)_10%,transparent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--rootsy-savia-300)_90%,white)]">
              {category}
            </span>

            <div className="space-y-1">
              <h2
                className="font-canopy text-xl font-bold leading-[1.15] tracking-tight text-[#f4f8f6] sm:text-2xl"
                title={name}
              >
                {name}
              </h2>
              {description ? (
                <p className="max-w-prose text-[13px] leading-relaxed text-white/52 sm:text-sm">
                  {description}
                </p>
              ) : (
                <p className={cn("text-[13px] italic sm:text-sm", layoutsOperarFormDarkMutedTextClass)}>
                  Sin descripción
                </p>
              )}
            </div>

            {showMeta ? (
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {discountLabel ? (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_28%,transparent)] px-2 py-1 text-[11px] text-white/78">
                    <Percent className="size-3 shrink-0 opacity-70" aria-hidden />
                    {discountLabel}
                  </span>
                ) : null}
                {lateInterestLabel ? (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_28%,transparent)] px-2 py-1 text-[11px] text-white/78">
                    <Percent className="size-3 shrink-0 opacity-70" aria-hidden />
                    {lateInterestLabel}
                  </span>
                ) : null}
                {hasContract && onOpenContract ? (
                  <button
                    type="button"
                    className={cn(layoutsOperarFormDarkSecondaryButtonClass, "ml-auto text-[11px]")}
                    onClick={onOpenContract}
                  >
                    <FileText className="size-3.5 shrink-0 opacity-80" aria-hidden />
                    Ver contrato
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          <PlanPriceColumn displayPrice={displayPrice} billingLabel={billingLabel} />
        </div>
      </div>
    </section>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-2xl px-3.5 py-3",
        layoutsOperarFormDarkSurfaceClass,
      )}
    >
      <span className={layoutsOperarFormDarkSectionLabelClass}>{label}</span>
      <span className="shrink-0 text-sm font-medium leading-snug text-[#f4f8f6]">{value}</span>
    </div>
  )
}

function AddonRow({ addon }: { addon: ServiceTypeChargeAddonOption }) {
  return (
    <li
      className={cn(
        "flex items-center justify-between gap-3 rounded-2xl px-3.5 py-3",
        layoutsOperarFormDarkSurfaceClass,
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <Plus
          className="size-4 shrink-0 text-[color-mix(in_srgb,var(--rootsy-savia-300)_88%,white)]"
          aria-hidden
        />
        <span className="text-sm text-[#f4f8f6]">{addon.name}</span>
      </div>
      <span className="shrink-0 text-sm font-semibold tabular-nums text-[color-mix(in_srgb,var(--rootsy-savia-300)_95%,white)]">
        +{priceFmt.format(addon.price)}
      </span>
    </li>
  )
}

function ArticleRow({ line }: { line: ServiceTypeChargeDetailArticle }) {
  return (
    <li
      className={cn(
        "flex items-center justify-between gap-3 rounded-2xl px-3.5 py-3",
        layoutsOperarFormDarkSurfaceClass,
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <Check
          className="size-4 shrink-0 text-[color-mix(in_srgb,var(--rootsy-savia-300)_92%,white)]"
          strokeWidth={2.5}
          aria-hidden
        />
        <span className="text-sm font-medium text-[#f4f8f6]">{line.articleName}</span>
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
    <div className="overflow-hidden rounded-2xl">
      <table className="w-full border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr className={layoutsOperarFormDarkSurfaceClass}>
            {columns.map((column, index) => (
              <th
                key={`${column}-${index}`}
                className={cn(
                  "px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em]",
                  layoutsOperarFormDarkMutedTextClass,
                )}
              >
                {column || `Col ${index + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={cn(
                    "px-3.5 py-3",
                    rowIndex % 2 === 0
                      ? "bg-[var(--layouts-operar-form-dark-table-row)]"
                      : layoutsOperarFormDarkSurfaceClass,
                    cellIndex === 0
                      ? "font-medium text-[var(--layouts-operar-form-dark-text)]"
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
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Row 1 — plan (8) | período / pago / vence (4) */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-stretch">
        <PlanHeroPanel
          className="h-full md:col-span-8"
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
          loadingDetail={loadingDetail}
        />

        <div className="flex h-full flex-col justify-center gap-2.5 md:col-span-4">
          <StatRow label="Período" value={billingLabel} />
          <StatRow
            label="Pago"
            value={SERVICE_PAYMENT_TIMING_LABELS[paymentTiming]}
          />
          <StatRow label="Vence" value={dueLabel} />
        </div>
      </div>

      {loadingDetail ? (
        <ServiceOperateSelectedServiceDetailSkeleton
          showRow2={showRow2 || loadingDetail}
          row2TwoCols={hasAddons}
        />
      ) : (
        <>
          {showRow2 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
              {hasAddons ? (
                <LooseSection
                  title="Adicionales"
                  hint="En Configuración"
                  className={row2TwoCols ? "md:col-span-6" : "md:col-span-12"}
                >
                  <ul className="flex flex-col gap-2.5">
                    {addons.map((addon) => (
                      <AddonRow key={addon.id} addon={addon} />
                    ))}
                  </ul>
                </LooseSection>
              ) : null}

              {hasArticles ? (
                <LooseSection
                  title="Qué incluye"
                  className={row2TwoCols ? "md:col-span-6" : "md:col-span-12"}
                >
                  <ul className="flex flex-col gap-2.5">
                    {detail!.articles.map((line, index) => (
                      <ArticleRow key={`${line.articleName}-${index}`} line={line} />
                    ))}
                  </ul>
                </LooseSection>
              ) : null}
            </div>
          ) : null}

          {detail && hasGrid ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
              <LooseSection title="Detalle del plan" className="md:col-span-12">
                <PlanDetailTable detail={detail} />
              </LooseSection>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
