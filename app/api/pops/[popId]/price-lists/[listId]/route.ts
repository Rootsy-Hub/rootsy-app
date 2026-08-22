import { NextResponse } from "next/server"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string; listId: string }> }

async function listPath(ctx: RouteCtx) {
  const { popId, listId } = await ctx.params
  return `/v1/pops/${popId}/price-lists/${listId}`
}

export async function PATCH(request: Request, ctx: RouteCtx) {
  try {
    const data = await rootsyApiFetch(await listPath(ctx), {
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
    const data = await rootsyApiFetch(await listPath(ctx), {
      method: "DELETE",
    })
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
