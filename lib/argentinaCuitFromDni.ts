/** Prefijos habituales de CUIT para persona física (AFIP). */
const PERSON_CUIT_PREFIXES = ["20", "27", "23", "24"] as const

const VERIFIER_WEIGHTS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2] as const

function onlyDigits(s: string): string {
  return s.replace(/\D/g, "")
}

/**
 * Calcula el dígito verificador AFIP para los primeros 10 dígitos del CUIT.
 * Retorna null si el resto es 1 y hay que cambiar el prefijo (20→23, 27/24→33).
 */
function cuitVerifierDigit(firstTen: string): string | "retry-prefix" | null {
  if (firstTen.length !== 10 || !/^\d+$/.test(firstTen)) return null
  let sum = 0
  for (let i = 0; i < 10; i++) {
    sum += Number(firstTen[i]) * VERIFIER_WEIGHTS[i]
  }
  const rest = sum % 11
  if (rest === 0) return "0"
  if (rest === 1) return "retry-prefix"
  return String(11 - rest)
}

function prefixAfterVerifierConflict(prefix: string): string | null {
  if (prefix === "20") return "23"
  if (prefix === "27" || prefix === "24") return "33"
  if (prefix === "23") return "33"
  return null
}

/**
 * Arma posibles CUIT (11 dígitos) a partir de un DNI, probando prefijos de persona física.
 * AFIP no expone búsqueda directa por DNI en constancia de inscripción; se infieren CUITs válidos.
 */
export function buildCuitCandidatesFromDni(rawDni: string): string[] {
  const dni = onlyDigits(rawDni.trim())
  if (dni.length < 6 || dni.length > 8) return []

  const body = dni.padStart(8, "0")
  const out = new Set<string>()

  for (const initialPrefix of PERSON_CUIT_PREFIXES) {
    let prefix: string = initialPrefix
    for (let attempt = 0; attempt < 2; attempt++) {
      const firstTen = prefix + body
      const dv = cuitVerifierDigit(firstTen)
      if (dv === "retry-prefix") {
        const next = prefixAfterVerifierConflict(prefix)
        if (!next) break
        prefix = next
        continue
      }
      if (dv != null) {
        out.add(firstTen + dv)
      }
      break
    }
  }

  return [...out]
}

export function normalizeDniDigits(raw: string): string | null {
  const d = onlyDigits(raw.trim())
  if (d.length < 6 || d.length > 9) return null
  if (d.length === 9) return d.slice(-8)
  return d
}
