import { NextResponse } from "next/server"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string; expenseId: string }> }

export async function DELETE(_request: Request, ctx: RouteCtx) {
  try {
    const { popId, expenseId } = await ctx.params
    const data = await rootsyApiFetch(
      `/v1/pops/${popId}/expenses/${expenseId}`,
      { method: "DELETE" },
    )
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
