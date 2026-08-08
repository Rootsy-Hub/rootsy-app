"use client"

import { rootsDialogFooterClass } from "@/components/rootsy-dialog/rootsDialogProductStyles"
import {
  RootsDangerButton,
  RootsPrimaryButton,
  RootsProgressButton,
  RootsSubtleButton,
} from "@/components/rootsy-button"
import { DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

export type RootsDialogFooterVariant =
  | "none"
  | "single"
  | "dual"
  | "destructive-dual"

type RootsDialogFooterProps = ComponentProps<typeof DialogFooter>

export function RootsDialogFooter({ className, ...props }: RootsDialogFooterProps) {
  return (
    <DialogFooter className={cn(rootsDialogFooterClass, className)} {...props} />
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
      <RootsPrimaryButton
        type={actionType}
        onClick={actionType === "button" ? onAction : undefined}
        disabled={disabled}
      >
        {label}
      </RootsPrimaryButton>
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
  destructive?: boolean
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
  destructive = false,
  className,
}: RootsDialogDualActionFooterProps) {
  return (
    <RootsDialogFooter className={className}>
      <div className="flex w-full items-center justify-between gap-3">
        <RootsSubtleButton type="button" onClick={onCancel}>
          {cancelLabel}
        </RootsSubtleButton>
        {confirmLoading ? (
          <RootsProgressButton
            type={confirmType}
            semantic={destructive ? "destructive" : "primary"}
            disabled={confirmDisabled}
            loading={confirmLoading}
            loadingLabel={confirmLoadingLabel}
            onClick={confirmType === "button" ? onConfirm : undefined}
            className="shrink-0"
          >
            {confirmLabel}
          </RootsProgressButton>
        ) : destructive ? (
          <RootsDangerButton
            type={confirmType}
            disabled={confirmDisabled}
            onClick={confirmType === "button" ? onConfirm : undefined}
            className="shrink-0"
          >
            {confirmLabel}
          </RootsDangerButton>
        ) : (
          <RootsPrimaryButton
            type={confirmType}
            disabled={confirmDisabled}
            onClick={confirmType === "button" ? onConfirm : undefined}
            className="shrink-0"
          >
            {confirmLabel}
          </RootsPrimaryButton>
        )}
      </div>
    </RootsDialogFooter>
  )
}

type RootsDialogFooterByVariantProps = {
  variant: RootsDialogFooterVariant
  onClose: () => void
  confirmLabel?: string
}

export function RootsDialogFooterByVariant({
  variant,
  onClose,
  confirmLabel,
}: RootsDialogFooterByVariantProps) {
  if (variant === "none") return null

  if (variant === "single") {
    return (
      <RootsDialogSingleActionFooter
        label={confirmLabel ?? "Confirmar"}
        onAction={onClose}
        align="end"
      />
    )
  }

  if (variant === "destructive-dual") {
    return (
      <RootsDialogDualActionFooter
        onCancel={onClose}
        onConfirm={onClose}
        confirmType="button"
        confirmLabel={confirmLabel ?? "Eliminar"}
        destructive
      />
    )
  }

  return (
    <RootsDialogDualActionFooter
      onCancel={onClose}
      onConfirm={onClose}
      confirmType="button"
      confirmLabel={confirmLabel ?? "Guardar"}
    />
  )
}
