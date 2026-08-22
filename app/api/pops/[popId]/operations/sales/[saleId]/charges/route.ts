import { NextResponse } from "next/server"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string; saleId: string }> }

export async function GET(request: Request, ctx: RouteCtx) {
  try {
    const { popId, saleId } = await ctx.params
    const search = new URL(request.url).search
    const data = await rootsyApiFetch(
      `/v1/pops/${popId}/operations/sales/${saleId}/charges${search}`,
    )
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
