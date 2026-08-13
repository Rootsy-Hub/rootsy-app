import type { ServiceOperateStep } from "@/lib/serviceOperateSteps"
import type { LucideIcon } from "lucide-react"
import { Banknote, Briefcase, Settings2 } from "lucide-react"

export type ServiceOperateStepMeta = {
  step: ServiceOperateStep
  label: string
  description: string
  icon: LucideIcon
}

export const SERVICE_OPERATE_STEP_META: Record<
  ServiceOperateStep,
  ServiceOperateStepMeta
> = {
  1: {
    step: 1,
    label: "Servicio",
    description: "Elegí del catálogo.",
    icon: Briefcase,
  },
  2: {
    step: 2,
    label: "Configuración",
    description: "Cliente, alcance, período, precio y descuento.",
    icon: Settings2,
  },
  3: {
    step: 3,
    label: "Facturación",
    description: "Medio de cobro y facturación.",
    icon: Banknote,
  },
}

export const SERVICE_OPERATE_STEP_LIST = (
  Object.values(SERVICE_OPERATE_STEP_META) as ServiceOperateStepMeta[]
).sort((a, b) => a.step - b.step)
