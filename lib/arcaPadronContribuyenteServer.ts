import "server-only"

import {
  loginWsaaAndGetPersonaV2,
  loginWsaaAndGetFirstMatchingPersonaV2,
} from "@/lib/arcaPadronWs"
import type { PadronLookupOk } from "@/lib/argentinaPadronLookup"
import { buildCuitCandidatesFromDni } from "@/lib/argentinaCuitFromDni"
import { getGlobalAfipPadronContext } from "@/lib/rootsyGlobalAfipConfigServer"

function extractSoapFaultText(e: unknown): string {
  if (!(e instanceof Error)) return ""
  const any = e as Error & {
    root?: { Body?: { Fault?: { faultstring?: string } } }
    response?: { data?: unknown }
  }
  const fs = any.root?.Body?.Fault?.faultstring
  if (typeof fs === "string" && fs.trim()) return fs.trim()
  return e.message
}

function friendlyAfipWsaaMessage(raw: string): string | null {
  const t = raw.toLowerCase()
  if (
    t.includes("coe.notauthorized") ||
    t.includes("computador no autorizado") ||
    t.includes("loginfault") ||
    t.includes("notauthorized")
  ) {
    return (
      "AFIP rechazó el acceso (computador no autorizado). Suele faltar habilitar el servicio " +
      "«Constancia de inscripción» / ws_sr_constancia_inscripcion en el Administrador de relaciones " +
      "de clave fiscal para el mismo certificado que subiste. El CUIT en admin Rootsy debe ser el " +
      "del representado de ese certificado. Si el certificado es de homologación, en el servidor " +
      "definí ARCA_PADRON_AFIP_ENV=homologation."
    )
  }
  return null
}

function soapErrMessage(e: unknown): string {
  const raw = extractSoapFaultText(e)
  if (!raw) return "Error al comunicarse con ARCA/AFIP."
  const friendly = friendlyAfipWsaaMessage(raw)
  return friendly ?? raw
}

export async function lookupPadronArcaContribuyenteByCuit(
  cuit11: string,
): Promise<PadronLookupOk | { error: string } | null> {
  const ctx = await getGlobalAfipPadronContext()
  if (!ctx) return null
  try {
    return await loginWsaaAndGetPersonaV2({
      certPem: ctx.certPem,
      keyPem: ctx.keyPem,
      cuitRepresentada: ctx.representadaCuit,
      idPersonaCuit: cuit11,
    })
  } catch (e) {
    return { error: soapErrMessage(e) }
  }
}

/** Busca en AFIP probando los CUIT posibles derivados de un DNI (persona física). */
export async function lookupPadronArcaContribuyenteByDni(
  dni: string,
): Promise<PadronLookupOk | { error: string } | null> {
  const ctx = await getGlobalAfipPadronContext()
  if (!ctx) return null

  const candidates = buildCuitCandidatesFromDni(dni)
  if (candidates.length === 0) {
    return { error: "No se pudo calcular un CUIT válido para ese DNI." }
  }

  try {
    const res = await loginWsaaAndGetFirstMatchingPersonaV2({
      certPem: ctx.certPem,
      keyPem: ctx.keyPem,
      cuitRepresentada: ctx.representadaCuit,
      idPersonaCuits: candidates,
    })
    return {
      ...res,
      docTipoAfip: 96,
    }
  } catch (e) {
    return { error: soapErrMessage(e) }
  }
}
