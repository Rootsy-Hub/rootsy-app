"use client"

import { searchClientsForServiceCharge } from "@/app/[siteId]/[popId]/active-services/actions"
import { SERVICE_CHARGE_CLIENT_SEARCH_LIMIT } from "@/app/[siteId]/[popId]/active-services/serviceChargeClientConstants"
import type { CreateServiceChargeInput } from "@/app/[siteId]/[popId]/active-services/actions"
import { OperationPartyManualEntryForm } from "@/components/checkout/OperationPartyManualEntryForm"
import {
  RootsFormCheckboxChoiceRow,
  RootsFormSearchField,
  rootsFormColumnClass,
  rootsFormFieldGroupClass,
} from "@/components/rootsy-form"
import {
  rootsFormDropdownHighlightItemClassForTone,
  rootsFormDropdownListClass,
  rootsFormPortalZClass,
  rootsFormSelectContentClass,
  rootsFormSelectDarkContentClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { useRootsFormControlTone } from "@/components/rootsy-form/rootsFormFieldContext"
import { RootsSpinner } from "@/components/rootsy-spinner"
import {
  layoutsOperarDropdownRevealClass,
  layoutsOperarFormDarkMutedTextClass,
  layoutsOperarScrollMinimalClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { OperarReveal } from "@/components/layouts-module/OperarReveal"
import type { OperationPartyCatalogItem } from "@/lib/operationPartyPicker"
import { cn } from "@/lib/utils"
import { useEffect, useRef, useState, type ChangeEvent } from "react"

function clientSearchDropdownItemClass(
  isDark: boolean,
  active: boolean,
  selected: boolean,
) {
  const tone = isDark ? "dark" : "light"
  const state = selected ? "selected" : active ? "highlighted" : "default"

  return cn(
    "flex w-full cursor-pointer flex-col items-start gap-0.5 px-3 py-2.5 text-left text-sm transition-colors",
    rootsFormDropdownHighlightItemClassForTone(tone, state),
  )
}

function clientSearchDropdownSubtitleClass(isDark: boolean) {
  return cn(
    "w-full truncate text-xs",
    isDark ? layoutsOperarFormDarkMutedTextClass : "text-[var(--rootsy-bruma-500)]",
  )
}

export type ServiceChargeClientDraft = {
  catalogClient: OperationPartyCatalogItem | null
  manualName: string
  taxId: string
  email: string
  ivaCondition: string
  /** Persistir en cartera: cambios (cliente existente) o alta (cliente manual). */
  persistInCatalog: boolean
}

export function normalizeServiceChargeClientDraft(
  draft: Partial<ServiceChargeClientDraft>,
): ServiceChargeClientDraft {
  return {
    catalogClient: draft.catalogClient ?? null,
    manualName: draft.manualName ?? "",
    taxId: draft.taxId ?? "",
    email: draft.email ?? "",
    ivaCondition: draft.ivaCondition ?? "",
    persistInCatalog: draft.persistInCatalog ?? false,
  }
}

export function emptyServiceChargeClientDraft(): ServiceChargeClientDraft {
  return normalizeServiceChargeClientDraft({})
}

export function isServiceChargeClientReady(draft: ServiceChargeClientDraft): boolean {
  if (draft.catalogClient?.id) return true
  return Boolean(draft.manualName.trim())
}

/** IVA efectiva del cargo — el valor del form prevalece sobre la ficha precargada. */
export function serviceChargeEffectiveClientIva(draft: ServiceChargeClientDraft): string {
  return (
    draft.ivaCondition.trim() ||
    draft.catalogClient?.ivaCondition?.trim() ||
    ""
  )
}

export function serviceChargeClientCatalogHasEdits(
  draft: ServiceChargeClientDraft,
): boolean {
  const catalog = draft.catalogClient
  if (!catalog?.id) return false
  const catalogEmail = catalog.email?.trim() ?? ""
  const catalogIva = catalog.ivaCondition?.trim() ?? ""
  return (
    draft.email.trim() !== catalogEmail ||
    draft.ivaCondition.trim() !== catalogIva
  )
}

export function serviceChargeClientIsManualEntry(
  draft: ServiceChargeClientDraft,
): boolean {
  return !draft.catalogClient?.id && Boolean(draft.manualName.trim())
}

export function buildServiceChargeClientPayload(
  draft: ServiceChargeClientDraft,
  options: { canCreateClient: boolean },
): Pick<
  CreateServiceChargeInput,
  "clientId" | "newClient" | "updateExistingClient" | "saveNewClient"
> {
  const normalized = normalizeServiceChargeClientDraft(draft)

  if (normalized.catalogClient?.id) {
    const payload: Pick<
      CreateServiceChargeInput,
      "clientId" | "updateExistingClient"
    > = {
      clientId: normalized.catalogClient.id,
    }
    if (
      normalized.persistInCatalog &&
      serviceChargeClientCatalogHasEdits(normalized)
    ) {
      payload.updateExistingClient = {
        email: normalized.email.trim(),
        ivaCondition: normalized.ivaCondition.trim(),
      }
    }
    return payload
  }

  if (!options.canCreateClient || !normalized.manualName.trim()) {
    return {}
  }

  return {
    saveNewClient: normalized.persistInCatalog,
    ...(normalized.persistInCatalog
      ? {
          newClient: {
            name: normalized.manualName.trim(),
            taxId: normalized.taxId.trim(),
            email: normalized.email.trim(),
            ivaCondition: normalized.ivaCondition.trim(),
          },
        }
      : {}),
  }
}

type Props = {
  popId: string
  disabled?: boolean
  canSearchClients: boolean
  canCreateClient: boolean
  canUpdateClient: boolean
  draft: ServiceChargeClientDraft
  manualNameError?: string
  emailError?: string
  onDraftChange: (patch: Partial<ServiceChargeClientDraft>) => void
}

export function ServiceChargeClientField({
  popId,
  disabled = false,
  canSearchClients,
  canCreateClient,
  canUpdateClient,
  draft: rawDraft,
  manualNameError,
  emailError,
  onDraftChange,
}: Props) {
  const draft = normalizeServiceChargeClientDraft(rawDraft)
  const [searchQuery, setSearchQuery] = useState("")
  const [catalogResults, setCatalogResults] = useState<OperationPartyCatalogItem[]>(
    [],
  )
  const [searchLoading, setSearchLoading] = useState(false)
  const [highlightedClientId, setHighlightedClientId] = useState<string | null>(null)
  const searchGenRef = useRef(0)
  const catalogClientId = draft.catalogClient?.id ?? null

  const catalogSelected = draft.catalogClient
  const fieldsLocked = Boolean(catalogSelected?.id)
  const searchTrim = searchQuery.trim()
  const showSearchDropdown =
    canSearchClients && !fieldsLocked && Boolean(searchTrim)

  useEffect(() => {
    if (catalogSelected) {
      setSearchQuery(catalogSelected.name)
      setCatalogResults([])
    }
  }, [catalogClientId, catalogSelected])

  useEffect(() => {
    if (!showSearchDropdown) {
      setCatalogResults([])
      setSearchLoading(false)
      setHighlightedClientId(null)
      return
    }

    const gen = ++searchGenRef.current
    const timer = window.setTimeout(() => {
      void (async () => {
        setSearchLoading(true)
        const res = await searchClientsForServiceCharge(popId, searchTrim)
        if (gen !== searchGenRef.current) return
        setSearchLoading(false)
        setCatalogResults(
          res.success
            ? res.parties.slice(0, SERVICE_CHARGE_CLIENT_SEARCH_LIMIT)
            : [],
        )
      })()
    }, 300)

    return () => window.clearTimeout(timer)
  }, [showSearchDropdown, popId, searchTrim])

  const selectCatalogClient = (party: OperationPartyCatalogItem) => {
    onDraftChange({
      catalogClient: party,
      manualName: party.name,
      taxId: party.taxId?.trim() ?? "",
      email: party.email?.trim() ?? "",
      ivaCondition: party.ivaCondition?.trim() ?? "",
      persistInCatalog: false,
    })
    setSearchQuery(party.name)
    setCatalogResults([])
  }

  const clearClientSelection = () => {
    onDraftChange({
      catalogClient: null,
      manualName: "",
      taxId: "",
      email: "",
      ivaCondition: "",
      persistInCatalog: false,
    })
    setSearchQuery("")
    setCatalogResults([])
  }

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value
    setSearchQuery(next)
    if (catalogSelected && next.trim() !== catalogSelected.name.trim()) {
      onDraftChange({
        catalogClient: null,
        manualName: "",
        taxId: "",
        email: "",
        ivaCondition: "",
        persistInCatalog: false,
      })
    }
  }

  const tone = useRootsFormControlTone()
  const isDark = tone === "dark"
  const catalogHasEdits = serviceChargeClientCatalogHasEdits(draft)
  const isManualEntry = serviceChargeClientIsManualEntry(draft)
  const showSaveExistingCheckbox =
    Boolean(catalogSelected?.id) && catalogHasEdits && canUpdateClient
  const showSaveNewCheckbox = isManualEntry && canCreateClient
  const searchResultsTruncated =
    !searchLoading &&
    catalogResults.length >= SERVICE_CHARGE_CLIENT_SEARCH_LIMIT

  return (
    <div className={rootsFormColumnClass}>
      {canSearchClients ? (
        <div className={cn(rootsFormColumnClass, "min-w-0")}>
          <p
            className={cn(
              "text-xs font-medium uppercase tracking-wide",
              isDark
                ? layoutsOperarFormDarkMutedTextClass
                : "text-[var(--rootsy-bruma-500)]",
            )}
          >
            Seleccionar cliente
          </p>
          <div className={cn("relative", showSearchDropdown && rootsFormPortalZClass)}>
            <RootsFormSearchField
              label="Buscar"
              value={searchQuery}
              onChange={handleSearchChange}
              onClear={clearClientSelection}
              placeholder="Nombre o CUIT…"
              disabled={disabled}
            />

            <div
              className={cn(
                "absolute inset-x-0 top-[calc(100%+4px)]",
                showSearchDropdown && rootsFormPortalZClass,
              )}
            >
              <OperarReveal open={showSearchDropdown}>
                <div
                  className={cn(
                    "max-h-[min(28rem,calc(100dvh-14rem))] overflow-x-hidden overflow-y-auto",
                    layoutsOperarScrollMinimalClass,
                    showSearchDropdown && layoutsOperarDropdownRevealClass,
                    isDark
                      ? cn(rootsFormSelectDarkContentClass, "z-[520] w-full min-w-0 max-w-none")
                      : cn(rootsFormSelectContentClass, "z-[520] w-full min-w-0 max-w-none"),
                  )}
                >
                  <ul
                    className={rootsFormDropdownListClass}
                    role="listbox"
                    aria-label="Clientes"
                    aria-busy={searchLoading}
                  >
                    {searchLoading ? (
                      <li
                        className={cn(
                          "flex items-center justify-center gap-2 px-3 py-4 text-sm",
                          isDark
                            ? layoutsOperarFormDarkMutedTextClass
                            : "text-[var(--rootsy-bruma-500)]",
                        )}
                      >
                        <RootsSpinner size="sm" tone={isDark ? "dark" : "light"} aria-hidden />
                        Buscando…
                      </li>
                    ) : catalogResults.length === 0 ? (
                      <li
                        className={cn(
                          "px-3 py-4 text-center text-sm",
                          isDark
                            ? layoutsOperarFormDarkMutedTextClass
                            : "text-[var(--rootsy-bruma-500)]",
                        )}
                      >
                        Sin resultados — podés completar los datos abajo
                      </li>
                    ) : (
                      catalogResults.map((party) => {
                        const isSelected = catalogSelected?.id === party.id
                        const isHighlighted =
                          highlightedClientId === party.id || isSelected

                        return (
                          <li key={party.id}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              className={clientSearchDropdownItemClass(
                                isDark,
                                isHighlighted,
                                isSelected,
                              )}
                              onMouseEnter={() => setHighlightedClientId(party.id)}
                              onMouseLeave={() =>
                                setHighlightedClientId((current) =>
                                  current === party.id ? null : current,
                                )
                              }
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => selectCatalogClient(party)}
                            >
                              <span className="w-full truncate font-medium">{party.name}</span>
                              {party.taxId ? (
                                <span className={clientSearchDropdownSubtitleClass(isDark)}>
                                  {party.taxId}
                                </span>
                              ) : null}
                            </button>
                          </li>
                        )
                      })
                    )}
                    {searchResultsTruncated ? (
                      <li
                        className={cn(
                          "border-t border-[color-mix(in_srgb,var(--rootsy-sombra-border)_45%,transparent)] px-3 py-2 text-center text-xs",
                          isDark
                            ? layoutsOperarFormDarkMutedTextClass
                            : "text-[var(--rootsy-bruma-500)]",
                        )}
                      >
                        Mostrando los primeros {SERVICE_CHARGE_CLIENT_SEARCH_LIMIT} resultados
                      </li>
                    ) : null}
                  </ul>
                </div>
              </OperarReveal>
            </div>
          </div>
        </div>
      ) : null}

      <OperationPartyManualEntryForm
        popId={popId}
        flow="sale"
        manualName={draft.manualName}
        onManualNameChange={(value) =>
          onDraftChange({
            catalogClient: null,
            manualName: value,
          })
        }
        taxId={draft.taxId}
        onTaxIdChange={(value) =>
          onDraftChange({
            catalogClient: null,
            taxId: value,
          })
        }
        email={draft.email}
        onEmailChange={(value) => onDraftChange({ email: value })}
        ivaCondition={draft.ivaCondition}
        onIvaConditionChange={(value) => onDraftChange({ ivaCondition: value })}
        disabled={disabled}
        readOnly={fieldsLocked}
        manualNameError={manualNameError}
        emailError={emailError}
      />

      <div className={rootsFormFieldGroupClass}>
        <OperarReveal open={showSaveExistingCheckbox}>
          <RootsFormCheckboxChoiceRow
            id="charge-client-save-existing"
            label="Guardar cambios del cliente"
            description="Actualiza email y condición IVA en la cartera."
            checked={draft.persistInCatalog}
            disabled={disabled}
            onCheckedChange={(checked) =>
              onDraftChange({ persistInCatalog: checked })
            }
          />
        </OperarReveal>

        <OperarReveal open={showSaveNewCheckbox}>
          <RootsFormCheckboxChoiceRow
            id="charge-client-save-new"
            label="Guardar cliente nuevo"
            description="Da de alta este cliente en la cartera al crear el cargo."
            checked={draft.persistInCatalog}
            disabled={disabled}
            onCheckedChange={(checked) =>
              onDraftChange({ persistInCatalog: checked })
            }
          />
        </OperarReveal>
      </div>

      {!canCreateClient && !fieldsLocked ? (
        <p
          className={cn(
            "text-xs",
            isDark ? layoutsOperarFormDarkMutedTextClass : "text-[var(--rootsy-bruma-500)]",
          )}
        >
          Para cargar un cliente nuevo necesitás permiso de creación en Clientes.
        </p>
      ) : null}
    </div>
  )
}
