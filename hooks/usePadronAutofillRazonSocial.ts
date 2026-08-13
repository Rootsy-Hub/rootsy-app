"use client"

import { lookupPadronForPop } from "@/app/[siteId]/[popId]/padronLookup/actions"
import type { ClientIvaConditionValue } from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import type { PadronActividadItem } from "@/lib/argentinaPadronLookup"
import { mapPadronCondicionIvaToClientEnum } from "@/lib/padronIvaMapping"
import { DEBOUNCE_MS_SAFE } from "@/lib/debounceMs"
import { useCallback, useEffect, useRef, useState } from "react"

export type UsePadronAutofillOptions = {
  enabled?: boolean
  debounceMs?: number
  /**
   * Si es true, un documento vacío o inválido no borra la razón social ya obtenida.
   * Útil mientras se hidrata el formulario (p. ej. Ajustes del POP) para no pisar datos del servidor.
   */
  suppressClear?: boolean
  /** No consulta al escribir; usar `lookup()`. */
  manual?: boolean
}

export type PadronLookupSuccess = {
  success: true
  razonSocial: string
  domicilioFiscal: string
  condicionIvaNombre: string
  mappedIvaCondition: ClientIvaConditionValue | null
  fiscalActividadesPadron: PadronActividadItem[]
}

export type PadronLookupFailure = {
  success: false
  error: string
}

export type PadronLookupResult = PadronLookupSuccess | PadronLookupFailure

export function canLookupPadronDocument(rawDocument: string): boolean {
  const raw = rawDocument.trim()
  if (!raw) return false
  const digits = raw.replace(/\D/g, "")
  return digits.length === 11 || (digits.length >= 6 && digits.length <= 9)
}

function applyPadronLookupSuccess(
  res: Extract<Awaited<ReturnType<typeof lookupPadronForPop>>, { success: true }>,
): PadronLookupSuccess {
  return {
    success: true,
    razonSocial: res.razonSocial,
    domicilioFiscal: res.domicilioFiscal?.trim() ?? "",
    condicionIvaNombre: res.condicionIvaNombre?.trim() ?? "",
    mappedIvaCondition: mapPadronCondicionIvaToClientEnum(res.condicionIvaNombre),
    fiscalActividadesPadron: res.fiscalActividadesPadron ?? [],
  }
}

export function usePadronAutofillRazonSocial(
  popId: string | undefined,
  rawDocument: string,
  options?: UsePadronAutofillOptions,
) {
  const enabled = options?.enabled ?? true
  const debounceMs = options?.debounceMs ?? DEBOUNCE_MS_SAFE
  const suppressClear = options?.suppressClear ?? false
  const manual = options?.manual ?? false

  const [razonSocial, setRazonSocial] = useState("")
  const [domicilioFiscal, setDomicilioFiscal] = useState("")
  const [condicionIvaNombre, setCondicionIvaNombre] = useState("")
  const [mappedIvaCondition, setMappedIvaCondition] =
    useState<ClientIvaConditionValue | null>(null)
  const [fiscalActividadesPadron, setFiscalActividadesPadron] = useState<
    PadronActividadItem[]
  >([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lookupGenRef = useRef(0)

  const clearPadronState = useCallback(() => {
    setRazonSocial("")
    setDomicilioFiscal("")
    setCondicionIvaNombre("")
    setMappedIvaCondition(null)
    setFiscalActividadesPadron([])
    setError(null)
  }, [])

  const applySuccess = useCallback((result: PadronLookupSuccess) => {
    setRazonSocial(result.razonSocial)
    setDomicilioFiscal(result.domicilioFiscal)
    setCondicionIvaNombre(result.condicionIvaNombre)
    setMappedIvaCondition(result.mappedIvaCondition)
    setFiscalActividadesPadron(result.fiscalActividadesPadron)
    setError(null)
  }, [])

  const lookup = useCallback(
    async (document = rawDocument): Promise<PadronLookupResult> => {
      if (!popId || !enabled) {
        return { success: false, error: "Consulta no disponible." }
      }

      const raw = document.trim()
      if (!canLookupPadronDocument(raw)) {
        return {
          success: false,
          error: "Ingresá un CUIT o DNI válido para consultar AFIP.",
        }
      }

      const gen = ++lookupGenRef.current
      setBusy(true)
      setError(null)

      const res = await lookupPadronForPop(popId, raw)
      if (gen !== lookupGenRef.current) {
        return { success: false, error: "Consulta cancelada." }
      }

      setBusy(false)

      if (!res.success) {
        setError(res.error)
        setRazonSocial("")
        setDomicilioFiscal("")
        setCondicionIvaNombre("")
        setMappedIvaCondition(null)
        setFiscalActividadesPadron([])
        return { success: false, error: res.error }
      }

      const success = applyPadronLookupSuccess(res)
      applySuccess(success)
      return success
    },
    [popId, enabled, rawDocument, applySuccess],
  )

  useEffect(() => {
    if (!popId || !enabled) return

    if (manual) {
      if (!suppressClear) {
        clearPadronState()
      }
      return
    }

    let cancelled = false
    const raw = rawDocument.trim()
    if (!raw) {
      if (!suppressClear) {
        clearPadronState()
      }
      return
    }
    if (!canLookupPadronDocument(raw)) {
      if (!suppressClear) {
        clearPadronState()
      }
      return
    }

    const t = setTimeout(() => {
      void (async () => {
        setBusy(true)
        setError(null)
        const res = await lookupPadronForPop(popId, raw)
        if (cancelled) return
        setBusy(false)
        if (!res.success) {
          setError(res.error)
          setRazonSocial("")
          setDomicilioFiscal("")
          setCondicionIvaNombre("")
          setMappedIvaCondition(null)
          setFiscalActividadesPadron([])
          return
        }
        applySuccess(applyPadronLookupSuccess(res))
      })()
    }, debounceMs)

    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [
    popId,
    rawDocument,
    enabled,
    debounceMs,
    suppressClear,
    manual,
    clearPadronState,
    applySuccess,
  ])

  return {
    razonSocial,
    domicilioFiscal,
    condicionIvaNombre,
    mappedIvaCondition,
    fiscalActividadesPadron,
    busy,
    error,
    lookup,
    canLookup: canLookupPadronDocument(rawDocument),
  }
}
