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
import { RootsIconButton } from "@/components/rootsy-button/RootsIconButton"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogHeader,
  rootsDialogHeaderClass,
  rootsDialogHeaderCompactClass,
  rootsDialogTitleClass,
} from "@/components/rootsy-dialog"
import {
  RootsFormSearchField,
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormTextField,
} from "@/components/rootsy-form"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  partyPickerTitle,
  type OperationPartyCatalogItem,
  type OperationPartySelection,
} from "@/lib/operationPartyPicker"
import { sanitizeTaxDocumentInput } from "@/lib/argentinaTaxDocumentInput"
import { formatPadronErrorForUser } from "@/lib/padronUserFacingError"
import { cn } from "@/lib/utils"
import { Building2, ChevronLeft, User } from "lucide-react"
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
    <div className="space-y-4">
      <RootsFormTextField
        label={taxLabel}
        id="party-tax-id"
        type="text"
        inputMode="numeric"
        value={taxId}
        onChange={(e) =>
          onTaxIdChange(sanitizeTaxDocumentInput(e.target.value, taxInputMode))
        }
        placeholder={taxPlaceholder}
        autoComplete="off"
        disabled={readOnly}
        readOnly={readOnly}
        autoFocus={!readOnly}
        error={padronErrorMessage ?? undefined}
        hint={
          padron.busy ? (
            <span className="inline-flex items-center gap-2">
              <RootsSpinner size="sm" aria-hidden />
              Consultando ARCA…
            </span>
          ) : undefined
        }
      />

      <RootsFormTextField
        label="Nombre o razón social"
        id="party-manual-name"
        value={manualName}
        onChange={(e) => onManualNameChange(e.target.value)}
        placeholder={
          padron.busy
            ? "Consultando ARCA…"
            : "Se completa al consultar ARCA"
        }
        autoComplete="off"
        disabled
        readOnly
      />

      <RootsFormSelectField
        label="Condición IVA"
        id="party-iva-condition"
        value={ivaCondition || "__none__"}
        placeholder="Sin definir"
        disabled={readOnly || !arcaLookupOk || ivaFromArca}
        readOnly={readOnly || ivaFromArca}
        onValueChange={(v) => {
          const next = v === "__none__" ? "" : v
          onIvaConditionChange(next)
          if (next && onIvaConditionApplied) {
            onIvaConditionApplied(next as ClientIvaConditionValue)
          }
        }}
      >
        <RootsFormSelectItem value="__none__">Sin definir</RootsFormSelectItem>
        {CLIENT_IVA_CONDITION_OPTIONS.map((o) => (
          <RootsFormSelectItem key={o.value} value={o.value}>
            {o.label}
          </RootsFormSelectItem>
        ))}
      </RootsFormSelectField>
    </div>
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
      <RootsDialogContent className="flex flex-col">
        {step === "catalog" ? (
          <RootsDialogHeader title={partyPickerTitle(flow, context)} />
        ) : (
          <DialogHeader
            className={cn(
              rootsDialogHeaderClass,
              rootsDialogHeaderCompactClass,
              "shrink-0",
            )}
          >
            <div className="flex items-center gap-2">
              <RootsIconButton
                type="button"
                label="Volver"
                theme="workspace"
                emphasis="ghost"
                size="default"
                className="-ml-2 shrink-0"
                onClick={() => setStep("catalog")}
              >
                <ChevronLeft aria-hidden />
              </RootsIconButton>
              <DialogTitle className={cn(rootsDialogTitleClass, "min-w-0 flex-1")}>
                Carga manual
              </DialogTitle>
            </div>
          </DialogHeader>
        )}

        <RootsDialogBody className="space-y-4">
          {step === "catalog" ? (
            <>
              {!catalogBlocked && canSearchCatalog ? (
                <>
                  <RootsFormSearchField
                    hideLabel
                    label={
                      flow === "purchase"
                        ? "Buscar proveedor"
                        : "Buscar cliente"
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClear={() => setSearchQuery("")}
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
                        <li className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--rootsy-bruma-200)] bg-white px-4 py-8 text-sm text-[var(--rootsy-bruma-500)]">
                          <RootsSpinner size="sm" aria-hidden />
                          Buscando…
                        </li>
                      ) : catalogResults.length === 0 ? (
                        <li className="rounded-xl border border-dashed border-[var(--rootsy-bruma-200)] bg-white px-4 py-8 text-center text-sm text-[var(--rootsy-bruma-500)]">
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
                    <Separator className="bg-[var(--rootsy-bruma-200)]" />
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
        </RootsDialogBody>

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
      </RootsDialogContent>
    </Dialog>
  )
}
