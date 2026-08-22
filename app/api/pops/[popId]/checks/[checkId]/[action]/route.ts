import { NextResponse } from "next/server"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

const LIFECYCLE_ACTIONS = new Set(["deposit", "clear", "reject", "void"])

type RouteCtx = {
  params: Promise<{ popId: string; checkId: string; action: string }>
}

export async function POST(request: Request, ctx: RouteCtx) {
  try {
    const { popId, checkId, action } = await ctx.params
    if (!LIFECYCLE_ACTIONS.has(action)) {
      return NextResponse.json(
        { success: false, error: "Acción inválida" },
        { status: 404 },
      )
    }
    const data = await rootsyApiFetch(
      `/v1/pops/${popId}/checks/${checkId}/${action}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: action === "void" ? "{}" : await request.text(),
      },
    )
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
