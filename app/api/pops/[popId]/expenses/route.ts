import { NextResponse } from "next/server"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string }> }

export async function GET(request: Request, ctx: RouteCtx) {
  try {
    const { popId } = await ctx.params
    const search = new URL(request.url).search
    const data = await rootsyApiFetch(`/v1/pops/${popId}/expenses${search}`)
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}

export async function POST(request: Request, ctx: RouteCtx) {
  try {
    const { popId } = await ctx.params
    const data = await rootsyApiFetch(`/v1/pops/${popId}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await request.text(),
    })
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
