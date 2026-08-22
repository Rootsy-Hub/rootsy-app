import { NextResponse } from "next/server"
import {
  looksLikePemCert,
  looksLikePemKey,
  uploadArcaSalePointCrt,
  uploadArcaSalePointPemFiles,
} from "@/lib/rootsyAfipStorage"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string; salePointId: string }> }

async function salePointPath(ctx: RouteCtx) {
  const { popId, salePointId } = await ctx.params
  return `/v1/pops/${popId}/arca-sale-points/${salePointId}`
}

export async function GET(_request: Request, ctx: RouteCtx) {
  try {
    const data = await rootsyApiFetch(await salePointPath(ctx))
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}

async function readPemPair(form: FormData): Promise<
  | { success: true; certPemUtf8: string; keyPemUtf8: string }
  | { success: true; certPemUtf8: string }
  | { success: true; empty: true }
  | { success: false; error: string }
> {
  const crt = form.get("crt")
  const key = form.get("key")
  const hasCrt = crt instanceof File && crt.size > 0
  const hasKey = key instanceof File && key.size > 0
  if (!hasCrt && !hasKey) return { success: true, empty: true }
  if (hasKey && !hasCrt) {
    return {
      success: false,
      error: "La clave la genera Rootsy. Subí solo el certificado (.crt).",
    }
  }
  if (!(crt instanceof File)) {
    return { success: false, error: "Subí el certificado (.crt)." }
  }
  if (!crt.name.toLowerCase().endsWith(".crt")) {
    return { success: false, error: "El certificado debe ser un archivo .crt." }
  }
  const certPemUtf8 = Buffer.from(await crt.arrayBuffer()).toString("utf8")
  if (!looksLikePemCert(certPemUtf8)) {
    return { success: false, error: "El .crt no parece un PEM de certificado válido." }
  }
  if (!hasKey) return { success: true, certPemUtf8 }
  if (!(key instanceof File)) {
    return { success: false, error: "Subí ambos archivos (.crt y .key) o ninguno." }
  }
  if (!key.name.toLowerCase().endsWith(".key")) {
    return { success: false, error: "La clave privada debe ser un archivo .key." }
  }
  const keyPemUtf8 = Buffer.from(await key.arrayBuffer()).toString("utf8")
  if (!looksLikePemKey(keyPemUtf8)) {
    return { success: false, error: "El .key no parece una clave privada PEM válida." }
  }
  return { success: true, certPemUtf8, keyPemUtf8 }
}

export async function PATCH(request: Request, ctx: RouteCtx) {
  try {
    const { popId, salePointId } = await ctx.params
    const contentType = request.headers.get("content-type") ?? ""

    if (!contentType.includes("multipart/form-data")) {
      const data = await rootsyApiFetch(
        `/v1/pops/${popId}/arca-sale-points/${salePointId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: await request.text(),
        },
      )
      return NextResponse.json(data)
    }

    const form = await request.formData()
    const files = await readPemPair(form)
    if (!files.success) {
      return NextResponse.json(
        { success: false, error: files.error },
        { status: 400 },
      )
    }

    if (!("empty" in files) && "keyPemUtf8" in files) {
      const uploaded = await uploadArcaSalePointPemFiles({
        popId,
        salePointId,
        certPemUtf8: files.certPemUtf8,
        keyPemUtf8: files.keyPemUtf8,
      })
      if (!uploaded.success) {
        return NextResponse.json(uploaded, { status: 400 })
      }
    } else if (!("empty" in files)) {
      const uploaded = await uploadArcaSalePointCrt({
        popId,
        salePointId,
        certPemUtf8: files.certPemUtf8,
      })
      if (!uploaded.success) {
        return NextResponse.json(uploaded, { status: 400 })
      }
    }

    const ptoRaw = String(form.get("ptoVta") ?? "").trim()
    const expiresRaw = String(form.get("expiresAt") ?? "").trim()
    const body: {
      ptoVta?: number
      expiresAt: string | null
      certificatesUploaded?: boolean
      certificateUploaded?: boolean
    } = {
      expiresAt: expiresRaw.slice(0, 10) || null,
    }
    if (ptoRaw) {
      const parsed = Number(ptoRaw.replace(/\D/g, ""))
      if (Number.isFinite(parsed)) body.ptoVta = parsed
    }
    if (!("empty" in files) && "keyPemUtf8" in files) {
      body.certificatesUploaded = true
    } else if (!("empty" in files)) {
      body.certificateUploaded = true
    }

    const data = await rootsyApiFetch(
      `/v1/pops/${popId}/arca-sale-points/${salePointId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    )
    return NextResponse.json(data)
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
