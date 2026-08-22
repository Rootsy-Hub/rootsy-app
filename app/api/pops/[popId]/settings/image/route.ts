import { NextResponse } from "next/server"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string }> }

export async function POST(request: Request, ctx: RouteCtx) {
  try {
    const { popId } = await ctx.params
    const data = await rootsyApiFetch(`/v1/pops/${popId}/settings/image`, {
      method: "POST",
      body: await request.formData(),
    })
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
