import { NextResponse } from "next/server"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string; supplierId: string }> }

export async function PATCH(request: Request, ctx: RouteCtx) {
  try {
    const { popId, supplierId } = await ctx.params
    const data = await rootsyApiFetch(
      `/v1/pops/${popId}/suppliers/${supplierId}`,
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

export async function DELETE(request: Request, ctx: RouteCtx) {
  try {
    const { popId, supplierId } = await ctx.params
    const data = await rootsyApiFetch(
      `/v1/pops/${popId}/suppliers/${supplierId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: await request.text(),
      },
    )
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
