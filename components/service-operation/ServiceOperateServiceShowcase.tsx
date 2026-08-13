"use client"

import type { ServiceTypeChargeOption } from "@/app/[siteId]/[popId]/active-services/actions"
import { LayoutsOperarProductCardMediaEmptyState } from "@/app/library/layouts/LayoutsOperarProductCardProposalPrimitives"
import { cn } from "@/lib/utils"

const priceFmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

type Props = {
  service: ServiceTypeChargeOption
  price?: number
  clientName?: string | null
  tone?: "operar" | "ticket"
  className?: string
}

function ServiceShowcaseMedia({
  serviceId,
  imageUrl,
  name,
  tone,
}: {
  serviceId: string
  imageUrl: string | null
  name: string
  tone: "operar" | "ticket"
}) {
  const isOperar = tone === "operar"

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden",
        isOperar ? "size-[4.5rem] rounded-2xl" : "size-12 rounded-lg",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -inset-px rounded-[inherit] opacity-80",
          isOperar
            ? "bg-[linear-gradient(135deg,color-mix(in_srgb,var(--rootsy-savia-400)_35%,transparent),color-mix(in_srgb,var(--rootsy-savia-700)_8%,transparent))]"
            : "bg-[linear-gradient(135deg,color-mix(in_srgb,var(--rootsy-savia-400)_18%,transparent),transparent)]",
        )}
        aria-hidden
      />
      <div
        className={cn(
          "relative size-full overflow-hidden ring-1 ring-inset",
          isOperar ? "rounded-2xl ring-white/10" : "rounded-lg ring-[var(--rootsy-bruma-200)]",
        )}
      >
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
  clientName = null,
  tone = "operar",
  className,
}: Props) {
  const isOperar = tone === "operar"
  const displayPrice = price ?? service.defaultPrice
  const category = service.categoryName?.trim() || "Sin categoría"
  const name = service.name.trim() || "Sin nombre"
  const description = service.description?.trim() || null
  const billingLabel = service.billingPeriodDisplay
  const imageUrl = service.imageUrl?.trim() || null
  const displayClient = clientName?.trim() || "Sin cliente"
  const hasClient = Boolean(clientName?.trim())

  const categoryPillClass = cn(
    "inline-flex max-w-full items-center rounded-full border font-bold uppercase",
    isOperar
      ? "border-[color-mix(in_srgb,var(--rootsy-savia-400)_35%,transparent)] bg-[color-mix(in_srgb,var(--rootsy-savia-400)_12%,transparent)] px-2.5 py-0.5 text-[10px] tracking-[0.16em] text-[color-mix(in_srgb,var(--rootsy-savia-300)_92%,white)]"
      : "border-[color-mix(in_srgb,var(--rootsy-savia-400)_22%,transparent)] bg-[color-mix(in_srgb,var(--rootsy-savia-400)_7%,white)] px-2 py-0.5 text-[9px] tracking-[0.14em] text-[var(--rootsy-savia-700)]",
  )

  const mainRow = (
    <>
      <ServiceShowcaseMedia
        serviceId={service.id}
        imageUrl={imageUrl}
        name={name}
        tone={tone}
      />

      <div className="min-w-0 flex-1">
        <div className={cn(!isOperar && "flex items-start justify-between gap-2")}>
          <div className="min-w-0 flex-1">
            <span className={categoryPillClass}>
              <span className="truncate">{category}</span>
            </span>

            <h2
              className={cn(
                "font-canopy font-bold tracking-tight",
                isOperar
                  ? "mt-1.5 truncate text-lg leading-tight text-[#f4f8f6] sm:text-xl"
                  : "mt-1 line-clamp-2 text-sm leading-snug text-[var(--rootsy-bruma-800)]",
              )}
              title={name}
            >
              {name}
            </h2>
          </div>

          {!isOperar ? (
            <div className="shrink-0 text-right">
              <p className="font-canopy text-base font-bold tabular-nums leading-none tracking-tight text-[var(--rootsy-savia-700)]">
                {priceFmt.format(displayPrice)}
              </p>
              <p className="mt-0.5 text-[10px] leading-none text-[var(--rootsy-bruma-500)]">
                {billingLabel}
              </p>
            </div>
          ) : null}
        </div>

        {description ? (
          <p
            className={cn(
              "leading-relaxed",
              isOperar ? "mt-1 line-clamp-2 text-sm text-white/55" : "mt-1 line-clamp-1 text-[11px] text-[var(--rootsy-bruma-600)]",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
    </>
  )

  return (
    <div
      className={cn(
        "relative min-w-0",
        isOperar ? "flex flex-1 items-stretch gap-4" : "flex flex-col gap-2",
        className,
      )}
    >
      {isOperar ? (
        <div
          className="pointer-events-none absolute -left-4 top-1/2 h-24 w-40 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at center, color-mix(in srgb, var(--rootsy-savia-400) 22%, transparent), transparent 70%)",
          }}
          aria-hidden
        />
      ) : null}

      {isOperar ? (
        <>
          {mainRow}
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
        </>
      ) : (
        <>
          <div className="flex min-w-0 items-start gap-2.5">{mainRow}</div>

          <div
            className="border-t border-[color-mix(in_srgb,var(--rootsy-bruma-300)_55%,transparent)]"
            role="separator"
            aria-hidden
          />

          <div className="flex items-baseline justify-between gap-2">
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--rootsy-bruma-500)]">
              Cliente
            </span>
            <span
              className={cn(
                "min-w-0 truncate text-right text-xs font-medium leading-snug",
                hasClient ? "text-[var(--rootsy-bruma-800)]" : "text-[var(--rootsy-bruma-400)]",
              )}
              title={hasClient ? displayClient : undefined}
            >
              {displayClient}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
