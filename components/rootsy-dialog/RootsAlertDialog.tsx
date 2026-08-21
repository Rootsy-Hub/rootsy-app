"use client"

import {
  rootsAlertDialogBodyTextClass,
  rootsAlertDialogContentClass,
  rootsAlertDialogDescriptionClass,
  rootsAlertDialogFooterClass,
  rootsAlertDialogSurfaceClass,
  rootsAlertDialogTitleClass,
  rootsDialogContentNestedZClass,
  rootsDialogContentZClass,
  rootsDialogOverlayClass,
  rootsDialogOverlayNestedClass,
} from "@/components/rootsy-dialog/rootsDialogProductStyles"
import {
  RootsDangerButton,
  RootsPrimaryButton,
  RootsSubtleButton,
} from "@/components/rootsy-button"
import {
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import type { ComponentProps, ReactNode } from "react"

type AlertContentProps = ComponentProps<typeof AlertDialogContent> & {
  overlayClassName?: string
  /** Abrí este alert encima de otro diálogo: el velo cubre el modal de abajo. */
  nested?: boolean
}

export function RootsAlertDialogContent({
  className,
  overlayClassName,
  nested = false,
  children,
  ...props
}: AlertContentProps) {
  return (
    <AlertDialogContent
      className={cn(
        rootsAlertDialogSurfaceClass,
        nested ? rootsDialogContentNestedZClass : rootsDialogContentZClass,
        className,
      )}
      overlayClassName={cn(
        nested ? rootsDialogOverlayNestedClass : rootsDialogOverlayClass,
        overlayClassName,
      )}
      {...props}
    >
      {children}
    </AlertDialogContent>
  )
}

type PanelProps = {
  title: ReactNode
  description?: ReactNode
  descriptionClassName?: string
  children?: ReactNode
  className?: string
}

export function RootsAlertDialogPanel({
  title,
  description,
  descriptionClassName,
  children,
  className,
}: PanelProps) {
  return (
    <div className={cn(rootsAlertDialogContentClass, className)}>
      <div className="flex flex-col gap-1">
        <AlertDialogTitle className={rootsAlertDialogTitleClass}>
          {title}
        </AlertDialogTitle>
        {description != null ? (
          <AlertDialogDescription
            className={cn(rootsAlertDialogDescriptionClass, descriptionClassName)}
          >
            {description}
          </AlertDialogDescription>
        ) : null}
      </div>
      {children}
    </div>
  )
}

export function RootsAlertDialogBodyText({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <p className={cn(rootsAlertDialogBodyTextClass, className)}>{children}</p>
  )
}

type FooterProps = {
  cancelLabel?: string
  confirmLabel?: string
  onCancel?: () => void
  onConfirm?: () => void
  destructive?: boolean
  confirmDisabled?: boolean
  cancelDisabled?: boolean
  /** dialog.footer.single — solo la acción primaria a la derecha. */
  hideCancel?: boolean
  className?: string
}

export function RootsAlertDialogFooter({
  cancelLabel = "Cancelar",
  confirmLabel = "Confirmar",
  onCancel,
  onConfirm,
  destructive = false,
  confirmDisabled,
  cancelDisabled,
  hideCancel = false,
  className,
}: FooterProps) {
  const ConfirmButton = destructive ? RootsDangerButton : RootsPrimaryButton

  return (
    <AlertDialogFooter
      className={cn(
        rootsAlertDialogFooterClass,
        hideCancel && "sm:justify-end",
        className,
      )}
    >
      {hideCancel ? null : (
        <RootsSubtleButton
          type="button"
          disabled={cancelDisabled}
          onClick={onCancel}
        >
          {cancelLabel}
        </RootsSubtleButton>
      )}
      <ConfirmButton type="button" onClick={onConfirm} disabled={confirmDisabled}>
        {confirmLabel}
      </ConfirmButton>
    </AlertDialogFooter>
  )
}
