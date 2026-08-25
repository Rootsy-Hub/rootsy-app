"use client"

import { COLOR_TOKENS } from "@/app/library/color/rootsyColorSystem"
import { CONCEPT_TOKENS } from "@/app/library/libraryFoundationDocShared"
import { MundosWorldStage } from "@/app/library/mundos/MundosDocPrimitives"
import {
  MENSAJE_ROOTSY_DEMO_COPY,
  MENSAJE_ROOTSY_DEFAULT_PORTRAIT,
  MENSAJE_ROOTSY_INTENTS,
  MENSAJE_ROOTSY_LAYOUTS,
  MENSAJE_ROOTSY_PLACEMENTS,
  MENSAJE_ROOTSY_PORTRAITS,
  type RootsyMensajeIntent,
  type RootsyMensajePlacement,
} from "@/app/library/ui-components/mensajeRootsyHardcodedSpec"
import { MensajePortraitProgressDemo } from "@/app/library/ui-components/MensajePortraitSlotDemo"
import {
  RootsyMensajeToast,
  rootsyMensajePlacementParts,
  showRootsyMensajeToast,
} from "@/components/rootsy-mensaje"
import { cn } from "@/lib/utils"
import { useState, type ReactNode } from "react"

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-1">
      <h2 className="font-canopy text-base font-semibold" style={{ color: COLOR_TOKENS.bruma900 }}>
        {title}
      </h2>
      {description ? (
        <p className="font-canopy text-xs leading-relaxed" style={{ color: COLOR_TOKENS.bruma500 }}>
          {description}
        </p>
      ) : null}
    </div>
  )
}

function LandscapeStage({
  caption,
  children,
  className,
  footer,
  placement,
}: {
  caption: string
  children: ReactNode
  className?: string
  footer?: ReactNode
  placement?: RootsyMensajePlacement
}) {
  const { edge, side } = rootsyMensajePlacementParts(placement ?? "bottom-left")

  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{ borderColor: CONCEPT_TOKENS.bruma200 }}
    >
      <MundosWorldStage label={caption} className={className}>
        <div className="mundos-herramientas-stage absolute inset-0" />
        <div
          className={cn(
            "relative z-10 flex h-full flex-col gap-3 overflow-visible px-4 py-6 sm:px-6",
            placement
              ? cn(
                  side === "right" ? "items-end" : "items-start",
                  edge === "top" ? "justify-start" : "justify-end",
                  footer && edge === "bottom" && "pb-16",
                )
              : "items-stretch justify-center",
          )}
        >
          {children}
        </div>
        {footer ? (
          <div className="absolute inset-x-0 bottom-0 z-20 flex flex-wrap items-center justify-center gap-2 px-4 py-4">
            {footer}
          </div>
        ) : null}
      </MundosWorldStage>
      <p
        className="border-t px-4 py-3 font-canopy text-[11px] leading-relaxed"
        style={{
          borderColor: CONCEPT_TOKENS.bruma200,
          color: CONCEPT_TOKENS.bruma500,
          backgroundColor: CONCEPT_TOKENS.bruma100,
        }}
      >
        {caption}
      </p>
    </div>
  )
}

function LiveMensaje({
  intent,
  layout = "title-message",
  placement,
  onAction,
  onDismiss,
}: {
  intent: RootsyMensajeIntent
  layout?: "title-message" | "with-action" | "dismissible"
  placement?: RootsyMensajePlacement
  onAction?: () => void
  onDismiss?: () => void
}) {
  const copy = MENSAJE_ROOTSY_DEMO_COPY[intent]

  return (
    <RootsyMensajeToast
      intent={intent}
      placement={placement}
      portraitSrc={MENSAJE_ROOTSY_DEFAULT_PORTRAIT}
      title={copy.title}
      message={copy.message}
      actionLabel={layout === "with-action" ? copy.action : undefined}
      onAction={layout === "with-action" ? onAction : undefined}
      dismissible={layout === "dismissible"}
      onDismiss={layout === "dismissible" ? onDismiss : undefined}
    />
  )
}

function LaunchChip({
  label,
  active,
  onClick,
}: {
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-3 py-1.5 font-canopy text-[10px] font-semibold uppercase tracking-[0.14em] transition-opacity hover:opacity-100"
      style={{
        color: "#e0feff",
        background: active ? "rgb(224 255 255 / 0.22)" : "rgb(224 255 255 / 0.1)",
        boxShadow: active ? "0 0 0 1px rgb(224 255 255 / 0.45)" : "0 0 0 1px rgb(224 255 255 / 0.18)",
        opacity: active ? 1 : 0.86,
      }}
    >
      {label}
    </button>
  )
}

function ToastPlayground() {
  const [intent, setIntent] = useState<RootsyMensajeIntent | null>("warning")
  const [placement, setPlacement] = useState<RootsyMensajePlacement>("top-left")
  const copy = intent ? MENSAJE_ROOTSY_DEMO_COPY[intent] : null

  return (
    <LandscapeStage
      className="h-[28rem] sm:h-[30rem]"
      placement={placement}
      caption="Elegí esquina e intent · Enviar toast llega a esa esquina. El click lleva el canto."
      footer={
        <>
          {MENSAJE_ROOTSY_PLACEMENTS.map((item) => (
            <LaunchChip
              key={item.id}
              label={item.label}
              active={placement === item.id}
              onClick={() => setPlacement(item.id)}
            />
          ))}
          {MENSAJE_ROOTSY_INTENTS.map((item) => (
            <LaunchChip
              key={item.id}
              label={item.label}
              active={intent === item.id}
              onClick={() => {
                setIntent(item.id)
              }}
            />
          ))}
          <LaunchChip
            label="Enviar toast"
            onClick={() => {
              const nextIntent = intent ?? "neutral"
              const demo = MENSAJE_ROOTSY_DEMO_COPY[nextIntent]
              showRootsyMensajeToast({
                intent: nextIntent,
                placement,
                title: demo.title,
                message: demo.message,
                actionLabel: demo.action,
                portraitSrc: MENSAJE_ROOTSY_DEFAULT_PORTRAIT,
                sound: true,
              })
            }}
          />
          <LaunchChip
            label="Enviar con marca"
            onClick={() => {
              const demo = MENSAJE_ROOTSY_DEMO_COPY.info
              showRootsyMensajeToast({
                intent: "info",
                placement,
                title: demo.title,
                message: demo.message,
                actionLabel: demo.action,
                portrait: <MensajePortraitProgressDemo />,
                sound: true,
              })
            }}
          />
        </>
      }
    >
      {intent && copy ? (
        <div className="max-w-[22.5rem]">
          <RootsyMensajeToast
            intent={intent}
            placement={placement}
            portraitSrc={MENSAJE_ROOTSY_DEFAULT_PORTRAIT}
            title={copy.title}
            message={copy.message}
            actionLabel={copy.action}
            onAction={() => setIntent(null)}
            dismissible
            onDismiss={() => setIntent(null)}
          />
        </div>
      ) : (
        <p className="pb-14 font-canopy text-sm text-[#d8fbff]">
          Tocá un estado para que Rootsy te escriba.
        </p>
      )}
    </LandscapeStage>
  )
}

function LiveDismissibleMensaje() {
  const [visible, setVisible] = useState(true)

  if (!visible) {
    return (
      <button
        type="button"
        className="font-canopy text-xs uppercase tracking-[0.12em] text-[#d8fbff] underline"
        onClick={() => setVisible(true)}
      >
        Mostrar mensaje de nuevo
      </button>
    )
  }

  return <LiveMensaje intent="danger" layout="dismissible" onDismiss={() => setVisible(false)} />
}

function LiveActionMensaje() {
  const [done, setDone] = useState(false)

  if (done) {
    return <LiveMensaje intent="success" layout="title-message" />
  }

  return <LiveMensaje intent="success" layout="with-action" onAction={() => setDone(true)} />
}

const PLACEMENT_DEMO_INTENT: Record<RootsyMensajePlacement, RootsyMensajeIntent> = {
  "top-left": "info",
  "top-right": "success",
  "bottom-left": "warning",
  "bottom-right": "danger",
}

function PlacementCorner({ placement }: { placement: RootsyMensajePlacement }) {
  const { edge, side } = rootsyMensajePlacementParts(placement)

  return (
    <div
      className={cn(
        "flex min-h-[11rem]",
        side === "right" ? "justify-end" : "justify-start",
        edge === "bottom" ? "items-end" : "items-start",
      )}
    >
      <div className="w-full max-w-[18.5rem]">
        <LiveMensaje intent={PLACEMENT_DEMO_INTENT[placement]} placement={placement} />
      </div>
    </div>
  )
}

export function ToastLiveGallery() {
  return (
    <div className="space-y-10">
      <p className="max-w-3xl font-canopy text-sm leading-relaxed text-[var(--rootsy-bruma-500)]">
        El Mensaje de Rootsy es un globo del chat: retrato, colita e hora. La orientación es
        opcional — izquierda o derecha, arriba o abajo — y el globo rota con la esquina.
        El canto es opt-in (`sound: true`) en el mismo click. En producto se dispara con
        showRootsyMensajeToast.
      </p>

      <div className="space-y-4">
        <SectionHeading
          title="Como en el chat"
          description="Elegí esquina e intent — el globo llega a esa esquina de la pantalla, se cierra o sigue la acción."
        />
        <ToastPlayground />
      </div>

      <div className="space-y-4">
        <SectionHeading
          title="Orientación"
          description="placement · top-left · top-right · bottom-left · bottom-right. Retrato y colita apuntan a la esquina."
        />
        <LandscapeStage
          className="h-[34rem] sm:h-[36rem]"
          caption="toast.placement · cuatro esquinas — el globo no es el mismo dado vuelta: la colita y el retrato cambian de lado."
        >
          <div className="grid h-full min-h-0 w-full flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
            {MENSAJE_ROOTSY_PLACEMENTS.map((item) => (
              <PlacementCorner key={item.id} placement={item.id} />
            ))}
          </div>
        </LandscapeStage>
      </div>

      <div className="space-y-4">
        <SectionHeading
          title="Intents"
          description="Mensaje · información · éxito · advertencia · alerta — rim, anillo y pip semánticos."
        />
        <LandscapeStage
          className="h-[46rem] sm:h-[48rem]"
          caption="toast.intent · chip + pip + anillo — el globo blanco se lee sobre el paisaje."
        >
          {MENSAJE_ROOTSY_INTENTS.map((intent) => (
            <LiveMensaje key={intent.id} intent={intent.id} />
          ))}
        </LandscapeStage>
      </div>

      <div className="space-y-4">
        <SectionHeading
          title="Layouts"
          description="Título y mensaje · acción que confirma · dismiss que cierra el aviso."
        />
        <LandscapeStage
          className="h-[34rem] sm:h-[36rem]"
          caption="toast.layout · with-action cambia a éxito · dismissible se puede volver a mostrar."
        >
          <div className="flex w-full max-w-[26.5rem] flex-col gap-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#d8fbff]">
              {MENSAJE_ROOTSY_LAYOUTS[1].token}
            </p>
            <LiveActionMensaje />
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#d8fbff]">
              {MENSAJE_ROOTSY_LAYOUTS[2].token}
            </p>
            <LiveDismissibleMensaje />
          </div>
        </LandscapeStage>
      </div>

      <div className="space-y-4">
        <SectionHeading
          title="Retrato"
          description="Mandá una foto con portraitSrc o un componente con portrait — ocupan el mismo círculo."
        />
        <LandscapeStage
          className="h-[32rem] sm:h-[34rem]"
          caption="mensaje.portrait.src · mensaje.portrait.slot — la marca gana sobre la foto."
        >
          <div className="flex w-full max-w-[26.5rem] flex-col gap-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#d8fbff]">
              {MENSAJE_ROOTSY_PORTRAITS[0].token}
            </p>
            <RootsyMensajeToast
              intent="warning"
              portraitSrc={MENSAJE_ROOTSY_DEFAULT_PORTRAIT}
              title={MENSAJE_ROOTSY_DEMO_COPY.warning.title}
              message={MENSAJE_ROOTSY_DEMO_COPY.warning.message}
            />
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#d8fbff]">
              {MENSAJE_ROOTSY_PORTRAITS[1].token}
            </p>
            <RootsyMensajeToast
              intent="info"
              portrait={<MensajePortraitProgressDemo />}
              title={MENSAJE_ROOTSY_DEMO_COPY.info.title}
              message={MENSAJE_ROOTSY_DEMO_COPY.info.message}
            />
          </div>
        </LandscapeStage>
      </div>
    </div>
  )
}
