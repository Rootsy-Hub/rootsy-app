"use client"

import {
  rootsDialogDescriptionClass,
  rootsDialogHeaderClass,
  rootsDialogHeaderCompactClass,
  rootsDialogHeaderWithDescriptionClass,
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
  const showVisibleDescription = description != null && !descriptionHidden
  const showAssistiveDescription = description != null && descriptionHidden

  return (
    <DialogHeader
      className={cn(
        rootsDialogHeaderClass,
        showVisibleDescription
          ? rootsDialogHeaderWithDescriptionClass
          : rootsDialogHeaderCompactClass,
        className,
      )}
    >
      <DialogTitle className={rootsDialogTitleClass}>{title}</DialogTitle>
      {showVisibleDescription ? (
        <DialogDescription className={rootsDialogDescriptionClass}>
          {description}
        </DialogDescription>
      ) : showAssistiveDescription ? (
        <DialogDescription className="sr-only">{description}</DialogDescription>
      ) : null}
    </DialogHeader>
  )
}
