import { NextResponse } from "next/server"
import { getInvoiceFormContext } from "@/lib/invoices/invoiceArcaServer"
import { rootsyApiErrorResponse } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string }> }

export async function GET(_request: Request, ctx: RouteCtx) {
  try {
    const { popId } = await ctx.params
    const result = await getInvoiceFormContext(popId)
    if (!result.success) {
      return NextResponse.json(result, { status: result.redirect ? 403 : 400 })
    }
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
