import {
  updateCashRegister,
  uploadCashRegisterArcaCertificates,
} from "@/app/[siteId]/[popId]/cash-registers/actions"
import type { CashRegisterArcaFormPayload } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterArcaConfigFields"

export function hasCashRegisterArcaInput(payload: CashRegisterArcaFormPayload): boolean {
  return (
    payload.arcaPtoVta.trim().length > 0 ||
    payload.arcaExpiresAt.trim().length > 0 ||
    payload.crtFile != null ||
    payload.keyFile != null
  )
}

function hasFileExtension(file: File, extension: string): boolean {
  return file.name.toLowerCase().endsWith(extension)
}

export function validateCashRegisterArcaFiles(
  payload: CashRegisterArcaFormPayload,
): { success: true } | { success: false; error: string } {
  const crt = payload.crtFile
  const key = payload.keyFile
  if ((crt && !key) || (!crt && key)) {
    return {
      success: false,
      error: "Subí ambos archivos (.crt y .key) o ninguno.",
    }
  }
  if (crt && !hasFileExtension(crt, ".crt")) {
    return {
      success: false,
      error: "El certificado debe ser un archivo .crt.",
    }
  }
  if (key && !hasFileExtension(key, ".key")) {
    return {
      success: false,
      error: "La clave privada debe ser un archivo .key.",
    }
  }
  return { success: true }
}

export function parseCashRegisterArcaPtoVta(
  raw: string,
): { success: true; value: number | null } | { success: false; error: string } {
  const ptoRaw = raw.trim()
  const ptoParsed = ptoRaw === "" ? null : Number(ptoRaw)
  if (
    ptoParsed != null &&
    (!Number.isFinite(ptoParsed) || ptoParsed < 0 || ptoParsed > 99999)
  ) {
    return { success: false, error: "Punto de venta inválido (0–99999 o vacío)." }
  }
  return { success: true, value: ptoParsed }
}

export async function saveCashRegisterArcaConfig(
  popId: string,
  registerId: string,
  base: {
    name: string
    sortOrder: number
    isActive: boolean
    cashTreasuryAccountId: string
    arcaCertificateSecretName: string | null
    arcaCertificateLastFour: string | null
  },
  payload: CashRegisterArcaFormPayload,
): Promise<{ success: true } | { success: false; error: string }> {
  const pto = parseCashRegisterArcaPtoVta(payload.arcaPtoVta)
  if (!pto.success) return pto

  const crt = payload.crtFile
  const key = payload.keyFile
  const filesValidation = validateCashRegisterArcaFiles(payload)
  if (!filesValidation.success) return filesValidation

  if (crt && key) {
    const fd = new FormData()
    fd.append("crt", crt)
    fd.append("key", key)
    const exp = payload.arcaExpiresAt.trim().slice(0, 10)
    if (exp.length > 0) fd.append("expiresAt", exp)
    const up = await uploadCashRegisterArcaCertificates(popId, registerId, fd)
    if (!up.success) return up
  }

  return updateCashRegister(popId, registerId, {
    name: base.name,
    sortOrder: base.sortOrder,
    isActive: base.isActive,
    cashTreasuryAccountId: base.cashTreasuryAccountId,
    arcaPtoVta: pto.value,
    arcaCertificateSecretName: base.arcaCertificateSecretName,
    arcaCertificateLastFour: base.arcaCertificateLastFour,
    arcaCertificateExpiresAt: payload.arcaExpiresAt.trim().slice(0, 10) || null,
  })
}
