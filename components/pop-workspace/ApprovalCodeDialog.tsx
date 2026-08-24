"use client"

import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
  RootsDialogHeader,
  RootsDialogLoadingState,
} from "@/components/rootsy-dialog"
import { RootsFormTextField } from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"
import {
  clearApprovalCode,
  fetchApprovalCodeStatus,
  setApprovalCode,
} from "@/lib/rootsyApi/approvalCodeClient"
import { useEffect, useState, type FormEvent } from "react"

type Props = {
  popId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CODE_RE = /^[0-9]{4,8}$/

export function ApprovalCodeDialog({ popId, open, onOpenChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [hasCode, setHasCode] = useState(false)
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !popId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    setCode("")
    void fetchApprovalCodeStatus(popId).then((res) => {
      if (cancelled) return
      setLoading(false)
      if (!res.success) {
        setError(res.error)
        return
      }
      if (!res.canSet) {
        setError("Tu rol no puede generar un código de aprobación.")
        return
      }
      setHasCode(res.hasCode)
    })
    return () => {
      cancelled = true
    }
  }, [open, popId])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = code.trim()
    if (!CODE_RE.test(trimmed)) {
      setError("Usá un código de 4 a 8 dígitos.")
      return
    }
    setSaving(true)
    setError(null)
    const res = await setApprovalCode(popId, trimmed)
    setSaving(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    onOpenChange(false)
  }

  const handleClear = async () => {
    setClearing(true)
    setError(null)
    const res = await clearApprovalCode(popId)
    setClearing(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    onOpenChange(false)
  }

  const busy = saving || clearing

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent showCloseButton={!busy}>
        <RootsDialogHeader
          open={open}
          title="Código de aprobación"
          description="Elegí un PIN de 4 a 8 dígitos. Lo usás para autorizar acciones de quien solo puede pedir aprobación. No se guarda en claro."
        />
        <RootsDialogForm onSubmit={(event) => void handleSubmit(event)}>
          <RootsDialogBody className="space-y-4">
            {loading ? (
              <RootsDialogLoadingState message="Consultando tu código…" />
            ) : (
              <>
                {hasCode ? (
                  <p className="font-canopy text-sm leading-relaxed text-rootsy-bruma-600">
                    Ya tenés un código en este local. Podés cambiarlo o
                    borrarlo.
                  </p>
                ) : null}
                <RootsFormTextField
                  label="Código"
                  id="approval-code-input"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={8}
                  value={code}
                  onChange={(event) =>
                    setCode(event.target.value.replace(/\D/g, "").slice(0, 8))
                  }
                  placeholder="••••"
                  hint="Solo números. Tiene que ser único en este punto de venta."
                />
              </>
            )}
            {error ? <RootsDialogErrorBanner>{error}</RootsDialogErrorBanner> : null}
          </RootsDialogBody>
          <RootsDialogDualActionFooter
            onCancel={() => onOpenChange(false)}
            confirmLabel={hasCode ? "Cambiar código" : "Guardar código"}
            confirmLoadingLabel="Guardando…"
            confirmType="submit"
            confirmDisabled={loading || busy || code.length < 4}
            confirmLoading={saving}
          />
        </RootsDialogForm>
        {hasCode && !loading ? (
          <div className="px-6 pb-5">
            <button
              type="button"
              className="font-canopy text-sm text-rootsy-danger underline-offset-2 hover:underline disabled:opacity-50"
              disabled={busy}
              onClick={() => void handleClear()}
            >
              {clearing ? "Borrando…" : "Borrar mi código"}
            </button>
          </div>
        ) : null}
      </RootsDialogContent>
    </Dialog>
  )
}
