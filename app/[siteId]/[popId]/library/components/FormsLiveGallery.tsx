"use client"

import { FormsLiveVariantRenderer } from "@/app/[siteId]/[popId]/library/components/FormsLiveVariantRenderer"
import { ROOTSY_FORM_LIVE_FAMILIES } from "@/app/[siteId]/[popId]/library/form/rootsyFormLiveCatalog"
import { FORM_UI_DEMO_COPY } from "@/app/[siteId]/[popId]/library/ui-components/formsUiHardcodedSpec"
import { FoundationBrumaStage } from "@/app/[siteId]/[popId]/library/libraryFoundationDocShared"
import { COLOR_TOKENS } from "@/app/[siteId]/[popId]/library/color/rootsyColorSystem"
import type { RootsFormDiscountMode } from "@/components/rootsy-form"
import { useState, type ReactNode } from "react"

function SectionHeading({ title }: { title: string }) {
  return (
    <h2 className="font-canopy text-base font-semibold" style={{ color: COLOR_TOKENS.bruma900 }}>
      {title}
    </h2>
  )
}

function VariantBlock({
  label,
  children,
  fullWidth = false,
}: {
  label: string
  children: ReactNode
  fullWidth?: boolean
}) {
  return (
    <section className="space-y-3">
      <h3 className="font-canopy text-sm font-medium" style={{ color: COLOR_TOKENS.bruma700 }}>
        {label}
      </h3>
      <div className={fullWidth ? "min-w-0" : "min-w-0 max-w-sm"}>{children}</div>
    </section>
  )
}

function DemoGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">{children}</div>
}

export function FormsLiveGallery() {
  const copy = FORM_UI_DEMO_COPY
  const [textValue, setTextValue] = useState<string>(copy.text.value)
  const [textareaValue, setTextareaValue] = useState<string>(copy.textarea.value)
  const [selectValue, setSelectValue] = useState("bebidas")
  const [selectLeadingValue, setSelectLeadingValue] = useState("efectivo")
  const [moneyValue, setMoneyValue] = useState("1250")
  const [qtyValue, setQtyValue] = useState("24")
  const [dateValue, setDateValue] = useState("2026-08-03")
  const [dateLeadingValue, setDateLeadingValue] = useState("2026-08-03")
  const [checkboxChecked, setCheckboxChecked] = useState(true)
  const [switchChecked, setSwitchChecked] = useState(true)
  const [discountMode, setDiscountMode] = useState<RootsFormDiscountMode>("porcentaje")
  const [discountValue, setDiscountValue] = useState("10")
  const [deliverySegment, setDeliverySegment] = useState("pickup")
  const [itemKindSegment, setItemKindSegment] = useState("simple")
  const [phoneValue, setPhoneValue] = useState<string>(copy.phone.value)
  const [comprobanteValue, setComprobanteValue] = useState("factura-b")
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const demoState = {
    textValue,
    setTextValue,
    textareaValue,
    setTextareaValue,
    selectValue,
    setSelectValue,
    selectLeadingValue,
    setSelectLeadingValue,
    moneyValue,
    setMoneyValue,
    qtyValue,
    setQtyValue,
    dateValue,
    setDateValue,
    dateLeadingValue,
    setDateLeadingValue,
    checkboxChecked,
    setCheckboxChecked,
    switchChecked,
    setSwitchChecked,
    discountMode,
    setDiscountMode,
    discountValue,
    setDiscountValue,
    deliverySegment,
    setDeliverySegment,
    itemKindSegment,
    setItemKindSegment,
    phoneValue,
    setPhoneValue,
    comprobanteValue,
    setComprobanteValue,
    imagePreview,
    setImagePreview,
  }

  return (
    <div className="space-y-10">
      {ROOTSY_FORM_LIVE_FAMILIES.map((family) => {
        const isFieldStack = family.id === "field-stack"
        const isToolbarContext = family.id === "toolbar-context"

        return (
          <FoundationBrumaStage key={family.id} caption={family.title}>
            <div className="space-y-6">
              <SectionHeading title={family.title} />

              {isFieldStack ? (
                <div className="grid gap-8 lg:grid-cols-2">
                  {family.variants.map((variant) => (
                    <VariantBlock key={variant.code} label={variant.label}>
                      <FormsLiveVariantRenderer code={variant.code} state={demoState} />
                    </VariantBlock>
                  ))}
                </div>
              ) : isToolbarContext ? (
                family.variants.map((variant) => (
                  <VariantBlock key={variant.code} label={variant.label} fullWidth>
                    <FormsLiveVariantRenderer code={variant.code} state={demoState} />
                  </VariantBlock>
                ))
              ) : (
                <DemoGrid>
                  {family.variants.map((variant) => (
                    <VariantBlock key={variant.code} label={variant.label}>
                      <FormsLiveVariantRenderer code={variant.code} state={demoState} />
                    </VariantBlock>
                  ))}
                </DemoGrid>
              )}
            </div>
          </FoundationBrumaStage>
        )
      })}
    </div>
  )
}
