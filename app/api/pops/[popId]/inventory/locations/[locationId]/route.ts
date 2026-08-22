import { NextResponse } from "next/server"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string; locationId: string }> }

export async function PATCH(request: Request, ctx: RouteCtx) {
  try {
    const { popId, locationId } = await ctx.params
    const data = await rootsyApiFetch(
      `/v1/pops/${popId}/inventory/locations/${locationId}`,
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
