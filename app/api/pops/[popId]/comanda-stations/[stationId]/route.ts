import { NextResponse } from "next/server"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string; stationId: string }> }

async function stationPath(ctx: RouteCtx) {
  const { popId, stationId } = await ctx.params
  return `/v1/pops/${popId}/comanda-stations/${stationId}`
}

export async function GET(_request: Request, ctx: RouteCtx) {
  try {
    const data = await rootsyApiFetch(await stationPath(ctx))
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}

export async function PATCH(request: Request, ctx: RouteCtx) {
  try {
    const data = await rootsyApiFetch(await stationPath(ctx), {
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
    const data = await rootsyApiFetch(await stationPath(ctx), {
      method: "DELETE",
    })
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
