import { NextResponse } from "next/server"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string; saleId: string }> }

export async function GET(_request: Request, ctx: RouteCtx) {
  try {
    const { popId, saleId } = await ctx.params
    const data = await rootsyApiFetch(
      `/v1/pops/${popId}/operations/sales/${saleId}`,
    )
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
