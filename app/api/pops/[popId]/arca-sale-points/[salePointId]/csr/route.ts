import { NextResponse } from "next/server"
import {
  downloadArcaSalePointCsr,
  uploadArcaSalePointKeyAndCsr,
} from "@/lib/rootsyAfipStorage"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string; salePointId: string }> }

type SalePoint = {
  id: string
  ptoVta: number
}

type GenerateApiOk = {
  success: true
  data: SalePoint
  csrPem: string
  keyPem: string
}

export async function GET(_request: Request, ctx: RouteCtx) {
  try {
    const { popId, salePointId } = await ctx.params
    const csr = await downloadArcaSalePointCsr(popId, salePointId)
    if (!csr.success) {
      return NextResponse.json(csr, { status: 404 })
    }
    return NextResponse.json({ success: true, csrPem: csr.csrPemUtf8 })
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}

export async function POST(_request: Request, ctx: RouteCtx) {
  try {
    const { popId, salePointId } = await ctx.params
    const generated = await rootsyApiFetch<GenerateApiOk>(
      `/v1/pops/${popId}/arca-sale-points/${salePointId}/csr`,
      { method: "POST" },
    )
    const stored = await uploadArcaSalePointKeyAndCsr({
      popId,
      salePointId,
      keyPemUtf8: generated.keyPem,
      csrPemUtf8: generated.csrPem,
    })
    if (!stored.success) {
      return NextResponse.json(stored, { status: 400 })
    }
    const marked = await rootsyApiFetch<{ success: true; data: SalePoint }>(
      `/v1/pops/${popId}/arca-sale-points/${salePointId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyAndCsrUploaded: true }),
      },
    )
    return NextResponse.json({
      success: true,
      data: marked.data,
      csrPem: generated.csrPem,
    })
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
