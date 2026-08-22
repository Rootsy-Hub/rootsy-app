import { NextResponse } from "next/server"
import { enrichSaleQuoteDetail } from "@/lib/quotes/enrichQuoteDetail"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"
import type { SaleQuoteDetail } from "@/lib/saleQuoteTypes"

type RouteCtx = { params: Promise<{ popId: string; quoteId: string }> }

type QuoteDetailOk = { success: true; data: { quote: SaleQuoteDetail } }

export async function GET(_request: Request, ctx: RouteCtx) {
  try {
    const { popId, quoteId } = await ctx.params
    const data = await rootsyApiFetch<QuoteDetailOk>(
      `/v1/pops/${popId}/quotes/${quoteId}`,
    )
    if (data.success) {
      data.data.quote = await enrichSaleQuoteDetail(popId, data.data.quote)
    }
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}

export async function DELETE(_request: Request, ctx: RouteCtx) {
  try {
    const { popId, quoteId } = await ctx.params
    const data = await rootsyApiFetch(`/v1/pops/${popId}/quotes/${quoteId}`, {
      method: "DELETE",
    })
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
