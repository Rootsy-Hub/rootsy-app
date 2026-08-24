"use client"

import {
  RootsAlertDialogBodyText,
  RootsAlertDialogContent,
  RootsAlertDialogPanel,
  RootsAlertDialogFooter,
} from "@/components/rootsy-dialog"
import { RootsFormTextField } from "@/components/rootsy-form"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { useEffect, useRef, useState } from "react"

export const CHAT_ROOTSY_DELETE_CONFIRM_PHRASE = "ELIMINAR"

type Props = {
  open: boolean
  title: string
  description: string
  items: string[]
  confirmPhrase?: string
  busy?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ChatRootsyDestructiveConfirmDialog({
  open,
  title,
  description,
  items,
  confirmPhrase = CHAT_ROOTSY_DELETE_CONFIRM_PHRASE,
  busy = false,
  onOpenChange,
  onConfirm,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState("")
  const ready = value.trim() === confirmPhrase

  useEffect(() => {
    if (!open) {
      setValue("")
      return
    }
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40)
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
      <RootsAlertDialogContent>
        <RootsAlertDialogPanel title={title} description={description}>
          <RootsAlertDialogBodyText>
            Esta acción es irreversible. El registro deja de estar disponible en
            el negocio.
          </RootsAlertDialogBodyText>
          {items.length ? (
            <ul className="mt-2 space-y-1">
              {items.map((item) => (
                <li
                  key={item}
                  className="font-canopy text-sm text-rootsy-bruma-900"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
          <p className="mt-3 select-all rounded-lg bg-[color-mix(in_srgb,var(--rootsy-bruma-100)_88%,transparent)] px-3 py-2 font-canopy text-sm font-medium text-rootsy-bruma-900">
            {confirmPhrase}
          </p>
          <RootsFormTextField
            ref={inputRef}
            className="mt-3"
            label="Frase de confirmación"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={`Escribí ${confirmPhrase}`}
            disabled={busy}
            autoComplete="off"
            aria-label={`Para eliminar, escribí ${confirmPhrase}`}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return
              event.preventDefault()
              if (ready && !busy) onConfirm()
            }}
          />
        </RootsAlertDialogPanel>
        <RootsAlertDialogFooter
          cancelLabel="Volver"
          confirmLabel="Eliminar definitivamente"
          destructive
          confirmDisabled={!ready || busy}
          cancelDisabled={busy}
          onCancel={() => {
            if (busy) return
            onOpenChange(false)
          }}
          onConfirm={onConfirm}
        />
      </RootsAlertDialogContent>
    </AlertDialog>
  )
}
