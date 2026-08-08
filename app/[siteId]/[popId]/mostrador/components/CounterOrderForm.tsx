"use client"

import {
  COUNTER_ESTIMATED_MINUTES_OPTIONS,
  type CounterFulfillmentType,
  type CreateCounterOrderInput,
} from "@/app/[siteId]/[popId]/mostrador/mostradorTypes"
import {
  CheckoutSectionLabel,
} from "@/components/checkout/CheckoutFormFields"
import {
  ChannelDataFormActionsBar,
  ChannelDataPanel,
  ChannelDataSection,
} from "@/components/sale-operation/ChannelOperationDataPanel"
import {
  saleOpChannelFormField,
  saleOpChannelSegmentGroup,
  saleOpChannelSegmentOption,
} from "@/components/sale-operation/saleOperationStyles"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useState } from "react"

type Props = {
  onSubmit: (input: CreateCounterOrderInput) => Promise<boolean> | boolean
  onCancel?: () => void
  submitLabel?: string
}

export function CounterOrderForm({
  onSubmit,
  onCancel,
  submitLabel = "Crear pedido",
}: Props) {
  const [fulfillmentType, setFulfillmentType] =
    useState<CounterFulfillmentType>("pickup")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [driverName, setDriverName] = useState("")
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>("30")
  const [notes, setNotes] = useState("")
  const [immediateFulfillment, setImmediateFulfillment] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const isDelivery = fulfillmentType === "delivery"

  const canSubmit =
    Number.isFinite(Number(estimatedMinutes)) &&
    (!isDelivery || (deliveryAddress.trim() && phone.trim()))

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    try {
      await onSubmit({
        fulfillmentType,
        deliveryAddress: isDelivery ? deliveryAddress.trim() : undefined,
        phone: isDelivery ? phone.trim() : undefined,
        driverName: isDelivery ? driverName.trim() || undefined : undefined,
        estimatedMinutes: Number(estimatedMinutes),
        notes: notes.trim() || undefined,
        immediateFulfillment,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <ChannelDataPanel className="flex-1">
        <ChannelDataSection className="space-y-4">
          <div>
            <CheckoutSectionLabel>Tipo de entrega *</CheckoutSectionLabel>
            <div
              role="group"
              aria-label="Tipo de entrega"
              className={cn(saleOpChannelSegmentGroup, "mt-2")}
            >
              {(
                [
                  ["pickup", "Mostrador"],
                  ["delivery", "Delivery"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={fulfillmentType === value}
                  onClick={() => {
                    setFulfillmentType(value)
                    if (value === "pickup") setDriverName("")
                  }}
                  className={saleOpChannelSegmentOption(fulfillmentType === value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {isDelivery ? (
            <>
              <div>
                <CheckoutSectionLabel>Dirección *</CheckoutSectionLabel>
                <Input
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className={cn(saleOpChannelFormField, "mt-2 h-11")}
                  placeholder="Calle, número, piso…"
                />
              </div>
              <div>
                <CheckoutSectionLabel>Celular *</CheckoutSectionLabel>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={cn(saleOpChannelFormField, "mt-2 h-11")}
                  placeholder="11 1234 5678"
                />
              </div>
              <div>
                <CheckoutSectionLabel>Repartidor</CheckoutSectionLabel>
                <Input
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className={cn(saleOpChannelFormField, "mt-2 h-11")}
                  placeholder="Nombre (opcional)"
                />
              </div>
            </>
          ) : null}

          <div>
            <CheckoutSectionLabel>Tiempo estimado *</CheckoutSectionLabel>
            <Select value={estimatedMinutes} onValueChange={setEstimatedMinutes}>
              <SelectTrigger className={cn(saleOpChannelFormField, "mt-2 h-11")}>
                <SelectValue placeholder="Elegir minutos" />
              </SelectTrigger>
              <SelectContent>
                {COUNTER_ESTIMATED_MINUTES_OPTIONS.map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {m} minutos
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <CheckoutSectionLabel>Notas</CheckoutSectionLabel>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={cn(saleOpChannelFormField, "mt-2 min-h-20 resize-none px-3 py-2.5")}
              placeholder="Indicaciones para cocina o entrega"
            />
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/15 px-3 py-3">
            <Checkbox
              id="counter-immediate-fulfillment"
              checked={immediateFulfillment}
              onCheckedChange={(v) => setImmediateFulfillment(v === true)}
              className="mt-0.5 border-border/70 bg-background shadow-none data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            />
            <Label
              htmlFor="counter-immediate-fulfillment"
              className="cursor-pointer text-sm font-normal leading-snug text-foreground"
            >
              Entrega inmediata (pasa directo a entregados)
            </Label>
          </div>
        </ChannelDataSection>
      </ChannelDataPanel>

      <ChannelDataFormActionsBar
        onCancel={onCancel}
        primary={{
          label: submitLabel,
          disabled: !canSubmit || submitting,
          loading: submitting,
          loadingLabel: "Creando…",
          onClick: () => void handleSubmit(),
        }}
      />
    </div>
  )
}
