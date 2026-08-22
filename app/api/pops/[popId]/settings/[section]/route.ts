import { NextResponse } from "next/server"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

const SECTIONS = new Set(["business", "fiscal", "images"])

type RouteCtx = { params: Promise<{ popId: string; section: string }> }

export async function PATCH(request: Request, ctx: RouteCtx) {
  try {
    const { popId, section } = await ctx.params
    if (!SECTIONS.has(section)) {
      return NextResponse.json(
        { success: false, error: "Sección inválida" },
        { status: 404 },
      )
    }
    const data = await rootsyApiFetch(`/v1/pops/${popId}/settings/${section}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: await request.text(),
    })
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
