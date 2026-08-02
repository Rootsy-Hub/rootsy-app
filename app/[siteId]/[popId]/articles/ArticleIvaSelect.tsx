"use client"

import {
  articleFormFieldStackClass,
  articleFormSelectContentClass,
  articleFormSelectItemClass,
  articleFormSelectTriggerClass,
} from "@/app/[siteId]/[popId]/articles/articleConstants"
import { CheckoutSectionLabel } from "@/components/checkout/CheckoutFormFields"
import {
  formatArticleIvaOptionLabel,
  getArticleIvaOptions,
} from "@/lib/articleIva"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  id: string
  siteId: string
  value: string
  onChange: (value: string) => void
  required?: boolean
}

export function ArticleIvaSelect({
  id,
  siteId,
  value,
  onChange,
  required = true,
}: Props) {
  const options = getArticleIvaOptions(siteId)

  return (
    <div className={articleFormFieldStackClass}>
      <CheckoutSectionLabel>IVA</CheckoutSectionLabel>
      <div className="w-full min-w-0">
        <Select value={value || undefined} onValueChange={onChange} required={required}>
          <SelectTrigger id={id} className={articleFormSelectTriggerClass}>
            <SelectValue placeholder="Elegir tipo de IVA…" />
          </SelectTrigger>
          <SelectContent className={articleFormSelectContentClass} position="popper">
            {options.map((option) => (
              <SelectItem
                key={option.arcaAlicuotaId}
                value={String(option.arcaAlicuotaId)}
                className={articleFormSelectItemClass}
              >
                {formatArticleIvaOptionLabel(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
