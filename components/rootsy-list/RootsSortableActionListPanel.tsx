"use client"

import {
  rootsSortableListBodyClass,
  rootsSortableListFooterHintClass,
  rootsSortableListPanelClass,
  rootsSortableListPanelDescriptionClass,
  rootsSortableListPanelHeaderClass,
  rootsSortableListPanelTitleClass,
} from "@/components/rootsy-list/rootsListStyles"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  title: string
  description?: string
  footerHint?: string
  children: ReactNode
  className?: string
}

export function RootsSortableActionListPanel({
  title,
  description,
  footerHint,
  children,
  className,
}: Props) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className={rootsSortableListPanelClass}>
        <div className={rootsSortableListPanelHeaderClass}>
          <p className={rootsSortableListPanelTitleClass}>{title}</p>
          {description ? (
            <p className={rootsSortableListPanelDescriptionClass}>
              {description}
            </p>
          ) : null}
        </div>
        <div className={rootsSortableListBodyClass}>{children}</div>
      </div>
      {footerHint ? (
        <p className={rootsSortableListFooterHintClass}>{footerHint}</p>
      ) : null}
    </div>
  )
}
