import { NextResponse } from "next/server"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string; registerId: string }> }

export async function GET(_request: Request, ctx: RouteCtx) {
  try {
    const { popId, registerId } = await ctx.params
    const data = await rootsyApiFetch(
      `/v1/pops/${popId}/cash-registers/${registerId}/totals`,
    )
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
