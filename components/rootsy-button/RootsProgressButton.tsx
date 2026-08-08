"use client"

import {
  RootsSemanticButton,
} from "@/components/rootsy-button/RootsSemanticButton"
import type { RootsButtonSpecSize } from "@/components/rootsy-button/rootsButtonSpecRuntime"
import type { RootsButtonSemanticVariant } from "@/components/rootsy-button/rootsButtonStyles"
import type { LucideIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

type Props = Omit<ComponentProps<typeof RootsSemanticButton>, "children" | "withIcon"> & {
  children: ReactNode
  semantic?: RootsButtonSemanticVariant
  size?: RootsButtonSpecSize
  icon?: LucideIcon
  iconPosition?: "left" | "right"
}

export function RootsProgressButton({
  children,
  loading = false,
  loadingLabel,
  icon: Icon,
  iconPosition = "left",
  semantic = "primary",
  size = "default",
  ...props
}: Props) {
  return (
    <RootsSemanticButton
      semantic={semantic}
      size={size}
      loading={loading}
      loadingLabel={loadingLabel}
      withIcon={Boolean(Icon) || loading}
      {...props}
    >
      {!loading && Icon && iconPosition === "left" ? (
        <Icon className="size-4" aria-hidden />
      ) : null}
      {children}
      {!loading && Icon && iconPosition === "right" ? (
        <Icon className="size-4" aria-hidden />
      ) : null}
    </RootsSemanticButton>
  )
}
