"use client"

import {
  COUNTER_ESTIMATED_MINUTES_OPTIONS,
  type CounterFulfillmentType,
  type CreateCounterOrderInput,
} from "@/app/[siteId]/[popId]/mostrador/mostradorTypes"
import { Button } from "@/components/ui/button"
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

  const fieldClass =
    "rounded-lg border border-solid !border-slate-200 bg-white !shadow-none text-slate-800"

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
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="grid gap-3 border-b border-slate-200/90 bg-white px-3 py-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tipo de entrega *
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["pickup", "Mostrador"],
                ["delivery", "Delivery"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setFulfillmentType(value)
                  if (value === "pickup") setDriverName("")
                }}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors",
                  fulfillmentType === value
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {isDelivery ? (
          <>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Dirección *
              </label>
              <Input
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className={fieldClass}
                placeholder="Calle, número, piso…"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Celular *
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={fieldClass}
                placeholder="11 1234 5678"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Repartidor
              </label>
              <Input
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className={fieldClass}
                placeholder="Nombre (opcional)"
              />
            </div>
          </>
        ) : null}

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Tiempo estimado *
          </label>
          <Select value={estimatedMinutes} onValueChange={setEstimatedMinutes}>
            <SelectTrigger className={fieldClass}>
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
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Notas
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={cn(fieldClass, "min-h-20 resize-none")}
            placeholder="Indicaciones para cocina o entrega"
          />
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-3">
          <Checkbox
            id="counter-immediate-fulfillment"
            checked={immediateFulfillment}
            onCheckedChange={(v) => setImmediateFulfillment(v === true)}
            className="mt-0.5 border-slate-300 bg-white shadow-sm data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white"
          />
          <Label
            htmlFor="counter-immediate-fulfillment"
            className="cursor-pointer text-sm font-normal leading-snug text-slate-700"
          >
            Entrega inmediata (pasa directo a entregados)
          </Label>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-0 border-t border-slate-200/90">
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            className="h-12 rounded-none border-0 border-r border-slate-200/90 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            onClick={onCancel}
          >
            Cancelar
          </Button>
        ) : null}
        <Button
          type="button"
          className={cn("h-12 rounded-none", onCancel ? "" : "col-span-2")}
          disabled={!canSubmit || submitting}
          onClick={() => void handleSubmit()}
        >
          {submitting ? "Creando…" : submitLabel}
        </Button>
      </div>
    </div>
  )
}
