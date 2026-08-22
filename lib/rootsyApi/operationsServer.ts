import "server-only"

import type {
  GetOperationsListInput,
  GetOperationsListResult,
} from "@/app/[siteId]/[popId]/operations/actions"
import { buildOperationsListSearch } from "@/lib/rootsyApi/operationsClient"
import { RootsyApiError, rootsyApiFetch } from "@/lib/rootsyApi/server"

type ApiOk<T> = { success: true; data: T }

type ListData = Extract<GetOperationsListResult, { success: true }>

const EMPTY: Omit<
  Extract<GetOperationsListResult, { success: false }>,
  "success" | "error"
> = {
  totalCount: 0,
  page: 1,
  sales: [],
  expenseLedger: [],
  purchases: [],
  serviceCharges: [],
}

export async function fetchPopOperationsListServer(
  popId: string,
  input: GetOperationsListInput,
): Promise<GetOperationsListResult> {
  const search = buildOperationsListSearch(input)
  try {
    const body = await rootsyApiFetch<ApiOk<ListData>>(
      `/v1/pops/${popId}/operations?${search}`,
    )
    if (!body.success) {
      return { success: false, error: "Error al cargar operaciones", ...EMPTY }
    }
    return {
      success: true,
      popName: body.data.popName ?? "",
      totalCount: body.data.totalCount,
      page: body.data.page,
      sales: body.data.sales ?? [],
      expenseLedger: body.data.expenseLedger ?? [],
      purchases: body.data.purchases ?? [],
      serviceCharges: body.data.serviceCharges ?? [],
    }
  } catch (error) {
    const redirect =
      error instanceof RootsyApiError &&
      error.body &&
      typeof error.body === "object" &&
      "redirect" in error.body &&
      typeof (error.body as { redirect?: unknown }).redirect === "string"
        ? (error.body as { redirect: string }).redirect
        : undefined
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al cargar operaciones",
      redirect,
      ...EMPTY,
      page: input.page,
    }
  }
}
