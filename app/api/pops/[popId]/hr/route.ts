import { NextResponse } from "next/server"
import { getAppBaseUrl } from "@/lib/appUrl"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string }> }

export async function GET(_request: Request, ctx: RouteCtx) {
  try {
    const { popId } = await ctx.params
    const inviteBaseUrl = encodeURIComponent(getAppBaseUrl())
    const data = await rootsyApiFetch(
      `/v1/pops/${popId}/hr?inviteBaseUrl=${inviteBaseUrl}`,
    )
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
