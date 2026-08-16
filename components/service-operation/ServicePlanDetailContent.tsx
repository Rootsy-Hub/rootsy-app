"use client"

import type { ServiceTypeChargeDetail } from "@/app/[siteId]/[popId]/active-services/actions"
import { LayoutsOperarProductCardMediaEmptyState } from "@/app/library/layouts/LayoutsOperarProductCardProposalPrimitives"
import {
  layoutsOperarFormDarkBorderClass,
  layoutsOperarFormDarkMutedTextClass,
  layoutsOperarFormDarkSurfaceClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  rootsDialogDetailFieldStackClass,
  rootsDialogDetailLabelClass,
  rootsDialogDetailValueClass,
  rootsDialogDetailValueMultilineClass,
} from "@/components/rootsy-dialog"
import {
  SERVICE_LATE_INTEREST_TYPE_LABELS,
  SERVICE_PAYMENT_TIMING_LABELS,
  billingPeriodDisplayLabel,
  isServiceBillingPeriod,
  serviceDetailsGridHasContent,
} from "@/lib/serviceCatalogTypes"
import { cn } from "@/lib/utils"

const priceFmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

export type ServicePlanDetailTone = "light" | "dark"

type Props = {
  detail: ServiceTypeChargeDetail
  tone?: ServicePlanDetailTone
  showHero?: boolean
}

function toneClasses(tone: ServicePlanDetailTone) {
  if (tone === "dark") {
    return {
      label: cn(
        "text-[10px] font-semibold uppercase tracking-[0.12em]",
        layoutsOperarFormDarkMutedTextClass,
      ),
      sectionLabel: cn(
        "text-xs font-medium uppercase tracking-wide",
        layoutsOperarFormDarkMutedTextClass,
      ),
      value: "text-sm text-[#f4f8f6]",
      valueEmpty: layoutsOperarFormDarkMutedTextClass,
      description: "text-sm leading-relaxed text-[color-mix(in_srgb,var(--rootsy-sombra-200)_78%,white)]",
      category: "text-[10px] font-bold uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--rootsy-savia-300)_92%,white)]",
      title: "font-canopy text-lg font-bold leading-snug text-[#f4f8f6]",
      fieldShell: cn(
        "rounded-lg border px-3 py-2.5 text-sm shadow-none",
        layoutsOperarFormDarkBorderClass,
        layoutsOperarFormDarkSurfaceClass,
        "text-[#f4f8f6]",
      ),
      fieldShellInline: cn(
        "flex min-h-11 w-full min-w-0 items-center rounded-lg border px-3 text-sm shadow-none",
        layoutsOperarFormDarkBorderClass,
        layoutsOperarFormDarkSurfaceClass,
        "text-[#f4f8f6]",
      ),
      tableShell: cn(
        "overflow-x-auto rounded-lg border shadow-none",
        layoutsOperarFormDarkBorderClass,
        layoutsOperarFormDarkSurfaceClass,
      ),
      tableHead: cn(
        "border-b px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]",
        layoutsOperarFormDarkBorderClass,
        layoutsOperarFormDarkMutedTextClass,
        "bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_72%,transparent)]",
      ),
      tableRow: cn(
        "border-b last:border-b-0",
        layoutsOperarFormDarkBorderClass,
      ),
      tableCell: "px-3 py-2 text-[color-mix(in_srgb,var(--rootsy-sombra-100)_88%,white)]",
      articleQty: layoutsOperarFormDarkMutedTextClass,
    }
  }

  return {
    label: rootsDialogDetailLabelClass,
    sectionLabel: rootsDialogDetailLabelClass,
    value: rootsDialogDetailValueClass,
    valueEmpty: "text-[var(--rootsy-bruma-400)]",
    description: "text-sm leading-relaxed text-[var(--rootsy-bruma-600)]",
    category: "text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--rootsy-savia-700)]",
    title: "font-canopy text-lg font-bold leading-snug text-[var(--rootsy-bruma-900)]",
    fieldShell: rootsDialogDetailValueMultilineClass,
    fieldShellInline: rootsDialogDetailValueClass,
    tableShell: "overflow-x-auto rounded-lg border border-[var(--rootsy-bruma-200)] bg-white shadow-xs",
    tableHead:
      "border-b border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--rootsy-bruma-500)]",
    tableRow: "border-b border-[var(--rootsy-bruma-100)] last:border-b-0",
    tableCell: "px-3 py-2 text-[var(--rootsy-bruma-800)]",
    articleQty: "text-[var(--rootsy-bruma-600)]",
  }
}

function DetailField({
  label,
  value,
  multiline = false,
  empty = false,
  tone,
}: {
  label: string
  value: string
  multiline?: boolean
  empty?: boolean
  tone: ServicePlanDetailTone
}) {
  const styles = toneClasses(tone)

  return (
    <div className={rootsDialogDetailFieldStackClass}>
      <span className={styles.label}>{label}</span>
      {multiline ? (
        <div
          className={cn(styles.fieldShell, empty && styles.valueEmpty)}
        >
          {value}
        </div>
      ) : (
        <div
          className={cn(styles.fieldShellInline, empty && styles.valueEmpty)}
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

export function ServicePlanDetailContent({
  detail,
  tone = "light",
  showHero = true,
}: Props) {
  const styles = toneClasses(tone)
  const category = detail.categoryName?.trim() || "Sin categoría"
  const description = detail.description.trim() || "Sin descripción"
  const billingLabel = isServiceBillingPeriod(detail.billingPeriod)
    ? billingPeriodDisplayLabel(detail.billingPeriod, detail.billingPeriodLabel)
    : detail.billingPeriodDisplay
  const hasGrid = serviceDetailsGridHasContent(detail.detailsGrid)

  return (
    <div className="flex flex-col gap-5">
      {showHero ? (
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "relative size-16 shrink-0 overflow-hidden rounded-xl ring-1",
              tone === "dark"
                ? "ring-[color-mix(in_srgb,var(--rootsy-sombra-border)_55%,transparent)]"
                : "ring-[var(--rootsy-bruma-200)]",
            )}
          >
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
            <p className={styles.category}>{category}</p>
            <h3 className={cn(styles.title, "mt-0.5")}>
              {detail.name.trim() || "Sin nombre"}
            </h3>
            <p className={cn(styles.description, "mt-1")}>{description}</p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <DetailField label="Periodicidad" value={billingLabel} tone={tone} />
        <DetailField
          label="Precio base"
          value={priceFmt.format(detail.defaultPrice)}
          tone={tone}
        />
        <DetailField
          label="Cuándo se paga"
          value={SERVICE_PAYMENT_TIMING_LABELS[detail.paymentTiming]}
          tone={tone}
        />
        <DetailField
          label="Vencimiento"
          value={`${detail.dueDaysAfter} días`}
          tone={tone}
        />
        <DetailField
          label="Descuento del plan"
          value={formatCatalogDiscount(detail)}
          tone={tone}
        />
        <DetailField
          label="Interés por mora"
          value={formatLateInterest(detail)}
          tone={tone}
        />
      </div>

      {detail.articles.length > 0 ? (
        <div className={rootsDialogDetailFieldStackClass}>
          <span className={styles.sectionLabel}>Artículos incluidos</span>
          <ul className={styles.fieldShell}>
            {detail.articles.map((line, index) => (
              <li
                key={`${line.articleName}-${index}`}
                className="flex items-baseline justify-between gap-3 py-1"
              >
                <span className="min-w-0 truncate">{line.articleName}</span>
                <span className={cn("shrink-0 tabular-nums", styles.articleQty)}>
                  {line.quantity} {line.unitOfMeasure}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasGrid ? (
        <div className={rootsDialogDetailFieldStackClass}>
          <span className={styles.sectionLabel}>Detalle del plan</span>
          <div className={styles.tableShell}>
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr>
                  {detail.detailsGrid.columns.map((column, index) => (
                    <th key={`${column}-${index}`} className={styles.tableHead}>
                      {column || `Col ${index + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detail.detailsGrid.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className={styles.tableRow}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className={styles.tableCell}>
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
    </div>
  )
}

export function servicePlanHasContract(detail: ServiceTypeChargeDetail): boolean {
  return Boolean(detail.contractText.trim())
}
