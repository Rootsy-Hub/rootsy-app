import "server-only"

import type {
  CurrentAccountPartyRow,
  GetPopCurrentAccountPartiesInput,
} from "@/app/[siteId]/[popId]/current-accounts/actions"
import type { CurrentAccountDirection } from "@/lib/currentAccounts"
import { buildCurrentAccountsListSearch } from "@/lib/rootsyApi/currentAccountsClient"
import { RootsyApiError, rootsyApiFetch } from "@/lib/rootsyApi/server"

type ApiOk = {
  success: true
  data: {
    parties: CurrentAccountPartyRow[]
    totalCount: number
    page: number
    pageSize: number
    direction: CurrentAccountDirection
  }
}

export async function fetchCurrentAccountPartiesServer(
  popId: string,
  input: GetPopCurrentAccountPartiesInput,
): Promise<
  | {
      success: true
      parties: CurrentAccountPartyRow[]
      totalCount: number
      page: number
      direction: CurrentAccountDirection
    }
  | { success: false; error: string }
> {
  try {
    const search = buildCurrentAccountsListSearch(input)
    const res = await rootsyApiFetch<ApiOk>(
      `/v1/pops/${popId}/current-accounts?${search}`,
    )
    if (!res.success) {
      return { success: false, error: "No se pudieron cargar las cuentas." }
    }
    return {
      success: true,
      parties: res.data.parties,
      totalCount: res.data.totalCount,
      page: res.data.page,
      direction: res.data.direction,
    }
  } catch (error) {
    if (error instanceof RootsyApiError && (error.status === 401 || error.status === 403)) {
      return { success: false, error: "Sin permiso." }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}
