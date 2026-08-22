import { NextResponse } from "next/server"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string; layerId: string }> }

export async function PATCH(request: Request, ctx: RouteCtx) {
  try {
    const { popId, layerId } = await ctx.params
    const data = await rootsyApiFetch(
      `/v1/pops/${popId}/inventory/layers/${layerId}/expiry`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: await request.text(),
      },
    )
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
