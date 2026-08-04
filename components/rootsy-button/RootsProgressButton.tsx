"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2, type LucideIcon } from "lucide-react"
import type { ComponentProps } from "react"

type Props = Omit<ComponentProps<typeof Button>, "children"> & {
  children: React.ReactNode
  loading?: boolean
  loadingLabel?: string
  icon?: LucideIcon
  iconPosition?: "left" | "right"
}

export function RootsProgressButton({
  children,
  loading = false,
  loadingLabel,
  icon: Icon,
  iconPosition = "left",
  disabled,
  className,
  ...props
}: Props) {
  const isDisabled = disabled || loading
  const label = loading ? (loadingLabel ?? children) : children

  return (
    <Button disabled={isDisabled} className={className} {...props}>
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {label}
        </>
      ) : (
        <>
          {Icon && iconPosition === "left" ? (
            <Icon className="size-4" aria-hidden />
          ) : null}
          {children}
          {Icon && iconPosition === "right" ? (
            <Icon className="size-4" aria-hidden />
          ) : null}
        </>
      )}
    </Button>
  )
}
