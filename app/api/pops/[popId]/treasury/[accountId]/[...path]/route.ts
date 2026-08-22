import { NextResponse } from "next/server"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = {
  params: Promise<{ popId: string; accountId: string; path: string[] }>
}

async function proxy(
  request: Request,
  ctx: RouteCtx,
  method: string,
) {
  const { popId, accountId, path } = await ctx.params
  const search = new URL(request.url).search
  const suffix = path.map(encodeURIComponent).join("/")
  const init: RequestInit = { method }
  if (method !== "GET" && method !== "HEAD") {
    init.headers = {
      "Content-Type": request.headers.get("content-type") || "application/json",
    }
    init.body = await request.text()
  }
  return rootsyApiFetch(
    `/v1/pops/${popId}/treasury/${accountId}/${suffix}${search}`,
    init,
  )
}

export async function GET(request: Request, ctx: RouteCtx) {
  try {
    return NextResponse.json(await proxy(request, ctx, "GET"))
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}

export async function POST(request: Request, ctx: RouteCtx) {
  try {
    const data = await proxy(request, ctx, "POST")
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}

export async function DELETE(request: Request, ctx: RouteCtx) {
  try {
    return NextResponse.json(await proxy(request, ctx, "DELETE"))
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
