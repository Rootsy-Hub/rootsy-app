import { NextResponse } from "next/server"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string; path?: string[] }> }

async function proxy(request: Request, ctx: RouteCtx, method: string) {
  const { popId, path } = await ctx.params
  const search = new URL(request.url).search
  const suffix = (path ?? []).map(encodeURIComponent).join("/")
  const apiPath = suffix
    ? `/v1/pops/${popId}/menu-catalog/${suffix}${search}`
    : `/v1/pops/${popId}/menu-catalog${search}`
  return rootsyApiFetch(apiPath, { method })
}

export async function GET(request: Request, ctx: RouteCtx) {
  try {
    return NextResponse.json(await proxy(request, ctx, "GET"))
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
