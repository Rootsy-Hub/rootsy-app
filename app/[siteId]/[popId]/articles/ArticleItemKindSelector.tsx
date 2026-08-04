"use client"

import {
  RootsFormSegmentField,
  type RootsFormSegmentOption,
} from "@/components/rootsy-form"
import {
  ARTICLE_ITEM_KINDS,
  ARTICLE_ITEM_KIND_SELECTOR_HINT,
  ARTICLE_ITEM_KIND_STOCK_LABEL,
  type ArticleItemKind,
} from "@/lib/articleItemKind"

const ARTICLE_ITEM_KIND_SEGMENT_OPTIONS: RootsFormSegmentOption[] =
  ARTICLE_ITEM_KINDS.map((kind) => ({
    value: kind,
    label: ARTICLE_ITEM_KIND_STOCK_LABEL[kind],
  }))

type Props = {
  value: ArticleItemKind
  onChange: (kind: ArticleItemKind) => void
  readOnly?: boolean
  disabled?: boolean
}

export function ArticleItemKindSelector({
  value,
  onChange,
  readOnly = false,
  disabled = false,
}: Props) {
  const hint = readOnly
    ? `${ARTICLE_ITEM_KIND_SELECTOR_HINT[value]}. No se puede modificar al editar.`
    : ARTICLE_ITEM_KIND_SELECTOR_HINT[value]

  return (
    <RootsFormSegmentField
      label="Tipo de artículo"
      value={value}
      onValueChange={(next) => onChange(next as ArticleItemKind)}
      options={ARTICLE_ITEM_KIND_SEGMENT_OPTIONS}
      hint={hint}
      disabled={disabled || readOnly}
    />
  )
}
