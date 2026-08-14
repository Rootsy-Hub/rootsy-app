"use client"

import type { ServiceTypeChargeOption } from "@/app/[siteId]/[popId]/active-services/actions"
import { LayoutsOperarProductCardMediaEmptyState } from "@/app/library/layouts/LayoutsOperarProductCardProposalPrimitives"
import {
  billingPeriodDisplayLabel,
  isServiceBillingPeriod,
} from "@/lib/serviceCatalogTypes"
import { cn } from "@/lib/utils"

const priceFmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

type Props = {
  service: ServiceTypeChargeOption
  price?: number
  className?: string
}

function ServiceShowcaseMedia({
  serviceId,
  imageUrl,
  name,
}: {
  serviceId: string
  imageUrl: string | null
  name: string
}) {
  return (
    <div className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-2xl">
      <div
        className="pointer-events-none absolute -inset-px rounded-[inherit] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--rootsy-savia-400)_35%,transparent),color-mix(in_srgb,var(--rootsy-savia-700)_8%,transparent))] opacity-80"
        aria-hidden
      />
      <div className="relative size-full overflow-hidden rounded-2xl ring-1 ring-white/10 ring-inset">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <LayoutsOperarProductCardMediaEmptyState
            seed={serviceId}
            className="size-full rounded-none"
          />
        )}
      </div>
    </div>
  )
}

export function ServiceOperateServiceShowcase({
  service,
  price,
  className,
}: Props) {
  const displayPrice = price ?? service.defaultPrice
  const category = service.categoryName?.trim() || "Sin categoría"
  const name = service.name.trim() || "Sin nombre"
  const description = service.description?.trim() || null
  const billingLabel = isServiceBillingPeriod(service.billingPeriod)
    ? billingPeriodDisplayLabel(service.billingPeriod, service.billingPeriodLabel)
    : service.billingPeriodDisplay
  const imageUrl = service.imageUrl?.trim() || null

  return (
    <div
      className={cn(
        "relative flex min-w-0 flex-1 items-stretch gap-4",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -left-4 top-1/2 h-24 w-40 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, color-mix(in srgb, var(--rootsy-savia-400) 22%, transparent), transparent 70%)",
        }}
        aria-hidden
      />

      <ServiceShowcaseMedia serviceId={service.id} imageUrl={imageUrl} name={name} />

      <div className="min-w-0 flex-1">
        <span className="inline-flex max-w-full items-center rounded-full border border-[color-mix(in_srgb,var(--rootsy-savia-400)_35%,transparent)] bg-[color-mix(in_srgb,var(--rootsy-savia-400)_12%,transparent)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--rootsy-savia-300)_92%,white)]">
          <span className="truncate">{category}</span>
        </span>

        <h2
          className="mt-1.5 truncate font-canopy text-lg font-bold leading-tight tracking-tight text-[#f4f8f6] sm:text-xl"
          title={name}
        >
          {name}
        </h2>

        {description ? (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-white/55">
            {description}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-end justify-between gap-3 sm:block sm:text-right">
        <div className="sm:text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
            Desde
          </p>
          <p className="mt-0.5 text-[11px] text-white/45 sm:hidden">{billingLabel}</p>
        </div>
        <div className="text-right">
          <p className="font-canopy text-xl font-bold tabular-nums tracking-tight text-[color-mix(in_srgb,var(--rootsy-savia-300)_95%,white)]">
            {priceFmt.format(displayPrice)}
          </p>
          <p className="mt-0.5 text-[11px] text-white/45">{billingLabel}</p>
        </div>
      </div>
    </div>
  )
}
