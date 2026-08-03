"use client"

import {
  rootsFormGridClass,
  rootsFormGridDividerClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"
import { Children, type ReactNode } from "react"

type Props = {
  className?: string
  children: ReactNode
}

/** Grilla de dos columnas con separador vertical en desktop. */
export function RootsFormGrid({ className, children }: Props) {
  const [left, right] = Children.toArray(children)

  return (
    <div className={cn(rootsFormGridClass, className)}>
      {left}
      <div className={rootsFormGridDividerClass} aria-hidden />
      {right}
    </div>
  )
}

export function RootsFormGridDivider() {
  return <div className={rootsFormGridDividerClass} aria-hidden />
}
