"use client"

import { COLOR_TOKENS } from "@/app/library/color/rootsyColorSystem"
import {
  CONCEPT_TOKENS,
  FoundationBrumaStage,
} from "@/app/library/libraryFoundationDocShared"
import { MundosWorldStage } from "@/app/library/mundos/MundosDocPrimitives"
import {
  MENSAJE_ROOTSY_DEMO_COPY,
  MENSAJE_ROOTSY_DEFAULT_PORTRAIT,
  MENSAJE_ROOTSY_INTENTS,
  MENSAJE_ROOTSY_LAYOUTS,
  MENSAJE_ROOTSY_PORTRAITS,
  type RootsyMensajeIntent,
} from "@/app/library/ui-components/mensajeRootsyHardcodedSpec"
import { MensajePortraitProgressDemo } from "@/app/library/ui-components/MensajePortraitSlotDemo"
import { RootsyMensajeToast } from "@/components/rootsy-mensaje"
import type { ReactNode } from "react"

const DEMO_TIME = "2026-08-25T15:32:00.000-03:00"

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

function SpecBlock({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h3
          className="font-mono text-[11px] font-medium uppercase tracking-[0.12em]"
          style={{ color: COLOR_TOKENS.bruma500 }}
        >
          {title}
        </h3>
        {hint ? (
          <p className="mt-1 font-canopy text-xs leading-relaxed" style={{ color: COLOR_TOKENS.bruma500 }}>
            {hint}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function VariantSpecCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex w-full max-w-[22.5rem] flex-col gap-1.5">
      {children}
      <span
        className="font-mono text-[10px] uppercase tracking-[0.08em]"
        style={{ color: COLOR_TOKENS.bruma500 }}
      >
        {label}
      </span>
    </div>
  )
}

function LandscapeStage({
  caption,
  children,
  className,
}: {
  caption: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{ borderColor: CONCEPT_TOKENS.bruma200 }}
    >
      <MundosWorldStage label={caption} className={className}>
        <div className="mundos-herramientas-stage absolute inset-0" />
        <div className="relative z-10 flex h-full flex-col items-start justify-center gap-3 overflow-visible px-4 py-6 sm:px-6">
          {children}
        </div>
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

function DemoMensaje({
  intent,
  layout = "title-message",
}: {
  intent: RootsyMensajeIntent
  layout?: "title-message" | "with-action" | "dismissible"
}) {
  const copy = MENSAJE_ROOTSY_DEMO_COPY[intent]

  return (
    <RootsyMensajeToast
      intent={intent}
      portraitSrc={MENSAJE_ROOTSY_DEFAULT_PORTRAIT}
      title={copy.title}
      message={copy.message}
      actionLabel={layout === "with-action" ? copy.action : undefined}
      dismissible={layout === "dismissible"}
      createdAt={DEMO_TIME}
    />
  )
}

function MensajeIntentVariantsBlock() {
  return (
    <SpecBlock
      title="mensaje.intent · variantes"
      hint="neutral · info · success · warning · danger — chip + pip + anillo de 1px. Globo blanco."
    >
      <div className="flex flex-col gap-4">
        {MENSAJE_ROOTSY_INTENTS.map((intent) => (
          <VariantSpecCell key={intent.id} label={intent.token}>
            <DemoMensaje intent={intent.id} />
          </VariantSpecCell>
        ))}
      </div>
    </SpecBlock>
  )
}

function MensajePortraitVariantsBlock() {
  const copy = MENSAJE_ROOTSY_DEMO_COPY.info

  return (
    <SpecBlock
      title="mensaje.portrait · variantes"
      hint="portraitSrc recorta la foto al círculo · portrait monta cualquier componente en el mismo hueco."
    >
      <div className="flex flex-col gap-4">
        <VariantSpecCell label={MENSAJE_ROOTSY_PORTRAITS[0].token}>
          <RootsyMensajeToast
            intent="warning"
            portraitSrc={MENSAJE_ROOTSY_DEFAULT_PORTRAIT}
            title={MENSAJE_ROOTSY_DEMO_COPY.warning.title}
            message={MENSAJE_ROOTSY_DEMO_COPY.warning.message}
            createdAt={DEMO_TIME}
          />
        </VariantSpecCell>
        <VariantSpecCell label={MENSAJE_ROOTSY_PORTRAITS[1].token}>
          <RootsyMensajeToast
            intent="info"
            portrait={<MensajePortraitProgressDemo />}
            title={copy.title}
            message={copy.message}
            createdAt={DEMO_TIME}
          />
        </VariantSpecCell>
      </div>
    </SpecBlock>
  )
}

function MensajeLayoutVariantsBlock() {
  const layouts: { id: (typeof MENSAJE_ROOTSY_LAYOUTS)[number]["id"]; intent: RootsyMensajeIntent }[] = [
    { id: "title-message", intent: "info" },
    { id: "with-action", intent: "success" },
    { id: "dismissible", intent: "danger" },
  ]

  return (
    <SpecBlock
      title="mensaje.layout · variantes"
      hint="title-message · with-action · dismissible — misma colita y hora."
    >
      <div className="flex flex-col gap-4">
        {layouts.map(({ id, intent }) => {
          const layoutMeta = MENSAJE_ROOTSY_LAYOUTS.find((item) => item.id === id)!
          return (
            <VariantSpecCell key={id} label={layoutMeta.token}>
              <DemoMensaje intent={intent} layout={id} />
            </VariantSpecCell>
          )
        })}
      </div>
    </SpecBlock>
  )
}

export function MensajeRootsyHardcodedGallery() {
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <SectionHeading
          title="Como en el chat"
          description="El toast es un globo recibido: retrato al lado de la colita, hora adentro, intent en el chip. Blanco y legible — sin frost."
        />
        <LandscapeStage
          className="h-[16rem] sm:h-[18rem]"
          caption="Globo theirs · colita abajo-izquierda · hora · retrato 4.5rem junto a la cola."
        >
          <DemoMensaje intent="warning" />
        </LandscapeStage>
      </div>

      <LandscapeStage
        className="h-[40rem] sm:h-[42rem]"
        caption="mensaje.intent · chip + pip · anillo semántico de 1px — el texto queda sobre blanco."
      >
        {MENSAJE_ROOTSY_INTENTS.map((intent) => (
          <DemoMensaje key={intent.id} intent={intent.id} />
        ))}
      </LandscapeStage>

      <FoundationBrumaStage
        clip={false}
        caption="Chip de intent · ícono 12px · pip en el retrato · anillo 28% del color semántico."
      >
        <div className="space-y-8">
          <SectionHeading
            title="Intents"
            description="Cinco estados — mensaje, en curso, hecho, aviso y alerta. El globo no cambia de tinta: cambia el chip."
          />
          <MensajeIntentVariantsBlock />
        </div>
      </FoundationBrumaStage>

      <FoundationBrumaStage
        clip={false}
        caption="mensaje.layout · acción savia-700 · dismiss junto al chip · hora abajo a la derecha."
      >
        <div className="space-y-8">
          <SectionHeading
            title="Layouts"
            description="Título y mensaje · acción para continuar · cierre a mano, como un aviso del hilo."
          />
          <MensajeLayoutVariantsBlock />
        </div>
      </FoundationBrumaStage>

      <FoundationBrumaStage
        clip={false}
        caption="mensaje.portrait.src recorta la foto · mensaje.portrait.slot monta un componente en el círculo."
      >
        <div className="space-y-8">
          <SectionHeading
            title="Retrato"
            description="Imagen con portraitSrc · o cualquier componente con portrait, al lado de la colita."
          />
          <MensajePortraitVariantsBlock />
        </div>
      </FoundationBrumaStage>
    </div>
  )
}
