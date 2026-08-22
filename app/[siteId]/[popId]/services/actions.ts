import type { ArticleItemKind } from "@/lib/articleItemKind"
import type {
  ServiceBillingPeriod,
  ServiceDetailsGrid,
  ServiceDiscountMode,
  ServiceLateInterestType,
  ServicePaymentTiming,
} from "@/lib/serviceCatalogTypes"

export type ServiceCategoryOption = {
  id: string
  name: string
  kind: "fijo" | "variable"
  sortOrder: number
}

export type ServiceArticleOption = {
  id: string
  name: string
  itemKind: ArticleItemKind
  unitOfMeasure: string
}

export type ServiceArticleInput = {
  articleId: string
  quantity: number
}

export type ServiceAddonInput = {
  name: string
  price: number
  articles: ServiceArticleInput[]
}

export type ServiceAddonRow = Omit<ServiceAddonInput, "articles"> & {
  id: string
  sortOrder: number
  articles: ServiceArticleRow[]
}

export type ServiceArticleRow = ServiceArticleInput & {
  id: string
  articleName: string
  unitOfMeasure: string
  itemKind: ArticleItemKind
}

export type ServiceTableRow = {
  id: string
  name: string
  description: string
  imageUrl: string | null
  categoryId: string | null
  categoryName: string
  defaultPrice: number
  billingPeriod: ServiceBillingPeriod
  billingPeriodLabel: string | null
  billingPeriodDisplay: string
  detailCount: number
  contractHasText: boolean
  articleCount: number
  isActive: boolean
}

export type ServiceDetail = ServiceTableRow & {
  detailsGrid: ServiceDetailsGrid
  contractText: string
  paymentTiming: ServicePaymentTiming
  dueDaysAfter: number
  lateInterestType: ServiceLateInterestType
  lateInterestValue: number | null
  discountMode: ServiceDiscountMode
  discountValue: number | null
  articles: ServiceArticleRow[]
  addons: ServiceAddonRow[]
}

export type UpsertServiceInput = {
  name: string
  description: string
  categoryId: string
  imageUrl: string
  defaultPrice: number
  billingPeriod: ServiceBillingPeriod
  billingPeriodLabel: string
  detailsGrid: ServiceDetailsGrid
  contractText: string
  paymentTiming: ServicePaymentTiming
  dueDaysAfter: number
  lateInterestType: ServiceLateInterestType
  lateInterestValue: number | null
  discountMode: ServiceDiscountMode
  discountValue: number | null
  articles: ServiceArticleInput[]
  addons: ServiceAddonInput[]
  isActive: boolean
}

export type GetPopServicesTableInput = {
  q?: string
  page?: number
  pageSize?: number
  soloActivos?: boolean
  categoryId?: string
  sort?: string | null
  ord?: "asc" | "desc"
}
