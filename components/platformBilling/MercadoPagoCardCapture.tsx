"use client"

import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useState,
} from "react"
import {
  CardNumber,
  ExpirationDate,
  SecurityCode,
  createCardToken,
  initMercadoPago,
} from "@mercadopago/sdk-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

export type MercadoPagoCardTokenResult = {
  token: string
}

export type MercadoPagoCardCaptureHandle = {
  tokenize: () => Promise<MercadoPagoCardTokenResult>
}

type MercadoPagoCardCaptureProps = {
  publicKey: string
  disabled?: boolean
}

export const MercadoPagoCardCapture = forwardRef<
  MercadoPagoCardCaptureHandle,
  MercadoPagoCardCaptureProps
>(function MercadoPagoCardCapture({ publicKey, disabled = false }, ref) {
  const formId = useId()
  const [sdkReady, setSdkReady] = useState(false)
  const [cardholderName, setCardholderName] = useState("")
  const [identificationType, setIdentificationType] = useState("DNI")
  const [identificationNumber, setIdentificationNumber] = useState("")

  useEffect(() => {
    if (!publicKey.trim()) return
    initMercadoPago(publicKey.trim(), { locale: "es-AR" })
    setSdkReady(true)
  }, [publicKey])

  useImperativeHandle(ref, () => ({
    async tokenize() {
      if (!sdkReady) {
        throw new Error("El formulario de tarjeta todavía no está listo")
      }
      if (cardholderName.trim().length < 3) {
        throw new Error("Ingresá el titular de la tarjeta")
      }
      if (identificationNumber.trim().length < 7) {
        throw new Error("Ingresá un documento válido")
      }

      const tokenResult = await createCardToken({
        cardholderName: cardholderName.trim(),
        identificationType,
        identificationNumber: identificationNumber.trim(),
      })

      const token = tokenResult?.id
      if (!token) {
        throw new Error("No se pudo tokenizar la tarjeta")
      }

      return { token }
    },
  }))

  if (!publicKey.trim()) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        Mercado Pago no está configurado en este entorno.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {!sdkReady ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner className="size-4" />
          Cargando formulario seguro…
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor={`${formId}-cardholder`}>Titular de la tarjeta</Label>
        <Input
          id={`${formId}-cardholder`}
          value={cardholderName}
          onChange={(event) => setCardholderName(event.target.value)}
          placeholder="Como figura en la tarjeta"
          autoComplete="cc-name"
          disabled={disabled || !sdkReady}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${formId}-identification-type`}>Documento</Label>
          <select
            id={`${formId}-identification-type`}
            value={identificationType}
            onChange={(event) => setIdentificationType(event.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={disabled || !sdkReady}
          >
            <option value="DNI">DNI</option>
            <option value="CUIT">CUIT</option>
            <option value="CUIL">CUIL</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${formId}-identification-number`}>Número</Label>
          <Input
            id={`${formId}-identification-number`}
            value={identificationNumber}
            onChange={(event) => setIdentificationNumber(event.target.value)}
            inputMode="numeric"
            placeholder="12345678"
            disabled={disabled || !sdkReady}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Número de tarjeta</Label>
        <div className="rounded-md border border-input bg-background px-3 py-2">
          <CardNumber placeholder="1234 1234 1234 1234" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Vencimiento</Label>
          <div className="rounded-md border border-input bg-background px-3 py-2">
            <ExpirationDate placeholder="MM/AA" mode="short" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Código de seguridad</Label>
          <div className="rounded-md border border-input bg-background px-3 py-2">
            <SecurityCode placeholder="123" />
          </div>
        </div>
      </div>
    </div>
  )
})
