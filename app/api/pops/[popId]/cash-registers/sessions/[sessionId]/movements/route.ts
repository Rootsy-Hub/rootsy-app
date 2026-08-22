import { NextResponse } from "next/server"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string; sessionId: string }> }

export async function POST(request: Request, ctx: RouteCtx) {
  try {
    const { popId, sessionId } = await ctx.params
    const data = await rootsyApiFetch(
      `/v1/pops/${popId}/cash-registers/sessions/${sessionId}/movements`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: await request.text(),
      },
    )
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
