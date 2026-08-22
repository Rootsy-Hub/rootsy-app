import { NextResponse } from "next/server"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string; purchaseId: string }> }

export async function GET(_request: Request, ctx: RouteCtx) {
  try {
    const { popId, purchaseId } = await ctx.params
    const data = await rootsyApiFetch(
      `/v1/pops/${popId}/operations/purchases/${purchaseId}`,
    )
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
