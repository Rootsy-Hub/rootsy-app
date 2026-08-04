"use client"

import { articleDialogFooterClass } from "@/app/[siteId]/[popId]/articles/articleConstants"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

export type RootsDialogFooterVariant = "none" | "single" | "dual"

type RootsDialogFooterProps = ComponentProps<typeof DialogFooter>

export function RootsDialogFooter({ className, ...props }: RootsDialogFooterProps) {
  return (
    <DialogFooter className={cn(articleDialogFooterClass, className)} {...props} />
  )
}

type RootsDialogSingleActionFooterProps = {
  label?: string
  onAction: () => void
  actionType?: "button" | "submit"
  disabled?: boolean
  align?: "start" | "end"
  className?: string
}

export function RootsDialogSingleActionFooter({
  label = "Confirmar",
  onAction,
  actionType = "button",
  disabled,
  align = "end",
  className,
}: RootsDialogSingleActionFooterProps) {
  return (
    <RootsDialogFooter
      className={cn(align === "end" && "sm:justify-end", className)}
    >
      <Button type={actionType} onClick={onAction} disabled={disabled}>
        {label}
      </Button>
    </RootsDialogFooter>
  )
}

type RootsDialogDualActionFooterProps = {
  cancelLabel?: string
  confirmLabel?: string
  onCancel: () => void
  onConfirm?: () => void
  confirmType?: "button" | "submit"
  confirmDisabled?: boolean
  confirmLoading?: boolean
  confirmLoadingLabel?: string
  className?: string
}

export function RootsDialogDualActionFooter({
  cancelLabel = "Cancelar",
  confirmLabel = "Confirmar",
  onCancel,
  onConfirm,
  confirmType = "button",
  confirmDisabled,
  confirmLoading,
  confirmLoadingLabel,
  className,
}: RootsDialogDualActionFooterProps) {
  return (
    <RootsDialogFooter className={className}>
      <Button type="button" variant="outline" onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button
        type={confirmType}
        disabled={confirmDisabled || confirmLoading}
        onClick={confirmType === "button" ? onConfirm : undefined}
      >
        {confirmLoading && confirmLoadingLabel
          ? confirmLoadingLabel
          : confirmLabel}
      </Button>
    </RootsDialogFooter>
  )
}

type RootsDialogFooterByVariantProps = {
  variant: RootsDialogFooterVariant
  onClose: () => void
}

export function RootsDialogFooterByVariant({
  variant,
  onClose,
}: RootsDialogFooterByVariantProps) {
  if (variant === "none") return null

  if (variant === "single") {
    return (
      <RootsDialogSingleActionFooter onAction={onClose} align="end" />
    )
  }

  return (
    <RootsDialogDualActionFooter
      onCancel={onClose}
      onConfirm={onClose}
      confirmType="button"
    />
  )
}
