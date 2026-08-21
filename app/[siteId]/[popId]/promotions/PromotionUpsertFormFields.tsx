"use client"

import type { PromotionCatalogOption } from "@/app/[siteId]/[popId]/promotions/actions"
import { PromotionSlotEditor } from "@/app/[siteId]/[popId]/promotions/components/PromotionSlotEditor"
import {
  promotionFormToggleWeekday,
  promotionFormWithType,
  type PromotionFormState,
} from "@/app/[siteId]/[popId]/promotions/promotionFormState"
import {
  RootsFormDateField,
  RootsFormGrid,
  RootsFormMoneyField,
  RootsFormQuantityField,
  RootsFormSegmentField,
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormSwitchField,
  RootsFormTextField,
  RootsFormTextareaField,
  rootsFormColumnClass,
  rootsFormBrumaTextSecondaryClass,
  rootsFormFieldLabelClass,
  rootsFormTwoColRowClass,
} from "@/components/rootsy-form"
import { rootsFormBrumaDividerClass } from "@/components/rootsy-form/rootsFormBrumaTokens"
import {
  PROMOTION_BENEFIT_TARGET_LABEL,
  PROMOTION_PRICING_MODE_LABEL,
  PROMOTION_WEEKDAY_OPTIONS,
  type PromotionBenefitTarget,
  type PromotionPricingMode,
  type PromotionType,
} from "@/lib/promotionTypes"
import { cn } from "@/lib/utils"
import type { Dispatch, ReactNode, SetStateAction } from "react"

const sectionDividerClass = cn("h-px w-full shrink-0", rootsFormBrumaDividerClass)

function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h3 className={rootsFormFieldLabelClass}>{title}</h3>
        {description ? (
          <p
            className={cn(
              "mt-1 text-xs leading-relaxed",
              rootsFormBrumaTextSecondaryClass,
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

type Props = {
  idPrefix: string
  form: PromotionFormState
  setForm: Dispatch<SetStateAction<PromotionFormState>>
  catalogOptions: PromotionCatalogOption[]
  disabled?: boolean
}

export function PromotionUpsertFormFields({
  idPrefix,
  form,
  setForm,
  catalogOptions,
  disabled = false,
}: Props) {
  return (
    <div className={cn(rootsFormColumnClass, "gap-6")}>
      <RootsFormGrid>
        <div className={cn(rootsFormColumnClass, "gap-6")}>
          <FormSection
            title="General"
            description="Nombre, tipo y cómo se muestra en el menú."
          >
            <RootsFormTextField
              label="Nombre"
              id={`${idPrefix}-name`}
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
              disabled={disabled}
            />

            <RootsFormTextareaField
              label="Descripción"
              id={`${idPrefix}-desc`}
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              rows={2}
              placeholder="Opcional"
              disabled={disabled}
            />

            <RootsFormTextField
              label="Imagen (URL)"
              id={`${idPrefix}-image`}
              value={form.imageUrl}
              onChange={(e) =>
                setForm((p) => ({ ...p, imageUrl: e.target.value }))
              }
              placeholder="https://…"
              disabled={disabled}
              hint="URL pública de la imagen de la promoción."
            />

            <RootsFormSegmentField
              label="Tipo de promoción"
              value={form.promotionType}
              onValueChange={(value) =>
                setForm((p) => promotionFormWithType(p, value as PromotionType))
              }
              disabled={disabled}
              options={[
                { value: "combo", label: "Combo" },
                { value: "quantity_deal", label: "Por cantidad" },
              ]}
            />
          </FormSection>

          <div className={sectionDividerClass} />

          <FormSection
            title={
              form.promotionType === "combo"
                ? "Precio del combo"
                : "Regla por cantidad"
            }
            description={
              form.promotionType === "combo"
                ? "Precio fijo o descuento sobre el total."
                : "Cantidad a comprar y unidades bonificadas."
            }
          >
            {form.promotionType === "combo" ? (
              <>
                <RootsFormSelectField
                  label="Modo de precio"
                  id={`${idPrefix}-pricing-mode`}
                  value={form.pricingMode}
                  onValueChange={(value) =>
                    setForm((p) => ({
                      ...p,
                      pricingMode: value as PromotionPricingMode,
                    }))
                  }
                  disabled={disabled}
                >
                  {(
                    Object.entries(PROMOTION_PRICING_MODE_LABEL) as [
                      PromotionPricingMode,
                      string,
                    ][]
                  ).map(([value, label]) => (
                    <RootsFormSelectItem key={value} value={value}>
                      {label}
                    </RootsFormSelectItem>
                  ))}
                </RootsFormSelectField>

                {form.pricingMode === "fixed_total" ? (
                  <RootsFormMoneyField
                    label="Precio fijo total"
                    id={`${idPrefix}-fixed-price`}
                    value={form.fixedPrice}
                    onChange={(value) =>
                      setForm((p) => ({ ...p, fixedPrice: value }))
                    }
                    disabled={disabled}
                  />
                ) : (
                  <RootsFormTextField
                    label={
                      form.pricingMode === "percent_off"
                        ? "Porcentaje (%)"
                        : "Monto de descuento ($)"
                    }
                    id={`${idPrefix}-discount`}
                    value={form.discountValue}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        discountValue: e.target.value,
                        discountMode:
                          form.pricingMode === "percent_off" ? "porcentaje" : "fijo",
                      }))
                    }
                    inputMode="decimal"
                    required
                    disabled={disabled}
                  />
                )}
              </>
            ) : (
              <>
                <div className={rootsFormTwoColRowClass}>
                  <RootsFormQuantityField
                    label="Cantidad a comprar"
                    id={`${idPrefix}-buy-qty`}
                    value={form.buyQuantity}
                    onChange={(value) =>
                      setForm((p) => ({ ...p, buyQuantity: value }))
                    }
                    disabled={disabled}
                    prefix="uds."
                  />
                  <RootsFormQuantityField
                    label="Unidades bonificadas"
                    id={`${idPrefix}-benefit-qty`}
                    value={form.benefitQuantity}
                    onChange={(value) =>
                      setForm((p) => ({ ...p, benefitQuantity: value }))
                    }
                    disabled={disabled}
                    prefix="uds."
                  />
                </div>

                <div className={rootsFormTwoColRowClass}>
                  <RootsFormTextField
                    label="Descuento (%)"
                    id={`${idPrefix}-benefit-pct`}
                    value={form.benefitDiscountPct}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        benefitDiscountPct: e.target.value,
                      }))
                    }
                    inputMode="decimal"
                    required
                    disabled={disabled}
                    hint="100% = gratis (ej. 2x1), 50% = mitad de precio."
                  />

                  <RootsFormSelectField
                    label="Aplicar beneficio a"
                    id={`${idPrefix}-benefit-target`}
                    value={form.applyBenefitTo}
                    onValueChange={(value) =>
                      setForm((p) => ({
                        ...p,
                        applyBenefitTo: value as PromotionBenefitTarget,
                      }))
                    }
                    disabled={disabled}
                  >
                    {(
                      Object.entries(PROMOTION_BENEFIT_TARGET_LABEL) as [
                        PromotionBenefitTarget,
                        string,
                      ][]
                    ).map(([value, label]) => (
                      <RootsFormSelectItem key={value} value={value}>
                        {label}
                      </RootsFormSelectItem>
                    ))}
                  </RootsFormSelectField>
                </div>
              </>
            )}
          </FormSection>
        </div>

        <div className={cn(rootsFormColumnClass, "gap-6")}>
          <FormSection title="Estado y visibilidad">
            <RootsFormSwitchField
              label="Activa"
              id={`${idPrefix}-active`}
              checked={form.isActive}
              onCheckedChange={(checked) =>
                setForm((p) => ({ ...p, isActive: checked }))
              }
              disabled={disabled}
            />
            <RootsFormSwitchField
              label="Visible en menú"
              id={`${idPrefix}-menu`}
              checked={form.showInMenu}
              onCheckedChange={(checked) =>
                setForm((p) => ({ ...p, showInMenu: checked }))
              }
              disabled={disabled}
            />
            <RootsFormSwitchField
              label="Aplicar automáticamente"
              description="Se aplica sola al armar el pedido cuando corresponde."
              id={`${idPrefix}-auto`}
              checked={form.autoApply}
              onCheckedChange={(checked) =>
                setForm((p) => ({ ...p, autoApply: checked }))
              }
              disabled={disabled}
            />
          </FormSection>

          <div className={sectionDividerClass} />

          <PromotionSlotEditor
            idPrefix={idPrefix}
            promotionType={form.promotionType}
            lines={form.slots}
            catalogOptions={catalogOptions}
            disabled={disabled}
            onChange={(slots) => setForm((p) => ({ ...p, slots }))}
          />

          <div className={sectionDividerClass} />

          <FormSection
            title="Vigencia"
            description="Fechas, horarios y días en que aplica."
          >
            <div className={rootsFormTwoColRowClass}>
              <RootsFormDateField
                label="Desde (fecha)"
                id={`${idPrefix}-from`}
                value={form.validFrom}
                onChange={(value) =>
                  setForm((p) => ({ ...p, validFrom: value }))
                }
                disabled={disabled}
                placeholder="Sin límite"
              />
              <RootsFormDateField
                label="Hasta (fecha)"
                id={`${idPrefix}-until`}
                value={form.validUntil}
                onChange={(value) =>
                  setForm((p) => ({ ...p, validUntil: value }))
                }
                disabled={disabled}
                placeholder="Sin límite"
              />
            </div>

            <div className={rootsFormTwoColRowClass}>
              <RootsFormTextField
                label="Hora inicio"
                id={`${idPrefix}-time-start`}
                type="time"
                value={form.validTimeStart}
                onChange={(e) =>
                  setForm((p) => ({ ...p, validTimeStart: e.target.value }))
                }
                disabled={disabled}
              />
              <RootsFormTextField
                label="Hora fin"
                id={`${idPrefix}-time-end`}
                type="time"
                value={form.validTimeEnd}
                onChange={(e) =>
                  setForm((p) => ({ ...p, validTimeEnd: e.target.value }))
                }
                disabled={disabled}
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className={rootsFormFieldLabelClass}>Días de la semana</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PROMOTION_WEEKDAY_OPTIONS.map(({ value, label }) => {
                  const checked = form.scheduleDays.includes(value)
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={disabled}
                      aria-pressed={checked}
                      className={cn(
                        "h-10 rounded-lg border px-2 text-xs font-medium transition-colors",
                        checked
                          ? "border-[color:var(--rootsy-savia-400)]/45 bg-[color:var(--rootsy-savia-100)] text-[color:var(--rootsy-savia-800)]"
                          : "border-border/70 bg-muted/20 text-muted-foreground hover:bg-muted/35",
                        disabled && "cursor-not-allowed opacity-50",
                      )}
                      onClick={() =>
                        setForm((p) => promotionFormToggleWeekday(p, value))
                      }
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          </FormSection>
        </div>
      </RootsFormGrid>
    </div>
  )
}
