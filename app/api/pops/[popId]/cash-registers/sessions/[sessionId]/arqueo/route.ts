import { NextResponse } from "next/server"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string; sessionId: string }> }

export async function GET(_request: Request, ctx: RouteCtx) {
  try {
    const { popId, sessionId } = await ctx.params
    const data = await rootsyApiFetch(
      `/v1/pops/${popId}/cash-registers/sessions/${sessionId}/arqueo`,
    )
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
