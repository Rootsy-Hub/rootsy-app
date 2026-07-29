"use client"

import {
  searchCheckoutClients,
  searchCheckoutSuppliers,
} from "@/app/[siteId]/[popId]/checkout/partySearchActions"
import {
  CLIENT_IVA_CONDITION_OPTIONS,
  type ClientIvaConditionValue,
} from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import { CheckoutOptionCard } from "@/components/checkout/CheckoutOptionCard"
import { CheckoutDialogFooter } from "@/components/checkout/CheckoutDialogFooter"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  partyPickerTitle,
  type OperationPartyCatalogItem,
  type OperationPartySelection,
} from "@/lib/operationPartyPicker"
import { sanitizeTaxDocumentInput } from "@/lib/argentinaTaxDocumentInput"
import { formatPadronErrorForUser } from "@/lib/padronUserFacingError"
import { cn } from "@/lib/utils"
import {
  saleOpDialogBody,
  saleOpDialogContentMd,
  saleOpDialogHeader,
} from "@/components/sale-operation/saleOperationStyles"
import {
  Building2,
  ChevronLeft,
  Loader2,
  Search,
  User,
  X,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

export type OperationPadronState = {
  busy: boolean
  error: string | null
  razonSocial: string
  condicionIvaNombre?: string | null
  mappedIvaCondition?: ClientIvaConditionValue | null
}

type PartyPickerStep = "catalog" | "manual"

type Props = {
  popId: string
  flow: "sale" | "purchase"
  context: "venta" | "mesa" | "pedido" | "compra"
  open: boolean
  onOpenChange: (open: boolean) => void
  canSearchCatalog: boolean
  manualName: string
  onManualNameChange: (value: string) => void
  taxId: string
  onTaxIdChange: (value: string) => void
  ivaCondition: string
  onIvaConditionChange: (value: string) => void
  selected: OperationPartySelection | null
  padron: OperationPadronState
  catalogBlocked: boolean
  onSelectCatalogParty: (party: OperationPartyCatalogItem) => void
  onSelectManual: () => void
  onClearSelection: () => void
  onIvaConditionApplied?: (iva: ClientIvaConditionValue) => void
}

function SearchClearButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Limpiar búsqueda"
      className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-[color,background-color] duration-150 hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:bg-muted"
      onClick={onClick}
    >
      <X className="size-3.5" aria-hidden />
    </button>
  )
}

function CheckoutSearchField({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  disabled?: boolean
}) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-border/70 bg-muted/15 transition-all duration-150",
        "focus-within:border-primary/45 focus-within:ring-2 focus-within:ring-primary/20",
        disabled && "opacity-60",
      )}
    >
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        type="text"
        inputMode="search"
        enterKeyHint="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className={cn(
          "h-11 w-full bg-transparent pl-10 text-sm text-foreground outline-none placeholder:text-muted-foreground/70",
          value.length > 0 && !disabled && "pr-10",
        )}
      />
      {value.length > 0 && !disabled ? (
        <SearchClearButton onClick={() => onChange("")} />
      ) : null}
    </div>
  )
}

function StepHeader({
  step,
  flow,
  context,
  onBack,
}: {
  step: PartyPickerStep
  flow: "sale" | "purchase"
  context: "venta" | "mesa" | "pedido" | "compra"
  onBack: () => void
}) {
  if (step === "catalog") {
    return (
      <DialogTitle className="text-base font-semibold tracking-tight">
        {partyPickerTitle(flow, context)}
      </DialogTitle>
    )
  }

  return (
    <div className="flex items-start gap-2">
      <Button
        type="button"
        variant="ghost-neutral"
        size="icon"
        className="-ml-2 size-8 shrink-0 rounded-lg"
        onClick={onBack}
        aria-label="Volver"
      >
        <ChevronLeft className="size-4" />
      </Button>
      <DialogTitle className="min-w-0 flex-1 pt-0.5 text-base font-semibold tracking-tight">
        Carga manual
      </DialogTitle>
    </div>
  )
}

function ManualEntryForm({
  flow,
  manualName,
  onManualNameChange,
  taxId,
  onTaxIdChange,
  ivaCondition,
  onIvaConditionChange,
  padron,
  readOnly,
  onIvaConditionApplied,
}: {
  flow: "sale" | "purchase"
  manualName: string
  onManualNameChange: (value: string) => void
  taxId: string
  onTaxIdChange: (value: string) => void
  ivaCondition: string
  onIvaConditionChange: (value: string) => void
  padron: OperationPadronState
  readOnly: boolean
  onIvaConditionApplied?: (iva: ClientIvaConditionValue) => void
}) {
  const taxInputMode = flow === "purchase" ? "cuit_only" : "cuit_or_dni"
  const lastPadronApplyRef = useRef<string>("")
  const lastIvaApplyRef = useRef<string>("")

  const taxLabel = flow === "purchase" ? "CUIT" : "CUIT / DNI"
  const taxPlaceholder =
    flow === "purchase" ? "30-12345678-9" : "20-12345678-9"

  useEffect(() => {
    if (readOnly) return
    lastPadronApplyRef.current = ""
    lastIvaApplyRef.current = ""
    onManualNameChange("")
    onIvaConditionChange("")
  }, [taxId, readOnly, onManualNameChange, onIvaConditionChange])

  useEffect(() => {
    if (readOnly || !padron.error) return
    lastPadronApplyRef.current = ""
    lastIvaApplyRef.current = ""
    onManualNameChange("")
    onIvaConditionChange("")
  }, [readOnly, padron.error, onManualNameChange, onIvaConditionChange])

  useEffect(() => {
    if (readOnly || padron.busy || padron.error) return
    const razon = padron.razonSocial.trim()
    if (!razon) return
    const token = `${taxId.trim()}::${razon}`
    if (token === lastPadronApplyRef.current) return
    lastPadronApplyRef.current = token
    onManualNameChange(razon)
  }, [
    readOnly,
    padron.busy,
    padron.error,
    padron.razonSocial,
    taxId,
    onManualNameChange,
  ])

  useEffect(() => {
    if (readOnly || padron.busy || padron.error) return
    if (!padron.mappedIvaCondition) return
    const token = `${taxId.trim()}::${padron.mappedIvaCondition}`
    if (token === lastIvaApplyRef.current) return
    lastIvaApplyRef.current = token
    onIvaConditionChange(padron.mappedIvaCondition)
    onIvaConditionApplied?.(padron.mappedIvaCondition)
  }, [
    readOnly,
    padron.busy,
    padron.error,
    padron.mappedIvaCondition,
    taxId,
    onIvaConditionChange,
    onIvaConditionApplied,
  ])

  const arcaLookupOk =
    !readOnly &&
    !padron.busy &&
    !padron.error &&
    Boolean(padron.razonSocial.trim())
  const ivaFromArca = Boolean(padron.mappedIvaCondition)
  const padronErrorMessage = padron.error
    ? formatPadronErrorForUser(padron.error)
    : null

  return (
    <FieldGroup className="gap-4">
      <Field>
        <FieldLabel htmlFor="party-tax-id">{taxLabel}</FieldLabel>
        <Input
          id="party-tax-id"
          type="text"
          inputMode="numeric"
          value={taxId}
          onChange={(e) =>
            onTaxIdChange(sanitizeTaxDocumentInput(e.target.value, taxInputMode))
          }
          placeholder={taxPlaceholder}
          className="h-11 rounded-xl"
          autoComplete="off"
          disabled={readOnly}
          readOnly={readOnly}
          autoFocus={!readOnly}
        />
        {padron.busy ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Consultando ARCA…
          </p>
        ) : null}
        {padronErrorMessage ? (
          <p className="text-sm text-destructive">{padronErrorMessage}</p>
        ) : null}
      </Field>

      <Field>
        <FieldLabel htmlFor="party-manual-name">Nombre o razón social</FieldLabel>
        <Input
          id="party-manual-name"
          value={manualName}
          onChange={(e) => onManualNameChange(e.target.value)}
          placeholder={
            padron.busy
              ? "Consultando ARCA…"
              : "Se completa al consultar ARCA"
          }
          className="h-11 rounded-xl"
          autoComplete="off"
          disabled
          readOnly
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="party-iva-condition">Condición IVA</FieldLabel>
        <Select
          value={ivaCondition || "__none__"}
          disabled={readOnly || !arcaLookupOk || ivaFromArca}
          onValueChange={(v) => {
            const next = v === "__none__" ? "" : v
            onIvaConditionChange(next)
            if (next && onIvaConditionApplied) {
              onIvaConditionApplied(next as ClientIvaConditionValue)
            }
          }}
        >
          <SelectTrigger id="party-iva-condition" className="h-11 w-full rounded-xl">
            <SelectValue placeholder="Sin definir" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Sin definir</SelectItem>
            {CLIENT_IVA_CONDITION_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </FieldGroup>
  )
}

export function OperationPartyPickerDialog({
  popId,
  flow,
  context,
  open,
  onOpenChange,
  canSearchCatalog,
  manualName,
  onManualNameChange,
  taxId,
  onTaxIdChange,
  ivaCondition,
  onIvaConditionChange,
  selected,
  padron,
  catalogBlocked,
  onSelectCatalogParty,
  onSelectManual,
  onClearSelection,
  onIvaConditionApplied,
}: Props) {
  const [step, setStep] = useState<PartyPickerStep>("catalog")
  const [searchQuery, setSearchQuery] = useState("")
  const [catalogResults, setCatalogResults] = useState<OperationPartyCatalogItem[]>(
    [],
  )
  const [searchLoading, setSearchLoading] = useState(false)
  const searchGenRef = useRef(0)

  const searchTrim = searchQuery.trim()
  const manualSelected = selected?.manual === true
  const catalogSelected = selected != null && !manualSelected
  const manualReadOnly = selected != null
  const canConfirmManual =
    !selected &&
    Boolean(manualName.trim()) &&
    !padron.busy &&
    !padron.error

  useEffect(() => {
    if (!open) {
      setStep("catalog")
      setSearchQuery("")
      setCatalogResults([])
      setSearchLoading(false)
      return
    }
    if (catalogBlocked) {
      setStep("manual")
    }
  }, [open, catalogBlocked])

  useEffect(() => {
    if (!open || !canSearchCatalog || catalogBlocked || step !== "catalog") {
      return
    }

    if (!searchTrim) {
      setCatalogResults([])
      setSearchLoading(false)
      return
    }

    const gen = ++searchGenRef.current
    const timer = window.setTimeout(() => {
      void (async () => {
        setSearchLoading(true)
        const res =
          flow === "purchase"
            ? await searchCheckoutSuppliers(popId, searchTrim)
            : await searchCheckoutClients(popId, searchTrim)
        if (gen !== searchGenRef.current) return
        setSearchLoading(false)
        setCatalogResults(res.success ? res.parties : [])
      })()
    }, 300)

    return () => {
      window.clearTimeout(timer)
    }
  }, [
    open,
    canSearchCatalog,
    catalogBlocked,
    step,
    searchTrim,
    popId,
    flow,
  ])

  const showAlternateOptions = !catalogSelected
  const searchPlaceholder =
    flow === "purchase"
      ? "Buscar proveedor por nombre o CUIT…"
      : "Buscar cliente por nombre…"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={saleOpDialogContentMd}>
        <DialogHeader className={cn(saleOpDialogHeader, "shrink-0")}>
          <StepHeader
            step={step}
            flow={flow}
            context={context}
            onBack={() => setStep("catalog")}
          />
        </DialogHeader>

        <div
          className={cn(
            saleOpDialogBody,
            "min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain",
          )}
        >
          {step === "catalog" ? (
            <>
              {!catalogBlocked && canSearchCatalog ? (
                <>
                  <CheckoutSearchField
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder={searchPlaceholder}
                  />

                  {searchTrim ? (
                    <ul
                      className="flex flex-col gap-2"
                      role="listbox"
                      aria-label={flow === "purchase" ? "Proveedores" : "Clientes"}
                      aria-busy={searchLoading}
                    >
                      {searchLoading ? (
                        <li className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-8 text-sm text-muted-foreground">
                          <Loader2 className="size-4 animate-spin" aria-hidden />
                          Buscando…
                        </li>
                      ) : catalogResults.length === 0 ? (
                        <li className="rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-8 text-center text-sm text-muted-foreground">
                          Sin resultados
                        </li>
                      ) : (
                        catalogResults.map((party) => {
                          const isSelected = selected?.id === party.id
                          return (
                            <li key={party.id}>
                              <CheckoutOptionCard
                                title={party.name}
                                selected={isSelected}
                                disabled={selected != null}
                                onClick={() => onSelectCatalogParty(party)}
                                icon={Building2}
                                trailing={isSelected ? "check" : "none"}
                              />
                            </li>
                          )
                        })
                      )}
                    </ul>
                  ) : null}
                </>
              ) : null}

              {showAlternateOptions ? (
                <>
                  {!catalogBlocked && canSearchCatalog ? (
                    <Separator className="bg-border/60" />
                  ) : null}

                  <div className="space-y-2">
                    <CheckoutOptionCard
                      title={
                        manualSelected && selected
                          ? `${selected.name} (manual)`
                          : "Carga manual"
                      }
                      selected={manualSelected}
                      onClick={() => setStep("manual")}
                      icon={User}
                      trailing={manualSelected ? "check" : "chevron"}
                    />
                  </div>
                </>
              ) : null}
            </>
          ) : (
            <ManualEntryForm
              flow={flow}
              manualName={manualName}
              onManualNameChange={onManualNameChange}
              taxId={taxId}
              onTaxIdChange={onTaxIdChange}
              ivaCondition={ivaCondition}
              onIvaConditionChange={onIvaConditionChange}
              padron={padron}
              readOnly={manualReadOnly}
              onIvaConditionApplied={onIvaConditionApplied}
            />
          )}
        </div>

        <CheckoutDialogFooter
          secondaryAction={
            selected
              ? {
                  label:
                    flow === "purchase" ? "Quitar proveedor" : "Quitar cliente",
                  onClick: () => {
                    onClearSelection()
                    onOpenChange(false)
                  },
                }
              : undefined
          }
          primary={
            step === "manual" && !selected
              ? {
                  label:
                    flow === "purchase"
                      ? "Usar para esta compra"
                      : "Usar para esta operación",
                  onClick: onSelectManual,
                  disabled: !canConfirmManual,
                }
              : undefined
          }
        />
      </DialogContent>
    </Dialog>
  )
}
