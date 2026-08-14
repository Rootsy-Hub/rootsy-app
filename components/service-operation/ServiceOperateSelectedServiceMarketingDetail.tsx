"use client"

import type {
  ServiceTypeChargeAddonOption,
  ServiceTypeChargeDetail,
  ServiceTypeChargeDetailArticle,
  ServiceTypeChargeOption,
} from "@/app/[siteId]/[popId]/active-services/actions"
import { LayoutsOperarProductCardMediaEmptyState } from "@/app/library/layouts/LayoutsOperarProductCardProposalPrimitives"
import {
  layoutsOperarFormDarkBorderClass,
  layoutsOperarFormDarkMutedTextClass,
  layoutsOperarFormDarkSecondaryButtonClass,
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
  CalendarClock,
  Check,
  Clock3,
  FileText,
  Layers,
  Package,
  Percent,
  Plus,
  Sparkles,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

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

function MarketingSection({
  title,
  hint,
  icon: Icon,
  children,
  className,
}: {
  title: string
  hint?: string
  icon?: LucideIcon
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2">
        {Icon ? (
          <Icon
            className="size-3.5 shrink-0 text-[color-mix(in_srgb,var(--rootsy-savia-300)_88%,white)]"
            aria-hidden
          />
        ) : null}
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#f4f8f6]">
          {title}
        </h3>
        {hint ? (
          <span className={cn("ml-auto text-[11px]", layoutsOperarFormDarkMutedTextClass)}>
            {hint}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function MetaChip({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div
      className={cn(
        "inline-flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2.5 py-1.5",
        layoutsOperarFormDarkSurfaceClass,
        "ring-1 ring-[color-mix(in_srgb,var(--rootsy-sombra-border)_55%,transparent)]",
      )}
      title={`${label}: ${value}`}
    >
      <Icon className="size-3 shrink-0 text-[color-mix(in_srgb,var(--rootsy-savia-300)_88%,white)]" aria-hidden />
      <div className="min-w-0">
        <p className="truncate text-[10px] uppercase tracking-wide text-white/40">{label}</p>
        <p className="truncate text-xs font-medium text-[#f4f8f6]">{value}</p>
      </div>
    </div>
  )
}

function IncludedArticleRow({ line }: { line: ServiceTypeChargeDetailArticle }) {
  return (
    <li className="flex items-center gap-2 py-1.5 text-sm">
      <Check
        className="size-3 shrink-0 text-[color-mix(in_srgb,var(--rootsy-savia-300)_92%,white)]"
        strokeWidth={2.5}
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate font-medium text-[#f4f8f6]">
        {line.articleName}
      </span>
      <span className={cn("shrink-0 text-xs tabular-nums", layoutsOperarFormDarkMutedTextClass)}>
        {line.quantity} {line.unitOfMeasure}
      </span>
    </li>
  )
}

function AddonRow({ addon }: { addon: ServiceTypeChargeAddonOption }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg px-2.5 py-2",
        layoutsOperarFormDarkSurfaceClass,
        "ring-1 ring-[color-mix(in_srgb,var(--rootsy-sombra-border)_55%,transparent)]",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Plus
          className="size-3 shrink-0 text-[color-mix(in_srgb,var(--rootsy-savia-300)_88%,white)]"
          aria-hidden
        />
        <span className="truncate text-sm text-[#f4f8f6]">{addon.name}</span>
      </div>
      <span className="shrink-0 text-sm font-semibold tabular-nums text-[color-mix(in_srgb,var(--rootsy-savia-300)_95%,white)]">
        +{priceFmt.format(addon.price)}
      </span>
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

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <article
        className={cn(
          "relative overflow-hidden rounded-2xl p-3",
          layoutsOperarFormDarkSurfaceClass,
          "ring-1 ring-[color-mix(in_srgb,var(--rootsy-savia-400)_16%,transparent)]",
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_srgb,var(--rootsy-savia-400)_12%,transparent),transparent_62%)]"
          aria-hidden
        />

        <div className="relative flex gap-3">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-xl sm:size-16">
            <div
              className="pointer-events-none absolute -inset-px rounded-[inherit] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--rootsy-savia-400)_30%,transparent),transparent)]"
              aria-hidden
            />
            <div className="relative size-full overflow-hidden rounded-xl ring-1 ring-white/10 ring-inset">
              {imageUrl ? (
                <img src={imageUrl} alt={name} className="size-full object-cover" loading="lazy" />
              ) : (
                <LayoutsOperarProductCardMediaEmptyState
                  seed={service.id}
                  className="size-full rounded-none"
                />
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="inline-flex max-w-full rounded-full border border-[color-mix(in_srgb,var(--rootsy-savia-400)_30%,transparent)] bg-[color-mix(in_srgb,var(--rootsy-savia-400)_10%,transparent)] px-2 py-px text-[9px] font-bold uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--rootsy-savia-300)_92%,white)]">
                  <span className="truncate">{category}</span>
                </span>
                <h2
                  className="mt-1 font-canopy text-base font-bold leading-snug tracking-tight text-[#f4f8f6] sm:text-lg"
                  title={name}
                >
                  {name}
                </h2>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-canopy text-lg font-bold tabular-nums leading-none tracking-tight text-[color-mix(in_srgb,var(--rootsy-savia-300)_95%,white)] sm:text-xl">
                  {priceFmt.format(displayPrice)}
                </p>
                <p className="mt-0.5 text-[10px] text-white/45">/ {billingLabel.toLowerCase()}</p>
              </div>
            </div>

            {description ? (
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/55">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="relative mt-2.5 flex flex-wrap gap-1.5">
          <MetaChip icon={CalendarClock} label="Periodicidad" value={billingLabel} />
          <MetaChip
            icon={Clock3}
            label="Pago"
            value={SERVICE_PAYMENT_TIMING_LABELS[paymentTiming]}
          />
          <MetaChip
            icon={Layers}
            label="Vence"
            value={
              dueDaysAfter === 0
                ? "Sin extra"
                : `${dueDaysAfter}d después`
            }
          />
        </div>
      </article>

      {addons.length > 0 ? (
        <MarketingSection title="Adicionales" hint="En Configuración" icon={Sparkles}>
          <ul className="flex flex-col gap-1.5">
            {addons.map((addon) => (
              <li key={addon.id}>
                <AddonRow addon={addon} />
              </li>
            ))}
          </ul>
        </MarketingSection>
      ) : null}

      {loadingDetail ? (
        <ServiceOperateSelectedServiceDetailSkeleton />
      ) : (
        <>
          {detail && detail.articles.length > 0 ? (
            <MarketingSection title="Qué incluye" icon={Package}>
              <ul
                className={cn(
                  "rounded-lg px-2.5 py-1",
                  layoutsOperarFormDarkBorderClass,
                  layoutsOperarFormDarkSurfaceClass,
                  "ring-1 ring-[color-mix(in_srgb,var(--rootsy-sombra-border)_55%,transparent)]",
                )}
              >
                {detail.articles.map((line, index) => (
                  <IncludedArticleRow key={`${line.articleName}-${index}`} line={line} />
                ))}
              </ul>
            </MarketingSection>
          ) : null}

          {detail && hasGrid ? (
            <MarketingSection title="Detalle del plan" icon={Layers}>
              <div
                className={cn(
                  "overflow-x-auto rounded-lg ring-1 ring-[color-mix(in_srgb,var(--rootsy-sombra-border)_55%,transparent)]",
                  layoutsOperarFormDarkSurfaceClass,
                )}
              >
                <table className="min-w-full text-left text-xs">
                  <thead>
                    <tr className={cn("border-b", layoutsOperarFormDarkBorderClass)}>
                      {detail.detailsGrid.columns.map((column, index) => (
                        <th
                          key={`${column}-${index}`}
                          className={cn(
                            "px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.06em]",
                            layoutsOperarFormDarkMutedTextClass,
                          )}
                        >
                          {column || `Col ${index + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detail.detailsGrid.rows.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={cn(
                          "border-b last:border-b-0",
                          layoutsOperarFormDarkBorderClass,
                          rowIndex % 2 === 1 &&
                            "bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_35%,transparent)]",
                        )}
                      >
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-2.5 py-2 text-[color-mix(in_srgb,var(--rootsy-sombra-100)_88%,white)]"
                          >
                            {cell || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </MarketingSection>
          ) : null}

          {(discountLabel || lateInterestLabel) && detail ? (
            <MarketingSection title="Condiciones" icon={Percent}>
              <ul className="flex flex-col gap-1 text-xs text-[#f4f8f6]">
                {discountLabel ? (
                  <li className="flex items-center gap-1.5">
                    <Check
                      className="size-3 shrink-0 text-[color-mix(in_srgb,var(--rootsy-savia-300)_92%,white)]"
                      aria-hidden
                    />
                    {discountLabel}
                  </li>
                ) : null}
                {lateInterestLabel ? (
                  <li className="flex items-center gap-1.5">
                    <Check
                      className="size-3 shrink-0 text-[color-mix(in_srgb,var(--rootsy-savia-300)_92%,white)]"
                      aria-hidden
                    />
                    {lateInterestLabel}
                  </li>
                ) : null}
              </ul>
            </MarketingSection>
          ) : null}

          {hasContract && onOpenContract ? (
            <button
              type="button"
              className={cn(layoutsOperarFormDarkSecondaryButtonClass, "self-start text-xs")}
              onClick={onOpenContract}
            >
              <FileText className="size-3.5 shrink-0 opacity-80" aria-hidden />
              Ver contrato
            </button>
          ) : null}
        </>
      )}
    </div>
  )
}
