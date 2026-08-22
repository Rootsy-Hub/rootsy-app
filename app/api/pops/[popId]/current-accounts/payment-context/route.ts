import { NextResponse } from "next/server"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string }> }

export async function GET(_request: Request, ctx: RouteCtx) {
  try {
    const { popId } = await ctx.params
    const data = await rootsyApiFetch(
      `/v1/pops/${popId}/current-accounts/payment-context`,
    )
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
