import type { ServiceChargeCreateWizardStep } from "@/app/[siteId]/[popId]/active-services/serviceChargeCreateFormState"

export type ServiceOperateStep = 1 | 2 | 3

export const SERVICE_OPERATE_STEPS: {
  step: ServiceOperateStep
  label: string
}[] = [
  { step: 1, label: "Servicio" },
  { step: 2, label: "Configuración" },
  { step: 3, label: "Facturación" },
]

/** Pasos operar ↔ wizard (1:1). */
export function wizardStepForOperateStep(
  step: ServiceOperateStep,
): ServiceChargeCreateWizardStep {
  return step
}

export function operateStepForWizardStep(
  step: ServiceChargeCreateWizardStep,
): ServiceOperateStep {
  return step
}

/** Paso operar anterior; salta cliente si no hay permiso de lectura. */
export function previousServiceOperateStep(
  step: ServiceOperateStep,
  options?: { skipClientStep?: boolean },
): ServiceOperateStep | null {
  if (step <= 1) return null
  if (step === 3 && options?.skipClientStep) return 1
  return (step - 1) as ServiceOperateStep
}
