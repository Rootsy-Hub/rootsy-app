"use client"

import { FormsPeriodFilterLiveDemo } from "@/app/library/components/FormsPeriodFilterLiveDemo"
import {
  FORM_UI_DEMO_COPY,
  getFormUiToolbarEmbedShellStyle,
  getFormUiToolbarTableHeadPreviewStyle,
} from "@/app/library/ui-components/formsUiHardcodedSpec"
import { COLOR_TOKENS } from "@/app/library/color/rootsyColorSystem"
import {
  RootsFormCheckboxField,
  RootsFormDateField,
  RootsFormDiscountField,
  RootsFormImageUploadField,
  RootsFormMoneyField,
  RootsFormPhoneField,
  RootsFormQuantityField,
  RootsFormSegmentField,
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormSwitchField,
  RootsFormTextField,
  RootsFormTextareaField,
  RootsFormToolbarListFilters,
  type RootsFormDiscountMode,
} from "@/components/rootsy-form"
import { CalendarRange, Landmark, Receipt } from "lucide-react"

export type FormsLiveDemoState = {
  textValue: string
  setTextValue: (value: string) => void
  textareaValue: string
  setTextareaValue: (value: string) => void
  selectValue: string
  setSelectValue: (value: string) => void
  selectLeadingValue: string
  setSelectLeadingValue: (value: string) => void
  moneyValue: string
  setMoneyValue: (value: string) => void
  qtyValue: string
  setQtyValue: (value: string) => void
  dateValue: string
  setDateValue: (value: string) => void
  dateLeadingValue: string
  setDateLeadingValue: (value: string) => void
  checkboxChecked: boolean
  setCheckboxChecked: (value: boolean) => void
  switchChecked: boolean
  setSwitchChecked: (value: boolean) => void
  discountMode: RootsFormDiscountMode
  setDiscountMode: (value: RootsFormDiscountMode) => void
  discountValue: string
  setDiscountValue: (value: string) => void
  deliverySegment: string
  setDeliverySegment: (value: string) => void
  itemKindSegment: string
  setItemKindSegment: (value: string) => void
  phoneValue: string
  setPhoneValue: (value: string) => void
  comprobanteValue: string
  setComprobanteValue: (value: string) => void
  imagePreview: string | null
  setImagePreview: (value: string | null) => void
}

export function FormsLiveVariantRenderer({
  code,
  state,
}: {
  code: string
  state: FormsLiveDemoState
}) {
  const copy = FORM_UI_DEMO_COPY

  switch (code) {
    case "form.field-stack.hint":
      return (
        <RootsFormTextField
          label={copy.text.label}
          value={state.textValue}
          onChange={(event) => state.setTextValue(event.target.value)}
          hint={copy.hint}
        />
      )
    case "form.field-stack.error":
      return (
        <RootsFormTextField
          label={copy.text.label}
          placeholder={copy.text.placeholder}
          error={copy.error}
          invalid
        />
      )
    case "form.text.default":
      return (
        <RootsFormTextField
          label={copy.text.label}
          value={state.textValue}
          onChange={(event) => state.setTextValue(event.target.value)}
          placeholder={copy.text.placeholder}
        />
      )
    case "form.textarea.default":
      return (
        <RootsFormTextareaField
          label={copy.textarea.label}
          value={state.textareaValue}
          onChange={(event) => state.setTextareaValue(event.target.value)}
          rows={3}
        />
      )
    case "form.text.phone":
      return (
        <RootsFormPhoneField
          label={copy.phone.label}
          value={state.phoneValue}
          onChange={(event) => state.setPhoneValue(event.target.value)}
        />
      )
    case "form.text.money":
      return (
        <RootsFormMoneyField
          label={copy.leadingCurrency.label}
          value={state.moneyValue}
          onChange={state.setMoneyValue}
        />
      )
    case "form.text.quantity":
      return (
        <RootsFormQuantityField
          label={copy.leadingUnit.label}
          value={state.qtyValue}
          onChange={state.setQtyValue}
        />
      )
    case "form.checkbox.default":
      return (
        <RootsFormCheckboxField
          label={copy.checkbox.label}
          checked={state.checkboxChecked}
          onCheckedChange={state.setCheckboxChecked}
        />
      )
    case "form.switch.default":
      return (
        <RootsFormSwitchField
          label={copy.switch.label}
          checked={state.switchChecked}
          onCheckedChange={state.setSwitchChecked}
        />
      )
    case "form.select.default":
      return (
        <RootsFormSelectField
          label={copy.select.label}
          value={state.selectValue}
          onValueChange={state.setSelectValue}
          placeholder={copy.select.placeholder}
        >
          <RootsFormSelectItem value="bebidas">Bebidas</RootsFormSelectItem>
          <RootsFormSelectItem value="verduras">Verduras</RootsFormSelectItem>
        </RootsFormSelectField>
      )
    case "form.select.inline-icon":
      return (
        <RootsFormSelectField
          label={copy.selectLeading.label}
          value={state.selectLeadingValue}
          onValueChange={state.setSelectLeadingValue}
          placeholder={copy.selectLeading.placeholder}
          prefix={<Landmark className="size-4" aria-hidden />}
          prefixVariant="inline"
        >
          <RootsFormSelectItem value="efectivo">Efectivo</RootsFormSelectItem>
          <RootsFormSelectItem value="tarjeta">Tarjeta</RootsFormSelectItem>
        </RootsFormSelectField>
      )
    case "form.select.leading-sunken":
      return (
        <RootsFormSelectField
          label={copy.selectLeading.label}
          value={state.selectLeadingValue}
          onValueChange={state.setSelectLeadingValue}
          placeholder={copy.selectLeading.placeholder}
          prefix={<Landmark className="size-4" aria-hidden />}
        >
          <RootsFormSelectItem value="efectivo">Efectivo</RootsFormSelectItem>
          <RootsFormSelectItem value="tarjeta">Tarjeta</RootsFormSelectItem>
        </RootsFormSelectField>
      )
    case "form.select.long-list":
      return (
        <RootsFormSelectField
          label="Comprobante"
          value={state.comprobanteValue}
          onValueChange={state.setComprobanteValue}
          prefix={<Receipt className="size-4" aria-hidden />}
          prefixVariant="inline"
          hint="Usá select cuando hay más de 4 opciones o textos largos."
        >
          <RootsFormSelectItem value="sin">Sin comprobante</RootsFormSelectItem>
          <RootsFormSelectItem value="recibo-x">Recibo X</RootsFormSelectItem>
          <RootsFormSelectItem value="factura-b">Factura B</RootsFormSelectItem>
          <RootsFormSelectItem value="factura-c">Factura C</RootsFormSelectItem>
        </RootsFormSelectField>
      )
    case "form.select.disabled":
      return (
        <RootsFormSelectField
          label={copy.select.label}
          value=""
          onValueChange={() => undefined}
          placeholder={copy.select.placeholder}
          disabled
        >
          <RootsFormSelectItem value="bebidas">Bebidas</RootsFormSelectItem>
          <RootsFormSelectItem value="verduras">Verduras</RootsFormSelectItem>
        </RootsFormSelectField>
      )
    case "form.select.readonly":
      return (
        <RootsFormSelectField
          label={copy.select.label}
          value="bebidas"
          onValueChange={() => undefined}
          readOnly
        >
          <RootsFormSelectItem value="bebidas">Bebidas</RootsFormSelectItem>
          <RootsFormSelectItem value="verduras">Verduras</RootsFormSelectItem>
        </RootsFormSelectField>
      )
    case "form.date.default":
      return (
        <RootsFormDateField
          label={copy.date.label}
          value={state.dateValue}
          onChange={state.setDateValue}
          placeholder={copy.date.placeholder}
        />
      )
    case "form.date.leading":
      return (
        <RootsFormDateField
          label={copy.dateLeading.label}
          value={state.dateLeadingValue}
          onChange={state.setDateLeadingValue}
          placeholder={copy.date.placeholder}
          prefix={<CalendarRange className="size-4" aria-hidden />}
        />
      )
    case "form.period-filter.default":
      return <FormsPeriodFilterLiveDemo variant="layout" />
    case "form.period-filter.compact":
      return <FormsPeriodFilterLiveDemo variant="compact" />
    case "form.period-filter.custom-range":
      return (
        <FormsPeriodFilterLiveDemo
          variant="compact"
          initialPreset="custom"
          initialCustomRange={{
            from: new Date(2026, 7, 1),
            to: new Date(2026, 7, 13),
          }}
        />
      )
    case "form.image-upload.empty":
      return (
        <RootsFormImageUploadField label={copy.imageUpload.label} onFileSelect={() => undefined} />
      )
    case "form.image-upload.filled":
      return (
        <RootsFormImageUploadField
          label={copy.imageUpload.label}
          previewSrc={state.imagePreview}
          emptyTitle={copy.imageUpload.emptyTitle}
          emptySubtitle={copy.imageUpload.emptySubtitle}
          previewCaption={copy.imageUpload.filledTitle}
          statusHint={copy.imageUpload.filledMeta}
          onFileSelect={(file) => {
            if (state.imagePreview) URL.revokeObjectURL(state.imagePreview)
            state.setImagePreview(URL.createObjectURL(file))
          }}
          onRemove={() => {
            if (state.imagePreview) URL.revokeObjectURL(state.imagePreview)
            state.setImagePreview(null)
          }}
        />
      )
    case "form.discount.default":
      return (
        <RootsFormDiscountField
          label={copy.discount.label}
          mode={state.discountMode}
          onModeChange={state.setDiscountMode}
          value={state.discountValue}
          onChange={state.setDiscountValue}
          onClear={() => state.setDiscountValue("")}
          hint={copy.discount.hint}
        />
      )
    case "form.segment.two-options":
      return (
        <RootsFormSegmentField
          label={copy.segmentDelivery.label}
          value={state.deliverySegment}
          onValueChange={state.setDeliverySegment}
          options={[
            { value: "pickup", label: "Mostrador" },
            { value: "delivery", label: "Delivery" },
          ]}
        />
      )
    case "form.segment.three-options":
      return (
        <RootsFormSegmentField
          label={copy.segmentItemKind.label}
          value={state.itemKindSegment}
          onValueChange={state.setItemKindSegment}
          hint={copy.segmentItemKind.hint}
          options={[
            { value: "simple", label: "Simple" },
            { value: "combo", label: "Combo" },
            { value: "variant", label: "Variante" },
          ]}
        />
      )
    case "form.context.toolbar-list.flush":
      return (
        <div
          className="mx-auto max-w-4xl overflow-hidden rounded-2xl"
          style={{ border: `1px solid ${COLOR_TOKENS.bruma200}` }}
        >
          <div style={getFormUiToolbarEmbedShellStyle()}>
            <RootsFormToolbarListFilters />
          </div>
          <div style={getFormUiToolbarTableHeadPreviewStyle()}>
            {["Artículo", "Referencia", "Monto", "Estado"].map((column) => (
              <span key={column}>{column}</span>
            ))}
          </div>
        </div>
      )
    default:
      return null
  }
}
