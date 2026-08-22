import { NextResponse } from "next/server"
import { createArcaInvoiceWithOpenCashRegister } from "@/lib/invoices/invoiceArcaServer"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string }> }

export async function GET(request: Request, ctx: RouteCtx) {
  try {
    const { popId } = await ctx.params
    const search = new URL(request.url).search
    const data = await rootsyApiFetch(`/v1/pops/${popId}/invoices${search}`)
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}

export async function POST(request: Request, ctx: RouteCtx) {
  try {
    const { popId } = await ctx.params
    const formData = await request.formData()
    const result = await createArcaInvoiceWithOpenCashRegister(popId, formData)
    return NextResponse.json(result, { status: result.success ? 201 : 400 })
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
