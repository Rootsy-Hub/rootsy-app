"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  saleOpDialogContentMd,
  saleOpDialogHeader,
} from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"
import { useSaleScanInputFocus } from "@/components/sale-operation/SaleScanInputFocusContext"
import { useEffect, useRef, useState } from "react"

export const SALE_CATALOG_ENTRY_QTY_MIN = 1
export const SALE_CATALOG_ENTRY_QTY_MAX = 999

export function clampSaleCatalogEntryQty(value: number) {
  if (!Number.isFinite(value)) return SALE_CATALOG_ENTRY_QTY_MIN
  return Math.min(
    SALE_CATALOG_ENTRY_QTY_MAX,
    Math.max(SALE_CATALOG_ENTRY_QTY_MIN, Math.round(value)),
  )
}

type Props = {
  cantidadIngreso: number
  onCantidadIngresoChange: (cantidad: number) => void
  valueClassName: string
  valueHoverClassName?: string
}

export function SaleCatalogEntryQuantityDialog({
  cantidadIngreso,
  onCantidadIngresoChange,
  valueClassName,
  valueHoverClassName,
}: Props) {
  const scanFocus = useSaleScanInputFocus()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(String(cantidadIngreso))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) setDraft(String(cantidadIngreso))
  }, [cantidadIngreso, open])

  useEffect(() => {
    if (!open) return
    const id = window.requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
    return () => window.cancelAnimationFrame(id)
  }, [open])

  const commitDraft = () => {
    const trimmed = draft.trim()
    const parsed = trimmed.length > 0 ? Number.parseInt(trimmed, 10) : NaN
    onCantidadIngresoChange(clampSaleCatalogEntryQty(parsed))
  }

  const handleOpenChange = (next: boolean) => {
    if (!next && open) {
      commitDraft()
      scanFocus?.focusScanInput()
    }
    setOpen(next)
  }

  return (
    <>
      <button
        type="button"
        className={cn(valueClassName, "rounded px-0.5 transition-colors", valueHoverClassName)}
        aria-label={`Cantidad a ingresar: ${cantidadIngreso}. Tocá para editar`}
        onClick={() => setOpen(true)}
      >
        {cantidadIngreso}
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className={cn(saleOpDialogContentMd, "max-w-xs gap-4 sm:max-w-sm")}
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <DialogHeader className={cn(saleOpDialogHeader, "shrink-0 text-center sm:text-center")}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Cantidad a ingresar
            </DialogTitle>
            <DialogDescription className="sr-only">
              Ingresá la cantidad de unidades a agregar al pedido. Enter confirma.
            </DialogDescription>
          </DialogHeader>

          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={draft}
            onChange={(event) => setDraft(event.target.value.replace(/\D/g, ""))}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                commitDraft()
                setOpen(false)
              }
            }}
            aria-label="Cantidad a ingresar"
            className="w-full border-0 bg-transparent py-2 text-center text-6xl font-bold tabular-nums tracking-tight text-foreground outline-none"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
