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
import { useFrozenWhileClosing } from "@/components/rootsy-dialog/useFrozenWhileClosing"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  title: ReactNode
  description?: ReactNode
  descriptionHidden?: boolean
  /** Pasá el `open` del diálogo para congelar título/descripción durante el cierre. */
  open?: boolean
  className?: string
}

export function RootsDialogHeader({
  title,
  description,
  descriptionHidden = false,
  open,
  className,
}: Props) {
  const freeze = open != null
  const displayTitle = useFrozenWhileClosing(freeze ? open : true, title)
  const displayDescription = useFrozenWhileClosing(
    freeze ? open : true,
    description,
  )
  const showVisibleDescription =
    displayDescription != null && !descriptionHidden
  const showAssistiveDescription =
    displayDescription != null && descriptionHidden

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
      <DialogTitle className={rootsDialogTitleClass}>{displayTitle}</DialogTitle>
      {showVisibleDescription ? (
        <DialogDescription className={rootsDialogDescriptionClass}>
          {displayDescription}
        </DialogDescription>
      ) : showAssistiveDescription ? (
        <DialogDescription className="sr-only">
          {displayDescription}
        </DialogDescription>
      ) : null}
    </DialogHeader>
  )
}
