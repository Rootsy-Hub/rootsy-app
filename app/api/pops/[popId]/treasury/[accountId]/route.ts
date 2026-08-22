import { NextResponse } from "next/server"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string; accountId: string }> }

export async function GET(_request: Request, ctx: RouteCtx) {
  try {
    const { popId, accountId } = await ctx.params
    const data = await rootsyApiFetch(`/v1/pops/${popId}/treasury/${accountId}`)
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}

export async function PATCH(request: Request, ctx: RouteCtx) {
  try {
    const { popId, accountId } = await ctx.params
    const data = await rootsyApiFetch(`/v1/pops/${popId}/treasury/${accountId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: await request.text(),
    })
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}

export async function DELETE(_request: Request, ctx: RouteCtx) {
  try {
    const { popId, accountId } = await ctx.params
    const data = await rootsyApiFetch(`/v1/pops/${popId}/treasury/${accountId}`, {
      method: "DELETE",
    })
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
