"use client"

import {
  COUNTER_ESTIMATED_MINUTES_OPTIONS,
  type CounterFulfillmentType,
  type CreateCounterOrderInput,
} from "@/app/[siteId]/[popId]/mostrador/mostradorTypes"
import { ChannelDataFormActionsBar } from "@/components/sale-operation/ChannelOperationDataPanel"
import {
  ChannelDataFormCheckboxField,
  ChannelDataFormSection,
  ChannelDataFormSegmentField,
  ChannelDataFormSelectField,
  ChannelDataFormSelectItem,
  ChannelDataFormTextareaField,
  ChannelDataFormTextField,
} from "@/components/sale-operation/ChannelDataFormFields"
import { ChannelDataPanel } from "@/components/sale-operation/ChannelOperationDataPanel"
import { useEffect, useState } from "react"

type Props = {
  initial?: Partial<CreateCounterOrderInput>
  onSubmit: (input: CreateCounterOrderInput) => Promise<boolean> | boolean
  onCancel?: () => void
  submitLabel?: string
  showImmediateFulfillment?: boolean
}

export function CounterOrderForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Crear pedido",
  showImmediateFulfillment = true,
}: Props) {
  const [fulfillmentType, setFulfillmentType] = useState<CounterFulfillmentType>(
    initial?.fulfillmentType ?? "pickup",
  )
  const [deliveryAddress, setDeliveryAddress] = useState(
    initial?.deliveryAddress ?? "",
  )
  const [phone, setPhone] = useState(initial?.phone ?? "")
  const [driverName, setDriverName] = useState(initial?.driverName ?? "")
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    initial?.estimatedMinutes != null ? String(initial.estimatedMinutes) : "30",
  )
  const [notes, setNotes] = useState(initial?.notes ?? "")
  const [immediateFulfillment, setImmediateFulfillment] = useState(
    initial?.immediateFulfillment ?? false,
  )
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setFulfillmentType(initial?.fulfillmentType ?? "pickup")
    setDeliveryAddress(initial?.deliveryAddress ?? "")
    setPhone(initial?.phone ?? "")
    setDriverName(initial?.driverName ?? "")
    setEstimatedMinutes(
      initial?.estimatedMinutes != null ? String(initial.estimatedMinutes) : "30",
    )
    setNotes(initial?.notes ?? "")
    setImmediateFulfillment(initial?.immediateFulfillment ?? false)
  }, [initial])

  const isDelivery = fulfillmentType === "delivery"

  const canSubmit =
    Number.isFinite(Number(estimatedMinutes)) &&
    (!isDelivery || (deliveryAddress.trim() && phone.trim()))

  const loadingLabel = submitLabel === "Guardar cambios" ? "Guardando…" : "Creando…"

  return (
    <form
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      onSubmit={(e) => {
        e.preventDefault()
        if (!canSubmit || submitting) return
        setSubmitting(true)
        void (async () => {
          try {
            const ok = await onSubmit({
              fulfillmentType,
              deliveryAddress: isDelivery ? deliveryAddress.trim() : undefined,
              phone: isDelivery ? phone.trim() : undefined,
              driverName: isDelivery ? driverName.trim() || undefined : undefined,
              estimatedMinutes: Number(estimatedMinutes),
              notes: notes.trim() || undefined,
              immediateFulfillment: showImmediateFulfillment
                ? immediateFulfillment
                : undefined,
            })
            if (ok === false) return
          } finally {
            setSubmitting(false)
          }
        })()
      }}
    >
      <ChannelDataPanel className="flex-1">
        <ChannelDataFormSection>
          <ChannelDataFormSegmentField
            label="Tipo de entrega"
            value={fulfillmentType}
            onValueChange={(value) => {
              setFulfillmentType(value as CounterFulfillmentType)
              if (value === "pickup") setDriverName("")
            }}
            options={[
              { value: "pickup", label: "Mostrador" },
              { value: "delivery", label: "Delivery" },
            ]}
          />

          {isDelivery ? (
            <>
              <ChannelDataFormTextField
                label="Dirección"
                id="counter-delivery-address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Calle, número, piso…"
                required
              />
              <ChannelDataFormTextField
                label="Celular"
                id="counter-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="11 1234 5678"
                required
              />
              <ChannelDataFormTextField
                label="Repartidor"
                id="counter-driver"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="Nombre (opcional)"
              />
            </>
          ) : null}

          <ChannelDataFormSelectField
            label="Tiempo estimado"
            id="counter-eta"
            value={estimatedMinutes}
            onValueChange={setEstimatedMinutes}
            placeholder="Elegir minutos"
          >
            {COUNTER_ESTIMATED_MINUTES_OPTIONS.map((m) => (
              <ChannelDataFormSelectItem key={m} value={String(m)}>
                {m} minutos
              </ChannelDataFormSelectItem>
            ))}
          </ChannelDataFormSelectField>

          <ChannelDataFormTextareaField
            label="Notas"
            id="counter-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Indicaciones para cocina o entrega"
          />

          {showImmediateFulfillment ? (
            <ChannelDataFormCheckboxField
              label="Entrega inmediata (pasa directo a entregados)"
              id="counter-immediate-fulfillment"
              checked={immediateFulfillment}
              onCheckedChange={setImmediateFulfillment}
            />
          ) : null}
        </ChannelDataFormSection>
      </ChannelDataPanel>

      <ChannelDataFormActionsBar
        onCancel={onCancel}
        primary={{
          type: "submit",
          label: submitLabel,
          disabled: !canSubmit || submitting,
          loading: submitting,
          loadingLabel,
        }}
      />
    </form>
  )
}
