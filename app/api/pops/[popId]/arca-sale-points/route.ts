import { NextResponse } from "next/server"
import { uploadArcaSalePointKeyAndCsr } from "@/lib/rootsyAfipStorage"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string }> }

type SalePoint = {
  id: string
  ptoVta: number
  expiresAt: string | null
  crtUploadedAt: string | null
  keyUploadedAt: string | null
  csrUploadedAt: string | null
  configured: boolean
  daysUntilExpiry: number | null
}

type CreateApiOk = {
  success: true
  data: SalePoint
  csrPem?: string
  keyPem?: string
}

export async function GET(_request: Request, ctx: RouteCtx) {
  try {
    const { popId } = await ctx.params
    const data = await rootsyApiFetch(`/v1/pops/${popId}/arca-sale-points`)
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}

export async function POST(request: Request, ctx: RouteCtx) {
  try {
    const { popId } = await ctx.params
    const created = await rootsyApiFetch<CreateApiOk>(
      `/v1/pops/${popId}/arca-sale-points`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: await request.text(),
      },
    )

    const salePoint = created.data
    const keyPem = created.keyPem
    const csrPem = created.csrPem
    if (salePoint && keyPem && csrPem) {
      const stored = await uploadArcaSalePointKeyAndCsr({
        popId,
        salePointId: salePoint.id,
        keyPemUtf8: keyPem,
        csrPemUtf8: csrPem,
      })
      if (!stored.success) {
        return NextResponse.json(stored, { status: 400 })
      }
      const marked = await rootsyApiFetch<CreateApiOk>(
        `/v1/pops/${popId}/arca-sale-points/${salePoint.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyAndCsrUploaded: true }),
        },
      )
      return NextResponse.json(
        { success: true, data: marked.data, csrPem },
        { status: 201 },
      )
    }

    return NextResponse.json(
      { success: true, data: salePoint, csrPem: csrPem ?? null },
      { status: 201 },
    )
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
