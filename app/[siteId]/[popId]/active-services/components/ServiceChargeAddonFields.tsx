"use client"

import type { ServiceTypeChargeOption } from "@/app/[siteId]/[popId]/active-services/actions"
import { ServiceChargeAddonMultiSelectField } from "@/app/[siteId]/[popId]/active-services/components/ServiceChargeAddonMultiSelectField"
import type { ServiceChargeCreateWizardForm } from "@/app/[siteId]/[popId]/active-services/serviceChargeCreateFormState"
import { rootsFormColumnClass } from "@/components/rootsy-form"
import { pruneOneTimeAddonIds } from "@/lib/serviceChargeAddonSelection"

type Props = {
  form: ServiceChargeCreateWizardForm
  selectedService: ServiceTypeChargeOption
  disabled?: boolean
  fieldIdPrefix?: string
  onChange: (patch: Partial<ServiceChargeCreateWizardForm>) => void
}

export function ServiceChargeAddonFields({
  form,
  selectedService,
  disabled = false,
  fieldIdPrefix = "",
  onChange,
}: Props) {
  const addons = selectedService.addons
  if (addons.length === 0) return null

  const isSubscription = form.billingScope === "subscription"
  const oneTimeOptions = addons.filter((addon) =>
    form.selectedAddonIds.includes(addon.id),
  )

  const updateSelectedAddonIds = (selectedAddonIds: string[]) => {
    onChange({
      selectedAddonIds,
      oneTimeAddonIds: pruneOneTimeAddonIds(
        selectedAddonIds,
        form.oneTimeAddonIds,
      ),
    })
  }

  const id = (suffix: string) => (fieldIdPrefix ? `${fieldIdPrefix}-${suffix}` : suffix)

  return (
    <div className={rootsFormColumnClass}>
      <ServiceChargeAddonMultiSelectField
        label={isSubscription ? "Adicionales" : "Adicionales"}
        id={id("operate-charge-addons")}
        addons={addons}
        selectedIds={form.selectedAddonIds}
        onSelectedIdsChange={updateSelectedAddonIds}
        disabled={disabled}
      />

      {isSubscription && form.selectedAddonIds.length > 0 ? (
        <ServiceChargeAddonMultiSelectField
          label="Adicionales por única vez"
          id={id("operate-charge-addons-once")}
          addons={oneTimeOptions}
          selectedIds={form.oneTimeAddonIds}
          onSelectedIdsChange={(oneTimeAddonIds) =>
            onChange({
              oneTimeAddonIds: pruneOneTimeAddonIds(
                form.selectedAddonIds,
                oneTimeAddonIds,
              ),
            })
          }
          disabled={disabled}
          showNoneOption={false}
          emptySelectionLabel="Ninguno"
        />
      ) : null}
    </div>
  )
}
