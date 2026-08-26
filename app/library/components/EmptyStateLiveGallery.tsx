"use client"

import { COLOR_TOKENS } from "@/app/library/color/rootsyColorSystem"
import { CONCEPT_TOKENS } from "@/app/library/libraryFoundationDocShared"
import { MundosWorldStage } from "@/app/library/mundos/MundosDocPrimitives"
import { ROOTSY_PRODUCT_WORLDS } from "@/app/library/mundos/rootsyMundosSystem"
import { HomeWorkspaceBackdrop } from "@/components/layouts/HomeWorkspaceBackdrop"
import {
  RootsyEmptyState,
  ROOTSY_EMPTY_STATE_COPY,
  ROOTSY_EMPTY_STATE_VOICE,
  type RootsyEmptyStateWorld,
} from "@/components/rootsy-empty-state"
import { LibraryGuidelineCards } from "@/app/library/libraryDocPrimitives"
import { rootsyLayoutsEarthFloorSurfaceClass } from "@/app/library/layouts/rootsyLayoutsEarthFloor"
import { cn } from "@/lib/utils"
import { ListPlus, Package } from "lucide-react"
import "@/app/library/mundos/mundosHerramientas.css"
import "@/components/data-workspace/dataWorkspaceBlocksAtmosphere.css"
import type { ReactNode } from "react"

const DEMO_TITLE = ROOTSY_EMPTY_STATE_COPY.catalog.idle.title
const DEMO_DESCRIPTION = ROOTSY_EMPTY_STATE_COPY.catalog.idle.description

const EMPTY_STATE_VARIANTS = [
  { id: "title", label: "Ícono y título", description: undefined as string | undefined },
  {
    id: "title-description",
    label: "Ícono, título y descripción",
    description: DEMO_DESCRIPTION,
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
              id: "icon",
              title: "Ícono",
              doText: ROOTSY_EMPTY_STATE_VOICE.icon,
              dontText: "La foto de Rootsy, ni un círculo recortado.",
            },
          ]}
        />
        <p className="font-canopy text-xs leading-relaxed" style={{ color: COLOR_TOKENS.bruma500 }}>
          Copy viva: {ROOTSY_EMPTY_STATE_VOICE.examples.yes} No: {ROOTSY_EMPTY_STATE_VOICE.examples.no}
        </p>
      </section>
      <section className="space-y-4">
        <SectionHeading
          title="Catálogo y pedido"
          description="Mismo componente, glow del mundo e ícono de lo que falta. Rootsy no se pinta acá."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <EmptyStateStage
            world="sombra"
            caption="Catálogo · no hay productos"
          >
            <RootsyEmptyState
              world="sombra"
              icon={Package}
              title={ROOTSY_EMPTY_STATE_COPY.catalog.idle.title}
              description={ROOTSY_EMPTY_STATE_COPY.catalog.idle.description}
            />
          </EmptyStateStage>
          <EmptyStateStage
            world="bruma"
            caption="Pedido · se insertan líneas"
          >
            <RootsyEmptyState
              world="bruma"
              icon={ListPlus}
              title={ROOTSY_EMPTY_STATE_COPY.ticket.order.title}
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
          <div className="grid gap-4 lg:grid-cols-2">
            {EMPTY_STATE_VARIANTS.map((variant) => (
              <EmptyStateStage
                key={variant.id}
                world={world.id}
                caption={`${world.name} · ${variant.label}`}
              >
                <RootsyEmptyState
                  world={world.id}
                  title={DEMO_TITLE}
                  description={variant.description}
                />
              </EmptyStateStage>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
