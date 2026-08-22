import { NextResponse } from "next/server"
import { testArcaInvoiceHomologacion } from "@/lib/invoices/invoiceArcaServer"
import { rootsyApiErrorResponse } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string }> }

export async function POST(request: Request, ctx: RouteCtx) {
  try {
    const { popId } = await ctx.params
    const formData = await request.formData()
    const result = await testArcaInvoiceHomologacion(popId, formData)
    return NextResponse.json(result, { status: result.success ? 200 : 400 })
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
