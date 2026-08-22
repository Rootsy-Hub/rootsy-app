import { NextResponse } from "next/server"
import { RootsyApiError, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string }> }

function apiError(error: unknown) {
  if (error instanceof RootsyApiError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.status },
    )
  }
  return NextResponse.json(
    { success: false, error: "Error interno" },
    { status: 500 },
  )
}

async function popDockPath(ctx: RouteCtx) {
  const { popId } = await ctx.params
  return `/v1/pops/${popId}/dock`
}

export async function GET(_request: Request, ctx: RouteCtx) {
  try {
    const data = await rootsyApiFetch(await popDockPath(ctx))
    return NextResponse.json(data)
  } catch (error) {
    return apiError(error)
  }
}

export async function POST(request: Request, ctx: RouteCtx) {
  try {
    const data = await rootsyApiFetch(await popDockPath(ctx), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await request.text(),
    })
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return apiError(error)
  }
}

export async function PATCH(request: Request, ctx: RouteCtx) {
  try {
    const data = await rootsyApiFetch(await popDockPath(ctx), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: await request.text(),
    })
    return NextResponse.json(data)
  } catch (error) {
    return apiError(error)
  }
}

export async function DELETE(_request: Request, ctx: RouteCtx) {
  try {
    const data = await rootsyApiFetch(await popDockPath(ctx), {
      method: "DELETE",
    })
    return NextResponse.json(data)
  } catch (error) {
    return apiError(error)
  }
}
