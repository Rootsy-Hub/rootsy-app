import { NextResponse } from "next/server"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string; printerId: string }> }

async function printerPath(ctx: RouteCtx) {
  const { popId, printerId } = await ctx.params
  return `/v1/pops/${popId}/printers/${printerId}`
}

export async function GET(_request: Request, ctx: RouteCtx) {
  try {
    const data = await rootsyApiFetch(await printerPath(ctx))
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}

export async function PATCH(request: Request, ctx: RouteCtx) {
  try {
    const data = await rootsyApiFetch(await printerPath(ctx), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: await request.text(),
    })
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}

export async function DELETE(_request: Request, ctx: RouteCtx) {
  try {
    const data = await rootsyApiFetch(await printerPath(ctx), {
      method: "DELETE",
    })
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
