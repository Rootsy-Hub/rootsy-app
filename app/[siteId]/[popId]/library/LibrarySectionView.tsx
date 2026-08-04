"use client"

import {
  articleDialogBodyClass,
  articleDialogDescriptionClass,
  articleDialogFooterClass,
  articleDialogHeaderClass,
  articleDialogSurfaceClass,
  articleDialogTitleClass,
} from "@/app/[siteId]/[popId]/articles/articleConstants"
import { ArticleDeleteAlertLibraryDemo } from "@/app/[siteId]/[popId]/library/ArticleDeleteAlertLibraryDemo"
import { LayoutButtonLibrarySection } from "@/app/[siteId]/[popId]/library/LayoutButtonLibrarySection"
import { LayoutDropdownLibrarySection } from "@/app/[siteId]/[popId]/library/LayoutDropdownLibrarySection"
import { ColorFoundationView } from "@/app/[siteId]/[popId]/library/color/ColorFoundationView"
import { isColorLibrarySection } from "@/app/[siteId]/[popId]/library/color/colorLibraryNav"
import { SpacingFoundationView } from "@/app/[siteId]/[popId]/library/spacing/SpacingFoundationView"
import { isSpacingLibrarySection } from "@/app/[siteId]/[popId]/library/spacing/spacingLibraryNav"
import { GridFoundationView } from "@/app/[siteId]/[popId]/library/grid/GridFoundationView"
import { isGridLibrarySection } from "@/app/[siteId]/[popId]/library/grid/gridLibraryNav"
import { TypographyFoundationView } from "@/app/[siteId]/[popId]/library/typography/TypographyFoundationView"
import { isTypographyLibrarySection } from "@/app/[siteId]/[popId]/library/typography/typographyLibraryNav"
import { MotionFoundationView } from "@/app/[siteId]/[popId]/library/motion/MotionFoundationView"
import { isMotionLibrarySection } from "@/app/[siteId]/[popId]/library/motion/motionLibraryNav"
import { IconographyFoundationView } from "@/app/[siteId]/[popId]/library/iconography/IconographyFoundationView"
import { isIconographyLibrarySection } from "@/app/[siteId]/[popId]/library/iconography/iconographyLibraryNav"
import { IllustrationsFoundationView } from "@/app/[siteId]/[popId]/library/illustrations/IllustrationsFoundationView"
import { isIllustrationsLibrarySection } from "@/app/[siteId]/[popId]/library/illustrations/illustrationsLibraryNav"
import { LogosFoundationView } from "@/app/[siteId]/[popId]/library/logos/LogosFoundationView"
import { isLogosLibrarySection } from "@/app/[siteId]/[popId]/library/logos/logosLibraryNav"
import { ElevationFoundationView } from "@/app/[siteId]/[popId]/library/elevation/ElevationFoundationView"
import { isElevationLibrarySection } from "@/app/[siteId]/[popId]/library/elevation/elevationLibraryNav"
import { BorderFoundationView } from "@/app/[siteId]/[popId]/library/border/BorderFoundationView"
import { isBorderLibrarySection } from "@/app/[siteId]/[popId]/library/border/borderLibraryNav"
import { RadiusFoundationView } from "@/app/[siteId]/[popId]/library/radius/RadiusFoundationView"
import { isRadiusLibrarySection } from "@/app/[siteId]/[popId]/library/radius/radiusLibraryNav"
import { LayoutsBlocksFoundationView } from "@/app/[siteId]/[popId]/library/layouts/LayoutsBlocksFoundationView"
import { LayoutsTablesFoundationView } from "@/app/[siteId]/[popId]/library/layouts/LayoutsTablesFoundationView"
import { isLayoutsLibrarySection } from "@/app/[siteId]/[popId]/library/layouts/layoutsLibraryNav"
import {
  LibrarySection,
  SpecCard,
} from "@/app/[siteId]/[popId]/library/layoutLibraryShared"
import { ArticleItemKindSelector } from "@/app/[siteId]/[popId]/articles/ArticleItemKindSelector"
import {
  RootsFormField,
  RootsFormDateField,
  RootsFormDiscountField,
  RootsFormGrid,
  RootsFormImageUploadField,
  RootsFormMoneyField,
  RootsFormQuantityField,
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormSegmentField,
  RootsFormSwitchField,
  RootsFormTextField,
  RootsFormTextareaField,
  rootsFormColumnClass,
  rootsFormTwoColRowClass,
  rootsFormTextFieldClass,
} from "@/components/rootsy-form"
import {
  RootsSortableActionList,
  RootsSortableActionListPanel,
  type RootsSortableActionListItem,
} from "@/components/rootsy-list"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogFooterByVariant,
  RootsDialogHeader,
  RootsDialogLoadingState,
  type RootsDialogFooterVariant,
} from "@/components/rootsy-dialog"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  RootsDangerButton,
  RootsDefaultButton,
  RootsPrimaryButton,
  RootsSubtleButton,
} from "@/components/rootsy-button"
import {
  saleOpAlertDialogContent,
  saleOpChannelErrorBanner,
  saleOpChannelHint,
  saleOpChannelWarningBanner,
} from "@/components/sale-operation/saleOperationStyles"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import type { ArticleItemKind } from "@/lib/articleItemKind"
import { CalendarIcon, Landmark, Receipt } from "lucide-react"
import { useState } from "react"

const MODAL_SAMPLE_TITLE = "Título del modal"
const MODAL_SAMPLE_DESCRIPTION = "Descripción breve del contenido."

type ModalFooterVariant = RootsDialogFooterVariant

type ModalVariantSpec = {
  id: string
  title: string
  description: string
  footerVariant: ModalFooterVariant
  loading?: boolean
}

const MODAL_VARIANTS: ModalVariantSpec[] = [
  {
    id: "modal-no-footer",
    title: "Sin footer",
    description: "Header + body. Cierre con × o acción fuera del modal.",
    footerVariant: "none",
  },
  {
    id: "modal-single-action",
    title: "Un botón",
    description: "Acción principal alineada a la derecha.",
    footerVariant: "single",
  },
  {
    id: "modal-dual-action",
    title: "Cancelar + confirmar",
    description: "Secundaria a la izquierda, primaria a la derecha.",
    footerVariant: "dual",
  },
  {
    id: "modal-loading",
    title: "Cargando",
    description: "Header + spinner centrado en body tierra. Sin footer ni texto visible.",
    footerVariant: "none",
    loading: true,
  },
]

function ModalDemoFormFields({
  name,
  onNameChange,
  description,
  onDescriptionChange,
  price,
  onPriceChange,
  className,
}: {
  name: string
  onNameChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
  price: string
  onPriceChange: (value: string) => void
  className?: string
}) {
  return (
    <div className={cn("space-y-3.5", className)}>
      <RootsFormTextField
        label="Nombre"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
      />
      <RootsFormTextareaField
        label="Descripción"
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        rows={3}
      />
      <RootsFormMoneyField
        label="Precio venta"
        value={price}
        onChange={onPriceChange}
      />
    </div>
  )
}

function ModalFooterPreview({ variant }: { variant: ModalFooterVariant }) {
  if (variant === "none") return null

  if (variant === "single") {
    return (
      <div className={cn(articleDialogFooterClass, "flex justify-end")}>
        <RootsPrimaryButton type="button">Confirmar</RootsPrimaryButton>
      </div>
    )
  }

  return (
    <div className={cn(articleDialogFooterClass, "flex items-center justify-between gap-3")}>
      <RootsSubtleButton type="button">Cancelar</RootsSubtleButton>
      <RootsPrimaryButton type="button">Guardar</RootsPrimaryButton>
    </div>
  )
}

function ModalChromePreview({ spec }: { spec: ModalVariantSpec }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-dashed border-border/80 bg-muted/15 p-3">
      <div
        className={cn(
          "pointer-events-none mx-auto w-full overflow-hidden",
          articleDialogSurfaceClass,
          "max-h-none shadow-md",
        )}
      >
        <div className={articleDialogHeaderClass}>
          <p className={articleDialogTitleClass}>{MODAL_SAMPLE_TITLE}</p>
          <p className={articleDialogDescriptionClass}>
            {MODAL_SAMPLE_DESCRIPTION}
          </p>
        </div>
        <div className={articleDialogBodyClass}>
          {spec.loading ? (
            <RootsDialogLoadingState />
          ) : (
            <div className="pointer-events-none">
              <ModalDemoFormFields
                name="Cola 500 ml"
                onNameChange={() => {}}
                description="Bebida gaseosa en envase individual."
                onDescriptionChange={() => {}}
                price="1.250,00"
                onPriceChange={() => {}}
              />
            </div>
          )}
        </div>
        {!spec.loading ? (
          <ModalFooterPreview variant={spec.footerVariant} />
        ) : null}
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        {spec.title}
      </p>
    </div>
  )
}

function LiveModalDemo({
  spec,
  open,
  onOpenChange,
}: {
  spec: ModalVariantSpec
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = useState("Cola 500 ml")
  const [description, setDescription] = useState(
    "Bebida gaseosa en envase individual.",
  )
  const [price, setPrice] = useState("1.250,00")
  const handleClose = () => onOpenChange(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent>
        <RootsDialogHeader
          title={MODAL_SAMPLE_TITLE}
          description={MODAL_SAMPLE_DESCRIPTION}
        />
        {spec.loading ? (
          <RootsDialogBody>
            <RootsDialogLoadingState />
          </RootsDialogBody>
        ) : (
          <>
            <RootsDialogBody>
              <ModalDemoFormFields
                name={name}
                onNameChange={setName}
                description={description}
                onDescriptionChange={setDescription}
                price={price}
                onPriceChange={setPrice}
              />
            </RootsDialogBody>
            <RootsDialogFooterByVariant
              variant={spec.footerVariant}
              onClose={handleClose}
            />
          </>
        )}
      </RootsDialogContent>
    </Dialog>
  )
}

type LibrarySectionViewProps = {
  sectionId: string
  siteId: string
  popId: string
  liveModalId: string | null
  onLiveModalIdChange: (id: string | null) => void
}

export function LibrarySectionView({
  sectionId,
  siteId,
  popId,
  liveModalId,
  onLiveModalIdChange,
}: LibrarySectionViewProps) {
  const [textValue, setTextValue] = useState("Ejemplo de texto")
  const [moneyValue, setMoneyValue] = useState("1.250,00")
  const [qtyValue, setQtyValue] = useState("12")
  const [selectValue, setSelectValue] = useState("bebidas")
  const [fieldSelectValue, setFieldSelectValue] = useState("efectivo")
  const [darkSelectPage, setDarkSelectPage] = useState("1")
  const [darkSelectPageSize, setDarkSelectPageSize] = useState("20")
  const [dateValue, setDateValue] = useState("2026-08-03")
  const [switchOn, setSwitchOn] = useState(true)
  const [switchCatalogOn, setSwitchCatalogOn] = useState(false)
  const [layoutName, setLayoutName] = useState("Cola 500 ml")
  const [layoutDesc, setLayoutDesc] = useState(
    "Bebida gaseosa en envase individual.",
  )
  const [layoutSku, setLayoutSku] = useState("BEB-001")
  const [layoutBarcode, setLayoutBarcode] = useState("7790310987654")
  const [layoutActive, setLayoutActive] = useState(true)
  const [layoutDiscountMode, setLayoutDiscountMode] = useState<
    "porcentaje" | "fijo"
  >("porcentaje")
  const [layoutDiscountValue, setLayoutDiscountValue] = useState("10")
  const [fieldHelpSku, setFieldHelpSku] = useState("BE")
  const [segment, setSegment] = useState<"porcentaje" | "fijo">("porcentaje")
  const [discountValue, setDiscountValue] = useState("10")
  const [fulfillmentSegment, setFulfillmentSegment] = useState<"pickup" | "delivery">("pickup")
  const [layoutItemKind, setLayoutItemKind] = useState<ArticleItemKind>("merchandise")
  const [sortableDemoItems, setSortableDemoItems] = useState<
    RootsSortableActionListItem[]
  >([
    { id: "bebidas", label: "Bebidas", visible: true },
    { id: "verduras", label: "Verduras", visible: true },
    { id: "solo-interno", label: "Solo interno", visible: false },
    { id: "general", label: "[Ejemplo] General", visible: true },
  ])
  const [sortableEditingId, setSortableEditingId] = useState<string | null>(
    null,
  )
  const [sortableEditingName, setSortableEditingName] = useState("")
  const [comprobanteValue, setComprobanteValue] = useState("factura-b")
  const [layoutImagePreview, setLayoutImagePreview] = useState<string | null>(
    null,
  )
  const liveModal = MODAL_VARIANTS.find((spec) => spec.id === liveModalId) ?? null

  if (isColorLibrarySection(sectionId)) {
    return (
      <ColorFoundationView
        sectionId={sectionId}
        siteId={siteId}
        popId={popId}
      />
    )
  }

  if (isSpacingLibrarySection(sectionId)) {
    return (
      <SpacingFoundationView
        sectionId={sectionId}
        siteId={siteId}
        popId={popId}
      />
    )
  }

  if (isGridLibrarySection(sectionId)) {
    return (
      <GridFoundationView
        sectionId={sectionId}
        siteId={siteId}
        popId={popId}
      />
    )
  }

  if (isTypographyLibrarySection(sectionId)) {
    return (
      <TypographyFoundationView
        sectionId={sectionId}
        siteId={siteId}
        popId={popId}
      />
    )
  }

  if (isMotionLibrarySection(sectionId)) {
    return (
      <MotionFoundationView
        sectionId={sectionId}
        siteId={siteId}
        popId={popId}
      />
    )
  }

  if (isIconographyLibrarySection(sectionId)) {
    return (
      <IconographyFoundationView
        sectionId={sectionId}
        siteId={siteId}
        popId={popId}
      />
    )
  }

  if (isIllustrationsLibrarySection(sectionId)) {
    return <IllustrationsFoundationView sectionId={sectionId} />
  }

  if (isLogosLibrarySection(sectionId)) {
    return (
      <LogosFoundationView
        sectionId={sectionId}
        siteId={siteId}
        popId={popId}
      />
    )
  }

  if (isElevationLibrarySection(sectionId)) {
    return (
      <ElevationFoundationView
        sectionId={sectionId}
        siteId={siteId}
        popId={popId}
      />
    )
  }

  if (isBorderLibrarySection(sectionId)) {
    return (
      <BorderFoundationView sectionId={sectionId} siteId={siteId} popId={popId} />
    )
  }

  if (isRadiusLibrarySection(sectionId)) {
    return (
      <RadiusFoundationView sectionId={sectionId} siteId={siteId} popId={popId} />
    )
  }

  if (isLayoutsLibrarySection(sectionId)) {
    if (sectionId === "layouts-blocks") {
      return (
        <LayoutsBlocksFoundationView
          sectionId={sectionId}
          siteId={siteId}
          popId={popId}
        />
      )
    }

    return (
      <LayoutsTablesFoundationView
        sectionId={sectionId}
        siteId={siteId}
        popId={popId}
      />
    )
  }

  switch (sectionId) {
    case "labels":
      return (
          <LibrarySection
            id="labels"
            title="Labels"
            description="Único label aprobado: prop label en RootsFormField, renderizado con CheckoutSectionLabel."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <SpecCard
                title="RootsFormField"
                source="components/rootsy-form/RootsFormField.tsx"
                tokens={["label", "CheckoutSectionLabel"]}
              >
                <RootsFormTextField
                  label="Nombre del artículo"
                  id="library-demo-name"
                  defaultValue="Cola 500 ml"
                />
              </SpecCard>
              <SpecCard
                title="Label + control custom"
                source="RootsFormField · children"
              >
                <RootsFormField label="Precios e impuestos" htmlFor="library-demo-price">
                  <Input
                    id="library-demo-price"
                    className={rootsFormTextFieldClass}
                    placeholder="0,00"
                  />
                </RootsFormField>
              </SpecCard>
            </div>
          </LibrarySection>
      )
    case "text":
      return (
          <LibrarySection
            id="text"
            title="Texto · una línea"
            description="Light form con rounded-lg y foco verde Rootsy más marcado. Siempre RootsFormTextField con prop label."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <SpecCard
                title="RootsFormTextField"
                source="components/rootsy-form/RootsFormTextField.tsx"
                tokens={["rounded-lg", "emerald-600", "h-11"]}
              >
                <RootsFormTextField
                  label="Nombre del artículo"
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder="Nombre"
                />
              </SpecCard>
              <SpecCard
                title="Placeholder"
                source="rootsFormTextFieldClass"
              >
                <RootsFormTextField
                  label="Referencia interna"
                  id="library-text-ref"
                  placeholder="SKU o código"
                />
              </SpecCard>
            </div>
          </LibrarySection>
      )
    case "multiline":
      return (
          <LibrarySection
            id="multiline"
            title="Multilínea"
            description="Misma familia visual que texto una línea. Siempre RootsFormTextareaField con prop label."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <SpecCard
                title="RootsFormTextareaField"
                source="components/rootsy-form/RootsFormTextareaField.tsx"
                tokens={["min-h-[5.25rem]", "resize-y", "emerald-700"]}
              >
                <RootsFormTextareaField
                  label="Descripción"
                  defaultValue="Descripción del artículo para el catálogo."
                  rows={4}
                />
              </SpecCard>
              <SpecCard title="Placeholder" source="rootsFormTextareaFieldClass">
                <RootsFormTextareaField
                  label="Notas internas"
                  id="library-textarea-notes"
                  placeholder="Opcional"
                  rows={3}
                />
              </SpecCard>
            </div>
          </LibrarySection>
      )
    case "numeric":
      return (
          <LibrarySection
            id="numeric"
            title="Montos y cantidades"
            description="Un solo estilo con prefijo a la izquierda ($, uds., ícono). Slot fijo w-11 (2.75rem) para alinear variantes."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <SpecCard
                title="RootsFormMoneyField"
                source="components/rootsy-form/RootsFormMoneyField.tsx"
                tokens={["prefix: $", "w-11", "focus-within"]}
              >
                <RootsFormMoneyField
                  label="Precio de venta"
                  value={moneyValue}
                  onChange={setMoneyValue}
                />
              </SpecCard>
              <SpecCard
                title="RootsFormQuantityField"
                source="components/rootsy-form/RootsFormQuantityField.tsx"
                tokens={["prefix: uds.", "w-11", "centrado"]}
              >
                <RootsFormQuantityField
                  label="Stock inicial"
                  value={qtyValue}
                  onChange={setQtyValue}
                />
              </SpecCard>
            </div>
          </LibrarySection>
      )
    case "select":
      return (
          <LibrarySection
            id="select"
            title="Select"
            description="Desplegable alineado al light form. Con o sin prefijo (w-11). La opción activa muestra check verde. Modo dark para footer y toolbar nocturno."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <SpecCard
                title="RootsFormSelectField"
                source="components/rootsy-form/RootsFormSelectField.tsx"
                tokens={["rounded-lg", "emerald-700", "check"]}
              >
                <RootsFormSelectField
                  label="Categoría"
                  value={selectValue}
                  onValueChange={setSelectValue}
                  placeholder="Elegir categoría"
                >
                  <RootsFormSelectItem value="bebidas">Bebidas</RootsFormSelectItem>
                  <RootsFormSelectItem value="verduras">Verduras</RootsFormSelectItem>
                  <RootsFormSelectItem value="panaderia">Panadería</RootsFormSelectItem>
                </RootsFormSelectField>
              </SpecCard>
              <SpecCard
                title="RootsFormSelectField · prefijo"
                source="rootsFormPrefixedSelectTriggerClass"
                tokens={["prefix w-11", "check verde"]}
              >
                <RootsFormSelectField
                  label="Medio de pago"
                  value={fieldSelectValue}
                  onValueChange={setFieldSelectValue}
                  placeholder="Elegir medio"
                  prefix={<Landmark className="size-4" aria-hidden />}
                >
                  <RootsFormSelectItem value="efectivo">Efectivo</RootsFormSelectItem>
                  <RootsFormSelectItem value="tarjeta">Tarjeta</RootsFormSelectItem>
                  <RootsFormSelectItem value="transferencia">
                    Transferencia
                  </RootsFormSelectItem>
                </RootsFormSelectField>
              </SpecCard>
            </div>
            <SpecCard
              title="RootsFormSelectField · dark"
              source="rootsFormSelectDarkTriggerClass"
              tokens={["bosque nocturno", "footer paginación", "check emerald"]}
              className="mt-4"
            >
              <div className="overflow-hidden rounded-xl border border-[#263530]/80">
                <div className="border-[#263530]/80 bg-[linear-gradient(165deg,#060908_0%,#0c1210_52%,#141c19_100%)] p-4">
                  <div className="flex max-w-md flex-wrap items-center gap-3">
                    <RootsFormSelectField
                      label="Página"
                      tone="dark"
                      value={darkSelectPage}
                      onValueChange={setDarkSelectPage}
                      className="w-auto min-w-[6rem]"
                    >
                      <RootsFormSelectItem tone="dark" value="1">
                        1
                      </RootsFormSelectItem>
                      <RootsFormSelectItem tone="dark" value="2">
                        2
                      </RootsFormSelectItem>
                      <RootsFormSelectItem tone="dark" value="3">
                        3
                      </RootsFormSelectItem>
                    </RootsFormSelectField>
                    <RootsFormSelectField
                      label="Por página"
                      tone="dark"
                      value={darkSelectPageSize}
                      onValueChange={setDarkSelectPageSize}
                      className="w-auto min-w-[6rem]"
                    >
                      <RootsFormSelectItem tone="dark" value="10">
                        10
                      </RootsFormSelectItem>
                      <RootsFormSelectItem tone="dark" value="20">
                        20
                      </RootsFormSelectItem>
                      <RootsFormSelectItem tone="dark" value="50">
                        50
                      </RootsFormSelectItem>
                    </RootsFormSelectField>
                  </div>
                </div>
              </div>
            </SpecCard>
          </LibrarySection>
      )
    case "date":
      return (
          <LibrarySection
            id="date"
            title="Fecha"
            description="Date picker alineado al light form. Formato largo en español. Con o sin prefijo (w-11)."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <SpecCard
                title="RootsFormDateField"
                source="components/rootsy-form/RootsFormDateField.tsx"
                tokens={["rounded-lg", "emerald-700", "3 de agosto de 2026"]}
              >
                <RootsFormDateField
                  label="Fecha de alta"
                  value={dateValue}
                  onChange={setDateValue}
                  placeholder="Elegí una fecha"
                />
              </SpecCard>
              <SpecCard
                title="RootsFormDateField · prefijo"
                source="rootsFormPrefixedDateTriggerClass"
                tokens={["prefix w-11", "calendario"]}
              >
                <RootsFormDateField
                  label="Vencimiento"
                  value={dateValue}
                  onChange={setDateValue}
                  placeholder="Elegí una fecha"
                  prefix={<CalendarIcon className="size-4" aria-hidden />}
                />
              </SpecCard>
            </div>
          </LibrarySection>
      )
    case "boolean":
      return (
          <LibrarySection
            id="boolean"
            title="Booleanos"
            description="Switch en caja clickable alineada al light form. Texto a la izquierda y toggle a la derecha."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <SpecCard
                title="RootsFormSwitchField"
                source="components/rootsy-form/RootsFormSwitchField.tsx"
                tokens={["rounded-lg", "emerald-600", "click en caja"]}
              >
                <RootsFormSwitchField
                  label="Artículo activo en ventas"
                  checked={switchOn}
                  onCheckedChange={setSwitchOn}
                />
              </SpecCard>
              <SpecCard
                title="RootsFormSwitchField · descripción"
                source="rootsFormSwitchDescriptionClass"
                tokens={["text-xs", "zinc-500"]}
              >
                <RootsFormSwitchField
                  label="Incluir en catálogo digital"
                  description="Visible en el menú QR y en la web del local."
                  checked={switchCatalogOn}
                  onCheckedChange={setSwitchCatalogOn}
                />
              </SpecCard>
            </div>
          </LibrarySection>
      )
    case "field-help":
      return (
          <LibrarySection
            id="field-help"
            title="Ayuda de campo"
            description="Texto debajo del control con props hint, warning, error o success. Solo se muestra uno a la vez (prioridad: error → warning → success → hint)."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <SpecCard
                title="hint · ayuda neutral"
                source="RootsFormTextField · hint"
                tokens={["text-xs", "zinc-500"]}
              >
                <RootsFormTextField
                  label="SKU"
                  value={fieldHelpSku}
                  onChange={(e) => setFieldHelpSku(e.target.value)}
                  placeholder="Código interno"
                  hint="Opcional. Visible solo en reportes internos."
                />
              </SpecCard>
              <SpecCard
                title="error · validación"
                source="RootsFormTextField · error"
                tokens={["destructive", "aria-invalid"]}
              >
                <RootsFormTextField
                  label="SKU"
                  value={fieldHelpSku}
                  onChange={(e) => setFieldHelpSku(e.target.value)}
                  error="Ingresá al menos 3 caracteres."
                />
              </SpecCard>
              <SpecCard
                title="warning · aviso"
                source="RootsFormTextField · warning"
                tokens={["amber-700"]}
              >
                <RootsFormTextField
                  label="SKU"
                  value={fieldHelpSku}
                  onChange={(e) => setFieldHelpSku(e.target.value)}
                  warning="Este SKU ya existe en otro artículo del catálogo."
                />
              </SpecCard>
              <SpecCard
                title="success · confirmación"
                source="RootsFormTextField · success"
                tokens={["emerald-700"]}
              >
                <RootsFormTextField
                  label="Código de barras"
                  defaultValue="7790310987654"
                  success="Formato EAN válido."
                />
              </SpecCard>
            </div>
            <p className="mt-3 font-mono text-[11px] text-muted-foreground">
              Props: hint · warning · error · success · invalid — en cualquier RootsForm*Field
              o directo en RootsFormField.
            </p>
          </LibrarySection>
      )
    case "layout":
      return (
          <LibrarySection
            id="layout"
            title="Layout de formulario"
            description="Tipo de artículo al inicio de la columna izquierda; grilla de dos columnas debajo."
          >
            <RootsFormGrid>
              <div className={rootsFormColumnClass}>
                <ArticleItemKindSelector
                  value={layoutItemKind}
                  onChange={setLayoutItemKind}
                />
                <RootsFormTextField
                  label="Nombre"
                  value={layoutName}
                  onChange={(e) => setLayoutName(e.target.value)}
                  hint="Nombre comercial visible en ventas y catálogo."
                />
                <RootsFormTextareaField
                  label="Descripción"
                  value={layoutDesc}
                  onChange={(e) => setLayoutDesc(e.target.value)}
                  rows={3}
                  hint="Opcional. Aparece en el menú digital si lo activás."
                />
                <div className={rootsFormTwoColRowClass}>
                  <RootsFormTextField
                    label="SKU"
                    value={layoutSku}
                    onChange={(e) => setLayoutSku(e.target.value)}
                    error={
                      layoutSku.length > 0 && layoutSku.length < 3
                        ? "Ingresá al menos 3 caracteres."
                        : undefined
                    }
                    hint={
                      layoutSku.length === 0
                        ? "Código interno para reportes."
                        : undefined
                    }
                  />
                  <RootsFormTextField
                    label="Código de barras"
                    value={layoutBarcode}
                    onChange={(e) => setLayoutBarcode(e.target.value)}
                    success={
                      layoutBarcode.length >= 8
                        ? "Formato EAN válido."
                        : undefined
                    }
                  />
                </div>
                <RootsFormSwitchField
                  label="Artículo activo en ventas"
                  description="Los inactivos no aparecen en ventas ni catálogo."
                  checked={layoutActive}
                  onCheckedChange={setLayoutActive}
                />
              </div>
              <div className={rootsFormColumnClass}>
                <RootsFormMoneyField
                  label="Precio venta"
                  value={moneyValue}
                  onChange={setMoneyValue}
                  hint="Precio de lista antes de impuestos."
                />
                <RootsFormQuantityField
                  label="Stock inicial"
                  value={qtyValue}
                  onChange={setQtyValue}
                  warning="Solo aplica al crear el artículo."
                />
                <RootsFormSelectField
                  label="Categoría"
                  value={selectValue}
                  onValueChange={setSelectValue}
                  placeholder="Elegir categoría"
                  hint="Organiza el artículo en listados y reportes."
                >
                  <RootsFormSelectItem value="bebidas">Bebidas</RootsFormSelectItem>
                  <RootsFormSelectItem value="verduras">Verduras</RootsFormSelectItem>
                </RootsFormSelectField>
                <RootsFormDateField
                  label="Vencimiento"
                  value={dateValue}
                  onChange={setDateValue}
                  hint="Dejá vacío si el producto no vence."
                />
                <RootsFormDiscountField
                  label="Descuento"
                  mode={layoutDiscountMode}
                  onModeChange={setLayoutDiscountMode}
                  value={layoutDiscountValue}
                  onChange={setLayoutDiscountValue}
                  hint={
                    layoutDiscountMode === "porcentaje"
                      ? "Porcentaje sobre el subtotal (0–100)."
                      : "Monto fijo en pesos sobre el subtotal."
                  }
                />
              </div>
            </RootsFormGrid>
            <p className="mt-3 font-mono text-[11px] text-muted-foreground">
              ArticleItemKindSelector (col. izq.) · RootsFormSegmentField ·
              RootsFormGrid · rootsFormColumnClass · rootsFormTwoColRowClass ·
              RootsFormDiscountField · hint · warning · error · success
            </p>
          </LibrarySection>
      )
    case "composite":
      return (
          <LibrarySection
            id="composite"
            title="Controles compuestos"
            description="Descuento con prefijo dual %/$, imagen compacta, segment group para opciones sin valor, y select para listas largas."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <SpecCard
                title="RootsFormImageUploadField"
                source="components/rootsy-form/RootsFormImageUploadField.tsx"
                tokens={["miniatura 56px", "drag & drop", "tierra + emerald focus"]}
              >
                <RootsFormImageUploadField
                  label="Imagen"
                  previewSrc={layoutImagePreview}
                  emptyTitle="Agregar foto"
                  emptySubtitle="Arrastrá o hacé clic · JPG, PNG o WebP"
                  onFileSelect={(file) => {
                    if (layoutImagePreview) {
                      URL.revokeObjectURL(layoutImagePreview)
                    }
                    setLayoutImagePreview(URL.createObjectURL(file))
                  }}
                  onRemove={() => {
                    if (layoutImagePreview) {
                      URL.revokeObjectURL(layoutImagePreview)
                    }
                    setLayoutImagePreview(null)
                  }}
                  hint="Versión compacta para modales — la lógica de subida vive en el consumidor."
                />
              </SpecCard>
              <SpecCard
                title="RootsFormDiscountField"
                source="components/rootsy-form/RootsFormDiscountField.tsx"
                tokens={["prefijo affix %/$", "sin sufijo redundante", "emerald focus"]}
              >
                <RootsFormDiscountField
                  label="Descuento"
                  mode={segment}
                  onModeChange={setSegment}
                  value={discountValue}
                  onChange={setDiscountValue}
                  hint="Tipo y valor en el mismo control."
                />
              </SpecCard>
              <SpecCard
                title="RootsFormSegmentField · 3 opciones"
                source="ArticleItemKindSelector · stock upsert"
                tokens={["hint dinámico", "decisión estructural"]}
              >
                <ArticleItemKindSelector
                  value={layoutItemKind}
                  onChange={setLayoutItemKind}
                />
              </SpecCard>
              <SpecCard
                title="RootsFormSegmentField · 2 opciones"
                source="rootsFormSegmentGroupClass"
              >
                <RootsFormSegmentField
                  label="Tipo de entrega"
                  value={fulfillmentSegment}
                  onValueChange={(value) =>
                    setFulfillmentSegment(value as "pickup" | "delivery")
                  }
                  options={[
                    { value: "pickup", label: "Mostrador" },
                    { value: "delivery", label: "Delivery" },
                  ]}
                />
              </SpecCard>
              <SpecCard
                title="RootsFormSelectField · alternativa a filas"
                source="Reemplaza selectable row / dialog option"
                tokens={["check", "lista larga"]}
              >
                <RootsFormSelectField
                  label="Comprobante"
                  value={comprobanteValue}
                  onValueChange={setComprobanteValue}
                  prefix={<Receipt className="size-4" aria-hidden />}
                  hint="Usá select cuando hay más de 4 opciones o textos largos."
                >
                  <RootsFormSelectItem value="sin">Sin comprobante</RootsFormSelectItem>
                  <RootsFormSelectItem value="recibo-x">Recibo X</RootsFormSelectItem>
                  <RootsFormSelectItem value="factura-b">Factura B</RootsFormSelectItem>
                  <RootsFormSelectItem value="factura-c">Factura C</RootsFormSelectItem>
                </RootsFormSelectField>
              </SpecCard>
            </div>
          </LibrarySection>
      )
    case "buttons":
      return <LayoutButtonLibrarySection siteId={siteId} popId={popId} />
    case "dropdown":
      return <LayoutDropdownLibrarySection siteId={siteId} popId={popId} />
    case "sortable-list":
      return (
          <LibrarySection
            id="sortable-list"
            title="Lista ordenable"
            description="Drag and drop para reordenar, más visibilidad, edición inline y eliminar."
          >
            <SpecCard
              title="RootsSortableActionList"
              source="components/rootsy-list · ArticleCategoriesSaleBoard"
              tokens={["tierra e50", "corteza e400", "canopy acciones"]}
            >
              <RootsSortableActionListPanel
                title="Categorías"
                description="Arrastrá para ordenar. Usá el ojo para mostrar u ocultar en ventas."
                footerHint="Los cambios de orden y visibilidad se guardan al soltar o al tocar el ojo."
              >
                <RootsSortableActionList
                  listId="library-sortable-demo"
                  items={sortableDemoItems}
                  onReorder={setSortableDemoItems}
                  canReorder
                  canToggleVisibility
                  canEdit
                  canDelete
                  editingId={sortableEditingId}
                  editingValue={sortableEditingName}
                  editSaveBusy={false}
                  onStartEdit={(item) => {
                    setSortableEditingId(item.id)
                    setSortableEditingName(item.label)
                  }}
                  onCancelEdit={() => {
                    setSortableEditingId(null)
                    setSortableEditingName("")
                  }}
                  onEditingValueChange={setSortableEditingName}
                  onSaveEdit={() => {
                    if (!sortableEditingId || !sortableEditingName.trim()) return
                    setSortableDemoItems((items) =>
                      items.map((item) =>
                        item.id === sortableEditingId
                          ? { ...item, label: sortableEditingName.trim() }
                          : item,
                      ),
                    )
                    setSortableEditingId(null)
                    setSortableEditingName("")
                  }}
                  onDelete={(item) =>
                    setSortableDemoItems((items) =>
                      items.filter((row) => row.id !== item.id),
                    )
                  }
                  onToggleVisibility={(id) =>
                    setSortableDemoItems((items) =>
                      items.map((item) =>
                        item.id === id
                          ? {
                              ...item,
                              visible: item.visible === false,
                            }
                          : item,
                      ),
                    )
                  }
                />
              </RootsSortableActionListPanel>
            </SpecCard>
          </LibrarySection>
      )
    case "feedback":
      return (
          <LibrarySection
            id="feedback"
            title="Banners"
            description="Mensajes inline dentro de modales y paneles."
          >
            <div className="grid gap-4">
              <div className={saleOpChannelErrorBanner}>
                No se pudo guardar. Revisá los campos obligatorios.
              </div>
              <div className={saleOpChannelWarningBanner}>
                El stock quedará negativo si confirmás esta operación.
              </div>
              <div className={saleOpChannelHint}>
                Tip: podés escanear el código de barras directamente en el campo SKU.
              </div>
            </div>
          </LibrarySection>
      )
    case "modals":
      return (
        <>
          <LibrarySection
            id="modals"
            title="Modales"
            description="Shell iOS (rounded-[1.375rem]) · footer subtle izq + primary der · RootsProgressButton en submit."
          >
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {MODAL_VARIANTS.map((spec) => (
                <div key={spec.id} className="space-y-3">
                  <ModalChromePreview spec={spec} />
                  <div className="space-y-2 px-1">
                    <p className="text-sm font-medium text-foreground">{spec.title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {spec.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <RootsDefaultButton
                        type="button"
                        size="sm"
                        onClick={() => onLiveModalIdChange(spec.id)}
                      >
                        Abrir en vivo
                      </RootsDefaultButton>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        articleDialogSurfaceClass
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </LibrarySection>
          {liveModal ? (
            <LiveModalDemo
              spec={liveModal}
              open
              onOpenChange={(open) => {
                if (!open) onLiveModalIdChange(null)
              }}
            />
          ) : null}
        </>
      )
    case "modals-alert":
      return (
          <LibrarySection
            id="modals-alert"
            title="Alert dialog"
            description="Confirmaciones destructivas — shell compacto con saleOpAlertDialogContent. Incluye variante simple (venta) y con confirmación escrita (stock)."
          >
            <SpecCard title="Alert venta" source="saleOpAlertDialogContent">
              <AlertDialog open={false}>
                <AlertDialogContent className={saleOpAlertDialogContent}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Descartar ticket?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Vista previa del shell de alerta usado en mesas/mostrador/venta.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                      <RootsSubtleButton type="button">Cancelar</RootsSubtleButton>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <RootsDangerButton type="button">Descartar</RootsDangerButton>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <div
                className={cn(
                  "mt-3 overflow-hidden rounded-2xl border border-dashed border-border/70 p-3",
                  saleOpAlertDialogContent,
                )}
              >
                <div className="space-y-2 px-1 py-2">
                  <p className="text-base font-semibold">¿Descartar ticket?</p>
                  <p className="text-sm text-muted-foreground">
                    Preview estática del alert dialog de venta.
                  </p>
                  <div className="flex justify-end gap-2 pt-2">
                    <RootsSubtleButton type="button">Cancelar</RootsSubtleButton>
                    <RootsDangerButton type="button">Descartar</RootsDangerButton>
                  </div>
                </div>
              </div>
            </SpecCard>

            <ArticleDeleteAlertLibraryDemo />
          </LibrarySection>
      )
    default:
      return null
  }
}
