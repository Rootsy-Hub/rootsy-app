"use client"

import {
  RootsSemanticButton,
} from "@/components/rootsy-button/RootsSemanticButton"
import type { RootsButtonSpecSize } from "@/components/rootsy-button/rootsButtonSpecRuntime"
import type { RootsButtonSemanticVariant } from "@/components/rootsy-button/rootsButtonStyles"
import type { ComponentProps, ReactNode } from "react"

type Props = Omit<ComponentProps<typeof RootsSemanticButton>, "children"> & {
  children: ReactNode
  semantic?: RootsButtonSemanticVariant
  size?: RootsButtonSpecSize
}

export function RootsProgressButton({
  children,
  loading = false,
  loadingLabel,
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
      {...props}
    >
      {children}
    </RootsSemanticButton>
  )
}
