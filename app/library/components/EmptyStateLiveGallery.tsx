"use client"

import { COLOR_TOKENS } from "@/app/library/color/rootsyColorSystem"
import { CONCEPT_TOKENS } from "@/app/library/libraryFoundationDocShared"
import { MundosWorldStage } from "@/app/library/mundos/MundosDocPrimitives"
import { ROOTSY_PRODUCT_WORLDS } from "@/app/library/mundos/rootsyMundosSystem"
import { HomeWorkspaceBackdrop } from "@/components/layouts/HomeWorkspaceBackdrop"
import {
  RootsyEmptyState,
  ROOTSY_EMPTY_STATE_COPY,
  ROOTSY_EMPTY_STATE_DEFAULT_IMAGE,
  ROOTSY_EMPTY_STATE_VOICE,
  type RootsyEmptyStateWorld,
} from "@/components/rootsy-empty-state"
import { LibraryGuidelineCards } from "@/app/library/libraryDocPrimitives"
import { rootsyLayoutsEarthFloorSurfaceClass } from "@/app/library/layouts/rootsyLayoutsEarthFloor"
import { cn } from "@/lib/utils"
import "@/app/library/mundos/mundosHerramientas.css"
import "@/components/data-workspace/dataWorkspaceBlocksAtmosphere.css"
import type { ReactNode } from "react"

const DEMO_TITLE = ROOTSY_EMPTY_STATE_COPY.catalog.idle.title
const DEMO_DESCRIPTION = ROOTSY_EMPTY_STATE_COPY.catalog.idle.description

const EMPTY_STATE_VARIANTS = [
  { id: "title", label: "Imagen y título", description: undefined as string | undefined, presence: "portrait" as const },
  {
    id: "title-description",
    label: "Imagen, título y descripción",
    description: DEMO_DESCRIPTION,
    presence: "portrait" as const,
  },
  {
    id: "continuing",
    label: "Tres puntos — sigue en otro lado",
    description: DEMO_DESCRIPTION,
    presence: "elsewhere" as const,
  },
] as const

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

function WorldCanvas({ world }: { world: RootsyEmptyStateWorld }) {
  if (world === "eter") {
    return <HomeWorkspaceBackdrop />
  }
  if (world === "bruma") {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <div className="data-workspace-blocks-atmosphere h-full" />
      </div>
    )
  }
  if (world === "suelo") {
    return (
      <div
        className={cn(
          "absolute inset-0",
          rootsyLayoutsEarthFloorSurfaceClass,
        )}
      />
    )
  }
  if (world === "herramientas") {
    return <div className="mundos-herramientas-stage absolute inset-0" />
  }
  return <div className="absolute inset-0 bg-[var(--rootsy-sombra-800)]" />
}

function EmptyStateStage({
  world,
  caption,
  children,
}: {
  world: RootsyEmptyStateWorld
  caption: string
  children: ReactNode
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{ borderColor: CONCEPT_TOKENS.bruma200 }}
    >
      <MundosWorldStage label={caption} className="h-[22rem] sm:h-[24rem]">
        <WorldCanvas world={world} />
        <div className="relative z-10 flex h-full items-center justify-center px-4">
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

export function EmptyStateLiveGallery() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <SectionHeading
          title="Voz"
          description={`${ROOTSY_EMPTY_STATE_VOICE.person}. ${ROOTSY_EMPTY_STATE_VOICE.language}. ${ROOTSY_EMPTY_STATE_VOICE.tone}`}
        />
        <LibraryGuidelineCards
          items={[
            {
              id: "title",
              title: "Título",
              doText: ROOTSY_EMPTY_STATE_VOICE.title,
              dontText: "Etiquetas de sistema: Pedido vacío, Sin resultados.",
            },
            {
              id: "description",
              title: "Descripción",
              doText: ROOTSY_EMPTY_STATE_VOICE.description,
              dontText: "Instrucciones largas ni tono de manual.",
            },
            {
              id: "conversation",
              title: "Catálogo + pedido",
              doText: ROOTSY_EMPTY_STATE_VOICE.conversation,
              dontText: "El mismo hallazgo dos veces: Acá no hay… / Acá no hay…",
            },
            {
              id: "presence",
              title: "Un solo Rootsy",
              doText: ROOTSY_EMPTY_STATE_VOICE.presence,
              dontText: "Tres retratos a la vez: toast, catálogo y pedido.",
            },
          ]}
        />
        <p className="font-canopy text-xs leading-relaxed" style={{ color: COLOR_TOKENS.bruma500 }}>
          Copy viva: {ROOTSY_EMPTY_STATE_VOICE.examples.yes} No: {ROOTSY_EMPTY_STATE_VOICE.examples.no}
        </p>
      </section>
      <section className="space-y-4">
        <SectionHeading
          title="Un solo retrato"
          description="Si Rootsy ya está en el toast o en el catálogo, el pedido no lo vuelve a pintar. El copy sigue; el círculo muestra tres puntos: la conversación continúa."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <EmptyStateStage
            world="sombra"
            caption="Catálogo · retrato (gana sobre el pedido)"
          >
            <RootsyEmptyState
              world="sombra"
              imageSrc={ROOTSY_EMPTY_STATE_DEFAULT_IMAGE}
              title={ROOTSY_EMPTY_STATE_COPY.catalog.idle.title}
              description={ROOTSY_EMPTY_STATE_COPY.catalog.idle.description}
            />
          </EmptyStateStage>
          <EmptyStateStage
            world="bruma"
            caption="Pedido · tres puntos (sigue en el catálogo)"
          >
            <RootsyEmptyState
              world="bruma"
              presence="elsewhere"
              title={ROOTSY_EMPTY_STATE_COPY.ticket.order.title}
              description={ROOTSY_EMPTY_STATE_COPY.ticket.order.description}
            />
          </EmptyStateStage>
        </div>
      </section>
      {ROOTSY_PRODUCT_WORLDS.map((world) => (
        <section key={world.id} className="space-y-4">
          <SectionHeading
            title={world.name}
            description={`${world.usedIn} ${world.concept}`}
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {EMPTY_STATE_VARIANTS.map((variant) => (
              <EmptyStateStage
                key={variant.id}
                world={world.id}
                caption={`${world.name} · ${variant.label}`}
              >
                <RootsyEmptyState
                  world={world.id}
                  imageSrc={ROOTSY_EMPTY_STATE_DEFAULT_IMAGE}
                  title={DEMO_TITLE}
                  description={variant.description}
                  presence={variant.presence}
                />
              </EmptyStateStage>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
