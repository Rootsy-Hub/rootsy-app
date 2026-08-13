"use client"

import {
  getServiceTypeChargeDetail,
  type ServiceTypeChargeDetail,
  type ServiceTypeChargeOption,
} from "@/app/[siteId]/[popId]/active-services/actions"
import { LayoutsOperarProductCardMediaEmptyState } from "@/app/library/layouts/LayoutsOperarProductCardProposalPrimitives"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogFooterByVariant,
  RootsDialogHeader,
  RootsDialogLoadingState,
  rootsDialogDetailFieldStackClass,
  rootsDialogDetailLabelClass,
  rootsDialogDetailValueClass,
  rootsDialogDetailValueMultilineClass,
} from "@/components/rootsy-dialog"
import { Dialog } from "@/components/ui/dialog"
import {
  SERVICE_LATE_INTEREST_TYPE_LABELS,
  SERVICE_PAYMENT_TIMING_LABELS,
  billingPeriodDisplayLabel,
  isServiceBillingPeriod,
  serviceDetailsGridHasContent,
} from "@/lib/serviceCatalogTypes"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const priceFmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  popId: string
  service: ServiceTypeChargeOption
}

function DetailField({
  label,
  value,
  multiline = false,
  empty = false,
}: {
  label: string
  value: string
  multiline?: boolean
  empty?: boolean
}) {
  return (
    <div className={rootsDialogDetailFieldStackClass}>
      <span className={rootsDialogDetailLabelClass}>{label}</span>
      {multiline ? (
        <div
          className={cn(
            rootsDialogDetailValueMultilineClass,
            empty && "text-[var(--rootsy-bruma-400)]",
          )}
        >
          {value}
        </div>
      ) : (
        <div
          className={cn(
            rootsDialogDetailValueClass,
            empty && "text-[var(--rootsy-bruma-400)]",
          )}
        >
          {value}
        </div>
      )}
    </div>
  )
}

function formatCatalogDiscount(detail: ServiceTypeChargeDetail): string {
  if (detail.discountMode === "porcentaje") {
    return `${detail.discountValue ?? 0} %`
  }
  if (detail.discountMode === "fijo") {
    return priceFmt.format(detail.discountValue ?? 0)
  }
  return "Sin descuento"
}

function formatLateInterest(detail: ServiceTypeChargeDetail): string {
  if (detail.lateInterestType === "simple_percent") {
    return `${detail.lateInterestValue ?? 0} %`
  }
  return SERVICE_LATE_INTEREST_TYPE_LABELS[detail.lateInterestType]
}

function ServicePlanDetailContent({ detail }: { detail: ServiceTypeChargeDetail }) {
  const category = detail.categoryName?.trim() || "Sin categoría"
  const description = detail.description.trim() || "Sin descripción"
  const billingLabel = isServiceBillingPeriod(detail.billingPeriod)
    ? billingPeriodDisplayLabel(detail.billingPeriod, detail.billingPeriodLabel)
    : detail.billingPeriodDisplay
  const hasGrid = serviceDetailsGridHasContent(detail.detailsGrid)
  const contractText = detail.contractText.trim()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-[var(--rootsy-bruma-200)]">
          {detail.imageUrl ? (
            <img
              src={detail.imageUrl}
              alt={detail.name}
              className="size-full object-cover"
            />
          ) : (
            <LayoutsOperarProductCardMediaEmptyState
              seed={detail.id}
              className="size-full rounded-none"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--rootsy-savia-700)]">
            {category}
          </p>
          <h3 className="mt-0.5 font-canopy text-lg font-bold leading-snug text-[var(--rootsy-bruma-900)]">
            {detail.name.trim() || "Sin nombre"}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-[var(--rootsy-bruma-600)]">
            {description}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DetailField label="Periodicidad" value={billingLabel} />
        <DetailField
          label="Precio base"
          value={priceFmt.format(detail.defaultPrice)}
        />
        <DetailField
          label="Cuándo se paga"
          value={SERVICE_PAYMENT_TIMING_LABELS[detail.paymentTiming]}
        />
        <DetailField
          label="Vencimiento"
          value={`${detail.dueDaysAfter} días`}
        />
        <DetailField label="Descuento del plan" value={formatCatalogDiscount(detail)} />
        <DetailField label="Interés por mora" value={formatLateInterest(detail)} />
      </div>

      {detail.articles.length > 0 ? (
        <div className={rootsDialogDetailFieldStackClass}>
          <span className={rootsDialogDetailLabelClass}>Artículos incluidos</span>
          <ul className="rounded-lg border border-[var(--rootsy-bruma-200)] bg-white px-3 py-2 text-sm text-[var(--rootsy-bruma-800)] shadow-xs">
            {detail.articles.map((line, index) => (
              <li
                key={`${line.articleName}-${index}`}
                className="flex items-baseline justify-between gap-3 py-1"
              >
                <span className="min-w-0 truncate">{line.articleName}</span>
                <span className="shrink-0 tabular-nums text-[var(--rootsy-bruma-600)]">
                  {line.quantity} {line.unitOfMeasure}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasGrid ? (
        <div className={rootsDialogDetailFieldStackClass}>
          <span className={rootsDialogDetailLabelClass}>Detalle del plan</span>
          <div className="overflow-x-auto rounded-lg border border-[var(--rootsy-bruma-200)] bg-white shadow-xs">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)]">
                  {detail.detailsGrid.columns.map((column, index) => (
                    <th
                      key={`${column}-${index}`}
                      className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--rootsy-bruma-500)]"
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
                    className="border-b border-[var(--rootsy-bruma-100)] last:border-b-0"
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-3 py-2 text-[var(--rootsy-bruma-800)]"
                      >
                        {cell || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {contractText ? (
        <DetailField label="Contrato" value={contractText} multiline />
      ) : null}
    </div>
  )
}

export function ServiceOperatePlanDetailDialog({
  open,
  onOpenChange,
  popId,
  service,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detail, setDetail] = useState<ServiceTypeChargeDetail | null>(null)

  useEffect(() => {
    if (!open) return

    let cancelled = false
    setLoading(true)
    setError(null)
    setDetail(null)

    void getServiceTypeChargeDetail(popId, service.id).then((res) => {
      if (cancelled) return
      setLoading(false)
      if (!res.success) {
        setError(res.error)
        return
      }
      setDetail(res.service)
    })

    return () => {
      cancelled = true
    }
  }, [open, popId, service.id])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="default" className="sm:max-w-lg">
        <RootsDialogHeader
          title="Detalle del plan"
          description="Información del servicio seleccionado en el catálogo."
        />
        <RootsDialogBody>
          {loading ? (
            <RootsDialogLoadingState message="Cargando detalle del plan…" />
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : detail ? (
            <ServicePlanDetailContent detail={detail} />
          ) : null}
        </RootsDialogBody>
        <RootsDialogFooterByVariant
          variant="single"
          confirmLabel="Cerrar"
          onClose={() => onOpenChange(false)}
        />
      </RootsDialogContent>
    </Dialog>
  )
}
