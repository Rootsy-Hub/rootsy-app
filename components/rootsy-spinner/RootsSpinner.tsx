"use client"

import {
  rootsSpinnerClassName,
  type RootsSpinnerSize,
} from "@/components/rootsy-spinner/rootsSpinnerStyles"
import type { ComponentPropsWithoutRef } from "react"

type Props = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  size?: RootsSpinnerSize
  /** Solo lectores de pantalla cuando el spinner es el único indicador visible. */
  label?: string
}

export function RootsSpinner({
  size = "default",
  className,
  label = "Cargando",
  "aria-hidden": ariaHidden,
  ...props
}: Props) {
  return (
    <div
      role={ariaHidden ? undefined : "status"}
      aria-label={ariaHidden ? undefined : label}
      aria-hidden={ariaHidden}
      aria-live={ariaHidden ? undefined : "polite"}
      className={rootsSpinnerClassName(size, className)}
      {...props}
    />
  )
}
