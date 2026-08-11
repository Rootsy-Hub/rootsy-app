"use client"

import {
  RootsFormSelectField,
  RootsFormSelectItem,
} from "@/components/rootsy-form"
import {
  formatArticleIvaOptionLabel,
  getArticleIvaOptions,
} from "@/lib/articleIva"
import type { ReactNode } from "react"

type Props = {
  id: string
  siteId: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  labelInfo?: ReactNode
  error?: string
}

export function ArticleIvaSelect({
  id,
  siteId,
  value,
  onChange,
  disabled = false,
  labelInfo,
  error,
}: Props) {
  const options = getArticleIvaOptions(siteId)

  return (
    <RootsFormSelectField
      label="IVA"
      id={id}
      value={value}
      onValueChange={onChange}
      placeholder="Elegir tipo de IVA…"
      disabled={disabled}
      labelInfo={labelInfo}
      error={error}
      invalid={Boolean(error)}
    >
      {options.map((option) => (
        <RootsFormSelectItem
          key={option.arcaAlicuotaId}
          value={String(option.arcaAlicuotaId)}
        >
          {formatArticleIvaOptionLabel(option)}
        </RootsFormSelectItem>
      ))}
    </RootsFormSelectField>
  )
}
