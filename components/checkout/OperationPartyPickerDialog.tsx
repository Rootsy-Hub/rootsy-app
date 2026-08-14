"use client"

import type { ClientIvaConditionValue } from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import {
  createCheckoutClient,
  searchCheckoutClients,
  searchCheckoutSuppliers,
} from "@/app/[siteId]/[popId]/checkout/partySearchActions"
import { CheckoutOptionCard } from "@/components/checkout/CheckoutOptionCard"
import { CheckoutDialogFooter } from "@/components/checkout/CheckoutDialogFooter"
import { OperationPartyManualEntryForm } from "@/components/checkout/OperationPartyManualEntryForm"
import { RootsIconButton } from "@/components/rootsy-button/RootsIconButton"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogHeader,
  rootsDialogHeaderClass,
  rootsDialogHeaderCompactClass,
  rootsDialogTitleClass,
} from "@/components/rootsy-dialog"
import { RootsFormSearchField, rootsFormSelectContentClass } from "@/components/rootsy-form"
import {
  rootsFormDropdownHighlightItemClassForTone,
  rootsFormDropdownListClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { validateOptionalEmailField } from "@/lib/authValidation"
import {
  partyPickerTitle,
  type OperationPartyCatalogItem,
  type OperationPartyManualConfirmOptions,
  type OperationPartyManualConfirmPayload,
  type OperationPartySelection,
} from "@/lib/operationPartyPicker"
import { cn } from "@/lib/utils"
import { Building2, ChevronLeft, User } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

function selectedPartySubtitle(selected: OperationPartySelection): string | undefined {
  if (selected.taxId?.trim()) return selected.taxId.trim()
  return selected.manual ? "Carga manual" : "Del catálogo"
}

function partySearchDropdownItemClass(active: boolean, selected: boolean) {
  const state = selected ? "selected" : active ? "highlighted" : "default"
  return cn(
    "flex w-full cursor-pointer items-center px-3 py-2.5 text-left text-sm transition-colors",
    rootsFormDropdownHighlightItemClassForTone("light", state),
  )
}

type PartyPickerStep = "catalog" | "manual"

type Props = {
  popId: string
  flow: "sale" | "purchase"
  context: "venta" | "mesa" | "pedido" | "compra"
  open: boolean
  onOpenChange: (open: boolean) => void
  canSearchCatalog: boolean
  canCreateClient?: boolean
  /** Si es "deferred", "Guardar cliente" delega en onConfirmManual con persistInCatalog. */
  manualRegisterMode?: "immediate" | "deferred"
  manualName: string
  onManualNameChange: (value: string) => void
  taxId: string
  onTaxIdChange: (value: string) => void
  email: string
  onEmailChange: (value: string) => void
  ivaCondition: string
  onIvaConditionChange: (value: string) => void
  selected: OperationPartySelection | null
  catalogBlocked: boolean
  onSelectCatalogParty: (party: OperationPartyCatalogItem) => void
  onConfirmManual: (
    payload: OperationPartyManualConfirmPayload,
    options: OperationPartyManualConfirmOptions,
  ) => void | Promise<void>
  onClearSelection: () => void
  onIvaConditionApplied?: (iva: ClientIvaConditionValue) => void
}

function buildManualPayload(
  manualName: string,
  taxId: string,
  email: string,
  ivaCondition: string,
): OperationPartyManualConfirmPayload {
  return {
    name: manualName.trim(),
    taxId: taxId.trim(),
    email: email.trim(),
    ivaCondition: ivaCondition.trim(),
  }
}

function isManualPayloadValid(
  flow: "sale" | "purchase",
  payload: OperationPartyManualConfirmPayload,
): boolean {
  if (flow === "sale") {
    if (!payload.name) return false
    if (payload.email && validateOptionalEmailField(payload.email)) return false
    return true
  }
  return Boolean(payload.name)
}

export function OperationPartyPickerDialog({
  popId,
  flow,
  context,
  open,
  onOpenChange,
  canSearchCatalog,
  canCreateClient = false,
  manualRegisterMode = "immediate",
  manualName,
  onManualNameChange,
  taxId,
  onTaxIdChange,
  email,
  onEmailChange,
  ivaCondition,
  onIvaConditionChange,
  selected,
  catalogBlocked: _catalogBlocked,
  onSelectCatalogParty,
  onConfirmManual,
  onClearSelection,
  onIvaConditionApplied,
}: Props) {
  const [step, setStep] = useState<PartyPickerStep>("catalog")
  const [searchQuery, setSearchQuery] = useState("")
  const [catalogResults, setCatalogResults] = useState<OperationPartyCatalogItem[]>(
    [],
  )
  const [searchLoading, setSearchLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [highlightedPartyId, setHighlightedPartyId] = useState<string | null>(null)
  const searchGenRef = useRef(0)

  const searchTrim = searchQuery.trim()
  const showSearchDropdown = Boolean(searchTrim) && step === "catalog"
  const manualSelected = selected?.manual === true
  const manualReadOnly = false

  const manualPayload = useMemo(
    () => buildManualPayload(manualName, taxId, email, ivaCondition),
    [manualName, taxId, email, ivaCondition],
  )

  const canConfirmManual = isManualPayloadValid(flow, manualPayload) && !confirming

  useEffect(() => {
    if (!open) {
      setStep("catalog")
      setSearchQuery("")
      setCatalogResults([])
      setSearchLoading(false)
      setConfirming(false)
      setConfirmError(null)
      return
    }
    setHighlightedPartyId(null)
  }, [open])

  useEffect(() => {
    if (!open || !canSearchCatalog || step !== "catalog") {
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
    step,
    searchTrim,
    popId,
    flow,
  ])

  const handleConfirmManual = async (options: OperationPartyManualConfirmOptions) => {
    if (!canConfirmManual) return
    setConfirmError(null)
    setConfirming(true)

    try {
      if (
        flow === "sale" &&
        options.persistInCatalog &&
        canCreateClient &&
        manualRegisterMode === "immediate"
      ) {
        const res = await createCheckoutClient(popId, manualPayload)
        if (!res.success) {
          setConfirmError(res.error)
          return
        }
        onSelectCatalogParty(res.party)
        onOpenChange(false)
        return
      }

      await onConfirmManual(manualPayload, options)
      onOpenChange(false)
    } finally {
      setConfirming(false)
    }
  }

  const searchPlaceholder =
    flow === "purchase"
      ? "Buscar proveedor por nombre o CUIT…"
      : selected
        ? "Buscar otro cliente…"
        : "Buscar cliente por nombre…"

  const manualFooter =
    step === "manual"
      ? flow === "sale"
        ? canCreateClient
          ? {
              secondary: {
                label: "Solo ahora",
                title: "Usar solo en esta operación, sin guardar en cartera",
                onClick: () => void handleConfirmManual({ persistInCatalog: false }),
                disabled: !canConfirmManual,
              },
              primary: {
                label: "Guardar cliente",
                title: "Dar de alta en clientes y usar en esta operación",
                onClick: () => void handleConfirmManual({ persistInCatalog: true }),
                disabled: !canConfirmManual,
                loading: confirming,
                loadingLabel: "Guardando…",
              },
            }
          : {
              primary: {
                label: "Solo ahora",
                title: "Usar solo en esta operación",
                onClick: () => void handleConfirmManual({ persistInCatalog: false }),
                disabled: !canConfirmManual,
                loading: confirming,
              },
            }
        : {
            primary: {
              label: "Usar en esta compra",
              onClick: () => void handleConfirmManual({ persistInCatalog: false }),
              disabled: !canConfirmManual,
              loading: confirming,
            },
          }
      : null

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
              {canSearchCatalog ? (
                <div className="flex min-w-0 flex-col gap-1">
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

                  {showSearchDropdown ? (
                    <div
                      className={cn(
                        "max-h-60 overflow-x-hidden overflow-y-auto overscroll-contain",
                        rootsFormSelectContentClass,
                        "w-full min-w-0 max-w-none",
                      )}
                    >
                      <ul
                        className={rootsFormDropdownListClass}
                        role="listbox"
                        aria-label={flow === "purchase" ? "Proveedores" : "Clientes"}
                        aria-busy={searchLoading}
                      >
                        {searchLoading ? (
                          <li className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-[var(--rootsy-bruma-500)]">
                            <RootsSpinner size="sm" aria-hidden />
                            Buscando…
                          </li>
                        ) : catalogResults.length === 0 ? (
                          <li className="px-3 py-4 text-center text-sm text-[var(--rootsy-bruma-500)]">
                            Sin resultados
                          </li>
                        ) : (
                          catalogResults.map((party) => {
                            const isSelected = selected?.id === party.id
                            const isHighlighted =
                              highlightedPartyId === party.id || isSelected

                            return (
                              <li key={party.id}>
                                <button
                                  type="button"
                                  role="option"
                                  aria-selected={isSelected}
                                  className={partySearchDropdownItemClass(
                                    isHighlighted,
                                    isSelected,
                                  )}
                                  onMouseEnter={() =>
                                    setHighlightedPartyId(party.id)
                                  }
                                  onMouseLeave={() =>
                                    setHighlightedPartyId((current) =>
                                      current === party.id ? null : current,
                                    )
                                  }
                                  onMouseDown={(event) => event.preventDefault()}
                                  onClick={() => onSelectCatalogParty(party)}
                                >
                                  <span className="w-full truncate font-medium">
                                    {party.name}
                                  </span>
                                </button>
                              </li>
                            )
                          })
                        )}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {selected ? (
                <CheckoutOptionCard
                  title={selected.name}
                  subtitle={selectedPartySubtitle(selected)}
                  selected
                  onClick={() => {}}
                  icon={flow === "purchase" ? Building2 : User}
                  trailing="check"
                />
              ) : null}

              {canSearchCatalog || selected ? (
                <Separator className="bg-[var(--rootsy-bruma-200)]" />
              ) : null}

              <div className="space-y-2">
                <CheckoutOptionCard
                  title="Carga manual"
                  subtitle={
                    selected && manualSelected
                      ? "Editar datos del cliente manual"
                      : "Completar datos sin buscar en el catálogo"
                  }
                  selected={false}
                  onClick={() => setStep("manual")}
                  icon={User}
                  trailing="chevron"
                />
              </div>
            </>
          ) : (
            <>
              <OperationPartyManualEntryForm
                popId={popId}
                flow={flow}
                manualName={manualName}
                onManualNameChange={onManualNameChange}
                taxId={taxId}
                onTaxIdChange={onTaxIdChange}
                email={email}
                onEmailChange={onEmailChange}
                ivaCondition={ivaCondition}
                onIvaConditionChange={onIvaConditionChange}
                readOnly={manualReadOnly}
                onIvaConditionApplied={onIvaConditionApplied}
              />
              {confirmError ? (
                <p className="text-sm text-rose-600" role="alert">
                  {confirmError}
                </p>
              ) : null}
            </>
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
              : manualFooter?.secondary
                ? {
                    label: manualFooter.secondary.label,
                    title: manualFooter.secondary.title,
                    onClick: manualFooter.secondary.onClick,
                    disabled: manualFooter.secondary.disabled,
                  }
                : undefined
          }
          primary={
            manualFooter?.primary
              ? {
                  label: manualFooter.primary.label,
                  title: manualFooter.primary.title,
                  onClick: manualFooter.primary.onClick,
                  disabled: manualFooter.primary.disabled,
                  loading: manualFooter.primary.loading,
                  loadingLabel: manualFooter.primary.loadingLabel,
                }
              : undefined
          }
        />
      </RootsDialogContent>
    </Dialog>
  )
}
