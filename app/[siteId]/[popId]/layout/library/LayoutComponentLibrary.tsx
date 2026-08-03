"use client"

import {
  articleDialogBodyClass,
  articleDialogFooterClass,
  articleDialogHeaderClass,
  articleDialogSurfaceClass,
  articleDialogSurfaceTwoColClass,
  articleDialogSurfaceWideClass,
  articleFormColumnClass,
  articleFormFieldStackClass,
  articleFormGridClass,
  articleFormTextFieldClass,
  articleFormTextareaClass,
  articleFormTwoColRowClass,
} from "@/app/[siteId]/[popId]/articles/articleConstants"
import {
  clientDialogBodyClass,
  clientDialogFooterClass,
  clientDialogHeaderClass,
  clientDialogSurface,
} from "@/app/[siteId]/[popId]/clients/ClientUpsertFormFields"
import {
  opsDialogHeader,
  opsDialogSurfaceMd,
  opsDialogSurfacePurchase,
} from "@/app/[siteId]/[popId]/operations/operationDialogStyles"
import { LayoutFinalComponentsModal } from "@/app/[siteId]/[popId]/layout/library/LayoutFinalComponentsModal"
import {
  RootsFormField,
  RootsFormMoneyField,
  RootsFormQuantityField,
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormTextField,
  RootsFormTextareaField,
  rootsFormTextFieldClass,
} from "@/components/rootsy-form"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  saleOpAlertDialogContent,
  saleOpChannelErrorBanner,
  saleOpChannelFormField,
  saleOpChannelHint,
  saleOpChannelSegmentGroup,
  saleOpChannelSelectableRow,
  saleOpChannelWarningBanner,
  saleOpDialogBody,
  saleOpDialogContentComprobante,
  saleOpDialogContentLg,
  saleOpDialogContentMd,
  saleOpDialogContentXl,
  saleOpDialogFooter,
  saleOpDialogHeader,
  saleOpDialogOptionClass,
  saleOpLightFormInput,
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
import { Landmark } from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"

const LIBRARY_SECTIONS = [
  { id: "labels", label: "Label (final)" },
  { id: "text", label: "Texto (final)" },
  { id: "multiline", label: "Multilínea (final)" },
  { id: "numeric", label: "Montos y cantidades (final)" },
  { id: "select", label: "Select (final)" },
  { id: "date", label: "Fecha" },
  { id: "boolean", label: "Booleanos" },
  { id: "layout", label: "Layout de formulario" },
  { id: "composite", label: "Controles compuestos" },
  { id: "feedback", label: "Banners y ayuda" },
  { id: "modals-articles", label: "Modales · Artículos" },
  { id: "modals-clients", label: "Modales · Clientes" },
  { id: "modals-sale", label: "Modales · Venta" },
  { id: "modals-ops", label: "Modales · Operaciones" },
] as const

const articleDetailDialogSurface = cn(
  "rootsy-app-light gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-0 text-foreground shadow-2xl ring-1 ring-black/[0.04] sm:max-w-2xl",
  "max-h-[min(90vh,760px)] flex flex-col overflow-hidden",
)

const articleImageDialogSurface = cn(
  "rootsy-app-light gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-0 text-foreground shadow-2xl ring-1 ring-black/[0.04] sm:max-w-lg",
  "max-h-[min(90vh,720px)] flex flex-col overflow-hidden",
)

const opsDialogSurfaceLg = cn(
  "rootsy-app-light gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-0 text-foreground shadow-2xl ring-1 ring-black/[0.04] sm:max-w-3xl",
  "max-h-[min(90vh,820px)] flex flex-col overflow-hidden",
)

type ModalPreviewSpec = {
  id: string
  family: string
  title: string
  width: string
  surfaceClass: string
  headerClass: string
  bodyClass: string
  footerClass: string
  source: string
  sampleTitle: string
  sampleDescription: string
}

const MODAL_SPECS: ModalPreviewSpec[] = [
  {
    id: "article-md",
    family: "Artículos / Stock",
    title: "Estándar (md)",
    width: "sm:max-w-md",
    surfaceClass: articleDialogSurfaceClass,
    headerClass: articleDialogHeaderClass,
    bodyClass: articleDialogBodyClass,
    footerClass: articleDialogFooterClass,
    source: "articleDialogSurfaceClass",
    sampleTitle: "Eliminar categoría",
    sampleDescription: "Esta acción no se puede deshacer.",
  },
  {
    id: "article-wide",
    family: "Artículos / Stock",
    title: "Ancho (lg)",
    width: "sm:max-w-lg",
    surfaceClass: articleDialogSurfaceWideClass,
    headerClass: articleDialogHeaderClass,
    bodyClass: articleDialogBodyClass,
    footerClass: articleDialogFooterClass,
    source: "articleDialogSurfaceWideClass",
    sampleTitle: "Categorías",
    sampleDescription: "Ordená las categorías y elegí cuáles se muestran en ventas.",
  },
  {
    id: "article-two-col",
    family: "Artículos / Stock",
    title: "Dos columnas (4xl)",
    width: "sm:max-w-4xl",
    surfaceClass: articleDialogSurfaceTwoColClass,
    headerClass: articleDialogHeaderClass,
    bodyClass: articleDialogBodyClass,
    footerClass: articleDialogFooterClass,
    source: "articleDialogSurfaceTwoColClass",
    sampleTitle: "Nuevo artículo",
    sampleDescription: "Alta de artículo en el stock del POP.",
  },
  {
    id: "article-detail",
    family: "Artículos / Stock",
    title: "Detalle tabla (2xl)",
    width: "sm:max-w-2xl",
    surfaceClass: articleDetailDialogSurface,
    headerClass: articleDialogHeaderClass,
    bodyClass: articleDialogBodyClass,
    footerClass: "",
    source: "ArticlesTableDetailDialog",
    sampleTitle: "Detalle del artículo",
    sampleDescription: "Vista de solo lectura desde el listado.",
  },
  {
    id: "article-image",
    family: "Artículos / Stock",
    title: "Preview imagen (lg)",
    width: "sm:max-w-lg",
    surfaceClass: articleImageDialogSurface,
    headerClass: articleDialogHeaderClass,
    bodyClass: articleDialogBodyClass,
    footerClass: "",
    source: "ArticleImagePreviewDialog",
    sampleTitle: "Imagen del artículo",
    sampleDescription: "Ampliación de la foto de stock.",
  },
  {
    id: "client-lg",
    family: "Clientes",
    title: "Cliente (lg)",
    width: "sm:max-w-lg",
    surfaceClass: clientDialogSurface,
    headerClass: clientDialogHeaderClass,
    bodyClass: clientDialogBodyClass,
    footerClass: clientDialogFooterClass,
    source: "clientDialogSurface",
    sampleTitle: "Nuevo cliente",
    sampleDescription: "Datos fiscales y de contacto.",
  },
  {
    id: "sale-md",
    family: "Venta / Checkout",
    title: "Venta md",
    width: "sm:max-w-md",
    surfaceClass: saleOpDialogContentMd,
    headerClass: saleOpDialogHeader,
    bodyClass: saleOpDialogBody,
    footerClass: saleOpDialogFooter,
    source: "saleOpDialogContentMd",
    sampleTitle: "Descuento",
    sampleDescription: "Aplicar descuento al ticket.",
  },
  {
    id: "sale-lg",
    family: "Venta / Checkout",
    title: "Venta lg",
    width: "sm:max-w-2xl",
    surfaceClass: saleOpDialogContentLg,
    headerClass: saleOpDialogHeader,
    bodyClass: saleOpDialogBody,
    footerClass: saleOpDialogFooter,
    source: "saleOpDialogContentLg",
    sampleTitle: "Cliente del ticket",
    sampleDescription: "Buscar o crear cliente para la venta.",
  },
  {
    id: "sale-xl",
    family: "Venta / Checkout",
    title: "Venta xl",
    width: "sm:max-w-4xl",
    surfaceClass: saleOpDialogContentXl,
    headerClass: saleOpDialogHeader,
    bodyClass: saleOpDialogBody,
    footerClass: saleOpDialogFooter,
    source: "saleOpDialogContentXl",
    sampleTitle: "Promoción combo",
    sampleDescription: "Asistente de armado de promoción.",
  },
  {
    id: "sale-comprobante",
    family: "Venta / Checkout",
    title: "Comprobante",
    width: "sm:max-w-2xl",
    surfaceClass: saleOpDialogContentComprobante,
    headerClass: saleOpDialogHeader,
    bodyClass: saleOpDialogBody,
    footerClass: saleOpDialogFooter,
    source: "saleOpDialogContentComprobante",
    sampleTitle: "Comprobante de venta",
    sampleDescription: "Selector + preview del ticket.",
  },
  {
    id: "ops-md",
    family: "Operaciones",
    title: "Detalle operación",
    width: "calc ancho dual",
    surfaceClass: opsDialogSurfaceMd,
    headerClass: opsDialogHeader,
    bodyClass: articleDialogBodyClass,
    footerClass: "",
    source: "opsDialogSurfaceMd",
    sampleTitle: "Detalle de venta",
    sampleDescription: "Panel lateral + líneas de la operación.",
  },
  {
    id: "ops-purchase",
    family: "Operaciones",
    title: "Compra",
    width: "calc ancho triple",
    surfaceClass: opsDialogSurfacePurchase,
    headerClass: opsDialogHeader,
    bodyClass: articleDialogBodyClass,
    footerClass: "",
    source: "opsDialogSurfacePurchase",
    sampleTitle: "Detalle de compra",
    sampleDescription: "Layout amplio para ítems de compra.",
  },
  {
    id: "ops-lg",
    family: "Operaciones",
    title: "Factura venta (lg)",
    width: "sm:max-w-3xl",
    surfaceClass: opsDialogSurfaceLg,
    headerClass: opsDialogHeader,
    bodyClass: articleDialogBodyClass,
    footerClass: articleDialogFooterClass,
    source: "OperationSaleInvoiceDialog",
    sampleTitle: "Facturar venta",
    sampleDescription: "Emisión de comprobante fiscal.",
  },
]

function LibrarySection({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-border/50 pb-10 last:border-b-0">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function SpecCard({
  title,
  source,
  tokens,
  children,
}: {
  title: string
  source: string
  tokens?: string[]
  children: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
            {source}
          </p>
        </div>
        {tokens?.length ? (
          <div className="flex flex-wrap gap-1">
            {tokens.map((token) => (
              <span
                key={token}
                className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
              >
                {token}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  )
}

function ModalChromePreview({ spec }: { spec: ModalPreviewSpec }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-dashed border-border/80 bg-muted/15 p-3">
      <div
        className={cn(
          "pointer-events-none mx-auto w-full overflow-hidden",
          spec.surfaceClass,
          "max-h-none shadow-md",
        )}
      >
        <div className={spec.headerClass}>
          <p className="text-base font-semibold tracking-tight">{spec.sampleTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">{spec.sampleDescription}</p>
        </div>
        <div className={spec.bodyClass}>
          <div className="space-y-3">
            <div className="h-9 rounded-lg bg-muted/50" />
            <div className="h-9 rounded-lg bg-muted/35" />
            <div className="h-20 rounded-lg bg-muted/25" />
          </div>
        </div>
        {spec.footerClass ? (
          <div className={cn(spec.footerClass, "flex justify-end gap-2")}>
            <div className="h-9 w-24 rounded-lg bg-muted/50" />
            <div className="h-9 w-28 rounded-lg bg-primary/20" />
          </div>
        ) : null}
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        {spec.width} · {spec.title}
      </p>
    </div>
  )
}

function LiveModalDemo({
  spec,
  open,
  onOpenChange,
}: {
  spec: ModalPreviewSpec
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={spec.surfaceClass}
        data-rootsy-light-shell="true"
        showCloseButton
      >
        <DialogHeader className={spec.headerClass}>
          <DialogTitle className="text-base font-semibold tracking-tight">
            {spec.sampleTitle}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {spec.sampleDescription}
          </DialogDescription>
        </DialogHeader>
        <div className={spec.bodyClass}>
          <p className="text-sm text-muted-foreground">
            Vista interactiva de <span className="font-mono">{spec.source}</span>.
            Compará header, body, footer y ancho con el resto de la familia.
          </p>
          <div className="mt-4 space-y-3">
            <Input className={articleFormTextFieldClass} placeholder="Campo de ejemplo" />
            <Textarea
              className={articleFormTextareaClass}
              placeholder="Notas..."
              rows={3}
            />
          </div>
        </div>
        {spec.footerClass ? (
          <DialogFooter className={spec.footerClass}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="button">Guardar</Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export function LayoutComponentLibrary() {
  const [textValue, setTextValue] = useState("Ejemplo de texto")
  const [moneyValue, setMoneyValue] = useState("1.250,00")
  const [qtyValue, setQtyValue] = useState("12")
  const [selectValue, setSelectValue] = useState("bebidas")
  const [fieldSelectValue, setFieldSelectValue] = useState("efectivo")
  const [dateValue, setDateValue] = useState("2026-08-03")
  const [switchOn, setSwitchOn] = useState(true)
  const [checkboxOn, setCheckboxOn] = useState(false)
  const [segment, setSegment] = useState<"a" | "b">("a")
  const [selectedRow, setSelectedRow] = useState<"one" | "two">("one")
  const [liveModalId, setLiveModalId] = useState<string | null>(null)
  const [finalComponentsOpen, setFinalComponentsOpen] = useState(false)

  const modalFamilies = useMemo(() => {
    const groups = new Map<string, ModalPreviewSpec[]>()
    for (const spec of MODAL_SPECS) {
      const list = groups.get(spec.family) ?? []
      list.push(spec)
      groups.set(spec.family, list)
    }
    return [...groups.entries()]
  }, [])

  const liveModal = MODAL_SPECS.find((spec) => spec.id === liveModalId) ?? null

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="hidden w-56 shrink-0 border-r border-border/50 bg-muted/10 px-3 py-5 lg:block">
        <p className="px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Secciones
        </p>
        <nav className="mt-3 space-y-1">
          {LIBRARY_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="block rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              {section.label}
            </a>
          ))}
        </nav>
      </aside>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-10">
          <header className="rounded-2xl border border-primary/15 bg-primary/5 px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                  Librería de formularios y modales
                </h1>
                <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  Referencia visual de candidatos y piezas ya aprobadas. Lo legacy
                  sigue en pantalla para comparar; lo final vive en el modal de
                  componentes finales.
                </p>
              </div>
              <Button type="button" onClick={() => setFinalComponentsOpen(true)}>
                Componentes finales
              </Button>
            </div>
          </header>

          <LibrarySection
            id="labels"
            title="Label de campo (final)"
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

          <LibrarySection
            id="text"
            title="Texto · una línea (final)"
            description="Light form con rounded-lg y foco verde Roots más marcado. Siempre RootsFormTextField con prop label."
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

          <LibrarySection
            id="multiline"
            title="Multilínea (final)"
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

          <LibrarySection
            id="numeric"
            title="Montos y cantidades (final)"
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

          <LibrarySection
            id="select"
            title="Select (final)"
            description="Desplegable alineado al light form. Con o sin prefijo (w-11). La opción activa muestra check verde."
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
          </LibrarySection>

          <LibrarySection
            id="date"
            title="Fecha"
            description="DatePicker en variantes button y field (modales light)."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <SpecCard title="Variante field · light" source="DatePicker · field">
                <DatePicker
                  value={dateValue}
                  onChange={setDateValue}
                  light
                  variant="field"
                  className={saleOpLightFormInput}
                />
              </SpecCard>
              <SpecCard title="Variante button" source="DatePicker · button">
                <DatePicker value={dateValue} onChange={setDateValue} light />
              </SpecCard>
            </div>
          </LibrarySection>

          <LibrarySection
            id="boolean"
            title="Booleanos"
            description="Switch y checkbox en formularios de modal."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <SpecCard title="Switch" source="Switch">
                <div className="flex items-center gap-3">
                  <Switch
                    id="demo-switch"
                    checked={switchOn}
                    onCheckedChange={setSwitchOn}
                  />
                  <Label htmlFor="demo-switch">Artículo activo en ventas</Label>
                </div>
              </SpecCard>
              <SpecCard title="Checkbox" source="Checkbox">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="demo-checkbox"
                    checked={checkboxOn}
                    onCheckedChange={(v) => setCheckboxOn(v === true)}
                  />
                  <Label htmlFor="demo-checkbox">Incluir en catálogo digital</Label>
                </div>
              </SpecCard>
            </div>
          </LibrarySection>

          <LibrarySection
            id="layout"
            title="Layout de formulario"
            description="Stacks, grillas y columnas usadas en upserts de artículo."
          >
            <div className={articleFormGridClass}>
              <div className={articleFormColumnClass}>
                <div className={articleFormFieldStackClass}>
                  <Label>Nombre</Label>
                  <Input className={articleFormTextFieldClass} defaultValue="Cola 500 ml" />
                </div>
                <div className={articleFormTwoColRowClass}>
                  <div className={articleFormFieldStackClass}>
                    <Label>SKU</Label>
                    <Input className={articleFormTextFieldClass} defaultValue="BEB-001" />
                  </div>
                  <div className={articleFormFieldStackClass}>
                    <Label>Código barras</Label>
                    <Input className={articleFormTextFieldClass} defaultValue="7790310" />
                  </div>
                </div>
              </div>
              <div className={articleFormColumnClass}>
                <div className={articleFormFieldStackClass}>
                  <Label>Descripción</Label>
                  <Textarea
                    className={articleFormTextareaClass}
                    rows={5}
                    defaultValue="Ejemplo de columna derecha en modal de dos columnas."
                  />
                </div>
              </div>
            </div>
            <p className="mt-3 font-mono text-[11px] text-muted-foreground">
              articleFormGridClass · articleFormColumnClass · articleFormFieldStackClass ·
              articleFormTwoColRowClass
            </p>
          </LibrarySection>

          <LibrarySection
            id="composite"
            title="Controles compuestos"
            description="Segmentos, filas seleccionables y opciones de diálogo de venta."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <SpecCard title="Segment group" source="saleOpChannelSegmentGroup">
                <div className={saleOpChannelSegmentGroup}>
                  {(["a", "b"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={cn(
                        "inline-flex flex-1 items-center justify-center rounded-lg px-3 py-2.5 text-sm font-semibold transition-all",
                        segment === value
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/40",
                      )}
                      onClick={() => setSegment(value)}
                    >
                      {value === "a" ? "Porcentaje" : "Monto fijo"}
                    </button>
                  ))}
                </div>
              </SpecCard>
              <SpecCard title="Selectable row" source="saleOpChannelSelectableRow">
                <div className="space-y-2">
                  {(["one", "two"] as const).map((id) => (
                    <button
                      key={id}
                      type="button"
                      className={saleOpChannelSelectableRow(selectedRow === id)}
                      onClick={() => setSelectedRow(id)}
                    >
                      <span className="text-sm font-medium">
                        {id === "one" ? "Factura B" : "Ticket fiscal"}
                      </span>
                    </button>
                  ))}
                </div>
              </SpecCard>
              <SpecCard title="Dialog option" source="saleOpDialogOptionClass">
                <button
                  type="button"
                  className={saleOpDialogOptionClass(true)}
                >
                  <span className="text-sm font-medium">Opción seleccionada</span>
                </button>
                <button
                  type="button"
                  className={cn(saleOpDialogOptionClass(false), "mt-2")}
                >
                  <span className="text-sm font-medium">Opción alternativa</span>
                </button>
              </SpecCard>
            </div>
          </LibrarySection>

          <LibrarySection
            id="feedback"
            title="Banners y ayuda"
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

          {modalFamilies.map(([family, specs]) => (
            <LibrarySection
              key={family}
              id={`modals-${family.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              title={`Modales · ${family}`}
              description="Chrome estático + botón para abrir la variante en vivo. Compará header, body, footer y ancho."
            >
              <div className="grid gap-5 xl:grid-cols-2">
                {specs.map((spec) => (
                  <div key={spec.id} className="space-y-3">
                    <ModalChromePreview spec={spec} />
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setLiveModalId(spec.id)}
                      >
                        Abrir en vivo
                      </Button>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {spec.source}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </LibrarySection>
          ))}

          <LibrarySection
            id="modals-alert"
            title="Modales · Alert dialog"
            description="Confirmaciones destructivas en flujos de venta."
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
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction>Descartar</AlertDialogAction>
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
                    <div className="h-9 w-24 rounded-lg bg-muted/50" />
                    <div className="h-9 w-24 rounded-lg bg-destructive/20" />
                  </div>
                </div>
              </div>
            </SpecCard>
          </LibrarySection>
        </div>
      </div>

      {liveModal ? (
        <LiveModalDemo
          spec={liveModal}
          open
          onOpenChange={(open) => {
            if (!open) setLiveModalId(null)
          }}
        />
      ) : null}

      <LayoutFinalComponentsModal
        open={finalComponentsOpen}
        onOpenChange={setFinalComponentsOpen}
      />
    </div>
  )
}
