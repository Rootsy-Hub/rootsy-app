"use client"

import type { ServiceCategoryOption } from "@/app/[siteId]/[popId]/services/actions"
import type { ServiceFormState } from "@/app/[siteId]/[popId]/services/serviceFormState"
import { DataWorkspaceTableThumbnail } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  billingPeriodDisplayLabel,
  serviceDetailsGridHasContent,
} from "@/lib/serviceCatalogTypes"
import { parseMoneyInput } from "@/lib/moneyInput"
import { cn } from "@/lib/utils"

const PLACEHOLDER = "—"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

const summaryRowLabelClass =
  "shrink-0 text-[11px] leading-snug text-[var(--rootsy-bruma-500)]"

const summaryRowValueClass =
  "min-w-0 truncate text-right text-xs leading-snug text-[var(--rootsy-bruma-700)]"

const summaryRowEmptyClass = "text-[var(--rootsy-bruma-400)]"

type Props = {
  form: ServiceFormState
  categories: ServiceCategoryOption[]
}

function SummaryRow({
  label,
  value,
  empty = false,
}: {
  label: string
  value: string
  empty?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5">
      <span className={summaryRowLabelClass}>{label}</span>
      <span
        className={cn(
          summaryRowValueClass,
          (empty || value === PLACEHOLDER) && summaryRowEmptyClass,
        )}
        title={value === PLACEHOLDER ? undefined : value}
      >
        {value}
      </span>
    </div>
  )
}

export function ServiceUpsertSummaryPanel({ form, categories }: Props) {
  const categoryName =
    categories.find((c) => c.id === form.categoryId)?.name ?? PLACEHOLDER
  const price = parseMoneyInput(form.defaultPrice, 0)
  const articleCount = form.articleLines.filter((l) => l.articleId.trim()).length
  const hasGrid = serviceDetailsGridHasContent(form.detailsGrid)
  const hasContract = Boolean(form.contractText.trim())

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <DataWorkspaceTableThumbnail
          src={form.imageUrl.trim() || null}
          alt={form.name.trim() || "Servicio"}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm font-medium leading-snug",
              form.name.trim()
                ? "text-[var(--rootsy-bruma-800)]"
                : "text-[var(--rootsy-bruma-400)]",
            )}
          >
            {form.name.trim() || "Sin nombre"}
          </p>
          <p
            className={cn(
              "mt-1 text-xs leading-relaxed",
              form.description.trim()
                ? "text-[var(--rootsy-bruma-600)]"
                : "text-[var(--rootsy-bruma-400)]",
            )}
          >
            {form.description.trim() || "Sin descripción"}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-0.5">
        <SummaryRow label="Categoría" value={categoryName} empty={!form.categoryId} />
        <SummaryRow
          label="Período"
          value={billingPeriodDisplayLabel(
            form.billingPeriod,
            form.billingPeriodLabel,
          )}
        />
        <SummaryRow
          label="Precio"
          value={Number.isFinite(price) ? fmt.format(price) : PLACEHOLDER}
        />
        <SummaryRow
          label="Artículos"
          value={articleCount > 0 ? String(articleCount) : PLACEHOLDER}
          empty={articleCount === 0}
        />
        <SummaryRow
          label="Detalles"
          value={
            hasGrid
              ? `${form.detailsGrid.columns.length} col · ${form.detailsGrid.rows.length} filas`
              : PLACEHOLDER
          }
          empty={!hasGrid}
        />
        <SummaryRow
          label="Contrato"
          value={hasContract ? "Texto cargado" : PLACEHOLDER}
          empty={!hasContract}
        />
        <SummaryRow
          label="Estado"
          value={form.isActive ? "Activo" : "Inactivo"}
        />
      </div>
    </div>
  )
}
