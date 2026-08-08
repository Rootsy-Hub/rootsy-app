"use client"

import {
  rootsAlertDialogBodyTextClass,
  rootsAlertDialogContentClass,
  rootsAlertDialogDescriptionClass,
  rootsAlertDialogFooterClass,
  rootsAlertDialogSurfaceClass,
  rootsAlertDialogTitleClass,
  rootsDialogContentZClass,
  rootsDialogOverlayClass,
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
}

export function RootsAlertDialogContent({
  className,
  overlayClassName,
  children,
  ...props
}: AlertContentProps) {
  return (
    <AlertDialogContent
      className={cn(rootsAlertDialogSurfaceClass, rootsDialogContentZClass, className)}
      overlayClassName={cn(rootsDialogOverlayClass, overlayClassName)}
      {...props}
    >
      {children}
    </AlertDialogContent>
  )
}

type PanelProps = {
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  className?: string
}

export function RootsAlertDialogPanel({
  title,
  description,
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
          <AlertDialogDescription className={rootsAlertDialogDescriptionClass}>
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
  className?: string
}

export function RootsAlertDialogFooter({
  cancelLabel = "Cancelar",
  confirmLabel = "Confirmar",
  onCancel,
  onConfirm,
  destructive = false,
  confirmDisabled,
  className,
}: FooterProps) {
  const ConfirmButton = destructive ? RootsDangerButton : RootsPrimaryButton

  return (
    <AlertDialogFooter className={cn(rootsAlertDialogFooterClass, className)}>
      <RootsSubtleButton type="button" onClick={onCancel}>
        {cancelLabel}
      </RootsSubtleButton>
      <ConfirmButton type="button" onClick={onConfirm} disabled={confirmDisabled}>
        {confirmLabel}
      </ConfirmButton>
    </AlertDialogFooter>
  )
}
