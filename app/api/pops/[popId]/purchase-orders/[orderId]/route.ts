import { NextResponse } from "next/server"
import { enrichPurchaseOrderDetail } from "@/lib/purchaseOrders/enrichOrderDetail"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"
import type { PurchaseOrderDetail } from "@/lib/purchaseOrderTypes"

type RouteCtx = { params: Promise<{ popId: string; orderId: string }> }

type OrderDetailOk = { success: true; data: { order: PurchaseOrderDetail } }

export async function GET(_request: Request, ctx: RouteCtx) {
  try {
    const { popId, orderId } = await ctx.params
    const data = await rootsyApiFetch<OrderDetailOk>(
      `/v1/pops/${popId}/purchase-orders/${orderId}`,
    )
    if (data.success) {
      data.data.order = await enrichPurchaseOrderDetail(popId, data.data.order)
    }
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}

export async function DELETE(_request: Request, ctx: RouteCtx) {
  try {
    const { popId, orderId } = await ctx.params
    const data = await rootsyApiFetch(
      `/v1/pops/${popId}/purchase-orders/${orderId}`,
      { method: "DELETE" },
    )
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
