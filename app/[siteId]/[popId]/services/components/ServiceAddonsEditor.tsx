"use client"

import {
  ServiceArticlesEditor,
  createEmptyServiceArticleLine,
  type ServiceArticleFormLine,
} from "@/app/[siteId]/[popId]/services/components/ServiceArticlesEditor"
import {
  serviceDialogRepeatableListClass,
  serviceDialogRepeatableListItemClass,
  serviceDialogSectionHintClass,
  serviceDialogSectionTitleClass,
} from "@/app/[siteId]/[popId]/services/serviceDialogShared"
import { RootsSubtleButton } from "@/components/rootsy-button"
import { RootsFormMoneyField, RootsFormTextField } from "@/components/rootsy-form"
import { formatMoneyInputForField, parseMoneyInput } from "@/lib/moneyInput"
import { Plus, Trash2 } from "lucide-react"

const FIELD_REQUIRED_MESSAGE = "Requerido"

export type ServiceAddonFormLine = {
  key: string
  name: string
  price: string
  articleLines: ServiceArticleFormLine[]
}

type Props = {
  idPrefix: string
  popId: string
  addonLines: ServiceAddonFormLine[]
  baseArticleLines: ServiceArticleFormLine[]
  onAddonLinesChange: (lines: ServiceAddonFormLine[]) => void
  onBaseArticleLinesChange: (lines: ServiceArticleFormLine[]) => void
  disabled?: boolean
  addonError?: string
  baseArticleError?: string
}

function newAddonKey(): string {
  return `addon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createEmptyServiceAddonLine(): ServiceAddonFormLine {
  return {
    key: newAddonKey(),
    name: "",
    price: formatMoneyInputForField(0),
    articleLines: [],
  }
}

export function ServiceAddonsEditor({
  idPrefix,
  popId,
  addonLines,
  baseArticleLines,
  onAddonLinesChange,
  onBaseArticleLinesChange,
  disabled = false,
  addonError,
  baseArticleError,
}: Props) {
  const updateAddon = (key: string, patch: Partial<ServiceAddonFormLine>) => {
    onAddonLinesChange(
      addonLines.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    )
  }

  const removeAddon = (key: string) => {
    onAddonLinesChange(addonLines.filter((line) => line.key !== key))
  }

  const addAddon = () => {
    onAddonLinesChange([...addonLines, createEmptyServiceAddonLine()])
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div>
          <h4 className={serviceDialogSectionTitleClass}>
            Artículos base del servicio (opcional)
          </h4>
          <p className={serviceDialogSectionHintClass}>
            Insumos que se consumen siempre al prestar el servicio.
          </p>
        </div>

        <ServiceArticlesEditor
          idPrefix={`${idPrefix}-base-articles`}
          popId={popId}
          lines={baseArticleLines}
          onChange={onBaseArticleLinesChange}
          disabled={disabled}
          error={baseArticleError}
        />
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h4 className={serviceDialogSectionTitleClass}>
            Adicionales opcionales
          </h4>
          <p className={serviceDialogSectionHintClass}>
            Extras que el cliente puede sumar al contratar, con su propio precio y artículos.
          </p>
        </div>

        {addonLines.length > 0 ? (
          <div className={serviceDialogRepeatableListClass}>
            {addonLines.map((addon, index) => {
              const addonNameInvalid = Boolean(addonError) && !addon.name.trim()
              const addonPriceParsed = parseMoneyInput(addon.price, Number.NaN)
              const addonPriceInvalid =
                Boolean(addonError) &&
                (!Number.isFinite(addonPriceParsed) || addonPriceParsed < 0)
              const addonArticlesInvalid =
                Boolean(addonError) &&
                addon.articleLines.some(
                  (line) =>
                    !line.articleId.trim() ||
                    !Number.isFinite(Number(line.quantity.replace(",", "."))) ||
                    Number(line.quantity.replace(",", ".")) <= 0,
                )

              return (
              <div key={addon.key} className={serviceDialogRepeatableListItemClass}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-2">
                    <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                      <RootsFormTextField
                        label={`Adicional ${index + 1}`}
                        id={`${idPrefix}-addon-name-${addon.key}`}
                        value={addon.name}
                        onChange={(e) =>
                          updateAddon(addon.key, { name: e.target.value })
                        }
                        placeholder="Ej. Módulo Facturación"
                        disabled={disabled}
                        invalid={addonNameInvalid}
                        error={addonNameInvalid ? FIELD_REQUIRED_MESSAGE : undefined}
                      />
                      <RootsFormMoneyField
                        label="Precio"
                        id={`${idPrefix}-addon-price-${addon.key}`}
                        value={addon.price}
                        onChange={(value) => updateAddon(addon.key, { price: value })}
                        disabled={disabled}
                        invalid={addonPriceInvalid}
                        error={addonPriceInvalid ? FIELD_REQUIRED_MESSAGE : undefined}
                      />
                    </div>
                    <RootsSubtleButton
                      type="button"
                      onClick={() => removeAddon(addon.key)}
                      disabled={disabled}
                      aria-label="Quitar adicional"
                      className="mt-6 shrink-0"
                    >
                      <Trash2 className="size-4" />
                    </RootsSubtleButton>
                  </div>

                  <ServiceArticlesEditor
                    idPrefix={`${idPrefix}-addon-${addon.key}`}
                    popId={popId}
                    lines={addon.articleLines}
                    onChange={(articleLines) =>
                      updateAddon(addon.key, { articleLines })
                    }
                    disabled={disabled}
                    embedded
                    error={addonArticlesInvalid ? FIELD_REQUIRED_MESSAGE : undefined}
                  />
                </div>
              </div>
              )
            })}
          </div>
        ) : null}

        <RootsSubtleButton
          type="button"
          className="self-end"
          onClick={addAddon}
          disabled={disabled}
        >
          <Plus className="size-4" aria-hidden />
          Agregar adicional
        </RootsSubtleButton>
      </section>
    </div>
  )
}
