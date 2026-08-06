"use client"

import {
  rootsDialogDescriptionClass,
  rootsDialogHeaderClass,
  rootsDialogTitleClass,
} from "@/components/rootsy-dialog/rootsDialogProductStyles"
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  title: ReactNode
  description?: ReactNode
  descriptionHidden?: boolean
  className?: string
}

export function RootsDialogHeader({
  title,
  description,
  descriptionHidden = false,
  className,
}: Props) {
  return (
    <DialogHeader className={cn(rootsDialogHeaderClass, className)}>
      <DialogTitle className={rootsDialogTitleClass}>{title}</DialogTitle>
      {description != null ? (
        <DialogDescription
          className={cn(
            rootsDialogDescriptionClass,
            descriptionHidden && "sr-only",
          )}
        >
          {description}
        </DialogDescription>
      ) : null}
    </DialogHeader>
  )
}
