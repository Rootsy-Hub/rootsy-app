import { NextResponse } from "next/server"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string; categoryId: string }> }

async function categoryPath(ctx: RouteCtx) {
  const { popId, categoryId } = await ctx.params
  return `/v1/pops/${popId}/recipe-categories/${categoryId}`
}

export async function GET(_request: Request, ctx: RouteCtx) {
  try {
    const data = await rootsyApiFetch(await categoryPath(ctx))
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}

export async function PATCH(request: Request, ctx: RouteCtx) {
  try {
    const data = await rootsyApiFetch(await categoryPath(ctx), {
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
    const data = await rootsyApiFetch(await categoryPath(ctx), {
      method: "DELETE",
    })
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
