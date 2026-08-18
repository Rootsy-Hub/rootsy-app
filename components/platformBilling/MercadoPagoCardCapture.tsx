"use client"

import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useState,
  type ReactNode,
} from "react"
import {
  CardNumber,
  ExpirationDate,
  SecurityCode,
  createCardToken,
  initMercadoPago,
} from "@mercadopago/sdk-react"
import { RootsBanner } from "@/components/rootsy-banner"
import {
  RootsFormField,
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormTextField,
} from "@/components/rootsy-form"
import { useRootsFormControlTone } from "@/components/rootsy-form/rootsFormFieldContext"
import { getFormTextControlStyle } from "@/components/rootsy-form/rootsFormSpecRuntime"
import { Spinner } from "@/components/ui/spinner"
import { LAYOUTS_OPERAR_FORM_DARK } from "@/app/library/layouts/layoutsOperarFormTokens"

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

function MercadoPagoSecureField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  const tone = useRootsFormControlTone()
  const shellStyle = getFormTextControlStyle("default", { tone })

  return (
    <RootsFormField label={label}>
      <div
        className="mp-secure-field flex w-full items-stretch overflow-hidden"
        style={shellStyle}
      >
        {children}
      </div>
    </RootsFormField>
  )
}

export const MercadoPagoCardCapture = forwardRef<
  MercadoPagoCardCaptureHandle,
  MercadoPagoCardCaptureProps
>(function MercadoPagoCardCapture({ publicKey, disabled = false }, ref) {
  const formId = useId()
  const tone = useRootsFormControlTone()
  const [sdkReady, setSdkReady] = useState(false)
  const [cardholderName, setCardholderName] = useState("")
  const [identificationType, setIdentificationType] = useState("DNI")
  const [identificationNumber, setIdentificationNumber] = useState("")

  const secureFieldStyle = {
    height: "100%",
    padding: "0",
    "font-size": "14px",
    color: tone === "dark" ? LAYOUTS_OPERAR_FORM_DARK.text : "#1A2A24",
    "placeholder-color":
      tone === "dark" ? "#94A3B8" : "var(--rootsy-bruma-500)",
  }

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
      <RootsBanner
        intent="danger"
        tone={tone}
        density="compact"
        message="Mercado Pago no está configurado en este entorno."
      />
    )
  }

  const fieldsDisabled = disabled || !sdkReady

  return (
    <div className="space-y-4">
      {!sdkReady ? (
        <div
          className={
            tone === "dark"
              ? "flex items-center gap-2 text-sm text-[var(--rootsy-sombra-300)]"
              : "flex items-center gap-2 text-sm text-muted-foreground"
          }
        >
          <Spinner className="size-4" />
          Cargando formulario seguro…
        </div>
      ) : null}

      <RootsFormTextField
        label="Titular de la tarjeta"
        id={`${formId}-cardholder`}
        value={cardholderName}
        onChange={(event) => setCardholderName(event.target.value)}
        placeholder="Como figura en la tarjeta"
        autoComplete="cc-name"
        disabled={fieldsDisabled}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <RootsFormSelectField
          label="Documento"
          id={`${formId}-identification-type`}
          value={identificationType}
          onValueChange={setIdentificationType}
          disabled={fieldsDisabled}
        >
          <RootsFormSelectItem value="DNI">DNI</RootsFormSelectItem>
          <RootsFormSelectItem value="CUIT">CUIT</RootsFormSelectItem>
          <RootsFormSelectItem value="CUIL">CUIL</RootsFormSelectItem>
        </RootsFormSelectField>
        <RootsFormTextField
          label="Número"
          id={`${formId}-identification-number`}
          value={identificationNumber}
          onChange={(event) => setIdentificationNumber(event.target.value)}
          inputMode="numeric"
          placeholder="12345678"
          disabled={fieldsDisabled}
        />
      </div>

      <MercadoPagoSecureField label="Número de tarjeta">
        <CardNumber
          placeholder="1234 1234 1234 1234"
          style={secureFieldStyle}
        />
      </MercadoPagoSecureField>

      <div className="grid gap-4 sm:grid-cols-2">
        <MercadoPagoSecureField label="Vencimiento">
          <ExpirationDate
            placeholder="MM/AA"
            mode="short"
            style={secureFieldStyle}
          />
        </MercadoPagoSecureField>
        <MercadoPagoSecureField label="Código de seguridad">
          <SecurityCode placeholder="123" style={secureFieldStyle} />
        </MercadoPagoSecureField>
      </div>
    </div>
  )
})
