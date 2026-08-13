import type { ServiceTypeChargeOption } from "@/app/[siteId]/[popId]/active-services/actions"
import { SERVICE_BILLING_PERIOD_LABELS } from "@/lib/serviceCatalogTypes"

export type ServiceOperateCatalogItem = {
  id: string
  name: string
  price: number
  billingLabel: string
  categoryId: string | null
  categoryName: string
  searchText: string
}

export type ServiceOperateCatalogCategory = {
  id: string
  name: string
  count: number
}

export function mapServiceTypeToCatalogItem(
  service: ServiceTypeChargeOption,
): ServiceOperateCatalogItem {
  const billingLabel =
    service.billingPeriod === "custom" && service.billingPeriodLabel
      ? service.billingPeriodLabel
      : SERVICE_BILLING_PERIOD_LABELS[service.billingPeriod]

  const categoryName = service.categoryName?.trim() || "Sin categoría"

  return {
    id: service.id,
    name: service.name.trim(),
    price: service.defaultPrice,
    billingLabel,
    categoryId: service.categoryId,
    categoryName,
    searchText: `${service.name} ${categoryName} ${billingLabel}`.toLowerCase(),
  }
}

export function buildServiceOperateCategories(
  items: ServiceOperateCatalogItem[],
): ServiceOperateCatalogCategory[] {
  const counts = new Map<string, { id: string; name: string; count: number }>()

  for (const item of items) {
    const id = item.categoryId ?? "__none__"
    const existing = counts.get(id)
    if (existing) {
      existing.count += 1
      continue
    }
    counts.set(id, {
      id,
      name: item.categoryName,
      count: 1,
    })
  }

  return Array.from(counts.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "es"),
  )
}
