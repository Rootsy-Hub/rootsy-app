"use client"

import {
  FORM_UI_DEMO_COPY,
  ROOTSY_FORM_TOOLBAR_CONTEXT,
  getFormUiToolbarEmbedShellStyle,
  getFormUiToolbarTableHeadPreviewStyle,
} from "@/app/[siteId]/[popId]/library/ui-components/formsUiHardcodedSpec"
import { FoundationBrumaStage } from "@/app/[siteId]/[popId]/library/libraryFoundationDocShared"
import { COLOR_TOKENS } from "@/app/[siteId]/[popId]/library/color/rootsyColorSystem"
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
import { useState, type ReactNode } from "react"

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-1">
      <h2 className="font-canopy text-base font-semibold" style={{ color: COLOR_TOKENS.bruma900 }}>
        {title}
      </h2>
      {description ? (
        <p className="font-canopy text-xs leading-relaxed" style={{ color: COLOR_TOKENS.bruma500 }}>
          {description}
        </p>
      ) : null}
    </div>
  )
}

function SpecBlock({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h3
          className="font-mono text-[11px] font-medium uppercase tracking-[0.12em]"
          style={{ color: COLOR_TOKENS.bruma500 }}
        >
          {title}
        </h3>
        {hint ? (
          <p className="mt-1 font-canopy text-xs leading-relaxed" style={{ color: COLOR_TOKENS.bruma500 }}>
            {hint}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function DemoGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{children}</div>
}

function DemoCell({ children }: { children: ReactNode }) {
  return <div className="min-w-0 max-w-sm">{children}</div>
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

  return (
    <div className="space-y-10">
      <FoundationBrumaStage caption="field-stack · space.100 · form.field.label · form.field.assist · componentes RootsForm.">
        <div className="space-y-8">
          <SectionHeading
            title="Anatomía de campo"
            description="Stack completo con hint neutral y variante error — componentes vivos."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <RootsFormTextField
              label={copy.text.label}
              value={textValue}
              onChange={(event) => setTextValue(event.target.value)}
              hint={copy.hint}
            />
            <RootsFormTextField
              label={copy.text.label}
              placeholder={copy.text.placeholder}
              error={copy.error}
              invalid
            />
          </div>
        </div>
      </FoundationBrumaStage>

      <FoundationBrumaStage caption="form.control.* · space.500 · radius.large · borde bruma · foco savia.">
        <div className="space-y-8">
          <SectionHeading
            title="Controles base"
            description="Texto · multilínea · select · booleanos — default interactivo."
          />
          <DemoGrid>
            <DemoCell>
              <SpecBlock title="form.control.text" hint="RootsFormTextField">
                <RootsFormTextField
                  label={copy.text.label}
                  value={textValue}
                  onChange={(event) => setTextValue(event.target.value)}
                  placeholder={copy.text.placeholder}
                />
              </SpecBlock>
            </DemoCell>
            <DemoCell>
              <SpecBlock title="form.control.textarea" hint="RootsFormTextareaField">
                <RootsFormTextareaField
                  label={copy.textarea.label}
                  value={textareaValue}
                  onChange={(event) => setTextareaValue(event.target.value)}
                  rows={3}
                />
              </SpecBlock>
            </DemoCell>
            <DemoCell>
              <SpecBlock title="form.control.select" hint="RootsFormSelectField">
                <RootsFormSelectField
                  label={copy.select.label}
                  value={selectValue}
                  onValueChange={setSelectValue}
                  placeholder={copy.select.placeholder}
                >
                  <RootsFormSelectItem value="bebidas">Bebidas</RootsFormSelectItem>
                  <RootsFormSelectItem value="verduras">Verduras</RootsFormSelectItem>
                </RootsFormSelectField>
              </SpecBlock>
            </DemoCell>
            <DemoCell>
              <SpecBlock title="form.control.checkbox" hint="RootsFormCheckboxField">
                <RootsFormCheckboxField
                  label={copy.checkbox.label}
                  checked={checkboxChecked}
                  onCheckedChange={setCheckboxChecked}
                />
              </SpecBlock>
            </DemoCell>
            <DemoCell>
              <SpecBlock title="form.control.switch" hint="RootsFormSwitchField">
                <RootsFormSwitchField
                  label={copy.switch.label}
                  checked={switchChecked}
                  onCheckedChange={setSwitchChecked}
                />
              </SpecBlock>
            </DemoCell>
          </DemoGrid>
        </div>
      </FoundationBrumaStage>

      <FoundationBrumaStage caption="form.control.leading · form.control.date · form.control.image-upload · componentes compuestos.">
        <div className="space-y-8">
          <SectionHeading
            title="Compuestos · fecha · imagen"
            description="Shell compuesta · inline-icon · date · carga inline."
          />
          <DemoGrid>
            <DemoCell>
              <SpecBlock title="form.control.leading · $" hint="RootsFormMoneyField">
                <RootsFormMoneyField
                  label={copy.leadingCurrency.label}
                  value={moneyValue}
                  onChange={setMoneyValue}
                />
              </SpecBlock>
            </DemoCell>
            <DemoCell>
              <SpecBlock title="form.control.leading · uds." hint="RootsFormQuantityField">
                <RootsFormQuantityField
                  label={copy.leadingUnit.label}
                  value={qtyValue}
                  onChange={setQtyValue}
                />
              </SpecBlock>
            </DemoCell>
            <DemoCell>
              <SpecBlock title="form.control.shell.inline-icon" hint="RootsFormSelectField · prefixVariant inline">
                <RootsFormSelectField
                  label={copy.selectLeading.label}
                  value={selectLeadingValue}
                  onValueChange={setSelectLeadingValue}
                  placeholder={copy.selectLeading.placeholder}
                  prefix={<Landmark className="size-4" aria-hidden />}
                  prefixVariant="inline"
                >
                  <RootsFormSelectItem value="efectivo">Efectivo</RootsFormSelectItem>
                  <RootsFormSelectItem value="tarjeta">Tarjeta</RootsFormSelectItem>
                </RootsFormSelectField>
              </SpecBlock>
            </DemoCell>
            <DemoCell>
              <SpecBlock title="form.control.select.leading" hint="RootsFormSelectField · prefixVariant sunken">
                <RootsFormSelectField
                  label={copy.selectLeading.label}
                  value={selectLeadingValue}
                  onValueChange={setSelectLeadingValue}
                  placeholder={copy.selectLeading.placeholder}
                  prefix={<Landmark className="size-4" aria-hidden />}
                >
                  <RootsFormSelectItem value="efectivo">Efectivo</RootsFormSelectItem>
                  <RootsFormSelectItem value="tarjeta">Tarjeta</RootsFormSelectItem>
                </RootsFormSelectField>
              </SpecBlock>
            </DemoCell>
            <DemoCell>
              <SpecBlock title="form.control.date" hint="RootsFormDateField">
                <RootsFormDateField
                  label={copy.date.label}
                  value={dateValue}
                  onChange={setDateValue}
                  placeholder={copy.date.placeholder}
                />
              </SpecBlock>
            </DemoCell>
            <DemoCell>
              <SpecBlock title="form.control.date.leading" hint="RootsFormDateField · prefix">
                <RootsFormDateField
                  label={copy.dateLeading.label}
                  value={dateLeadingValue}
                  onChange={setDateLeadingValue}
                  placeholder={copy.date.placeholder}
                  prefix={<CalendarRange className="size-4" aria-hidden />}
                />
              </SpecBlock>
            </DemoCell>
            <DemoCell>
              <SpecBlock title="form.control.image-upload · empty" hint="RootsFormImageUploadField">
                <RootsFormImageUploadField
                  label={copy.imageUpload.label}
                  onFileSelect={() => undefined}
                />
              </SpecBlock>
            </DemoCell>
          </DemoGrid>
        </div>
      </FoundationBrumaStage>

      <FoundationBrumaStage caption="form.control.discount · form.control.segment · form.control.phone · form.control.image-upload · compuestos de decisión.">
        <div className="space-y-8">
          <SectionHeading
            title="Componentes compuestos"
            description="Descuento dual · segment group · teléfono · imagen con preview · select largo."
          />
          <DemoGrid>
            <DemoCell>
              <SpecBlock title="form.control.discount" hint="RootsFormDiscountField · %/$">
                <RootsFormDiscountField
                  label={copy.discount.label}
                  mode={discountMode}
                  onModeChange={setDiscountMode}
                  value={discountValue}
                  onChange={setDiscountValue}
                  onClear={() => setDiscountValue("")}
                  hint={copy.discount.hint}
                />
              </SpecBlock>
            </DemoCell>
            <DemoCell>
              <SpecBlock title="form.control.segment · 2 opciones" hint="RootsFormSegmentField">
                <RootsFormSegmentField
                  label={copy.segmentDelivery.label}
                  value={deliverySegment}
                  onValueChange={setDeliverySegment}
                  options={[
                    { value: "pickup", label: "Mostrador" },
                    { value: "delivery", label: "Delivery" },
                  ]}
                />
              </SpecBlock>
            </DemoCell>
            <DemoCell>
              <SpecBlock title="form.control.segment · 3 opciones" hint="RootsFormSegmentField">
                <RootsFormSegmentField
                  label={copy.segmentItemKind.label}
                  value={itemKindSegment}
                  onValueChange={setItemKindSegment}
                  hint={copy.segmentItemKind.hint}
                  options={[
                    { value: "simple", label: "Simple" },
                    { value: "combo", label: "Combo" },
                    { value: "variant", label: "Variante" },
                  ]}
                />
              </SpecBlock>
            </DemoCell>
            <DemoCell>
              <SpecBlock title="form.control.leading · teléfono" hint="RootsFormPhoneField">
                <RootsFormPhoneField
                  label={copy.phone.label}
                  value={phoneValue}
                  onChange={(event) => setPhoneValue(event.target.value)}
                />
              </SpecBlock>
            </DemoCell>
            <DemoCell>
              <SpecBlock title="form.control.image-upload · filled" hint="RootsFormImageUploadField">
                <RootsFormImageUploadField
                  label={copy.imageUpload.label}
                  previewSrc={imagePreview}
                  emptyTitle={copy.imageUpload.emptyTitle}
                  emptySubtitle={copy.imageUpload.emptySubtitle}
                  previewCaption={copy.imageUpload.filledTitle}
                  statusHint={copy.imageUpload.filledMeta}
                  onFileSelect={(file) => {
                    if (imagePreview) URL.revokeObjectURL(imagePreview)
                    setImagePreview(URL.createObjectURL(file))
                  }}
                  onRemove={() => {
                    if (imagePreview) URL.revokeObjectURL(imagePreview)
                    setImagePreview(null)
                  }}
                />
              </SpecBlock>
            </DemoCell>
            <DemoCell>
              <SpecBlock title="form.control.select · lista larga" hint="RootsFormSelectField · inline-icon">
                <RootsFormSelectField
                  label="Comprobante"
                  value={comprobanteValue}
                  onValueChange={setComprobanteValue}
                  prefix={<Receipt className="size-4" aria-hidden />}
                  prefixVariant="inline"
                  hint="Usá select cuando hay más de 4 opciones o textos largos."
                >
                  <RootsFormSelectItem value="sin">Sin comprobante</RootsFormSelectItem>
                  <RootsFormSelectItem value="recibo-x">Recibo X</RootsFormSelectItem>
                  <RootsFormSelectItem value="factura-b">Factura B</RootsFormSelectItem>
                  <RootsFormSelectItem value="factura-c">Factura C</RootsFormSelectItem>
                </RootsFormSelectField>
              </SpecBlock>
            </DemoCell>
          </DemoGrid>
        </div>
      </FoundationBrumaStage>

      <FoundationBrumaStage caption="form.context.toolbar-list · RootsFormToolbarListFilters · layout.toolbar.">
        <div className="space-y-8">
          <SectionHeading
            title="En contexto · toolbar listado"
            description="Barra de filtros con componentes vivos — inline-icon · labels · layout.toolbar · 92px."
          />
          <SpecBlock
            title={`${ROOTSY_FORM_TOOLBAR_CONTEXT.token} · inline-icon`}
            hint="RootsFormToolbarListFilters · embebido en layout.toolbar."
          >
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
          </SpecBlock>
        </div>
      </FoundationBrumaStage>
    </div>
  )
}
