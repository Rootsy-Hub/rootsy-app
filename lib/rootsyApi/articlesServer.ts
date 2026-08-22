import "server-only"

import type { GetPopArticlesTableInput } from "@/app/[siteId]/[popId]/articles/actions"
import {
  buildArticlesListSearch,
  type PopArticlesTableResult,
} from "@/lib/rootsyApi/articlesClient"
import { RootsyApiError, rootsyApiFetch } from "@/lib/rootsyApi/server"

type ApiOk<T> = { success: true; data: T }

export async function fetchPopArticlesTableServer(
  popId: string,
  input: GetPopArticlesTableInput,
): Promise<PopArticlesTableResult> {
  const search = buildArticlesListSearch(input)
  try {
    const body = await rootsyApiFetch<ApiOk<Extract<PopArticlesTableResult, { success: true }>>>(
      `/v1/pops/${popId}/articles?${search}`,
    )
    if (!body.success) {
      return {
        success: false,
        error: "Error al cargar artículos",
        articles: [],
        totalCount: 0,
        page: 1,
        canCreate: false,
        canPostInitialStock: false,
        canUpdate: false,
        canDelete: false,
      }
    }
    return { success: true, ...body.data }
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
      error: error instanceof Error ? error.message : "Error al cargar artículos",
      redirect,
      articles: [],
      totalCount: 0,
      page: 1,
      canCreate: false,
      canPostInitialStock: false,
      canUpdate: false,
      canDelete: false,
    }
  }
}
