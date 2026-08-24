"use client"

import { formatInventoryQtyWithUnit } from "@/app/[siteId]/[popId]/inventory/inventoryFormat"
import { manufacturingConfirmPhrase } from "@/app/[siteId]/[popId]/manufacturing/manufacturingConstants"
import {
  RootsDangerButton,
  RootsProgressButton,
  RootsSubtleButton,
  rootsButtonClassForVariant,
} from "@/components/rootsy-button"
import {
  RootsAlertDialogBodyText,
  RootsAlertDialogContent,
  RootsDialogErrorBanner,
  rootsAlertDialogContentClass,
  rootsAlertDialogDescriptionClass,
  rootsAlertDialogFooterClass,
  rootsAlertDialogTitleClass,
} from "@/components/rootsy-dialog"
import { RootsFormTextField } from "@/components/rootsy-form"
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { useEffect, useMemo, useRef } from "react"

export type ManufacturingConfirmLine = {
  articleId: string
  articleName: string
  itemKind: string
  need: number
  unitOfMeasure: string
}

type Props = {
  open: boolean
  recipeName: string
  outputArticleName: string
  quantity: number
  unitOfMeasure: string
  producedAt: string
  expiresAt: string
  lines: ManufacturingConfirmLine[]
  confirmValue: string
  banner: string | null
  busy: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
  onConfirmValueChange: (value: string) => void
  onConfirm: () => void
}

function formatManufacturingDay(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!match) return iso
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  return new Date(year, month - 1, day).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function ManufacturingConfirmDialog({
  open,
  recipeName,
  outputArticleName,
  quantity,
  unitOfMeasure,
  producedAt,
  expiresAt,
  lines,
  confirmValue,
  banner,
  busy,
  onOpenChange,
  onClose,
  onConfirmValueChange,
  onConfirm,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const confirmPhrase = useMemo(
    () =>
      manufacturingConfirmPhrase({
        quantity,
        unitOfMeasure,
        itemKinds: lines.map((line) => line.itemKind),
      }),
    [lines, quantity, unitOfMeasure],
  )
  const confirmReady = confirmValue.trim() === confirmPhrase

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => {
      inputRef.current?.focus()
    }, 40)
    return () => window.clearTimeout(timer)
  }, [open])

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return
        onOpenChange(next)
      }}
    >
      <RootsAlertDialogContent nested>
        <div className={rootsAlertDialogContentClass}>
          <div className="flex flex-col gap-1">
            <AlertDialogTitle className={rootsAlertDialogTitleClass}>
              ¿Fabricar ahora?
            </AlertDialogTitle>
            <AlertDialogDescription className={rootsAlertDialogDescriptionClass}>
              Esta acción no se puede revertir. Entra el artículo al depósito y
              baja los insumos. Para continuar, copiá la frase de abajo.
            </AlertDialogDescription>
          </div>

          <div className="space-y-2">
            <RootsAlertDialogBodyText>
              {formatInventoryQtyWithUnit(quantity, unitOfMeasure)}
              {outputArticleName ? ` de ${outputArticleName}` : ""}
              {recipeName ? ` · receta ${recipeName}` : ""}
              {producedAt ? ` · ${formatManufacturingDay(producedAt)}` : ""}
              {expiresAt
                ? ` · vence ${formatManufacturingDay(expiresAt)}`
                : ""}
            </RootsAlertDialogBodyText>
            {lines.length > 0 ? (
              <ul className="space-y-1">
                {lines.map((line) => (
                  <li
                    key={line.articleId}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <span className="min-w-0 text-rootsy-bruma-900">
                      {line.articleName}
                    </span>
                    <span className="shrink-0 text-xs text-rootsy-bruma-500">
                      {formatInventoryQtyWithUnit(line.need, line.unitOfMeasure)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <p className="select-all rounded-lg bg-[color-mix(in_srgb,var(--rootsy-bruma-100)_88%,transparent)] px-3 py-2 text-sm font-medium text-pretty text-rootsy-bruma-900">
            {confirmPhrase}
          </p>

          <RootsFormTextField
            ref={inputRef}
            label="Frase de confirmación"
            value={confirmValue}
            onChange={(event) => onConfirmValueChange(event.target.value)}
            placeholder="Pegá o escribí la frase"
            disabled={busy}
            autoComplete="off"
            aria-label={`Confirmación: ${confirmPhrase}`}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return
              event.preventDefault()
              if (confirmReady && !busy) onConfirm()
            }}
          />

          {banner ? (
            <RootsDialogErrorBanner className="mb-0">{banner}</RootsDialogErrorBanner>
          ) : null}
        </div>

        <AlertDialogFooter
          className={cn(rootsAlertDialogFooterClass, "sm:justify-between")}
        >
          <RootsSubtleButton type="button" onClick={onClose} disabled={busy}>
            Volver
          </RootsSubtleButton>
          {busy ? (
            <RootsProgressButton
              type="button"
              semantic="destructive"
              className={rootsButtonClassForVariant("destructive", "shrink-0")}
              loading
              loadingLabel="Fabricando…"
              disabled
            >
              Fabricar: no se puede revertir
            </RootsProgressButton>
          ) : (
            <RootsDangerButton
              type="button"
              className="shrink-0"
              disabled={!confirmReady}
              onClick={onConfirm}
            >
              Fabricar: no se puede revertir
            </RootsDangerButton>
          )}
        </AlertDialogFooter>
      </RootsAlertDialogContent>
    </AlertDialog>
  )
}
