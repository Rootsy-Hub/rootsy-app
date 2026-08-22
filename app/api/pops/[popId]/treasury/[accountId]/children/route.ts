import { NextResponse } from "next/server"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string; accountId: string }> }

export async function POST(request: Request, ctx: RouteCtx) {
  try {
    const { popId, accountId } = await ctx.params
    const data = await rootsyApiFetch(
      `/v1/pops/${popId}/treasury/${accountId}/children`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: await request.text(),
      },
    )
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
