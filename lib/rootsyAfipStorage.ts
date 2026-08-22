import { createServiceRoleClient } from "@/utils/supabase/service-role"

export const ROOTSY_AFIP_STORAGE_BUCKET = "rootsy_afip_private" as const

export const ARCA_PADRON_CRT_OBJECT_PATH = "global/arca_padron.crt" as const
export const ARCA_PADRON_KEY_OBJECT_PATH = "global/arca_padron.key" as const

export function cashRegisterArcaCrtObjectPath(
  popId: string,
  registerId: string,
): string {
  return `pops/${popId}/cash_registers/${registerId}/arca.crt.pem`
}

export function cashRegisterArcaKeyObjectPath(
  popId: string,
  registerId: string,
): string {
  return `pops/${popId}/cash_registers/${registerId}/arca.key.pem`
}

export function arcaSalePointCrtObjectPath(
  popId: string,
  salePointId: string,
): string {
  return `pops/${popId}/arca_sale_points/${salePointId}/arca.crt.pem`
}

export function arcaSalePointKeyObjectPath(
  popId: string,
  salePointId: string,
): string {
  return `pops/${popId}/arca_sale_points/${salePointId}/arca.key.pem`
}

export function arcaSalePointCsrObjectPath(
  popId: string,
  salePointId: string,
): string {
  return `pops/${popId}/arca_sale_points/${salePointId}/arca.csr.pem`
}

export function looksLikePemCsr(value: string): boolean {
  const t = value.trim()
  return (
    t.includes("BEGIN CERTIFICATE REQUEST") &&
    t.includes("END CERTIFICATE REQUEST")
  )
}

export function looksLikePemCert(value: string): boolean {
  const t = value.trim()
  return t.includes("BEGIN CERTIFICATE") && t.includes("END CERTIFICATE")
}

export function looksLikePemKey(value: string): boolean {
  const t = value.trim()
  return (
    (t.includes("BEGIN RSA PRIVATE KEY") ||
      t.includes("BEGIN PRIVATE KEY") ||
      t.includes("BEGIN EC PRIVATE KEY")) &&
    t.includes("END")
  )
}

export async function downloadArcaPadronCrt(): Promise<Uint8Array | null> {
  const client = createServiceRoleClient()
  const { data, error } = await client.storage
    .from(ROOTSY_AFIP_STORAGE_BUCKET)
    .download(ARCA_PADRON_CRT_OBJECT_PATH)
  if (error || !data) return null
  return new Uint8Array(await data.arrayBuffer())
}

export async function downloadArcaPadronKey(): Promise<Uint8Array | null> {
  const client = createServiceRoleClient()
  const { data, error } = await client.storage
    .from(ROOTSY_AFIP_STORAGE_BUCKET)
    .download(ARCA_PADRON_KEY_OBJECT_PATH)
  if (error || !data) return null
  return new Uint8Array(await data.arrayBuffer())
}

async function downloadPemPair(
  crtPath: string,
  keyPath: string,
): Promise<
  | { success: true; certPemUtf8: string; keyPemUtf8: string }
  | { success: false; error: string }
> {
  const client = createServiceRoleClient()
  const { data: cData, error: cErr } = await client.storage
    .from(ROOTSY_AFIP_STORAGE_BUCKET)
    .download(crtPath)
  if (cErr || !cData) {
    return {
      success: false,
      error:
        cErr?.message ||
        "No se encontró el certificado (.crt) en el almacenamiento.",
    }
  }
  const { data: kData, error: kErr } = await client.storage
    .from(ROOTSY_AFIP_STORAGE_BUCKET)
    .download(keyPath)
  if (kErr || !kData) {
    return {
      success: false,
      error:
        kErr?.message ||
        "No se encontró la clave (.key) en el almacenamiento.",
    }
  }
  const certPemUtf8 = Buffer.from(await cData.arrayBuffer()).toString("utf8")
  const keyPemUtf8 = Buffer.from(await kData.arrayBuffer()).toString("utf8")
  if (!certPemUtf8.trim() || !keyPemUtf8.trim()) {
    return { success: false, error: "Certificado o clave vacíos en el bucket." }
  }
  return { success: true, certPemUtf8, keyPemUtf8 }
}

async function downloadLegacyCashRegisterPemFiles(
  popId: string,
): Promise<
  | { success: true; certPemUtf8: string; keyPemUtf8: string }
  | { success: false; error: string }
> {
  const client = createServiceRoleClient()
  const { data, error } = await client.storage
    .from(ROOTSY_AFIP_STORAGE_BUCKET)
    .list(`pops/${popId}/cash_registers`, { limit: 50 })
  if (error || !data?.length) {
    return {
      success: false,
      error: "No se encontró un certificado fiscal para este punto de venta.",
    }
  }
  for (const folder of data) {
    if (!folder.name) continue
    const pair = await downloadPemPair(
      cashRegisterArcaCrtObjectPath(popId, folder.name),
      cashRegisterArcaKeyObjectPath(popId, folder.name),
    )
    if (pair.success) return pair
  }
  return {
    success: false,
    error: "No se encontró un certificado fiscal para este punto de venta.",
  }
}

async function uploadPemObject(
  path: string,
  pemUtf8: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const max = 512 * 1024
  if (pemUtf8.length > max) {
    return { success: false, error: "Archivo demasiado grande (máx. 512 KB)." }
  }
  const client = createServiceRoleClient()
  const { error } = await client.storage
    .from(ROOTSY_AFIP_STORAGE_BUCKET)
    .upload(path, Buffer.from(pemUtf8, "utf8"), {
      upsert: true,
      contentType: "application/x-pem-file",
    })
  if (error) {
    return {
      success: false,
      error: error.message || "No se pudo subir el archivo al almacenamiento.",
    }
  }
  return { success: true }
}

export async function uploadArcaSalePointCrt(params: {
  popId: string
  salePointId: string
  certPemUtf8: string
}): Promise<{ success: true } | { success: false; error: string }> {
  return uploadPemObject(
    arcaSalePointCrtObjectPath(params.popId, params.salePointId),
    params.certPemUtf8,
  )
}

export async function uploadArcaSalePointKeyAndCsr(params: {
  popId: string
  salePointId: string
  keyPemUtf8: string
  csrPemUtf8: string
}): Promise<{ success: true } | { success: false; error: string }> {
  const key = await uploadPemObject(
    arcaSalePointKeyObjectPath(params.popId, params.salePointId),
    params.keyPemUtf8,
  )
  if (!key.success) return key
  return uploadPemObject(
    arcaSalePointCsrObjectPath(params.popId, params.salePointId),
    params.csrPemUtf8,
  )
}

export async function downloadArcaSalePointCsr(
  popId: string,
  salePointId: string,
): Promise<
  { success: true; csrPemUtf8: string } | { success: false; error: string }
> {
  const client = createServiceRoleClient()
  const { data, error } = await client.storage
    .from(ROOTSY_AFIP_STORAGE_BUCKET)
    .download(arcaSalePointCsrObjectPath(popId, salePointId))
  if (error || !data) {
    return {
      success: false,
      error: error?.message || "No se encontró el pedido CSR.",
    }
  }
  const csrPemUtf8 = Buffer.from(await data.arrayBuffer()).toString("utf8")
  if (!csrPemUtf8.trim()) {
    return { success: false, error: "El CSR está vacío en el almacenamiento." }
  }
  return { success: true, csrPemUtf8 }
}

export async function uploadArcaSalePointPemFiles(params: {
  popId: string
  salePointId: string
  certPemUtf8: string
  keyPemUtf8: string
}): Promise<{ success: true } | { success: false; error: string }> {
  const max = 512 * 1024
  if (params.certPemUtf8.length > max || params.keyPemUtf8.length > max) {
    return { success: false, error: "Archivo demasiado grande (máx. 512 KB)." }
  }
  const client = createServiceRoleClient()
  const crtPath = arcaSalePointCrtObjectPath(params.popId, params.salePointId)
  const keyPath = arcaSalePointKeyObjectPath(params.popId, params.salePointId)
  const crtBytes = Buffer.from(params.certPemUtf8, "utf8")
  const keyBytes = Buffer.from(params.keyPemUtf8, "utf8")
  const { error: errCrt } = await client.storage
    .from(ROOTSY_AFIP_STORAGE_BUCKET)
    .upload(crtPath, crtBytes, {
      upsert: true,
      contentType: "application/x-pem-file",
    })
  if (errCrt) {
    return {
      success: false,
      error: errCrt.message || "No se pudo subir el .crt al almacenamiento.",
    }
  }
  const { error: errKey } = await client.storage
    .from(ROOTSY_AFIP_STORAGE_BUCKET)
    .upload(keyPath, keyBytes, {
      upsert: true,
      contentType: "application/x-pem-file",
    })
  if (errKey) {
    return {
      success: false,
      error: errKey.message || "No se pudo subir el .key al almacenamiento.",
    }
  }
  return { success: true }
}

export async function downloadArcaSalePointPemFiles(
  popId: string,
  salePointId: string,
): Promise<
  | { success: true; certPemUtf8: string; keyPemUtf8: string }
  | { success: false; error: string }
> {
  const primary = await downloadPemPair(
    arcaSalePointCrtObjectPath(popId, salePointId),
    arcaSalePointKeyObjectPath(popId, salePointId),
  )
  if (primary.success) return primary

  const legacy = await downloadLegacyCashRegisterPemFiles(popId)
  if (!legacy.success) {
    return {
      success: false,
      error:
        "No se encontró el certificado (.crt) y la clave (.key) de este punto de venta.",
    }
  }
  await uploadArcaSalePointPemFiles({
    popId,
    salePointId,
    certPemUtf8: legacy.certPemUtf8,
    keyPemUtf8: legacy.keyPemUtf8,
  })
  return legacy
}
